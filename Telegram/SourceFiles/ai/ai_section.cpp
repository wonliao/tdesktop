#include "ai/ai_section.h"

#include "ai/ai_memento.h"
#include "data/data_thread.h"
#include "dialogs/dialogs_key.h"
#include "history/history.h"
#include "history/history_item.h"
#include "history/history_item_text.h"
#include "history/view/history_view_element.h"
#include "main/main_session.h"
#include "storage/storage_account.h"
#include "ui/painter.h"
#include "ui/rp_widget.h"
#include "ui/webview_helpers.h"
#include "webview/webview_data_stream_memory.h"
#include "webview/webview_embed.h"
#include "webview/webview_interface.h"
#include "window/window_session_controller.h"
#include "styles/style_window.h"

#include <QtCore/QJsonArray>
#include <QtCore/QJsonDocument>
#include <QtCore/QJsonObject>
#include <QtCore/QFile>
#include <QtCore/QRegularExpression>

namespace Ai {
namespace {

constexpr auto kContextMessagesLimit = 40;

[[nodiscard]] std::string MimeFor(std::string_view id) {
	if (id.ends_with(".html")) {
		return "text/html; charset=utf-8";
	} else if (id.ends_with(".js")) {
		return "text/javascript";
	} else if (id.ends_with(".json")) {
		return "application/json";
	} else if (id.ends_with(".wasm")) {
		return "application/wasm";
	} else if (id.ends_with(".png")) {
		return "image/png";
	} else if (id.ends_with(".jpg") || id.ends_with(".jpeg")) {
		return "image/jpeg";
	} else if (id.ends_with(".svg")) {
		return "image/svg+xml";
	} else if (id.ends_with(".zip")) {
		return "application/zip";
	} else if (id.ends_with(".vrm") || id.ends_with(".vrma")) {
		return "application/octet-stream";
	}
	return {};
}

[[nodiscard]] bool SafeAvatarStageName(std::string_view id) {
	const auto name = QString::fromUtf8(id.data(), id.size());
	const auto pattern = u"^[a-zA-Z\\.\\-_0-9/]+$"_q;
	return !name.startsWith('/')
		&& !name.contains(u".."_q)
		&& QRegularExpression(pattern).match(name).hasMatch();
}

[[nodiscard]] QByteArray ReadAvatarStageResource(std::string_view id) {
	auto file = QFile(u":/avatar-stage/"_q
		+ QString::fromUtf8(id.data(), id.size()));
	return file.open(QIODevice::ReadOnly) ? file.readAll() : QByteArray();
}

[[nodiscard]] QJsonObject MessageContext(not_null<HistoryItem*> item) {
	auto result = QJsonObject();
	const auto fullId = item->fullId();
	const auto text = HistoryItemText(item).expanded;
	result.insert("id", double(fullId.msg.bare));
	result.insert("peerId", QString::number(fullId.peer.value));
	result.insert("sender", item->author()->name());
	result.insert("timestamp", item->date());
	result.insert("outgoing", item->out());
	result.insert("text", text);
	return result;
}

} // namespace

Section::Section(
	QWidget *parent,
	not_null<Window::SessionController*> controller,
	Window::Column)
: Window::SectionWidget(parent, controller) {
	setAttribute(Qt::WA_OpaquePaintEvent, true);
	setupWebview();
}

Section::~Section() {
	_destroying = true;
}

bool Section::showInternal(
		not_null<Window::SectionMemento*> memento,
		const Window::SectionShow &) {
	return sameTypeAs(memento);
}

bool Section::sameTypeAs(not_null<Window::SectionMemento*> memento) {
	return (dynamic_cast<Memento*>(memento.get()) != nullptr);
}

std::shared_ptr<Window::SectionMemento> Section::createMemento() {
	return std::make_shared<Memento>();
}

bool Section::floatPlayerHandleWheelEvent(QEvent*) {
	return false;
}

QRect Section::floatPlayerAvailableRect() {
	return mapToGlobal(rect());
}

QJsonObject Section::chatContext() const {
	const auto key = controller()->activeChatCurrent();
	const auto thread = key.thread();
	if (!thread) {
		return {
			{ "available", false },
			{ "reason", "no_active_chat" },
		};
	}
	const auto history = thread->owningHistory();
	auto messages = QJsonArray();
	for (auto block = history->blocks.rbegin()
		; block != history->blocks.rend() && messages.size() < kContextMessagesLimit
		; ++block) {
		for (auto i = (*block)->messages.rbegin()
			; i != (*block)->messages.rend() && messages.size() < kContextMessagesLimit
			; ++i) {
			const auto item = (*i)->data();
			if (!item->isRegular() || item->isService()) {
				continue;
			}
			if (const auto text = HistoryItemText(item).expanded; text.isEmpty()) {
				continue;
			}
			messages.prepend(MessageContext(item));
		}
	}
	return {
		{ "available", true },
		{ "peerId", QString::number(thread->peer()->id.value) },
		{ "title", thread->peer()->name() },
		{ "topicRootId", double(thread->topicRootId().bare) },
		{ "messages", messages },
	};
}

void Section::resizeEvent(QResizeEvent*) {
	updateWebviewGeometry();
	if (_fallback) {
		_fallback->setGeometry(rect());
	}
}

void Section::setupWebview() {
	_webview = std::make_unique<Webview::Window>(
		this,
		Webview::WindowConfig{
			.opaqueBg = st::windowBg->c,
			.storageId = session().local().resolveStorageIdOther(),
			.safe = true,
		});
	const auto raw = _webview.get();
	const auto widget = raw->widget();
	if (!widget) {
		showFallback();
		return;
	}
	QObject::connect(widget, &QObject::destroyed, this, [=] {
		if (_destroying || !_webview || _webview.get() != raw) {
			return;
		}
		_webview = nullptr;
		showFallback();
	});
	widget->show();
	updateWebviewGeometry();

	raw->setNavigationStartHandler([=](const QString &uri, bool) {
		return uri.startsWith(u"http://desktop-app-resource/avatar-stage/"_q);
	});
	raw->setNavigationDoneHandler([=](bool success) {
		if (!success) {
			showFallback();
		}
	});
	raw->setMessageHandler([=](const QJsonDocument &message) {
		handleMessage(message);
	});
	raw->setDataRequestHandler([=](Webview::DataRequest request) {
		return handleDataRequest(std::move(request));
	});
	raw->init(R"JS(
window.TelegramAiBridge = {
	receiveEvent: function(eventType, eventData) {
		window.dispatchEvent(new CustomEvent("telegram-ai:" + eventType, { detail: eventData || {} }));
	},
	postEvent: function(eventType, eventData) {
		if (window.external && window.external.invoke) {
			window.external.invoke(JSON.stringify({ event: eventType, data: eventData || {} }));
		}
	}
};
window.TelegramWebviewProxy = {
	postEvent: function(eventType, eventData) {
		if (window.external && window.external.invoke) {
			window.external.invoke(JSON.stringify({ event: eventType, data: eventData || {} }));
		}
	}
};
)JS");
	raw->navigateToData("avatar-stage/index.html");
}

void Section::showFallback() {
	if (!_fallback) {
		_fallback = Ui::CreateChild<Ui::RpWidget>(this);
		_fallback->paintRequest(
		) | rpl::on_next([=](QRect clip) {
			auto p = QPainter(_fallback);
			p.fillRect(clip, st::windowBg);
		}, _fallback->lifetime());
	}
	_fallback->setGeometry(rect());
	_fallback->show();
	_fallback->raise();
}

void Section::updateWebviewGeometry() {
	if (_webview) {
		if (const auto widget = _webview->widget()) {
			widget->setGeometry(rect());
		} else {
			showFallback();
		}
	}
}

void Section::handleMessage(const QJsonDocument &message) {
	const auto object = message.object();
	auto event = object.value("event").toString();
	if (event.isEmpty()) {
		event = object.value("type").toString();
	}
	if (event == u"ready"_q || event == u"bridgeReady"_q) {
		loadAvatar();
		showCapabilities();
		postEvent(u"chatContext"_q, chatContext());
	} else if (event == u"request_chat_context"_q
		|| event == u"requestChatContext"_q) {
		postEvent(u"chatContext"_q, chatContext());
	} else if (event == u"request_avatar_profile"_q
		|| event == u"requestAvatarProfile"_q) {
		const auto id = object.value("data").toObject().value("id").toString();
		postCommand({
			{ "type", "loadCharacter" },
			{ "profile", _providers.avatarProfile(id) },
		});
	} else if (event == u"request_ai_analysis"_q
		|| event == u"requestAiAnalysis"_q) {
		const auto task = object.value("data").toObject().value("task").toString();
		postEvent(u"aiAnalysis"_q, aiAnalysis(task));
	} else if (event == u"request_tts"_q || event == u"requestTts"_q) {
		const auto text = object.value("data").toObject().value("text").toString();
		previewSpeech(text);
	}
}

void Section::postEvent(const QString &event, const QJsonObject &data) {
	if (!_webview || !_webview->widget()) {
		return;
	}
	const auto payload = QJsonDocument(data).toJson(QJsonDocument::Compact);
	const auto script = QByteArray(
		"if (window.TelegramAiBridge && window.TelegramAiBridge.receiveEvent) { "
			"window.TelegramAiBridge.receiveEvent(\"")
		+ Ui::EscapeForScriptString(event.toUtf8())
		+ "\", "
		+ payload
		+ "); } else { window.dispatchEvent(new CustomEvent(\"telegram-ai:"
		+ Ui::EscapeForScriptString(event.toUtf8())
		+ "\", { detail: "
		+ payload
		+ " })); }";
	_webview->eval(script);
}

void Section::postCommand(const QJsonObject &data) {
	if (!_webview || !_webview->widget()) {
		return;
	}
	const auto payload = QJsonDocument(data).toJson(QJsonDocument::Compact);
	const auto script = QByteArray(
		"if (window.stageBridge && window.stageBridge.handleNativeCommand) { "
			"window.stageBridge.handleNativeCommand(")
		+ payload
		+ "); } else { window.__pendingStageCommands = window.__pendingStageCommands || []; "
			"window.__pendingStageCommands.push("
		+ payload
		+ "); }";
	_webview->eval(script);
}

void Section::loadAvatar() {
	postCommand({
		{ "type", "loadCharacter" },
		{ "profile", _providers.avatarProfile() },
	});
}

void Section::showCapabilities() {
	postEvent(u"aiCapabilities"_q, _providers.capabilities(kContextMessagesLimit));
}

QJsonObject Section::aiAnalysis(const QString &task) const {
	return _providers.analyze(chatContext(), task);
}

void Section::previewSpeech(const QString &text) {
	const auto result = _providers.synthesizeSpeech(text);
	if (!result.value("ok").toBool()) {
		postEvent(u"ttsStatus"_q, result);
		return;
	}
	const auto duration = result.value("durationMs").toInt();
	postEvent(u"ttsStatus"_q, {
		{ "available", true },
		{ "ok", true },
		{ "provider", result.value("provider").toString() },
		{ "speaking", true },
		{ "durationMs", duration },
	});
	postCommand({
		{ "type", "setSpeaking" },
		{ "boolValue", true },
	});
	postCommand({
		{ "type", "setMouthOpen" },
		{ "doubleValue", 0.68 },
	});
	postCommand({
		{ "type", "setSpeechAudio" },
		{ "stringValue", result.value("audioBase64").toString() },
		{ "stringValue2", result.value("mimeType").toString() },
	});
	const auto script = QByteArray(
		"window.setTimeout(function() {"
			"if (window.stageBridge && window.stageBridge.handleNativeCommand) {"
				"window.stageBridge.handleNativeCommand({ type: \"stop\" });"
			"}"
			"window.dispatchEvent(new CustomEvent(\"telegram-ai:ttsStatus\", "
				"{ detail: { speaking: false } }));"
		"}, ")
		+ QByteArray::number(duration)
		+ ");";
	_webview->eval(script);
}

Webview::DataResult Section::handleDataRequest(Webview::DataRequest request) {
	const auto pos = request.id.find('#');
	if (pos != request.id.npos) {
		request.id = request.id.substr(0, pos);
	}
	if (!request.id.starts_with("avatar-stage/")) {
		return Webview::DataResult::Failed;
	}
	const auto id = std::string_view(request.id).substr(13);
	if (!SafeAvatarStageName(id)) {
		return Webview::DataResult::Failed;
	}
	auto bytes = ReadAvatarStageResource(id);
	if (bytes.isEmpty()) {
		return Webview::DataResult::Failed;
	}
	request.done({
		.stream = std::make_unique<Webview::DataStreamFromMemory>(
			std::move(bytes),
			MimeFor(id)),
	});
	return Webview::DataResult::Done;
}

} // namespace Ai
