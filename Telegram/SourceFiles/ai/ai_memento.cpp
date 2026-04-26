#include "ai/ai_memento.h"

#include "ai/ai_section.h"

namespace Ai {

Memento::Memento() = default;

Memento::~Memento() = default;

object_ptr<Window::SectionWidget> Memento::createWidget(
		QWidget *parent,
		not_null<Window::SessionController*> controller,
		Window::Column column,
		const QRect &geometry) {
	auto result = object_ptr<Section>(parent, controller, column);
	result->setGeometry(geometry);
	return result;
}

} // namespace Ai
