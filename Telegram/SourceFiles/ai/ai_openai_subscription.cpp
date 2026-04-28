#include "ai/ai_openai_subscription.h"

#include "core/application.h"
#include "core/core_settings.h"

#include <QtCore/QCryptographicHash>
#include <QtCore/QDateTime>
#include <QtCore/QJsonArray>
#include <QtCore/QJsonDocument>
#include <QtCore/QRandomGenerator>
#include <QtCore/QStringList>
#include <QtCore/QUrlQuery>
#include <QtGui/QDesktopServices>
#include <QtNetwork/QHostAddress>
#include <QtNetwork/QNetworkReply>
#include <QtNetwork/QNetworkRequest>
#include <QtNetwork/QTcpServer>
#include <QtNetwork/QTcpSocket>

#include <vector>

namespace Ai {

constexpr auto kStorageKey = "auth/v1/providers/openai-subscription";
constexpr auto kClientId = "app_EMoamEEZ73f0CkXaXp7hrann";
constexpr auto kIssuer = "https://auth.openai.com";
constexpr auto kTokenEndpoint = "https://auth.openai.com/oauth/token";
constexpr auto kCodexEndpoint = "https://chatgpt.com/backend-api/codex/responses";
constexpr auto kOAuthPort = quint16(1455);
constexpr auto kCallbackPath = "/auth/callback";
constexpr auto kRefreshSkew = qint64(60 * 1000);
constexpr auto kFallbackInstructions = "You are AIRI, a helpful AI assistant.";

struct Model {
	const char *id;
	const char *name;
};

constexpr Model kModels[] = {
	{ "gpt-4.5-mini", "GPT-4.5 Mini" },
	{ "gpt-4.5", "GPT-4.5" },
	{ "gpt-5.1-codex", "GPT-5.1 Codex" },
	{ "gpt-5.1-codex-max", "GPT-5.1 Codex Max" },
	{ "gpt-5.1-codex-mini", "GPT-5.1 Codex Mini" },
	{ "gpt-5.2", "GPT-5.2" },
	{ "gpt-5.2-codex", "GPT-5.2 Codex" },
	{ "gpt-5.3-codex", "GPT-5.3 Codex" },
	{ "gpt-5.4", "GPT-5.4" },
	{ "gpt-5.4-mini", "GPT-5.4 Mini" },
};

struct OpenAISubscription::Tokens {
	QString accessToken;
	QString refreshToken;
	QString idToken;
	QString accountId;
	qint64 expiresAt = 0;

