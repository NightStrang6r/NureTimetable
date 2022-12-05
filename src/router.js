const express = require('express');
const path = require('path');
const fs = require('fs');
const API = require('./API.js');
const Locale = require('./locale.js');
const Auth = require('./auth.js');

class Router {
    constructor(staticPath) {
        this.path = this.getPath(staticPath);
        this.API = new API();
        this.locale = new Locale(`${this.path}/index.html`, this.getPath('src/locales.json'), `${this.path}/indexes`, 'uk');
        this.auth = new Auth(this.getPath('src/config.json'), this.getPath('src/users.json'));
    }

    getPath(staticPath) {
        if(fs.existsSync(staticPath)) {
            return path.resolve(staticPath);
        } else if(fs.existsSync(`../${staticPath}`)) {
            return path.resolve(`../${staticPath}`);
        } else {
            throw new Error('No path found!');
        }
    }

    async onIndex(req, res) {
        this.authorize(req, res);

        let lang = 'uk';

        if(req.cookies && req.cookies.lang) {
            lang = req.cookies.lang;
        } else {
            res.cookie('lang', lang);
        }

        let index = await this.locale.getIndex(lang);
        res.setHeader('content-type', 'text/html');
        res.send(index);
    }

    static() {
        return express.static(this.path);
    }

    async getTimetable(req, res) {
        const id = Number(req.query.id);

        if(isNaN(id) || !req.query.type) {
            this.badRequest(res);
            return;
        }

        if(!this.authorize(req, res)) return;

        let typeId;
        switch (req.query.type) {
            case 'groups':
                typeId = 1;
                break;
            case 'teachers':
                typeId = 2;
                break;
            case 'audiences':
                typeId = 3;
                break;
            default:
                typeId = 1;
                break;
        }

        const data = await this.API.getTimetable(id, typeId);

        res.setHeader('content-type', 'application/json');
        let error = false;

        if(data) {
            if(data.length < 5000) {
                try {
                    JSON.parse(data.toString());
                } catch(err) {
                    error = "Invalid timetable";
                }
            }
        } else {
            error = "Cist API failed";
        }

        if(error) {
            res.send(`{"error": "${error}"}`);
        } else {
            res.send(data);
        }
    }

    async getGroups(req, res) {
        const data = await this.API.getGroups();
        res.setHeader('content-type', 'application/json');

        if(!data) {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(data);
    }

    async getTeachers(req, res) {
        let data = await this.API.getTeachers();
        res.setHeader('content-type', 'application/json');

        if(!data) {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        data = data.toString('utf8');
        data = data.replace(']}]}]}', ']}]}]}]}'); // This fixes cist json encoding error
        
        res.send(data);
    }

    async getAudiences(req, res) {
        const data = await this.API.getAudiences();
        res.setHeader('content-type', 'application/json');

        if(!data) {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }
        
        res.send(data);
    }

    async getDarkTheme(req, res) {
        res.setHeader('cache-control', 'cache-control: private, max-age=0, no-cache');
        res.status(200);

        if(req.cookies && req.cookies.dark == 'true') {
            res.sendFile(`${this.path}/css/dark.css`);
        } else {
            res.send('');
        }
    }

    authorize(req, res) {
        let auth = false;

        // Если ключ авторизации существует и он верный, то auth = true
        if(req.cookies && req.cookies.key) {
            let user = this.auth.verify(req.cookies.key);

            if(this.auth.checkAuth(user)) {
                auth = true;
            }
        }

        // Если ключа нет либо он не верный, добавляем куки client, удаляем key
        if(!auth && req.cookies && !req.cookies.client) {
            const data = `${this.auth.getClient()};${this.auth.getRedirect()}`;
            res.cookie('client', data);
            res.clearCookie('key');
        }

        // Если пользователь не авторизован, то не предоставляем доступ
        if(!auth && req._parsedUrl.pathname != '/' && req._parsedUrl.pathname != '/index.html') {
            res.sendStatus(401);
            return false;
        }

        return true;
    }

    async onAuth(req, res) {
        const redirect = this.auth.getMainLink();

        if(!req.query.code) {
            res.location(redirect);
            res.sendStatus(302);
            return;
        }

        let userData = await this.auth.getToken(req.query.code);
        let result = await this.auth.parse(userData.id_token);

        if(this.auth.checkAuth(result)) {
            result = {
                email: result.email,
                email_verified: result.email_verified
            };

            let jwt = this.auth.sign(result);
            res.cookie('key', jwt);
            res.clearCookie('client');

            res.location(redirect);
            res.sendStatus(302);
        } else {
            res.location(`${redirect}/?auth=error`);
            res.sendStatus(302);
        }
    }

    badRequest(res) {
        res.status(400).send('Invalid request!');
    }
}

module.exports = Router;