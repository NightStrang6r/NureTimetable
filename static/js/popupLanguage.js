import Popup from './popup.js';
import Storage from './storage.js';

export default class PopupLanguage extends Popup {
    constructor(popupSelector, triggerSelector) {
        super(popupSelector, triggerSelector);

        this.select = document.querySelector('.language-select');
        this.popupSaveEl = document.querySelector('.popup-language-save');

        this.popupSaveEl.addEventListener('click', (event) => this.save(event));
        
        this.storage = new Storage();
    }

    open(event) {
        super.open(event);

        let lang = this.storage.getLanguage();
        this.select.value = lang;
        console.log(lang);
    }

    save() {
        this.storage.saveLanguage(this.select.value);
        this.close();
        window.location.reload();
    }
}