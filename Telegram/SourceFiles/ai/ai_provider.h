#pragma once

#include <QtCore/QJsonObject>

namespace Ai {

class ProviderFacade final {
public:
	[[nodiscard]] QJsonObject avatarProfile() const;
	[[nodiscard]] QJsonObject avatarProfile(const QString &id) const;
	[[nodiscard]] QJsonObject capabilities(int contextMessagesLimit) const;
	[[nodiscard]] QJsonObject analyze(
		const QJsonObject &context,
		const QString &task) const;
	[[nodiscard]] QJsonObject synthesizeSpeech(const QString &text) const;
};

} // namespace Ai
