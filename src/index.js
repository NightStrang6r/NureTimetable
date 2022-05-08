const Logger = require('./logger.js');
const Server = require('./server.js');

let logger = new Logger();
let server = new Server(3000);
server.run();