const express = require('express');
const cookieParser = require('cookie-parser');
const Router = require('./router.js');

class Server {
    constructor(port) {
        this.server = express();
        Server.port = port;
    }
    
    run() {
        const router = new Router('static');
        this.server.use(cookieParser());
        this.server.use((req, res, next) => {router.authentication(req, res, next)});

        this.server.get('/', router.onIndex);
        this.server.get('/index.html', router.onIndex);
        this.server.get('/auth', (req, res) => router.onAuth(req, res));
        this.server.get('/get', router.getTimetable);
        this.server.get('/getGroups', router.getGroups);
        this.server.get('/getTeachers', router.getTeachers);
        this.server.get('/getAudiences', router.getAudiences);
        this.server.get('/css/dark.css', router.getDarkTheme);
        this.server.use(router.static());
        
        this.server.listen(Server.port, this.onListen(Server.port));
    }

    onListen() {
        console.log(`NureTimetable server is running on port ${Server.port}`);
    }
}

module.exports = Server;