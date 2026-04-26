#pragma once

#include "base/object_ptr.h"
#include "window/section_memento.h"

namespace Dialogs {
class Key;
} // namespace Dialogs

namespace Ai {

class TabbedMemento final : public Window::SectionMemento {
public:
	TabbedMemento(
		std::shared_ptr<Window::SectionMemento> info,
		bool aiActive = false);
	~TabbedMemento();

	object_ptr<Window::SectionWidget> createWidget(
		QWidget *parent,
		not_null<Window::SessionController*> controller,
		Window::Column column,
		const QRect &geometry) override;

	[[nodiscard]] rpl::producer<> removeRequests() const override;

	[[nodiscard]] std::shared_ptr<Window::SectionMemento> info() const;
	[[nodiscard]] bool aiActive() const;

private:
	std::shared_ptr<Window::SectionMemento> _info;
	bool _aiActive = false;

};

[[nodiscard]] std::shared_ptr<Window::SectionMemento> MakeTabbedMemento(
	Dialogs::Key key,
	bool aiActive = false);

[[nodiscard]] std::shared_ptr<Window::SectionMemento> MakeTabbedMemento(
	std::shared_ptr<Window::SectionMemento> info,
	bool aiActive = false);

} // namespace Ai
