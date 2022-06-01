import Storage from './storage.js';

export default class Auth {
    constructor(selector) {
        this.authEl = document.querySelector(selector);
        this.authButton = this.authEl.children[0];
        this.selectEl = document.querySelector('.select-group');
        this.menuRightEl = document.querySelector('.menu-right');

        this.authButton.addEventListener('click', (event) => this.onClick(event));

        this.storage = new Storage();

        if(!this.check()) {
            this.setVisibilityDeauthed();
        }
    }

    check() {
        if(this.storage.getAuth() == null) return false;
        return true;
    }

    onClick() {
        const url = this.getAuthURL();
        console.log(url);
        window.location.href = url;
    }

    setVisibilityDeauthed() {
        this.authEl.classList.remove('d-none');
        this.selectEl.classList.add('d-none');
        this.menuRightEl.classList.add('d-none');
    }

    getAuthURL() {
        const data = this.storage.getClient();
        const client = data[0];
        const redirect = data[1];
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = 
            `redirect_uri=${redirect}` +
            `&client_id=${client}` +
            '&access_type=offline' +
            '&response_type=code' +
            '&prompt=consent' +
            '&scope=' + 'https://www.googleapis.com/auth/userinfo.profile' +
            ' https://www.googleapis.com/auth/userinfo.email';
      
        return `${rootUrl}?${options}`;
    }
}