export default class Popup {
    constructor(popupSelector, triggerSelector) {
        this.popupEl = document.querySelector(popupSelector);
        
        if(triggerSelector != null)
            this.popupTriggerEl = document.querySelector(triggerSelector);

        this.setupListeners();
    }

    setupListeners() {
        this.popupEl.classList.remove('d-none');
        this.popupTriggerEl.addEventListener('click', (event) => this.open(event));
        this.popupEl.addEventListener('click', (event) => this.closeEvent(event));
        document.addEventListener('keyup', (event) => this.closeEvent(event));
    }

    open(event) {
        event.preventDefault();
        this.popupEl.classList.add('is-visible');
    }

    close() {
        this.popupEl.classList.remove('is-visible');
    }

    closeEvent(event) {
        if($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup')) {
            event.preventDefault();
            this.close();
        }

        if(event.which == '27') {
            this.close();
        }
    }
}