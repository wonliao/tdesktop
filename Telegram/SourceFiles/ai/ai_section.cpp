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
	} else if (id.ends_with(".js")
		|| id.ends_with(".mjs")
		|| id.ends_with(".cjs")) {
		return "text/javascript";
	} else if (id.ends_with(".css")) {
		return "text/css; charset=utf-8";
	} else if (id.ends_with(".json") || id.ends_with(".map")) {
		return "application/json";
	} else if (id.ends_with(".webmanifest")) {
		return "application/manifest+json";
	} else if (id.ends_with(".wasm")) {
		return "application/wasm";
	} else if (id.ends_with(".png")) {
		return "image/png";
	} else if (id.ends_with(".webp")) {
		return "image/webp";
	} else if (id.ends_with(".avif")) {
		return "image/avif";
	} else if (id.ends_with(".jpg") || id.ends_with(".jpeg")) {
		return "image/jpeg";
	} else if (id.ends_with(".svg")) {
		return "image/svg+xml";
	} else if (id.ends_with(".ico")) {
		return "image/x-icon";
	} else if (id.ends_with(".zip")) {
		return "application/zip";
	} else if (id.ends_with(".ttf")) {
		return "font/ttf";
	} else if (id.ends_with(".woff")) {
		return "font/woff";
	} else if (id.ends_with(".woff2")) {
		return "font/woff2";
	} else if (id.ends_with(".vrm")
		|| id.ends_with(".vrma")
		|| id.ends_with(".hdr")
		|| id.ends_with(".task")) {
		return "application/octet-stream";
	} else if (id.ends_with(".txt") || id.ends_with(".md")) {
		return "text/plain; charset=utf-8";
	}
	return {};
}

[[nodiscard]] bool SafeAiriStageName(std::string_view id) {
	const auto name = QString::fromUtf8(id.data(), id.size());
	const auto pattern = u"^[a-zA-Z\\.\\-_0-9/]+$"_q;
	return !name.startsWith('/')
		&& !name.contains(u".."_q)
		&& QRegularExpression(pattern).match(name).hasMatch();
}

