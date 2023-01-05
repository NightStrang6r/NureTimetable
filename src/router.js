const express = require('express');
const Locale = require('./locale.js');
const Auth = require('./auth.js');
const BL = require('./bl.js');

class Router {
    constructor() {
        this.locale = new Locale(global.storage.indexesPath, 'uk');
        this.auth = new Auth();
        this.BL = new BL();
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
        try {
            const id = Number(req.query.id);

            if(isNaN(id) || !req.query.type) {
                this.badRequest(res);
                return;
            }

            if(!this.authorize(req, res)) return;

            res.setHeader('content-type', 'application/json');

            let timetable = await this.BL.getTimetable(id, req.query.type);

            if(!timetable.data || timetable.error) {
                res.send(`{"error": "${timetable.data}"}`);
                return;
            }

            res.send(timetable.data);
        } catch(err) {
            console.log(err);
            return;
        }
    }

    async getGroups(req, res) {
        res.setHeader('content-type', 'application/json');

        let groups = await this.BL.getGroups();

        if(!groups || typeof groups == 'string') {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(groups);
    }

    async getTeachers(req, res) {
        res.setHeader('content-type', 'application/json');

        let teachers = await this.BL.getTeachers();

        if(!teachers || typeof teachers == 'string') {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(teachers);
    }

    async getAudiences(req, res) {
        res.setHeader('content-type', 'application/json');

        let audiences = await this.BL.getAudiences();

        if(!audiences || typeof audiences == 'string') {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(audiences);
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