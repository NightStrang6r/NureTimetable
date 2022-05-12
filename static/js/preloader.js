let preloaderImg = null;

export default class Preloader {
    constructor(selector) {
        preloaderImg = document.querySelector(selector);
        console.log(preloaderImg);
    }

    async start() {
        preloaderImg.classList.remove('d-none');
        //preloaderImg.src = this.getRandomPreloader();
        //console.log(typeof preloaderImg);
    }

    stop() {
        preloaderImg.classList.add('d-none');
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