import Preloader from './preloader.js';
import Calendar from './calendar.js';
import Storage from './storage.js';
import Popup from './popup.js';

let calendar, preloader, storage;

document.addEventListener('DOMContentLoaded', main);
init();

async function init() {
    preloader = new Preloader('#preloader-img');
    preloader.start();
}

async function main() {
    calendar = await new Calendar('#calendar');
    storage = await new Storage();
    
    let timetable = await storage.getTimetable(9291672);

    calendar.setTimetable(timetable);
    calendar.loadEvents(timetable.events);

    preloader.stop();

    new Popup();
}