let popupEl = document.querySelector('.cd-popup');
let popupTriggerEl = document.querySelector('.cd-popup-trigger');

export default class Popup {
    constructor() {
        popupEl.classList.remove('d-none');
        popupTriggerEl.addEventListener('click', this.open);
        popupEl.addEventListener('click', this.close);
        document.addEventListener('keyup', this.close);
    }

    open(event) {
        event.preventDefault();
        popupEl.classList.add('is-visible');
    }

    close(event) {
        if($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup')) {
            event.preventDefault();
            $(this).removeClass('is-visible');
        }
        if(event.which == '27') {
            $('.cd-popup').removeClass('is-visible');
        }
    } 
}