export default class Preloader {
    constructor(selector) {
        this.preloaderEl = document.querySelector(selector);
        this.preloaderImg = this.preloaderEl.children[0];
    }

    async start() {
        this.preloaderEl.classList.remove('d-none');
        //preloaderImg.src = this.getRandomPreloader();
        //console.log(typeof preloaderImg);
    }

    stop() {
        this.preloaderEl.classList.add('d-none');
    }

    getRandomPreloader() {
        return `assets/loaders/loader-${this.getRandomInt(1, 6)}.gif`;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}