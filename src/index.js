const Storage = require('./storage.js');
const DB = require('./db.js');
const Logger = require('./logger.js');
const Server = require('./server.js');

let storage = new Storage();
global.storage = storage;

let logger = new Logger();
let db = new DB();
let server = new Server(3000);
global.db = db;

logger.printLogo();
db.connect();

server.run();