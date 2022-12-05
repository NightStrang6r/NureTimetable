import Storage from './storage.js';

export default class Auth {
    constructor(selector) {
        this.authEl = document.querySelector(selector);
        this.authButton = document.querySelector('.auth-button');
        this.logoutButton = document.querySelector('.logout-button');
        this.selectEl = document.querySelector('.select-group');
        this.menuRightEl = document.querySelector('.menu-right');
        this.calendar = document.querySelector('#calendar-container');
        this.addTip = document.querySelector('.addTip');
        this.logo = document.querySelector('.logo');

        this.authButton.addEventListener('click', (event) => this.onAuth(event));
        this.logoutButton.addEventListener('click', (event) => this.onLogout(event));

        this.storage = window.storage;

        if(!this.check()) {
            this.setVisibility('deauthed');
        } else {
            this.setVisibility('authed');
        }

        if(this.authError()) {
            history.pushState(null, null, '/');
            let lAuthError = document.querySelector('#l-authError');
            if(lAuthError == null) return;
            alert(lAuthError.innerHTML);
        }
    }

    check() {
        if(this.storage.getAuth() == null) return false;
        return true;
    }

    onAuth() {
        const url = this.getAuthURL();
        window.location.href = url;
    }

    onLogout() {
        this.storage.deleteAuth();
        window.location.reload();
    }

    setVisibility(visibility) {
        if(visibility == 'deauthed') {
            this.authEl.classList.remove('d-none');
            this.logo.classList.add('d-none');
            this.calendar.classList.add('d-none');
            this.selectEl.classList.add('d-none');
            this.menuRightEl.classList.add('d-none');
            this.logoutButton.classList.add('d-none');
            this.addTip.classList.add('d-none');
            return;
        }
    }

    authError() {
        const search = window.location.search;
        if(search && search.includes('auth') && search.includes('error')) return true;
        return false;
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