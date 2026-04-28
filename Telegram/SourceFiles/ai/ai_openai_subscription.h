#pragma once

#include <QtCore/QJsonObject>
#include <QtNetwork/QNetworkAccessManager>

#include <functional>
#include <memory>

class QNetworkReply;
class QTcpServer;

namespace Ai {

class OpenAISubscription final {
public:
	using Callback = std::function<void(QJsonObject)>;

	OpenAISubscription();
	~OpenAISubscription();

	[[nodiscard]] QJsonObject status() const;
	void startLogin(Callback done);
	void logout();
	void proxyFetch(const QJsonObject &data, Callback done);

private:
	struct Tokens;

	[[nodiscard]] Tokens loadTokens() const;
	void saveTokens(const Tokens &tokens);
	void clearLogin();
	void finishLoginError(const QString &message);
	void exchangeCode(const QString &code, quint16 callbackPort);
	void refreshTokens(Tokens tokens, Callback done);
	void proxyFetchWithToken(
		const QJsonObject &data,
		Tokens tokens,
		Callback done);

	QNetworkAccessManager _manager;
	std::unique_ptr<QTcpServer> _server;
	QString _loginState;
	QString _codeVerifier;
	Callback _loginDone;
};

} // namespace Ai
