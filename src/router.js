const express = require('express');
const path = require('path');
const fs = require('fs');
const API = require('./API.js');

class Router {
    constructor(staticPath) {
        Router.path = this.getStaticPath(staticPath);
        Router.API = new API();
    }

    getStaticPath(staticPath) {
        if(fs.existsSync(staticPath)) {
            return path.resolve(staticPath);
        } else if(fs.existsSync(`../${staticPath}`)) {
            return path.resolve(`../${staticPath}`);
        } else {
            throw new Error('No static path found!');
        }
    }

    onIndex(req, res) {
        res.sendFile(`${Router.path}/index.html`);
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

    badRequest(res) {
        res.status(400).send('Invalid request!');
    }
}

module.exports = Router;