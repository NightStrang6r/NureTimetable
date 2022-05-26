import Popup from './popup.js';
import Storage from './storage.js';

export default class PopupEvent extends Popup {
    constructor(popupSelector, calendar) {
        super(popupSelector, null);

        this.popupNameEl = document.querySelector('.event-name');
        this.popupDescriptionEl = document.querySelector('.event-description');
        this.popupSaveEl = document.querySelector('.popup-event-save');
        this.popupSaveEl.addEventListener('click', (event) => this.save(event));

        this.calendar = calendar;
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
    }

    close() {
        super.close();
    }

    save() {
        let name = this.popupNameEl.value;
        let description = this.popupDescriptionEl.value;

        if(name != '') {
            let event = {
                title: name,
                start: this.info.start,
                end: this.info.end,
                allDay: this.info.allDay,
                editable: true,
                extendedProps: {
                    description: description
                }
            };

            this.storage.addCustomEvent(event);
            this.calendar.addEvent(event);
        }

        this.popupNameEl.value = '';
        this.popupDescriptionEl.value = '';

        this.close();
    }
}