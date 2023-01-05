const express = require('express');
const cookieParser = require('cookie-parser');
const Router = require('./router.js');
const c = require('chalk');

class Server {
    constructor(port) {
        this.server = express();
        this.port = port;
    }
    
    run() {
        const router = new Router();

        this.server.use(cookieParser());

        this.server.get('/',             (req, res) => router.onIndex(req, res));
        this.server.get('/index.html',   (req, res) => router.onIndex(req, res));
        this.server.get('/auth',         (req, res) => router.onAuth(req, res));
        this.server.get('/get',          (req, res) => router.getTimetable(req, res));
        this.server.get('/getGroups',    (req, res) => router.getGroups(req, res));
        this.server.get('/getTeachers',  (req, res) => router.getTeachers(req, res));
        this.server.get('/getAudiences', (req, res) => router.getAudiences(req, res));
        this.server.get('/css/dark.css', (req, res) => router.getDarkTheme(req, res));
        this.server.use(router.static());
        
        this.server.listen(this.port, this.onListen());
    }

    onListen() {
        console.log(`${c.cyan('NureTimetable Server')} ${c.green(`is running on port ${this.port}`)}`);
    }
}

module.exports = Server;