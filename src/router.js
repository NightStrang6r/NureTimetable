const express = require('express');
const API = require('./API.js');
const Locale = require('./locale.js');
const Auth = require('./auth.js');
const Timetable = require('./timetable.js');

class Router {
    constructor() {
        this.API = new API();
        this.locale = new Locale(global.storage.indexesPath, 'uk');
        this.auth = new Auth();
        this.timetable = new Timetable();
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
        return express.static(global.storage.staticPath);
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
        let parsed = null;

        if(data) {
            try {
                parsed = JSON.parse(data.toString());
            } catch(err) {
                error = "Invalid timetable";
            }
        } else {
            error = "Cist API failed";
        }

        if(error) {
            res.send(`{"error": "${error}"}`);
        } else {
            let timetableName = this.timetable.getTimetableName(id, typeId, parsed);
            global.db.createOrUpdateTimetable(id, typeId, timetableName, parsed);



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

        let parsed = JSON.parse(data.toString());
        let groups = [];
        parsed.university.faculties.forEach(faculty => {
            faculty.directions.forEach(direction => {
                groups = groups.concat(direction.groups);
            })
        });
        //global.db.createOrUpdateGroups(groups);

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
            res.sendFile(`${global.storage.staticPath}/css/dark.css`);
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