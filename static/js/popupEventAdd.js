import Popup from './popup.js';
import Storage from './storage.js';

export default class PopupEventAdd extends Popup {
    constructor(popupSelector, calendar) {
        super(popupSelector, null);

        this.popupNameEl = document.querySelector('.event-name');
        this.popupDescriptionEl = document.querySelector('.event-description');
        this.popupSaveEl = document.querySelector('.popup-event-save');

        this.popupSaveEl.addEventListener('click', (event) => this.save(event));

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

        if(!info.event) return;

        if(info.event.title) {
            this.info.editing = true;
            this.popupNameEl.value = info.event.title;
        }
        
        if(info.event.extendedProps.description && info.event.extendedProps.description != '') {
            this.popupDescriptionEl.value = info.event.extendedProps.description;
        }
    }

    close() {
        super.close();
        this.calendar.unselect();
    }

    save() {
        let name = this.popupNameEl.value;
        let description = this.popupDescriptionEl.value;
        let info = this.info;

        if(name.length >= 150) {
            let lTooLongName = document.querySelector('#l-tooLongName');
            alert(lTooLongName.innerHTML);
            return;
        }

        if(description.length >= 500) {
            let lTooLongDesc = document.querySelector('#l-tooLongDescription');
            alert(lTooLongDesc.innerHTML);
            return;
        }
        
        // Если мы редактируем объект, то старый нужно удалить
        if(this.info.editing) {
            info = Object.assign(this.info.event);
            this.storage.updateCustomEvent(null, this.info.event);
            this.info.event.remove();
        }

        if(name != '') {
            let event = {
                title: name,
                start: info.start,
                end: info.end,
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

        this.close();
    }
}