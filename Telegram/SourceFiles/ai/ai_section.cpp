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
#include <QtCore/QDebug>
#include <QtCore/QRegularExpression>

#include <cstring>

namespace Ai {
namespace {

constexpr auto kContextMessagesLimit = 40;
constexpr auto kAiriStagePrefix = "airi-stage/";
constexpr auto kAiriStageOpenAISubscriptionPrefix
	= "airi-stage-openai-subscription-v3/";

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
		return uri.startsWith(u"http://desktop-app-resource/airi-stage/"_q)
			|| uri.startsWith(
				u"http://desktop-app-resource/airi-stage-openai-subscription-v3/"_q);
	});
	raw->setNavigationDoneHandler([=](bool success) {
		if (!success) {
			showFallback();
		} else {
			showOpenAISubscriptionRoute();
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
(function() {
	function report(kind, value) {
		try {
			var message = "";
			var stack = "";
			if (value) {
				message = value.message || String(value);
				stack = value.stack || "";
			}
			window.TelegramAiBridge && window.TelegramAiBridge.postEvent("airi_runtime_error", {
				kind: kind,
				message: message,
				stack: stack
			});
		} catch (e) {
		}
	}
	window.addEventListener("error", function(event) {
		report("error", event.error || event.message);
	});
	window.addEventListener("unhandledrejection", function(event) {
		report("unhandledrejection", event.reason);
	});
})();
window.TelegramAiBridge = {
	_openAISubscriptionRequests: {},
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
	openAISubscriptionRequest: function(type, data) {
		var requestId = String(Date.now()) + "-" + Math.random().toString(36).slice(2);
		var payload = data || {};
		payload.type = type;
		payload.requestId = requestId;
		return new Promise(function(resolve, reject) {
			window.TelegramAiBridge._openAISubscriptionRequests[requestId] = {
				resolve: resolve,
				reject: reject
			};
			window.TelegramAiBridge.postEvent("openai_subscription_bridge", payload);
		});
	},
	openAISubscriptionLogin: function() {
		return window.TelegramAiBridge.openAISubscriptionRequest("startLogin", {});
	},
	openAISubscriptionLogout: function() {
		return window.TelegramAiBridge.openAISubscriptionRequest("logout", {});
	},
	openAISubscriptionStatus: function() {
		return window.TelegramAiBridge.openAISubscriptionRequest("status", {});
	},
	openAISubscriptionProxyFetch: function(request) {
		return window.TelegramAiBridge.openAISubscriptionRequest("proxyFetch", { request: request });
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
window.addEventListener("telegram-ai:openaiSubscriptionBridgeResult", function(event) {
	var detail = event.detail || {};
	var request = window.TelegramAiBridge._openAISubscriptionRequests[detail.requestId];
	if (!request) {
		return;
	}
	delete window.TelegramAiBridge._openAISubscriptionRequests[detail.requestId];
	if (detail.ok) {
		request.resolve(detail.result || {});
	} else {
		request.reject(new Error(detail.error || "OpenAI subscription bridge failed."));
	}
});
window.TelegramOpenAISubscription = {
	request: function(type, data) {
		return window.TelegramAiBridge.openAISubscriptionRequest(type, data);
	},
	startLogin: function() {
		return window.TelegramAiBridge.openAISubscriptionLogin();
	},
	logout: function() {
		return window.TelegramAiBridge.openAISubscriptionLogout();
	},
	status: function() {
		return window.TelegramAiBridge.openAISubscriptionStatus();
	},
	proxyFetch: function(request) {
		return window.TelegramAiBridge.openAISubscriptionProxyFetch(request);
	}
};
)JS");
	raw->navigateToData(
		"airi-stage-openai-subscription-v3/index.html"
		"?telegram_plus_assets=20260427_openai_subscription_detail7");
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
		showOpenAISubscriptionRoute();
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
	} else if (event == u"openai_subscription_bridge"_q) {
		handleOpenAISubscriptionBridge(object.value("data").toObject());
	} else if (event == u"airi_runtime_error"_q) {
		qWarning().noquote()
			<< "AIRI runtime error:"
			<< QString::fromUtf8(QJsonDocument(
				object.value("data").toObject()).toJson(QJsonDocument::Compact));
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

void Section::handleOpenAISubscriptionBridge(const QJsonObject &data) {
	const auto requestId = data.value("requestId").toString();
	const auto type = data.value("type").toString();
	if (type == u"status"_q) {
		postOpenAISubscriptionBridgeResult(requestId, _openaiSubscription.status());
	} else if (type == u"startLogin"_q) {
		_openaiSubscription.startLogin([=](QJsonObject result) {
			postOpenAISubscriptionBridgeResult(requestId, std::move(result));
		});
	} else if (type == u"logout"_q) {
		_openaiSubscription.logout();
		postOpenAISubscriptionBridgeResult(requestId, {
			{ "ok", true },
			{ "authenticated", false },
		});
	} else if (type == u"proxyFetch"_q) {
		_openaiSubscription.proxyFetch(data, [=](QJsonObject result) {
			postOpenAISubscriptionBridgeResult(requestId, std::move(result));
		});
	} else {
		postOpenAISubscriptionBridgeResult(requestId, {
			{ "ok", false },
			{ "error", "Unknown OpenAI subscription bridge request." },
		});
	}
}

void Section::postOpenAISubscriptionBridgeResult(
		const QString &requestId,
		QJsonObject result) {
	const auto ok = result.value("ok").toBool();
	const auto error = result.value("error").toString();
	result.remove("ok");
	result.remove("error");
	postEvent(u"openaiSubscriptionBridgeResult"_q, {
		{ "requestId", requestId },
		{ "ok", ok },
		{ "error", error },
		{ "result", result },
	});
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

void Section::showOpenAISubscriptionRoute() {
	if (!_webview || !_webview->widget()) {
		return;
	}
	_webview->eval(R"JS(
(function() {
	var target = "/settings/providers/chat/openai-subscription";
	var attempts = 0;
	var setStyles = function(element, styles) {
		Object.keys(styles).forEach(function(key) {
			element.style[key] = styles[key];
		});
	};
	var notifyRoute = function() {
		var event;
		if (typeof PopStateEvent === "function") {
			event = new PopStateEvent("popstate", { state: {} });
		} else {
			event = document.createEvent("Event");
			event.initEvent("popstate", false, false);
		}
		window.dispatchEvent(event);
	};
		var notifyStorage = function(key, value) {
		try {
			window.dispatchEvent(new StorageEvent("storage", {
				key: key,
				newValue: value,
				storageArea: window.localStorage
			}));
		} catch (e) {
			window.dispatchEvent(new Event("storage"));
		}
	};
	var readStorageObject = function(key) {
		try {
			return JSON.parse(window.localStorage.getItem(key) || "{}") || {};
		} catch (e) {
			return {};
		}
	};
	var writeStorageObject = function(key, value) {
		var serialized = JSON.stringify(value || {});
		window.localStorage.setItem(key, serialized);
		notifyStorage(key, serialized);
	};
	var writeStorageString = function(key, value) {
		window.localStorage.setItem(key, value);
		notifyStorage(key, value);
	};
	var configureOpenAISubscriptionProvider = function() {
		var providerId = "openai-subscription";
		var credentials = readStorageObject("settings/credentials/providers");
		credentials[providerId] = {
			telegramOpenAISubscriptionConnectedAt: Date.now()
		};
		writeStorageObject("settings/credentials/providers", credentials);
		var added = readStorageObject("settings/providers/added");
		added[providerId] = true;
		writeStorageObject("settings/providers/added", added);
		writeStorageString("settings/consciousness/active-provider", providerId);
		writeStorageString("settings/consciousness/active-model", "gpt-5.4");
		window.dispatchEvent(new CustomEvent("telegram-ai:openaiSubscriptionConfigured", {
			detail: { providerId: providerId }
		}));
	};
	var clearOpenAISubscriptionProvider = function() {
		var providerId = "openai-subscription";
		var credentials = readStorageObject("settings/credentials/providers");
		delete credentials[providerId];
		writeStorageObject("settings/credentials/providers", credentials);
		var added = readStorageObject("settings/providers/added");
		delete added[providerId];
		writeStorageObject("settings/providers/added", added);
		if (window.localStorage.getItem("settings/consciousness/active-provider") === providerId) {
			writeStorageString("settings/consciousness/active-provider", "");
			writeStorageString("settings/consciousness/active-model", "");
		}
	};
		var ensureOpenAISubscriptionPanel = function() {
			if (window.location.pathname !== target || !document.body) {
				return;
			}
			setStyles(document.documentElement, {
				background: "#0f0f10"
			});
			setStyles(document.body, {
				background: "#0f0f10",
				color: "rgba(255, 255, 255, 0.94)"
			});
			var findOpenAISubscriptionTitle = function() {
				var candidates = document.querySelectorAll("h1, h2, h3, div, span");
				for (var i = 0; i != candidates.length; ++i) {
					var element = candidates[i];
				if ((element.textContent || "").trim() === "OpenAI (Subscription)") {
					return element;
				}
				}
				return null;
			};
			var ensureHost = function() {
				var host = document.getElementById("telegram-openai-subscription-host");
				if (!host) {
					host = document.createElement("div");
					host.id = "telegram-openai-subscription-host";
					host.setAttribute("data-telegram-openai-subscription-host", "1");
				}
				setStyles(host, {
					boxSizing: "border-box",
					display: "block",
					width: "100%",
					margin: "0",
					padding: "0 0 32px 0",
					position: "relative",
					zIndex: "2",
					visibility: "visible",
					opacity: "1"
				});
				var title = findOpenAISubscriptionTitle();
				if (title) {
					var anchor = title;
					for (var i = 0; i != 6; ++i) {
						var parent = anchor.parentElement;
						if (!parent || parent === document.body) {
							break;
						}
						var text = (parent.textContent || "").trim();
						var rect = parent.getBoundingClientRect();
						var style = window.getComputedStyle(parent);
						if (text.indexOf("OpenAI (Subscription)") === -1
							|| (rect.height > 180
								&& style.overflow !== "hidden"
								&& style.overflowY !== "hidden")) {
							break;
						}
						anchor = parent;
					}
					var targetParent = anchor.parentElement;
					if (targetParent && host.parentElement !== targetParent) {
						targetParent.insertBefore(host, anchor.nextSibling);
					} else if (targetParent && host.previousSibling !== anchor) {
						targetParent.insertBefore(host, anchor.nextSibling);
					}
					return host;
				}
				var app = document.getElementById("app");
				var targetHost = document.querySelector("main")
					|| app
					|| document.body;
				if (targetHost === document.body) {
					setStyles(host, {
						padding: "96px 0 32px 0"
					});
				} else {
					setStyles(host, {
						padding: "72px 0 32px 0"
					});
				}
				if (host.parentElement !== targetHost) {
					targetHost.appendChild(host);
				}
				return host;
			};
			var mountPanel = function(panel) {
				var host = ensureHost();
				if (panel.parentElement !== host) {
					host.appendChild(panel);
				}
				if (!host.contains(panel)) {
					document.body.appendChild(panel);
				}
				if (panel.scrollIntoView && !panel.dataset.telegramOpenaiSubscriptionScrolled) {
					panel.dataset.telegramOpenaiSubscriptionScrolled = "1";
					try {
						panel.scrollIntoView({ block: "nearest" });
					} catch (e) {
					}
				}
			};
			var applyPanelStyles = function(panel) {
				setStyles(panel, {
					position: "relative",
				left: "",
				right: "",
				top: "",
				zIndex: "",
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					gap: "14px",
					width: "calc(100% - 48px)",
					maxWidth: "520px",
					margin: "24px 24px 0 24px",
					padding: "18px",
					borderRadius: "14px",
					border: "1px solid rgba(148, 163, 184, 0.34)",
					background: "rgba(17, 24, 39, 0.96)",
				color: "rgba(255, 255, 255, 0.94)",
				boxShadow: "0 18px 44px rgba(0, 0, 0, 0.24)",
					fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
					fontSize: "14px",
					lineHeight: "1.45",
					backdropFilter: "",
					pointerEvents: "auto",
					visibility: "visible",
					opacity: "1",
					transform: "none"
				});
			};
			var existing = document.getElementById("telegram-openai-subscription-panel");
			var panel = existing;
			if (!panel) {
				panel = document.createElement("div");
			panel.id = "telegram-openai-subscription-panel";
			panel.setAttribute("data-telegram-openai-subscription-mounted", "1");
			var title = document.createElement("div");
			title.textContent = "OpenAI Subscription";
			setStyles(title, {
				fontSize: "18px",
				fontWeight: "700",
				lineHeight: "1.2"
			});
			var description = document.createElement("div");
			description.textContent = "Connect your ChatGPT subscription account for chat models.";
			setStyles(description, {
				color: "rgba(226, 232, 240, 0.82)",
				marginTop: "-6px"
			});
			var status = document.createElement("div");
			status.setAttribute("data-openai-subscription-status", "1");
			status.textContent = "Checking login status...";
			setStyles(status, {
				minHeight: "20px",
				color: "rgba(226, 232, 240, 0.9)"
			});
			var actions = document.createElement("div");
			setStyles(actions, {
				display: "flex",
				gap: "10px",
				flexWrap: "wrap"
			});
			var makeButton = function(label, primary) {
				var button = document.createElement("button");
				button.type = "button";
				button.textContent = label;
				setStyles(button, {
					border: primary ? "0" : "1px solid rgba(148, 163, 184, 0.36)",
					borderRadius: "999px",
					padding: "9px 14px",
					color: "white",
					background: primary ? "rgba(59, 130, 246, 0.98)" : "rgba(15, 23, 42, 0.62)",
					cursor: "pointer",
					font: "inherit",
					fontWeight: "650"
				});
				return button;
			};
			var signIn = makeButton("Sign in with OpenAI", true);
			signIn.setAttribute("data-openai-subscription-login", "1");
			var useProvider = makeButton("Use for Chat", true);
			useProvider.setAttribute("data-openai-subscription-use", "1");
			useProvider.style.display = "none";
			var logout = makeButton("Logout", false);
			logout.setAttribute("data-openai-subscription-logout", "1");
			actions.appendChild(signIn);
			actions.appendChild(useProvider);
			actions.appendChild(logout);
			panel.appendChild(title);
			panel.appendChild(description);
			panel.appendChild(status);
			panel.appendChild(actions);
		}
		applyPanelStyles(panel);
		mountPanel(panel);
		var statusNode = panel.querySelector("[data-openai-subscription-status]");
		var loginButton = panel.querySelector("[data-openai-subscription-login]");
		var useButton = panel.querySelector("[data-openai-subscription-use]");
		var logoutButton = panel.querySelector("[data-openai-subscription-logout]");
		var setStatus = function(text, failed, authenticated) {
			if (!statusNode) {
				return;
			}
			statusNode.textContent = text;
			statusNode.style.color = failed ? "#fecaca" : "rgba(226, 232, 240, 0.9)";
			if (useButton) {
				useButton.style.display = authenticated ? "" : "none";
			}
		};
		var refresh = function() {
			if (!window.TelegramOpenAISubscription || !window.TelegramOpenAISubscription.status) {
				setStatus("OpenAI subscription bridge is unavailable.", true);
				return;
			}
			window.TelegramOpenAISubscription.status().then(function(result) {
				if (result && result.authenticated) {
					configureOpenAISubscriptionProvider();
					setStatus("Signed in. Provider selected for chat.", false, true);
				} else {
					setStatus("Not signed in.", false, false);
				}
			}, function(error) {
				setStatus((error && error.message) || "Could not read login status.", true);
			});
		};
		if (!panel.dataset.telegramOpenaiSubscriptionBound) {
			panel.dataset.telegramOpenaiSubscriptionBound = "1";
			loginButton.addEventListener("click", function() {
				loginButton.disabled = true;
				setStatus("Opening OpenAI login...");
				window.TelegramOpenAISubscription.startLogin().then(function(result) {
					loginButton.disabled = false;
					if (result && result.authenticated) {
						configureOpenAISubscriptionProvider();
						setStatus("Signed in. Provider selected for chat.", false, true);
					} else {
						setStatus("Not signed in.", false, false);
					}
				}, function(error) {
					loginButton.disabled = false;
					setStatus((error && error.message) || "OpenAI login failed.", true);
				});
			});
			if (useButton) {
				useButton.addEventListener("click", function() {
					configureOpenAISubscriptionProvider();
					setStatus("Provider selected for chat.", false, true);
				});
			}
			logoutButton.addEventListener("click", function() {
				logoutButton.disabled = true;
				setStatus("Logging out...");
				window.TelegramOpenAISubscription.logout().then(function() {
					logoutButton.disabled = false;
					clearOpenAISubscriptionProvider();
					setStatus("Not signed in.", false, false);
				}, function(error) {
					logoutButton.disabled = false;
					setStatus((error && error.message) || "Logout failed.", true);
				});
			});
		}
		refresh();
		};
		var syncRoute = function() {
			++attempts;
			if (!document.body) {
				if (attempts < 80) {
					window.setTimeout(syncRoute, 100);
				}
				return;
		}
		if (window.location.pathname !== target) {
			window.history.replaceState({}, "", target + window.location.search);
		}
			notifyRoute();
			ensureOpenAISubscriptionPanel();
			if (attempts < 80) {
				window.setTimeout(syncRoute, 100);
			}
		};
	syncRoute();
})();
)JS");
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
	if (request.id.starts_with(kAiriStageOpenAISubscriptionPrefix)) {
		request.id = std::string(kAiriStagePrefix)
			+ request.id.substr(strlen(kAiriStageOpenAISubscriptionPrefix));
	} else if (!request.id.starts_with(kAiriStagePrefix)) {
		return Webview::DataResult::Failed;
	}
	const auto id = std::string_view(request.id).substr(strlen(kAiriStagePrefix));
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
