const express = require('express');
const Router = require('./router.js');

class Server {
    constructor(port) {
        this.server = express();
        Server.port = port;
    }
    
    run() {
        const router = new Router('../static');

        this.server.get('/', router.onIndex);
        this.server.get('/get', router.getTimetable);
        this.server.get('/getGroups', router.getGroups);
        this.server.use(router.static());
        
        this.server.listen(Server.port, this.onListen(Server.port));
    }

    onListen() {
        console.log(`NureTimetable server is running on port ${Server.port}`);
    }
}

module.exports = Server;