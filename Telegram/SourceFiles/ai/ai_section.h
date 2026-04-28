#pragma once

#include "ai/ai_openai_subscription.h"
#include "ai/ai_provider.h"
#include "window/section_widget.h"
#include "webview/webview_common.h"

#include <QtCore/QJsonDocument>
#include <QtCore/QJsonObject>

#include <memory>

namespace Ui {
class RpWidget;
} // namespace Ui

namespace Webview {
class Window;
struct DataRequest;
enum class DataResult;
} // namespace Webview

namespace Ai {

class Section final : public Window::SectionWidget {
public:
	Section(
		QWidget *parent,
		not_null<Window::SessionController*> controller,
		Window::Column column);
	~Section();

	bool showInternal(
		not_null<Window::SectionMemento*> memento,
		const Window::SectionShow &params) override;
	bool sameTypeAs(not_null<Window::SectionMemento*> memento) override;

	std::shared_ptr<Window::SectionMemento> createMemento() override;
	bool floatPlayerHandleWheelEvent(QEvent *e) override;
	QRect floatPlayerAvailableRect() override;

	[[nodiscard]] QJsonObject chatContext() const;

protected:
	void resizeEvent(QResizeEvent*) override;

private:
	void setupWebview();
	void showFallback();
	void updateWebviewGeometry();
	void handleMessage(const QJsonDocument &message);
	void postEvent(const QString &event, const QJsonObject &data);
	void postCommand(const QJsonObject &data);
	void handleOpenAISubscriptionBridge(const QJsonObject &data);
	void postOpenAISubscriptionBridgeResult(
		const QString &requestId,
		QJsonObject result);
	void loadAvatar();
	void loadBriefAction();
	void showCapabilities();
	void showBrief(const QString &task);
	void previewSpeech(const QString &text);

	[[nodiscard]] QJsonObject aiAnalysis(const QString &task) const;

	[[nodiscard]] Webview::DataResult handleDataRequest(
		Webview::DataRequest request);

	std::unique_ptr<Webview::Window> _webview;
	ProviderFacade _providers;
	OpenAISubscription _openaiSubscription;
	Ui::RpWidget *_fallback = nullptr;
	bool _destroying = false;
};

} // namespace Ai
