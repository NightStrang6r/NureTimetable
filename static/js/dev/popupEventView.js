import Popup from './popup.js';
import Storage from './storage.js';

export default class PopupEventView extends Popup {
    constructor(popupSelector, calendar) {
        super(popupSelector, null);

        this.popupNameEl = document.querySelector('.event-data-title');
        this.popupDescriptionEl = document.querySelector('.event-data-description');
        this.popupTimeEl = document.querySelector('.event-data-time');
        this.popupDateEl = document.querySelector('.event-data-date');
        this.popupEditEl = document.querySelector('.event-data-edit');
        this.popupDeleteEl = document.querySelector('.event-data-delete');

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

        if(info.event.allDay) return;

        this.popupTimeEl.innerHTML = `${this.getTimeString(info.event.start)}&nbsp;&mdash;&nbsp;${this.getTimeString(info.event.end)}`;
        this.popupDateEl.innerHTML = this.getDateString(info.event.start);
    }

    getTimeString(time) {
        if(!time) return '--:--';

        let hours = time.getHours();
        let minutes = time.getMinutes();

        hours = this.validateTimeValue(hours);
        minutes = this.validateTimeValue(minutes);

        return `${hours}:${minutes}`;
    }

    getDateString(date) {
        if(!date) return '';

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        month = this.validateTimeValue(month);
        day = this.validateTimeValue(day);

        return `${year}-${month}-${day}`;
    }

    validateTimeValue(time) {
        if(time.toString().length == 1)
            time = `0${time}`;

        return time;
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