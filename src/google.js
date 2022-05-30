const fetch = require('node-fetch');
const fs = require('fs');
const jwt = require('jsonwebtoken');

class Google {
    constructor(configPath) {
        this.config = JSON.parse(fs.readFileSync(configPath));
    }

    getAuthURL() {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = 
            'redirect_uri=' + this.config.redirect +
            '&client_id=' + this.config.client +
            '&access_type=offline' +
            '&response_type=code' +
            '&prompt=consent' +
            '&scope=' + 'https://www.googleapis.com/auth/userinfo.email' +
            ' https://www.googleapis.com/auth/userinfo.email';
      
        return `${rootUrl}?${options}`;
    }

    async getTokens(code) {
        const url = 'https://oauth2.googleapis.com/token';
        const values = 
            'code=' + code +
            '&client_id=' + this.config.client +
            '&client_secret=' + this.config.secret +
            '&redirect_uri=' + this.config.redirect +
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
        const decoded = jwt.verify(token, this.config.jwt_secret);
        return decoded;
    }

    async parseJwt(token) {
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
        if(data && data.email && data.email.includes('@nure.ua')) return true;
        return false;
    }
}

module.exports = Google;