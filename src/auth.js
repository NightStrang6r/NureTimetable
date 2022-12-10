const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

class Auth {
    constructor() {
        this.config = global.storage.config;
    }

    getClient() {
        if(this.config.client) return this.config.client;
        return null;
    }

    getRedirect() {
        if(this.config.main) return `${this.config.main}/auth`;
        return null;
    }

    getMainLink() {
        if(this.config.main) return this.config.main;
        return null;
    }

    async getToken(code) {
        const url = 'https://oauth2.googleapis.com/token';
        const values = 
            'code=' + code +
            '&client_id=' + this.config.client +
            '&client_secret=' + this.config.secret +
            '&redirect_uri=' + this.getRedirect() +
            '&grant_type=' + 'authorization_code';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
      
        const response = await fetch(`${url}?${values}`, options);
        const json = await response.json();

        return json;
    }

    sign(data) {
        const token = jwt.sign(data, this.config.jwt_secret);
        return token;
    }

    verify(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwt_secret);
            return decoded;
        } catch (e) {
            return false;
        }
    }

    async parse(token) {
        try {
            let base64Payload = token.split('.')[1];
            let payload = Buffer.from(base64Payload, 'base64');
            return JSON.parse(payload.toString());
        } catch (e) {
            //console.log(e);
            return null;
        }
    }

    checkAuth(data) {
        if(!data) return false;

        if(    data.email 
            && data.email_verified 
            && data.email.includes('@nure.ua') 
            && data.email_verified == true) {
                this.saveUser(data);
                return true;
            }

        return false;
    }

    saveUser(data) {
        if(data.email && !data.name) {
            global.db.updateUserLastActive(data.email);
            return;
        }

        if(!data.name || !data.given_name || !data.family_name || !data.locale) return;

        let user = {
            nickname: data.name,
            name: data.given_name,
            surname: data.family_name,
            email: data.email
        };

        global.db.createOrUpdateUser(user);
    }
}

module.exports = Auth;