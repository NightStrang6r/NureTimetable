const express = require('express');
const path = require('path');
const fs = require('fs');
const API = require('./API.js');
const Locale = require('./locale.js');
const Auth = require('./auth.js');

class Router {
    constructor(staticPath) {
        Router.path = this.getPath(staticPath);
        Router.API = new API();
        Router.locale = new Locale(this.getPath('src/locales.json'), 'uk');
        this.auth = new Auth(this.getPath('src/config.json'));
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
        let lang = 'uk';

        if(req.cookies && req.cookies.lang) {
            lang = req.cookies.lang;
        } else {
            res.cookie('lang', lang);
        }

        let index = await Router.locale.translate(`${Router.path}/index.html`, lang);
        res.send(index);
    }

    static() {
        return express.static(Router.path);
    }

    async getTimetable(req, res) {
        const id = Number(req.query.id);

        if(isNaN(id) || !req.query.type) {
            res.status(400).send('Invalid request!');
            return;
        }

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

        const data = await Router.API.getTimetable(id, typeId);

        res.setHeader('content-type', 'application/json');
        let error = false;
        if(data.length < 5000) {
            try {
                JSON.parse(data.toString());
            } catch(err) {
                error = "Invalid timetable";
            }
        }

        if(error) {
            res.send(`{"error": "${error}"}`);
        } else {
            res.send(data);
        }
    }

    async getGroups(req, res) {
        const data = await Router.API.getGroups();
        res.setHeader('content-type', 'application/json');
        res.send(data);
    }

    async getTeachers(req, res) {
        let data = await Router.API.getTeachers();
        data = data.toString('utf8');
        data = data.replace(']}]}]}', ']}]}]}]}'); // This fixes cist json encoding error
        res.setHeader('content-type', 'application/json');
        res.send(data);
    }

    async getAudiences(req, res) {
        const data = await Router.API.getAudiences();
        res.setHeader('content-type', 'application/json');
        res.send(data);
    }

    async getDarkTheme(req, res) {
        res.setHeader('cache-control', 'cache-control: private, max-age=0, no-cache');
        res.status(200);

        if(req.cookies && req.cookies.dark == 'true') {
            res.sendFile(`${Router.path}/css/dark.css`);
        } else {
            res.send('');
        }
    }

    authentication(req, res, next) {
        if(req.cookies && req.cookies.key) {
            let jwt = this.auth.verify(req.cookies.key);

            if(!jwt || !this.auth.checkAuth(jwt)) {
                const data = `${this.auth.getClient()};${this.auth.getRedirect()}`;
                res.cookie('client', data);
                res.clearCookie('key');
            }
        } else {
            const data = `${this.auth.getClient()};${this.auth.getRedirect()}`;
            res.cookie('client', data);
            res.clearCookie('key');
        }

        next();
    }

    async onAuth(req, res) {
        if(req.cookies && req.cookies.key) {
            let result = await this.auth.verify(req.cookies.key);

            if(this.auth.checkAuth(result)) {
                res.location(this.auth.getMainLink());
                res.sendStatus(302);
            } else {
                res.send('Invalid email. Relogin');
            }

            return;
        }

        if(req.query.code) {
            let json = await this.auth.getToken(req.query.code);
            let result = await this.auth.parse(json.id_token);

            if(this.auth.checkAuth(result)) {
                result = {
                    email: result.email,
                    email_verified: result.email_verified
                };

                let jwt = this.auth.sign(result);
                res.cookie('key', jwt);
                res.clearCookie('client');

                res.location(this.auth.getMainLink());
                res.sendStatus(302);
            } else {
                res.send('Invalid email');
            }
            
            return;
        }
        
        res.send('OK');
    }

    badRequest(res) {
        res.status(400).send('Invalid request!');
    }
}

module.exports = Router;