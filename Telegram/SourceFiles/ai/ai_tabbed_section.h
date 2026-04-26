#pragma once

#include "window/section_widget.h"

namespace Ui {
class SubTabs;
} // namespace Ui

namespace Ai {

class Section;
class TabbedMemento;

class TabbedSection final : public Window::SectionWidget {
public:
	TabbedSection(
		QWidget *parent,
		not_null<Window::SessionController*> controller,
		Window::Column column,
		not_null<TabbedMemento*> memento);
	~TabbedSection();

	Dialogs::RowDescriptor activeChat() const override;

	bool showInternal(
		not_null<Window::SectionMemento*> memento,
		const Window::SectionShow &params) override;
	bool sameTypeAs(not_null<Window::SectionMemento*> memento) override;

	std::shared_ptr<Window::SectionMemento> createMemento() override;
	bool floatPlayerHandleWheelEvent(QEvent *e) override;
	QRect floatPlayerAvailableRect() override;

protected:
	void resizeEvent(QResizeEvent*) override;

private:
	void setupTabs();
	void showInfo();
	void showAi();
	void updateGeometry();
	[[nodiscard]] not_null<Window::SectionWidget*> activeWidget() const;

	const Window::Column _column;
	std::shared_ptr<Window::SectionMemento> _infoMemento;
	object_ptr<Ui::SubTabs> _tabs = { nullptr };
	object_ptr<Window::SectionWidget> _info = { nullptr };
	object_ptr<Section> _ai = { nullptr };
	bool _aiActive = false;

};

} // namespace Ai
