#pragma once

#include "base/object_ptr.h"
#include "window/section_memento.h"

namespace Ai {

class Memento final : public Window::SectionMemento {
public:
	Memento();
	~Memento();

	object_ptr<Window::SectionWidget> createWidget(
		QWidget *parent,
		not_null<Window::SessionController*> controller,
		Window::Column column,
		const QRect &geometry) override;
};

} // namespace Ai