[[nodiscard]] QByteArray ReadAiriStageResource(std::string_view id) {
	auto file = QFile(u":/airi-stage/"_q
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
		return uri.startsWith(u"http://desktop-app-resource/airi-stage/"_q);
	});
	raw->setNavigationDoneHandler([=](bool success) {
		if (!success) {
			showFallback();
		} else {
			loadBriefAction();
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
	receiveCommand: function(commandData) {
		var command = commandData || {};
		window.dispatchEvent(new CustomEvent("telegram-ai:command", { detail: command }));
		if (command.type === "configureAiBrief" || command.type === "showAiBrief") {
			window.TelegramAiBridge.handleBriefCommand(command);
		}
	},
	postEvent: function(eventType, eventData) {
		if (window.external && window.external.invoke) {
			window.external.invoke(JSON.stringify({ event: eventType, data: eventData || {} }));
		}
	},
	handleBriefCommand: function(command) {
		var ensure = function() {
			if (!document.body) {
				window.setTimeout(ensure, 50);
				return;
			}
			var panel = document.getElementById("telegram-ai-brief-panel");
			if (!panel) {
				panel = document.createElement("div");
				panel.id = "telegram-ai-brief-panel";
				panel.style.position = "fixed";
				panel.style.left = "12px";
				panel.style.right = "12px";
				panel.style.bottom = "12px";
				panel.style.zIndex = "2147483647";
				panel.style.display = "flex";
				panel.style.flexDirection = "column";
				panel.style.gap = "8px";
				panel.style.padding = "10px";
				panel.style.borderRadius = "12px";
				panel.style.border = "1px solid rgba(148, 163, 184, 0.35)";
				panel.style.background = "rgba(15, 23, 42, 0.88)";
				panel.style.color = "white";
				panel.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.28)";
				panel.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
				panel.style.fontSize = "13px";
				panel.style.backdropFilter = "blur(18px)";
				var header = document.createElement("div");
				header.style.display = "flex";
				header.style.alignItems = "center";
				header.style.justifyContent = "space-between";
				header.style.gap = "8px";
				var title = document.createElement("div");
				title.textContent = command.title || "AI Brief";
				title.style.fontWeight = "650";
				var button = document.createElement("button");
				button.type = "button";
				button.textContent = command.label || "Brief";
				button.style.border = "0";
				button.style.borderRadius = "999px";
				button.style.padding = "6px 12px";
				button.style.color = "white";
				button.style.background = "rgba(59, 130, 246, 0.95)";
				button.style.cursor = "pointer";
				button.style.font = "inherit";
				var result = document.createElement("pre");
				result.dataset.telegramAiBriefResult = "1";
				result.style.display = "none";
				result.style.maxHeight = "220px";
				result.style.margin = "0";
				result.style.overflow = "auto";
				result.style.whiteSpace = "pre-wrap";
				result.style.wordBreak = "break-word";
				result.style.color = "rgba(255, 255, 255, 0.92)";
				result.style.font = "12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
				button.addEventListener("click", function() {
					result.style.display = "block";
					result.style.color = "rgba(255, 255, 255, 0.92)";
					result.textContent = "Loading...";
					window.TelegramAiBridge.postEvent("request_ai_brief", { task: "ai_brief" });
				});
				header.appendChild(title);
				header.appendChild(button);
				panel.appendChild(header);
				panel.appendChild(result);
				document.body.appendChild(panel);
			}
			if (command.type !== "showAiBrief") {
				return;
			}
			var result = panel.querySelector("[data-telegram-ai-brief-result]");
			var analysis = command.analysis || {};
			result.style.display = "block";
			result.style.color = analysis.ok ? "rgba(255, 255, 255, 0.92)" : "#fecaca";
			result.textContent = analysis.ok
				? (analysis.displayText || "No brief text returned.")
				: ((analysis.error && analysis.error.message) || "AI brief failed.");
		};
		ensure();
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
	raw->navigateToData("airi-stage/index.html");
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
		loadBriefAction();
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
		if (task == u"ai_brief"_q) {
			showBrief(task);
		} else {
			postEvent(u"aiAnalysis"_q, aiAnalysis(task));
		}
	} else if (event == u"request_ai_brief"_q || event == u"requestAiBrief"_q) {
		showBrief(u"ai_brief"_q);
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
		"var __telegramNativeCommand = ")
		+ payload
		+ "; var __telegramNativeCommandHandled = false;"
			"if (window.stageBridge && window.stageBridge.handleNativeCommand) { "
				"try { window.stageBridge.handleNativeCommand("
		+ payload
		+ "); __telegramNativeCommandHandled = true; } catch (e) {} } "
			"if (window.TelegramAiBridge && window.TelegramAiBridge.receiveCommand) { "
				"window.TelegramAiBridge.receiveCommand("
		+ payload
		+ "); __telegramNativeCommandHandled = true; } "
			"if (!__telegramNativeCommandHandled) { "
				"window.__pendingStageCommands = window.__pendingStageCommands || []; "
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

void Section::loadBriefAction() {
	postCommand({
		{ "type", "configureAiBrief" },
		{ "title", "AI Brief" },
		{ "label", "Brief" },
		{ "task", "ai_brief" },
	});
}

void Section::showCapabilities() {
	postEvent(u"aiCapabilities"_q, _providers.capabilities(kContextMessagesLimit));
}

QJsonObject Section::aiAnalysis(const QString &task) const {
	return _providers.analyze(chatContext(), task);
}

void Section::showBrief(const QString &task) {
	const auto result = aiAnalysis(task);
	postEvent(u"aiAnalysis"_q, result);
	postCommand({
		{ "type", "showAiBrief" },
		{ "task", task },
		{ "analysis", result },
	});
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
	const auto hash = request.id.find('#');
	if (hash != request.id.npos) {
		request.id = request.id.substr(0, hash);
	}
	const auto query = request.id.find('?');
	if (query != request.id.npos) {
		request.id = request.id.substr(0, query);
	}
	if (!request.id.starts_with("airi-stage/")) {
		return Webview::DataResult::Failed;
	}
	const auto id = std::string_view(request.id).substr(11);
	if (!SafeAiriStageName(id)) {
		return Webview::DataResult::Failed;
	}
	auto bytes = ReadAiriStageResource(id);
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
