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
        //let index = fs.readFileSync(`${Router.path}/index.html`).toString();
        //index = index.replace('loader-1.gif', `loader-${Math.floor(Math.random() * (6 - 1 + 1)) + 1}.gif`);
        //res.send(index);
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

    badRequest(res) {
        res.status(400).send('Invalid request!');
    }
}

module.exports = Router;