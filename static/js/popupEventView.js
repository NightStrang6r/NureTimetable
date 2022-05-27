import Popup from './popup.js';
import Storage from './storage.js';

export default class PopupEventView extends Popup {
    constructor(popupSelector, calendar) {
        super(popupSelector, null);

        this.popupNameEl = document.querySelector('.event-data-title');
        this.popupDescriptionEl = document.querySelector('.event-data-description');
        this.popupDeleteEl = document.querySelector('.event-data-delete');
        this.popupEditEl = document.querySelector('.event-data-edit');

        this.popupDeleteEl.addEventListener('click', (event) => this.delete(event));
        this.popupEditEl.addEventListener('click', (event) => this.edit(event));

        this.pageCalendar = calendar;
        this.calendar = calendar.calendar;
        this.storage = new Storage();
    }

    setupListeners() {
        this.popupEl.classList.remove('d-none');
        this.popupEl.addEventListener('click', (event) => this.closeEvent(event));
        document.addEventListener('keyup', (event) => this.closeEvent(event));
    }

    open(info) {
        this.info = info;
        this.popupEl.classList.add('is-visible');

        this.popupNameEl.innerHTML = info.event.title;
        if(info.event.extendedProps.description || info.event.extendedProps.description == '') {
            this.popupDescriptionEl.innerHTML = info.event.extendedProps.description;
        }
    }

    close() {
        super.close();
    }

    delete() {
        if(!confirm(this.pageCalendar.locale.toDelete)) return;

        this.storage.updateCustomEvent(null, this.info.event);
        this.info.event.remove();
        this.close();
    }

    edit() {
        this.close();
        this.pageCalendar.onSelect(this.info);
    }
}