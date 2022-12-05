export default class DarkTheme {
    constructor(selector) {
        this.selector = selector;
        this.storage = window.storage;

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

    async enable() {
        let dark = document.createElement('style');
        let css = await this.getDarkCSS();
        dark.innerHTML = css;
        dark.id = 'darkCSS';
        document.head.append(dark);
    }

    disable() {
        let darkStyle = document.querySelectorAll('#darkCSS');
        let darkLink = document.querySelector('link[href="css/dark.css"]');
        if(darkLink != null) darkLink.remove();
        if(darkStyle != null) darkStyle.forEach(el => el.remove());
    }

    async getDarkCSS() {
        let css = this.storage.getDarkCSS();
        if(css != null) return css;

        let res = await fetch('css/dark.css');
        css = await res.text();
        this.storage.saveDarkCSS(css);
        return css;
    }
}