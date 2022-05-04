const express = require('express');
const path = require('path');
const API = require('./API.js');

class Router {
    constructor(staticPath) {
        Router.path = path.resolve(staticPath);
        Router.API = new API();
    }

    onIndex(req, res) {
        res.sendFile(`${Router.path}/index.html`);
    }

    static() {
        return express.static(Router.path);
    }

    async getTimetable(req, res) {
        const groupId = Number(req.query.groupId);

        if(isNaN(groupId) || req.query.groupId.length < 7) {
            res.status(400).send('Invalid request!');
            return;
        }

        const data = await Router.API.getTimetable(groupId);
        res.setHeader('content-type', 'application/json');
        res.send(data);
    }

    async getGroups(req, res) {
        const data = await Router.API.getGroups();
        res.setHeader('content-type', 'application/json');
        res.send(data);
    }

    badRequest(res) {
        res.status(400).send('Invalid request!');
    }
}

module.exports = Router;