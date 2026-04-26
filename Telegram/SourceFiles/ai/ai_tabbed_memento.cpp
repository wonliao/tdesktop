#include "ai/ai_tabbed_memento.h"

#include "ai/ai_tabbed_section.h"
#include "data/data_forum_topic.h"
#include "data/data_saved_sublist.h"
#include "dialogs/dialogs_key.h"
#include "history/history.h"
#include "info/info_controller.h"
#include "info/info_memento.h"

namespace Ai {

TabbedMemento::TabbedMemento(
	std::shared_ptr<Window::SectionMemento> info,
	bool aiActive)
: _info(std::move(info))
, _aiActive(aiActive) {
}

TabbedMemento::~TabbedMemento() = default;

object_ptr<Window::SectionWidget> TabbedMemento::createWidget(
		QWidget *parent,
		not_null<Window::SessionController*> controller,
		Window::Column column,
		const QRect &geometry) {
	auto result = object_ptr<TabbedSection>(parent, controller, column, this);
	result->setGeometry(geometry);
	return result;
}

rpl::producer<> TabbedMemento::removeRequests() const {
	return _info ? _info->removeRequests() : rpl::never<>();
}

std::shared_ptr<Window::SectionMemento> TabbedMemento::info() const {
	return _info;
}

bool TabbedMemento::aiActive() const {
	return _aiActive;
}

std::shared_ptr<Window::SectionMemento> MakeTabbedMemento(
		Dialogs::Key key,
		bool aiActive) {
	if (const auto topic = key.topic()) {
		return std::make_shared<TabbedMemento>(
			std::make_shared<Info::Memento>(topic),
			aiActive);
	} else if (const auto sublist = key.sublist()
		; sublist && sublist->parentChat()) {
		return std::make_shared<TabbedMemento>(
			std::make_shared<Info::Memento>(sublist),
			aiActive);
	} else if (const auto peer = key.peer()) {
		return std::make_shared<TabbedMemento>(
			std::make_shared<Info::Memento>(
				peer,
				Info::Memento::DefaultSection(peer)),
			aiActive);
	} else if (const auto sublist = key.sublist()) {
		const auto peer = sublist->owningHistory()->peer;
		return std::make_shared<TabbedMemento>(
			std::make_shared<Info::Memento>(
				peer,
				Info::Memento::DefaultSection(peer)),
			aiActive);
	}
	return nullptr;
}

std::shared_ptr<Window::SectionMemento> MakeTabbedMemento(
		std::shared_ptr<Window::SectionMemento> info,
		bool aiActive) {
	return std::make_shared<TabbedMemento>(std::move(info), aiActive);
}

} // namespace Ai
