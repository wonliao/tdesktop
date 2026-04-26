#include "ai/ai_tabbed_section.h"

#include "ai/ai_memento.h"
#include "ai/ai_section.h"
#include "ai/ai_tabbed_memento.h"
#include "ui/controls/sub_tabs.h"
#include "window/section_memento.h"
#include "window/window_session_controller.h"
#include "styles/style_info.h"

namespace Ai {

TabbedSection::TabbedSection(
	QWidget *parent,
	not_null<Window::SessionController*> controller,
	Window::Column column,
	not_null<TabbedMemento*> memento)
: Window::SectionWidget(parent, controller)
, _column(column)
, _infoMemento(memento->info())
, _info(_infoMemento->createWidget(this, controller, column, QRect()))
, _ai(object_ptr<Section>(this, controller, column))
, _aiActive(memento->aiActive()) {
	setupTabs();
	_info->show();
	_ai->hide();
	if (_aiActive) {
		showAi();
	} else {
		showInfo();
	}
}

TabbedSection::~TabbedSection() = default;

Dialogs::RowDescriptor TabbedSection::activeChat() const {
	return _info ? _info->activeChat() : Dialogs::RowDescriptor();
}

bool TabbedSection::showInternal(
		not_null<Window::SectionMemento*> memento,
		const Window::SectionShow &params) {
	if (const auto tabs = dynamic_cast<TabbedMemento*>(memento.get())) {
		_infoMemento = tabs->info();
		if (_infoMemento && !_info->showInternal(_infoMemento.get(), params)) {
			_info = _infoMemento->createWidget(this, controller(), _column, QRect());
		}
		if (tabs->aiActive()) {
			showAi();
		} else {
			showInfo();
		}
		updateGeometry();
		return true;
	} else if (dynamic_cast<Memento*>(memento.get())) {
		showAi();
		return true;
	} else if (_info && _info->showInternal(memento, params)) {
		showInfo();
		return true;
	}
	return false;
}

bool TabbedSection::sameTypeAs(not_null<Window::SectionMemento*> memento) {
	return (dynamic_cast<TabbedMemento*>(memento.get()) != nullptr);
}

std::shared_ptr<Window::SectionMemento> TabbedSection::createMemento() {
	return std::make_shared<TabbedMemento>(
		_info ? _info->createMemento() : _infoMemento,
		_aiActive);
}

bool TabbedSection::floatPlayerHandleWheelEvent(QEvent *e) {
	return activeWidget()->floatPlayerHandleWheelEvent(e);
}

QRect TabbedSection::floatPlayerAvailableRect() {
	return activeWidget()->floatPlayerAvailableRect();
}

void TabbedSection::resizeEvent(QResizeEvent*) {
	updateGeometry();
}

void TabbedSection::setupTabs() {
	_tabs = object_ptr<Ui::SubTabs>(
		this,
		st::defaultSubTabs,
		Ui::SubTabs::Options{
			.selected = (_aiActive ? u"ai"_q : u"info"_q),
			.centered = true,
		},
		std::vector<Ui::SubTabs::Tab>{
			{ u"info"_q, { u"Info"_q } },
			{ u"ai"_q, { u"AI"_q } },
		});
	_tabs->show();
	_tabs->activated(
	) | rpl::on_next([=](const QString &id) {
		if (id == u"ai"_q) {
			showAi();
		} else {
			showInfo();
		}
	}, _tabs->lifetime());
}

void TabbedSection::showInfo() {
	_aiActive = false;
	_tabs->setActiveTab(u"info"_q);
	_info->show();
	_ai->hide();
	_info->raise();
	_tabs->raise();
}

void TabbedSection::showAi() {
	_aiActive = true;
	_tabs->setActiveTab(u"ai"_q);
	_ai->show();
	_info->hide();
	_ai->raise();
	_tabs->raise();
}

void TabbedSection::updateGeometry() {
	if (!_tabs) {
		return;
	}
	_tabs->resizeToWidth(width());
	const auto top = _tabs->height();
	_tabs->moveToLeft(0, 0);
	const auto content = rect().marginsRemoved({ 0, top, 0, 0 });
	_info->setGeometry(content);
	_ai->setGeometry(content);
}

not_null<Window::SectionWidget*> TabbedSection::activeWidget() const {
	return _aiActive
		? not_null<Window::SectionWidget*>(_ai.get())
		: not_null<Window::SectionWidget*>(_info.get());
}

} // namespace Ai
