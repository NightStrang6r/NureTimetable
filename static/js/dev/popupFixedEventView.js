import Popup from './popup.js';

export default class PopupFixedEventView extends Popup {
    constructor(popupSelector) {
        super(popupSelector, null);

        this.popupTitleEl = this.popupEl.querySelector('.fixed-event-title');
        this.popupDescriptionEl = this.popupEl.querySelector('.fixed-event-description');
    }

    setupListeners() {
        this.popupEl.classList.remove('d-none');
        this.popupEl.addEventListener('click', (event) => this.closeEvent(event));
        document.addEventListener('keyup', (event) => this.closeEvent(event));
    }

    open(info, locale) {
        this.popupEl.classList.add('is-visible');

        this.popupTitleEl.innerHTML = info.title;
        this.popupDescriptionEl.innerHTML = `${locale.type}: ${info.type} (${info.currentLesson}/${info.lessonsCount})<br>${locale.audience}: ${info.auditory}<br>${locale.teachers}: ${info.teachers}<br>${locale.groups}: ${info.groups}<br>${locale.dayUpper}: ${info.day}<br>${locale.time}: ${info.start} - ${info.end}`;
    }

    close() {
        super.close();
    }
}