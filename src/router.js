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

        this.getGroupsFromStorages();
        this.getTeachersFromStorages();
        this.getAudiencesFromStorages();
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

            res.setHeader('content-type', 'application/json');

            let data = await global.db.getTimetable(id, typeId);

            if(data) {
                res.send(data);
                return;
            }
            
            data = await this.API.getTimetable(id, typeId);

            let error = false;
            let parsed = null;

            if(data) {
                try {
                    data = data.toString();
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
                res.send(data);

                let timetableName = '';
                if(typeId == 3) {
                    timetableName = await global.db.getAudienceNameByCistId(id);
                } else {
                    timetableName = this.timetable.getTimetableName(id, typeId, parsed);
                }
                    
                await global.db.createOrUpdateTimetable(id, typeId, timetableName, data);
            }
        } catch(err) {
            console.log(err);
            return;
        }
    }

    async getGroups(req, res) {
        res.setHeader('content-type', 'application/json');

        let groups = await this.getGroupsFromStorages();

        if(!groups || typeof groups == 'string') {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(groups);
    }

    async getGroupsFromStorages() {
        let result = null;

        if(!global.storage.groupsUpdateTimestamp || (global.storage.groupsUpdateTimestamp + 14400000) < Date.now()) {
            global.storage.groupsUpdateTimestamp = Date.now();

            let groups = await this.API.getGroups();

            if(!groups) {
                result = `{"error": "Cist API failed"}`;
                return result;
            }

            let newGroups = [];
            for(let i = 0; i < groups.length; i++) {
                let group = groups[i];
                if(!group || typeof group != 'object' || !group.id) continue;

                let newGroup = {
                    cist_id: group.id,
                    name: group.name
                }
                
                newGroups.push(newGroup);
            }

            result = groups;
            global.db.createOrUpdateGroups(newGroups);
        } else {
            result = await global.db.getGroups();
        }

        return result;
    }

    async getTeachers(req, res) {
        res.setHeader('content-type', 'application/json');

        let teachers = await this.getTeachersFromStorages();

        if(!teachers || typeof teachers == 'string') {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(teachers);
    }

    async getTeachersFromStorages() {
        let result = null;

        if(!global.storage.teachersUpdateTimestamp || (global.storage.teachersUpdateTimestamp + 14400000) < Date.now()) {
            global.storage.teachersUpdateTimestamp = Date.now();

            let teachers = await this.API.getTeachers();

            if(!teachers) {
                res.send(`{"error": "Cist API failed"}`);
                return result;
            }
            
            result = teachers;
            global.db.createOrUpdateTeachers(teachers);
        } else {
            result = await global.db.getTeachers();
        }

        return result;
    }

    async getAudiences(req, res) {
        res.setHeader('content-type', 'application/json');

        let audiences = await this.getAudiencesFromStorages();

        if(!audiences || typeof audiences == 'string') {
            res.send(`{"error": "Cist API failed"}`);
            return;
        }

        res.send(audiences);
    }

    async getAudiencesFromStorages() {
        let result = null;

        if(!global.storage.audiencesUpdateTimestamp || (global.storage.audiencesUpdateTimestamp + 14400000) < Date.now()) {
            global.storage.audiencesUpdateTimestamp = Date.now();

            let audiences = await this.API.getAudiences();

            if(!audiences) {
                result = `{"error": "Cist API failed"}`;
                return result;
            }
            
            result = audiences;
            global.db.createOrUpdateAudiences(audiences);
        } else {
            result = await global.db.getAudiences();
        }

        return result;
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