	explicit operator bool() const {
		return !accessToken.isEmpty() && !refreshToken.isEmpty();
	}
};

namespace {

[[nodiscard]] QByteArray Base64Url(QByteArray data) {
	return data.toBase64(
		QByteArray::Base64UrlEncoding | QByteArray::OmitTrailingEquals);
}

[[nodiscard]] QString RandomUrlToken(int bytes) {
	auto data = QByteArray();
	data.resize(bytes);
	for (auto i = 0; i != bytes; ++i) {
		data[i] = char(QRandomGenerator::global()->generate() & 0xFF);
	}
	return QString::fromLatin1(Base64Url(data));
}

[[nodiscard]] QString CodeChallenge(const QString &verifier) {
	return QString::fromLatin1(Base64Url(QCryptographicHash::hash(
		verifier.toUtf8(),
		QCryptographicHash::Sha256)));
}

[[nodiscard]] QByteArray DecodeBase64Url(QString value) {
	value.replace('-', '+');
	value.replace('_', '/');
	while (value.size() % 4 != 0) {
		value.append('=');
	}
	return QByteArray::fromBase64(value.toLatin1());
}

[[nodiscard]] QJsonObject JwtClaims(const QString &token) {
	const auto parts = token.split('.');
	if (parts.size() != 3) {
		return {};
	}
	return QJsonDocument::fromJson(DecodeBase64Url(parts[1])).object();
}

[[nodiscard]] QString AccountIdFromClaims(const QJsonObject &claims) {
	auto result = claims.value("chatgpt_account_id").toString();
	if (!result.isEmpty()) {
		return result;
	}
	result = claims.value("https://api.openai.com/auth")
		.toObject()
		.value("chatgpt_account_id")
		.toString();
	if (!result.isEmpty()) {
		return result;
	}
	const auto organizations = claims.value("organizations").toArray();
	if (!organizations.isEmpty()) {
		return organizations.at(0).toObject().value("id").toString();
	}
	return {};
}

[[nodiscard]] QString ExtractAccountId(
		const QString &accessToken,
		const QString &idToken) {
	if (!idToken.isEmpty()) {
		const auto result = AccountIdFromClaims(JwtClaims(idToken));
		if (!result.isEmpty()) {
			return result;
		}
	}
	return AccountIdFromClaims(JwtClaims(accessToken));
}

[[nodiscard]] qint64 NowMs() {
	return QDateTime::currentMSecsSinceEpoch();
}

[[nodiscard]] QJsonObject ErrorResult(const QString &message) {
	return {
		{ "ok", false },
		{ "error", message },
	};
}

[[nodiscard]] QJsonObject ModelsResult() {
	auto models = QJsonArray();
	for (const auto &model : kModels) {
		models.push_back(QJsonObject{
			{ "id", model.id },
			{ "name", model.name },
		});
	}
	return {
		{ "ok", true },
		{ "models", models },
	};
}

[[nodiscard]] QString HeaderValue(
		const QJsonObject &headers,
		const QString &name) {
	const auto lower = name.toLower();
	for (auto i = headers.begin(); i != headers.end(); ++i) {
		if (i.key().toLower() == lower) {
			return i.value().toString();
		}
	}
	return QString();
}

[[nodiscard]] std::vector<std::pair<QByteArray, QByteArray>> HeaderPairs(
		const QJsonValue &headers) {
	auto result = std::vector<std::pair<QByteArray, QByteArray>>();
	if (headers.isObject()) {
		const auto object = headers.toObject();
		for (auto i = object.begin(); i != object.end(); ++i) {
			result.emplace_back(i.key().toUtf8(), i.value().toString().toUtf8());
		}
		return result;
	}
	if (headers.isArray()) {
		for (const auto value : headers.toArray()) {
			const auto pair = value.toArray();
			if (pair.size() >= 2) {
				result.emplace_back(
					pair[0].toString().toUtf8(),
					pair[1].toString().toUtf8());
			}
		}
	}
	return result;
}

[[nodiscard]] bool SkipProxyHeader(QByteArray name) {
	name = name.toLower();
	return name == "authorization"
		|| name == "content-length"
		|| name == "host"
		|| name == "connection"
		|| name == "accept-encoding";
}

[[nodiscard]] QUrl RewriteOpenAISubscriptionUrl(const QString &url) {
	auto result = QUrl(url);
	if (!result.isValid() || result.isEmpty()) {
		return QUrl(kCodexEndpoint);
	}
	const auto path = result.path();
	if (path.contains(u"/v1/responses"_q)
		|| path.contains(u"/chat/completions"_q)) {
		return QUrl(kCodexEndpoint);
	}
	return result;
}

[[nodiscard]] bool IsCodexUrl(const QUrl &url) {
	return url == QUrl(kCodexEndpoint);
}

[[nodiscard]] QString TextFromContent(const QJsonValue &value) {
	if (value.isString()) {
		return value.toString();
	}
	if (value.isObject()) {
		const auto object = value.toObject();
		const auto text = object.value("text").toString();
		if (!text.isEmpty()) {
			return text;
		}
		const auto content = object.value("content");
		if (!content.isUndefined()) {
			return TextFromContent(content);
		}
		return object.value("output").toString();
	}
	if (!value.isArray()) {
		return QString();
	}
	auto result = QStringList();
	for (const auto part : value.toArray()) {
		const auto object = part.toObject();
		const auto text = object.value("text").toString(
			object.value("content").toString());
		if (!text.isEmpty()) {
			result.push_back(text);
		}
	}
	return result.join('\n');
}

[[nodiscard]] QString InstructionsFromMessages(const QJsonArray &messages) {
	auto result = QStringList();
	for (const auto value : messages) {
		const auto message = value.toObject();
		if (message.value("role").toString() == u"system"_q) {
			const auto text = TextFromContent(message.value("content"));
			if (!text.isEmpty()) {
				result.push_back(text);
			}
		}
	}
	return result.join("\n\n").trimmed();
}

[[nodiscard]] QJsonValue NormalizeToolContent(const QJsonValue &value) {
	const auto object = value.toObject();
	if (object.value("type").toString() == u"tool_result"_q) {
		const auto content = object.value("content");
		return QJsonObject{
			{ "type", "function_call_output" },
			{ "call_id", object.value("tool_call_id") },
			{ "output", content.isString()
				? content.toString()
				: QString::fromUtf8(
					QJsonDocument(content.toObject()).toJson(
						QJsonDocument::Compact)) },
		};
	}
	if (object.value("type").toString() == u"image_url"_q) {
		return object;
	}
	return QJsonValue();
}

[[nodiscard]] QJsonArray MapChatMessagesToCodexInput(
		const QJsonArray &messages) {
	auto input = QJsonArray();
	for (const auto messageValue : messages) {
		const auto message = messageValue.toObject();
		const auto role = message.value("role").toString();
		if (role == u"system"_q) {
			continue;
		}
		const auto normalizedRole = (role == u"assistant"_q)
			? "assistant"
			: "user";
		const auto textContentType = (role == u"assistant"_q)
			? "output_text"
			: "input_text";
		auto content = QJsonArray();
		const auto contentValue = message.value("content");
		const auto contentItems = contentValue.isArray()
			? contentValue.toArray()
			: QJsonArray{ QJsonObject{
				{ "type", textContentType },
				{ "text", contentValue.toString() },
			} };
		for (const auto item : contentItems) {
			const auto normalized = NormalizeToolContent(item);
			if (!normalized.isUndefined() && !normalized.toObject().isEmpty()) {
				content.push_back(normalized);
				continue;
			}
			content.push_back(QJsonObject{
				{ "type", textContentType },
				{ "text", TextFromContent(item) },
			});
		}
		input.push_back(QJsonObject{
			{ "role", normalizedRole },
			{ "content", content },
		});
	}
	return input;
}

[[nodiscard]] QJsonValue NormalizeResponsesInputForCodex(
		const QJsonValue &input) {
	if (!input.isArray()) {
		return input;
	}
	auto result = QJsonArray();
	for (const auto value : input.toArray()) {
		if (value.toObject().value("role").toString() != u"system"_q) {
			result.push_back(value);
		}
	}
	return result;
}

[[nodiscard]] QJsonValue NormalizeCodexToolChoice(const QJsonValue &choice) {
	const auto object = choice.toObject();
	const auto function = object.value("function").toObject();
	const auto name = function.value("name").toString();
	if (object.value("type").toString() == u"function"_q && !name.isEmpty()) {
		return QJsonObject{
			{ "type", "function" },
			{ "name", name },
		};
	}
	return choice;
}

[[nodiscard]] QJsonValue SanitizeOpenAIToolSchema(
		const QJsonValue &value,
		bool propertiesMap = false) {
	if (value.isArray()) {
		auto result = QJsonArray();
		for (const auto item : value.toArray()) {
			result.push_back(SanitizeOpenAIToolSchema(item));
		}
		return result;
	}
	if (!value.isObject()) {
		return value;
	}
	auto result = QJsonObject();
	const auto object = value.toObject();
	if (propertiesMap) {
		for (auto i = object.begin(); i != object.end(); ++i) {
			const auto sanitized = SanitizeOpenAIToolSchema(i.value());
			if (!sanitized.isUndefined()) {
				result.insert(i.key(), sanitized);
			}
		}
		return result;
	}
	const auto hadDynamicObjectKeywords = object.contains("propertyNames")
		|| (object.contains("additionalProperties")
			&& object.value("additionalProperties") != false);
	const auto hadProperties = object.contains("properties");
	for (auto i = object.begin(); i != object.end(); ++i) {
		if (i.key() == u"propertyNames"_q
			|| i.key() == u"required"_q
			|| i.key() == u"additionalProperties"_q) {
			continue;
		}
		result.insert(
			i.key(),
			SanitizeOpenAIToolSchema(
				i.value(),
				i.key() == u"properties"_q));
	}
	const auto properties = result.value("properties").toObject();
	if (properties.isEmpty() && !hadProperties && hadDynamicObjectKeywords) {
		return QJsonValue(QJsonValue::Undefined);
	}
	if (!properties.isEmpty()) {
		auto required = QJsonArray();
		for (auto i = properties.begin(); i != properties.end(); ++i) {
			required.push_back(i.key());
		}
		result.insert("required", required);
		result.insert("additionalProperties", false);
	} else if (result.value("type").toString() == u"object"_q) {
		result.insert("additionalProperties", false);
	}
	return result;
}

[[nodiscard]] QJsonValue NormalizeCodexTools(const QJsonValue &tools) {
	if (!tools.isArray()) {
		return tools;
	}
	auto result = QJsonArray();
	for (const auto tool : tools.toArray()) {
		const auto object = tool.toObject();
		const auto directName = object.value("name").toString();
		if (!directName.isEmpty()) {
			result.push_back(SanitizeOpenAIToolSchema(object));
			continue;
		}
		const auto function = object.value("function").toObject();
		const auto name = function.value("name").toString();
		if (object.value("type").toString() == u"function"_q && !name.isEmpty()) {
			result.push_back(QJsonObject{
				{ "type", "function" },
				{ "name", name },
				{ "description", function.value("description") },
				{ "parameters", SanitizeOpenAIToolSchema(
					function.value("parameters")) },
				{ "strict", function.value("strict") },
			});
		}
	}
	return result.isEmpty() ? QJsonValue() : QJsonValue(result);
}

[[nodiscard]] QJsonObject NormalizeChatCompletionsBody(QJsonObject body) {
	const auto messages = body.value("messages").toArray();
	const auto hasMessages = !messages.isEmpty();
	const auto normalizedTools = NormalizeCodexTools(body.value("tools"));
	const auto existingInstructions = body.value("instructions").toString().trimmed();
	auto instructions = existingInstructions;
	if (instructions.isEmpty() && hasMessages) {
		instructions = InstructionsFromMessages(messages);
	}
	if (instructions.isEmpty() && body.value("input").isArray()) {
		instructions = InstructionsFromMessages(body.value("input").toArray());
	}
	if (instructions.isEmpty()) {
		instructions = kFallbackInstructions;
	}
	if (hasMessages) {
		body.insert("input", MapChatMessagesToCodexInput(messages));
		body.remove("messages");
	} else if (body.contains("input")) {
		body.insert("input", NormalizeResponsesInputForCodex(body.value("input")));
	}
	body.insert("instructions", instructions);
	body.insert("store", false);
	if (!normalizedTools.isUndefined()) {
		body.insert("tools", normalizedTools);
		body.insert("tool_choice", NormalizeCodexToolChoice(body.value("tool_choice")));
	}
	return body;
}

[[nodiscard]] QByteArray ChatCompletionChunk(
		const QString &content,
		const QString &finishReason = QString()) {
	auto choice = QJsonObject{
		{ "index", 0 },
		{ "delta", QJsonObject() },
	};
	if (!content.isEmpty()) {
		choice.insert("delta", QJsonObject{ { "content", content } });
	}
	if (!finishReason.isEmpty()) {
		choice.insert("finish_reason", finishReason);
	}
	const auto object = QJsonObject{
		{ "id", "chatcmpl-openai-subscription" },
		{ "object", "chat.completion.chunk" },
		{ "choices", QJsonArray{ choice } },
	};
	return "data: "
		+ QJsonDocument(object).toJson(QJsonDocument::Compact)
		+ "\n\n";
}

[[nodiscard]] QByteArray TransformCodexSse(const QByteArray &bytes) {
	auto result = QByteArray();
	const auto lines = QString::fromUtf8(bytes).split('\n');
	for (const auto &line : lines) {
		if (!line.startsWith(u"data: "_q)) {
			continue;
		}
		const auto data = line.mid(6).trimmed();
		if (data == u"[DONE]"_q) {
			result += "data: [DONE]\n\n";
			continue;
		}
		const auto document = QJsonDocument::fromJson(data.toUtf8());
		const auto object = document.object();
		const auto type = object.value("type").toString();
		if (type == u"response.output_text.delta"_q) {
			result += ChatCompletionChunk(object.value("delta").toString());
		} else if (type == u"response.completed"_q) {
			result += ChatCompletionChunk(QString(), u"stop"_q);
			result += "data: [DONE]\n\n";
		} else if (type == u"response.failed"_q
			|| type == u"error"_q) {
			const auto error = object.value("error").toObject();
			const auto message = error.value("message").toString(
				object.value("message").toString("OpenAI subscription failed."));
			result += ChatCompletionChunk(message, u"stop"_q);
			result += "data: [DONE]\n\n";
		}
	}
	if (result.isEmpty()) {
		result = bytes;
	}
	return result;
}

[[nodiscard]] QByteArray JsonPostBody(const QJsonObject &object) {
	return QJsonDocument(object).toJson(QJsonDocument::Compact);
}

} // namespace

OpenAISubscription::OpenAISubscription() = default;

OpenAISubscription::~OpenAISubscription() {
	clearLogin();
}

QJsonObject OpenAISubscription::status() const {
	const auto tokens = loadTokens();
	auto result = ModelsResult();
	result.insert("authenticated", bool(tokens));
	result.insert("expiresAt", double(tokens.expiresAt));
	return result;
}

void OpenAISubscription::startLogin(Callback done) {
	clearLogin();
	_loginDone = std::move(done);
	_loginState = RandomUrlToken(24);
	_codeVerifier = RandomUrlToken(64);
	_server = std::make_unique<QTcpServer>();
	if (!_server->listen(QHostAddress::LocalHost, kOAuthPort)) {
		finishLoginError(u"Could not start local OpenAI callback server."_q);
		return;
	}
	const auto callbackUrl = QString("http://localhost:%1%2")
		.arg(_server->serverPort())
		.arg(kCallbackPath);
	QObject::connect(_server.get(), &QTcpServer::newConnection, _server.get(), [=] {
		const auto socket = _server->nextPendingConnection();
		if (!socket) {
			return;
		}
		socket->setParent(nullptr);
		QObject::connect(
			socket,
			&QTcpSocket::disconnected,
			socket,
			&QObject::deleteLater);
		const auto handled = std::make_shared<bool>(false);
		QObject::connect(socket, &QTcpSocket::readyRead, socket, [=] {
			if (*handled || !socket->canReadLine()) {
				return;
			}
			*handled = true;
			const auto reply = [=](
					const QByteArray &status,
					const QByteArray &body) {
				socket->write("HTTP/1.1 " + status
					+ "\r\nContent-Type: text/plain; charset=utf-8\r\n"
					"Connection: close\r\nContent-Length: "
					+ QByteArray::number(body.size())
					+ "\r\n\r\n"
					+ body);
				socket->disconnectFromHost();
			};
			const auto line = QString::fromUtf8(socket->readLine());
			const auto firstSpace = line.indexOf(' ');
			const auto secondSpace = line.indexOf(' ', firstSpace + 1);
			if (firstSpace < 0 || secondSpace <= firstSpace) {
				reply(
					"400 Bad Request",
					"OpenAI login callback was invalid.");
				return;
			}
			const auto path = line.mid(
				firstSpace + 1,
				secondSpace - firstSpace - 1);
			const auto url = QUrl("http://127.0.0.1" + path);
			if (url.path() != u"/auth/callback"_q) {
				reply("404 Not Found", "Not found.");
				return;
			}
			const auto query = QUrlQuery(url);
			const auto state = query.queryItemValue("state");
			const auto code = query.queryItemValue("code");
			const auto error = query.queryItemValue("error");
			const auto body = error.isEmpty()
				? QByteArray("OpenAI login complete. You can close this window.")
				: QByteArray("OpenAI login failed. You can close this window.");
			reply("200 OK", body);
			if (!error.isEmpty()) {
				finishLoginError(error);
			} else if (state != _loginState || code.isEmpty()) {
				finishLoginError(u"Invalid OpenAI login callback."_q);
			} else {
				const auto callbackPort = _server
					? _server->serverPort()
					: kOAuthPort;
				if (_server) {
					_server->close();
				}
				exchangeCode(code, callbackPort);
			}
		});
	});
	auto auth = QUrl(QString(kIssuer) + "/oauth/authorize");
	auto query = QUrlQuery();
	query.addQueryItem("client_id", kClientId);
	query.addQueryItem("response_type", "code");
	query.addQueryItem("redirect_uri", callbackUrl);
	query.addQueryItem("scope", "openid profile email offline_access");
	query.addQueryItem("state", _loginState);
	query.addQueryItem("code_challenge", CodeChallenge(_codeVerifier));
	query.addQueryItem("code_challenge_method", "S256");
	query.addQueryItem("id_token_add_organizations", "true");
	query.addQueryItem("codex_cli_simplified_flow", "true");
	query.addQueryItem("originator", "airi");
	auth.setQuery(query);
	if (!QDesktopServices::openUrl(auth)) {
		finishLoginError(u"Could not open OpenAI login page."_q);
	}
}

void OpenAISubscription::logout() {
	Core::App().settings().clearPref(kStorageKey);
	clearLogin();
}

void OpenAISubscription::proxyFetch(const QJsonObject &data, Callback done) {
	const auto tokens = loadTokens();
	if (!tokens) {
		done(ErrorResult(u"OpenAI subscription is not authenticated."_q));
		return;
	}
	if (tokens.expiresAt > 0 && tokens.expiresAt <= NowMs() + kRefreshSkew) {
		refreshTokens(tokens, [=](QJsonObject result) mutable {
			if (!result.value("ok").toBool()) {
				done(result);
				return;
			}
			proxyFetchWithToken(data, loadTokens(), std::move(done));
		});
		return;
	}
	proxyFetchWithToken(data, tokens, std::move(done));
}

OpenAISubscription::Tokens OpenAISubscription::loadTokens() const {
	const auto bytes = Core::App().settings().readPref<QByteArray>(kStorageKey);
	if (bytes.isEmpty()) {
		return {};
	}
	const auto document = QJsonDocument::fromJson(bytes);
	const auto object = document.object();
	return {
		.accessToken = object.value("accessToken").toString(),
		.refreshToken = object.value("refreshToken").toString(),
		.idToken = object.value("idToken").toString(),
		.accountId = object.value("accountId").toString(),
		.expiresAt = qint64(object.value("expiresAt").toDouble()),
	};
}

void OpenAISubscription::saveTokens(const Tokens &tokens) {
	Core::App().settings().writePref<QByteArray>(kStorageKey, JsonPostBody({
		{ "accessToken", tokens.accessToken },
		{ "refreshToken", tokens.refreshToken },
		{ "idToken", tokens.idToken },
		{ "accountId", tokens.accountId },
		{ "expiresAt", double(tokens.expiresAt) },
	}));
}

void OpenAISubscription::clearLogin() {
	_loginDone = nullptr;
	_loginState.clear();
	_codeVerifier.clear();
	if (_server) {
		_server->close();
		_server = nullptr;
	}
}

void OpenAISubscription::finishLoginError(const QString &message) {
	const auto done = std::move(_loginDone);
	clearLogin();
	if (done) {
		done(ErrorResult(message));
	}
}

void OpenAISubscription::exchangeCode(
		const QString &code,
		quint16 callbackPort) {
	auto request = QNetworkRequest(QUrl(kTokenEndpoint));
	request.setHeader(
		QNetworkRequest::ContentTypeHeader,
		"application/x-www-form-urlencoded");
	auto body = QUrlQuery();
	body.addQueryItem("grant_type", "authorization_code");
	body.addQueryItem("client_id", kClientId);
	body.addQueryItem("code", code);
	body.addQueryItem("redirect_uri", QString("http://localhost:%1%2")
		.arg(callbackPort)
		.arg(kCallbackPath));
	body.addQueryItem("code_verifier", _codeVerifier);
	const auto reply = _manager.post(
		request,
		body.query(QUrl::FullyEncoded).toUtf8());
	QObject::connect(reply, &QNetworkReply::finished, reply, [=] {
		const auto bytes = reply->readAll();
		const auto networkError = reply->error();
		const auto errorString = reply->errorString();
		reply->deleteLater();
		if (networkError != QNetworkReply::NoError) {
			finishLoginError(errorString);
			return;
		}
		const auto object = QJsonDocument::fromJson(bytes).object();
		auto tokens = Tokens{
			.accessToken = object.value("access_token").toString(),
			.refreshToken = object.value("refresh_token").toString(),
			.idToken = object.value("id_token").toString(),
			.accountId = ExtractAccountId(
				object.value("access_token").toString(),
				object.value("id_token").toString()),
			.expiresAt = NowMs()
				+ qint64(object.value("expires_in").toInt(3600)) * 1000,
		};
		if (!tokens) {
			finishLoginError(u"OpenAI login did not return usable tokens."_q);
			return;
		}
		saveTokens(tokens);
		const auto done = std::move(_loginDone);
		clearLogin();
		if (done) {
			auto result = status();
			result.insert("ok", true);
			done(result);
		}
	});
}

void OpenAISubscription::refreshTokens(Tokens tokens, Callback done) {
	auto request = QNetworkRequest(QUrl(kTokenEndpoint));
	request.setHeader(
		QNetworkRequest::ContentTypeHeader,
		"application/x-www-form-urlencoded");
	auto body = QUrlQuery();
	body.addQueryItem("grant_type", "refresh_token");
	body.addQueryItem("client_id", kClientId);
	body.addQueryItem("refresh_token", tokens.refreshToken);
	const auto reply = _manager.post(
		request,
		body.query(QUrl::FullyEncoded).toUtf8());
	QObject::connect(reply, &QNetworkReply::finished, reply, [=]() mutable {
		const auto bytes = reply->readAll();
		const auto networkError = reply->error();
		const auto errorString = reply->errorString();
		reply->deleteLater();
		if (networkError != QNetworkReply::NoError) {
			done(ErrorResult(errorString));
			return;
		}
		const auto object = QJsonDocument::fromJson(bytes).object();
		tokens.accessToken = object.value("access_token").toString(
			tokens.accessToken);
		tokens.refreshToken = object.value("refresh_token").toString(
			tokens.refreshToken);
		tokens.idToken = object.value("id_token").toString(tokens.idToken);
		tokens.accountId = ExtractAccountId(
			tokens.accessToken,
			tokens.idToken);
		tokens.expiresAt = NowMs()
			+ qint64(object.value("expires_in").toInt(3600)) * 1000;
		if (!tokens) {
			done(ErrorResult(u"OpenAI token refresh returned invalid data."_q));
			return;
		}
		saveTokens(tokens);
		done({
			{ "ok", true },
		});
	});
}

void OpenAISubscription::proxyFetchWithToken(
		const QJsonObject &data,
		Tokens tokens,
		Callback done) {
	const auto incoming = data.value("request").toObject();
	const auto headerPairs = HeaderPairs(incoming.value("headers"));
	auto headers = QJsonObject();
	for (const auto &[name, value] : headerPairs) {
		headers.insert(QString::fromUtf8(name), QString::fromUtf8(value));
	}
	const auto accept = HeaderValue(headers, u"accept"_q);
	const auto method = incoming.value("method").toString("POST").toUtf8();
	const auto targetUrl = RewriteOpenAISubscriptionUrl(
		incoming.value("url").toString());
	const auto isCodex = IsCodexUrl(targetUrl);
	auto bodyDocument = QJsonDocument::fromJson(
		incoming.value("body").toString().toUtf8());
	auto requestBody = isCodex && bodyDocument.isObject()
		? JsonPostBody(NormalizeChatCompletionsBody(bodyDocument.object()))
		: incoming.value("body").toString().toUtf8();
	auto request = QNetworkRequest(targetUrl);
	for (const auto &[name, value] : headerPairs) {
		if (!SkipProxyHeader(name)) {
			request.setRawHeader(name, value);
		}
	}
	request.setRawHeader("Authorization", (u"Bearer "_q + tokens.accessToken).toUtf8());
	if (!tokens.accountId.isEmpty()) {
		request.setRawHeader("ChatGPT-Account-Id", tokens.accountId.toUtf8());
	}
	if (isCodex) {
		request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
	}
	if (accept.isEmpty()) {
		request.setRawHeader("Accept", "text/event-stream");
	}
	const auto reply = _manager.sendCustomRequest(request, method, requestBody);
	QObject::connect(reply, &QNetworkReply::finished, reply, [=] {
		const auto bytes = reply->readAll();
		const auto networkError = reply->error();
		const auto errorString = reply->errorString();
		const auto status = reply->attribute(
			QNetworkRequest::HttpStatusCodeAttribute).toInt();
		const auto statusText = reply->attribute(
			QNetworkRequest::HttpReasonPhraseAttribute).toString();
		reply->deleteLater();
		if (networkError != QNetworkReply::NoError && status == 0) {
			done(ErrorResult(errorString));
			return;
		}
		auto responseHeaders = QJsonObject();
		for (const auto &pair : reply->rawHeaderPairs()) {
			responseHeaders.insert(
				QString::fromLatin1(pair.first).toLower(),
				QString::fromUtf8(pair.second));
		}
		auto body = bytes;
		if (isCodex && networkError == QNetworkReply::NoError) {
			body = TransformCodexSse(bytes);
			responseHeaders.insert(
				"content-type",
				"text/event-stream; charset=utf-8");
			responseHeaders.remove("content-length");
		}
		done({
			{ "ok", true },
			{ "response", QJsonObject{
				{ "status", status ? status : 200 },
				{ "statusText", statusText },
				{ "headers", responseHeaders },
				{ "body", QString::fromUtf8(body) },
			} },
		});
	});
}

} // namespace Ai
