import Popup from './popup.js';
import Storage from './storage.js';

export default class PopupEventAdd extends Popup {
    constructor(popupSelector, calendar) {
        super(popupSelector, null);

        this.popupNameEl = document.querySelector('.event-name');
        this.popupDescriptionEl = document.querySelector('.event-description');
        this.popupTimeFromEl = document.querySelector('.event-time-from');
        this.popupTimeToEl = document.querySelector('.event-time-to');
        this.popupDateEl = document.querySelector('.event-date');
        this.popupSaveEl = document.querySelector('.popup-event-save');

        this.popupSaveEl.addEventListener('click', (event) => this.save(event));

        this.pageCalendar = calendar;
        this.calendar = calendar.calendar;
        this.storage = window.storage;
    }

    setupListeners() {
        this.popupEl.classList.remove('d-none');
        this.popupEl.addEventListener('click', (event) => this.closeEvent(event));
        document.addEventListener('keyup', (event) => this.closeEvent(event));
    }

    open(info) {
        this.info = info;
        this.popupEl.classList.add('is-visible');

        let timeFrom, timeTo, date;

        if(!info.event) {
            this.popupNameEl.value =  '';
            this.popupDescriptionEl.value = '';
        } else {
            info = info.event;

            if(info.title) {
                this.info.editing = true;
                this.popupNameEl.value = info.title;
            }
            
            if(info.extendedProps.description && info.extendedProps.description != '') {
                this.popupDescriptionEl.value = info.extendedProps.description;
            }
        }

        timeFrom = this.getTimeString(info.start);
        timeTo = this.getTimeString(info.end);
        date = this.getDateString(info.start);

        this.popupTimeFromEl.value = timeFrom;
        this.popupTimeToEl.value = timeTo;
        this.popupDateEl.value = date;
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

    getDateValue(initialDate, timeString, dateString = null) {
        let year, month, day;
        let time = timeString.split(':');

        if(dateString != null) {
            let date = dateString.split('-');
            year = date[0];
            month = date[1] - 1;
            day = date[2];
        } else {
            year = initialDate.getFullYear();
            month = initialDate.getMonth();
            day = initialDate.getDate();
        }
        
        let newDate = new Date(year, month, day, time[0], time[1]);

        return newDate;
    }

    close() {
        if(this.popupNameEl.value.length > 0 || this.popupDescriptionEl.value.length > 0) {
            let lUnsavedData = document.querySelector('#l-unsavedData');
            if(!confirm(lUnsavedData.innerHTML)) return;
        }

        super.close();
        this.calendar.unselect();
    }

    save() {
        let name = this.popupNameEl.value;
        let description = this.popupDescriptionEl.value;
        let info = this.info;

        // Проверка на длину названия
        if(name.length >= 150) {
            let lTooLongName = document.querySelector('#l-tooLongName');
            alert(lTooLongName.innerHTML);
            return;
        }

        // Проверка на длину описания
        if(description.length >= 500) {
            let lTooLongDesc = document.querySelector('#l-tooLongDescription');
            alert(lTooLongDesc.innerHTML);
            return;
        }

        // Проверка на валидность времени (Да, мы можем сравнить 2 строки именно так, это работает! Люблю JS)
        if(this.popupTimeFromEl.value >= this.popupTimeToEl.value) {
            let lInvalidTime = document.querySelector('#l-invalidTime');
            alert(lInvalidTime.innerHTML);
            return;
        }
        
        // Если мы редактируем объект, то старый нужно удалить
        if(this.info.editing) {
            info = Object.assign(this.info.event);
            this.storage.updateCustomEvent(null, this.info.event);
            this.info.event.remove();
        }

        let start, end, eventDate = info.start;
        start = this.getDateValue(eventDate, this.popupTimeFromEl.value, this.popupDateEl.value);

        if(info.end) {
            eventDate = info.end;
        }
        
        end = this.getDateValue(eventDate, this.popupTimeToEl.value);

        if(name != '') {
            let event = {
                title: name,
                start: start,
                end: end,
                allDay: info.allDay,
                editable: true,
                extendedProps: {
                    description: description
                }
            };

            this.storage.addCustomEvent(event);
            this.calendar.addEvent(event);
            this.calendar.unselect();
        }

        this.popupNameEl.value = '';
        this.popupDescriptionEl.value = '';
        this.popupTimeFromEl.value = '00:00';
        this.popupTimeToEl.value = '00:00';

        this.close();
    }
}