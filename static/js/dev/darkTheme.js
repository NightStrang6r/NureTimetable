import Storage from './storage.js';

export default class DarkTheme {
    constructor(selector) {
        this.selector = selector;
        this.storage = new Storage();

        document.addEventListener('DOMContentLoaded', () => this.onDOMContentLoaded());

        this.onLoad();
    }

    onDOMContentLoaded() {
        this.trigger = document.querySelector(this.selector);
        this.trigger.addEventListener('click', (event) => this.onTrigger(event));
        
        let isEnabled = this.isEnabled();
        this.setButtonImage(!isEnabled);
    }

    isEnabled() {
        let isEnabled = this.storage.getDarkTheme();
        if(isEnabled == null) isEnabled = false;
        return isEnabled;
    }

    onLoad() {
        let isEnabled = this.isEnabled();

        if(isEnabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    onTrigger(event) {
        event.preventDefault();
        let isEnabled = this.isEnabled();

        this.setButtonImage(isEnabled);
        this.storage.saveDarkTheme(!isEnabled);

        if(isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    setButtonImage(isEnabled) {
        let img = this.trigger.children[0];

        if(isEnabled) {
            img.src = 'assets/sun.png';
        } else {
            img.src = 'assets/moon.png';
        }
    }

    enable() {
        let dark = document.createElement('link');
        dark.rel = 'stylesheet';
        dark.href = 'css/dark.css';
        dark.class = 'moveable';
        document.head.append(dark);
    }

    disable() {
        let dark = document.querySelectorAll('link[href="css/dark.css"]');
        if(dark == null) return;
        dark.forEach(el => el.remove());
    }
}