#include "ai/ai_provider.h"

#include <QtCore/QByteArray>
#include <QtCore/QJsonArray>
#include <QtCore/QStringList>

#include <algorithm>
#include <cmath>

namespace Ai {
namespace {

constexpr auto kSampleRate = 16000;
constexpr auto kBitsPerSample = 16;
constexpr auto kChannels = 1;
constexpr auto kProvider = "native-local";

struct ProviderConfig {
	QString llmEndpoint;
	QString llmModel;
	QString llmCredential;
	QString ttsEndpoint;
	QString ttsVoice;
	QString ttsCredential;
};

[[nodiscard]] ProviderConfig LoadConfig() {
	return {
		.llmEndpoint = qEnvironmentVariable("TELEGRAM_AI_LLM_ENDPOINT"),
		.llmModel = qEnvironmentVariable("TELEGRAM_AI_LLM_MODEL"),
		.llmCredential = qEnvironmentVariable("TELEGRAM_AI_LLM_TOKEN"),
		.ttsEndpoint = qEnvironmentVariable("TELEGRAM_AI_TTS_ENDPOINT"),
		.ttsVoice = qEnvironmentVariable("TELEGRAM_AI_TTS_VOICE"),
		.ttsCredential = qEnvironmentVariable("TELEGRAM_AI_TTS_TOKEN"),
	};
}

[[nodiscard]] QString CleanSnippet(QString text) {
	text = text.simplified();
	if (text.size() > 80) {
		text = text.left(77) + u"..."_q;
	}
	return text;
}

void AppendUInt16(QByteArray &bytes, uint16 value) {
	bytes.append(char(value & 0xFF));
	bytes.append(char((value >> 8) & 0xFF));
}

void AppendUInt32(QByteArray &bytes, uint32 value) {
	bytes.append(char(value & 0xFF));
	bytes.append(char((value >> 8) & 0xFF));
	bytes.append(char((value >> 16) & 0xFF));
	bytes.append(char((value >> 24) & 0xFF));
}

[[nodiscard]] QByteArray BuildWaveTone(int durationMs, int frequency) {
	const auto sampleCount = (kSampleRate * durationMs) / 1000;
	const auto dataSize = sampleCount * kChannels * (kBitsPerSample / 8);
	auto bytes = QByteArray();
	bytes.reserve(44 + dataSize);
	bytes.append("RIFF", 4);
	AppendUInt32(bytes, 36 + dataSize);
	bytes.append("WAVE", 4);
	bytes.append("fmt ", 4);
	AppendUInt32(bytes, 16);
	AppendUInt16(bytes, 1);
	AppendUInt16(bytes, kChannels);
	AppendUInt32(bytes, kSampleRate);
	AppendUInt32(bytes, kSampleRate * kChannels * (kBitsPerSample / 8));
	AppendUInt16(bytes, kChannels * (kBitsPerSample / 8));
	AppendUInt16(bytes, kBitsPerSample);
	bytes.append("data", 4);
	AppendUInt32(bytes, dataSize);
	for (auto i = 0; i != sampleCount; ++i) {
		const auto phase = (2.0 * M_PI * frequency * i) / kSampleRate;
		const auto fadeIn = std::min(1.0, i / double(kSampleRate / 20));
		const auto fadeOut = std::min(1.0, (sampleCount - i) / double(kSampleRate / 18));
		const auto envelope = std::min(fadeIn, fadeOut);
		const auto value = int16(std::sin(phase) * 9000.0 * envelope);
		AppendUInt16(bytes, uint16(value));
	}
	return bytes;
}

[[nodiscard]] QJsonObject Failure(QString provider, QString code, QString message) {
	return {
		{ "available", false },
		{ "ok", false },
		{ "provider", std::move(provider) },
		{ "error", QJsonObject{
			{ "code", std::move(code) },
			{ "message", std::move(message) },
		} },
	};
}

} // namespace

QJsonObject ProviderFacade::avatarProfile() const {
	return {
		{ "name", "AIRI Avatar" },
		{ "rendererType", "placeholder" },
		{ "fallbackRendererType", "placeholder" },
		{ "provider", kProvider },
	};
}

QJsonObject ProviderFacade::capabilities(int contextMessagesLimit) const {
	const auto config = LoadConfig();
	return {
		{ "avatar", QJsonObject{
			{ "name", "AIRI Avatar" },
			{ "runtime", "telegram-avatar WebStage" },
			{ "rendererType", "placeholder" },
		} },
		{ "llm", QJsonObject{
			{ "bridge", "native" },
			{ "provider", kProvider },
			{ "model", config.llmModel.isEmpty()
				? u"local-context-analyzer"_q
				: config.llmModel },
			{ "configured", true },
			{ "externalEndpointConfigured", !config.llmEndpoint.isEmpty() },
			{ "credentialConfigured", !config.llmCredential.isEmpty() },
			{ "contextMessagesLimit", contextMessagesLimit },
			{ "secretsExposedToWebview", false },
		} },
		{ "tts", QJsonObject{
			{ "bridge", "native" },
			{ "provider", kProvider },
			{ "format", "audio/wav" },
			{ "configured", true },
			{ "externalEndpointConfigured", !config.ttsEndpoint.isEmpty() },
			{ "credentialConfigured", !config.ttsCredential.isEmpty() },
			{ "voice", config.ttsVoice.isEmpty() ? u"local-tone"_q : config.ttsVoice },
			{ "secretsExposedToWebview", false },
		} },
	};
}

QJsonObject ProviderFacade::analyze(
		const QJsonObject &context,
		const QString &task) const {
	if (!context.value("available").toBool()) {
		return Failure(
			kProvider,
			u"context_unavailable"_q,
			u"目前沒有可分析的 active chat。"_q);
	}
	const auto messages = context.value("messages").toArray();
	if (messages.isEmpty()) {
		return Failure(
			kProvider,
			u"context_empty"_q,
			u"目前載入的聊天沒有文字訊息。"_q);
	}
	auto participants = QStringList();
	auto samples = QStringList();
	const auto count = int(messages.size());
	const auto first = std::max(0, count - 4);
	for (auto i = 0; i != messages.size(); ++i) {
		const auto message = messages.at(i).toObject();
		const auto sender = message.value("sender").toString();
		if (!sender.isEmpty() && !participants.contains(sender)) {
			participants.push_back(sender);
		}
		if (i >= first) {
			const auto text = CleanSnippet(message.value("text").toString());
			if (!text.isEmpty()) {
				samples.push_back(text);
			}
		}
	}
	const auto title = context.value("title").toString();
	const auto latest = messages.last().toObject().value("text").toString();
	const auto taskText = task.isEmpty()
		? u"分析目前聊天脈絡"_q
		: task;
	const auto summary = QStringList{
		u"任務："_q + taskText,
		u"聊天："_q + (title.isEmpty() ? u"未命名聊天"_q : title),
		u"上下文："_q + QString::number(messages.size()) + u" 則訊息、"_q
			+ QString::number(participants.size()) + u" 位發言者。"_q,
		u"近期重點："_q + samples.join(u" / "_q),
		u"建議：可用這份 native context payload 接上正式 LLM provider，WebView 不需要接觸 endpoint 或 secret。"_q,
	}.join(u"\n"_q);
	return {
		{ "available", true },
		{ "ok", true },
		{ "provider", kProvider },
		{ "model", "local-context-analyzer" },
		{ "chatTitle", title },
		{ "messageCount", count },
		{ "participantCount", participants.size() },
		{ "latestMessage", CleanSnippet(latest) },
		{ "displayText", summary },
		{ "speechText", summary },
	};
}

QJsonObject ProviderFacade::synthesizeSpeech(const QString &text) const {
	const auto normalized = text.simplified();
	if (normalized.isEmpty()) {
		return Failure(
			kProvider,
			u"tts_text_empty"_q,
			u"沒有可播放的 TTS 文字。"_q);
	}
	const auto duration = std::clamp(int(normalized.size()) * 45, 700, 1800);
	const auto frequency = 420 + (normalized.size() % 10) * 22;
	const auto wave = BuildWaveTone(duration, frequency);
	return {
		{ "available", true },
		{ "ok", true },
		{ "provider", kProvider },
		{ "mimeType", "audio/wav" },
		{ "audioBase64", QString::fromLatin1(wave.toBase64()) },
		{ "durationMs", duration },
	};
}

} // namespace Ai
