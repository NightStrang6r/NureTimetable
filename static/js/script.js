import Preloader from './preloader.js';
import Calendar from './calendar.js';
import Storage from './storage.js';
import Select from './select.js';
import Popup from './popup.js';

let calendar, preloader, storage, select;

document.addEventListener('DOMContentLoaded', main);
init();

async function init() {
    preloader = new Preloader('#preloader-img');
    preloader.start();
}

async function main() {
    calendar = new Calendar('#calendar');
    storage = new Storage();
    select = new Select('.timetable-select');

    let timetables = storage.getTimetables();
    select.set(timetables);
    let lastTimetable = select.getFirstOption();

    if(lastTimetable) {
        console.log(lastTimetable);
        onSelectedCallback(lastTimetable);
    }

    select.onSelected(onSelectedCallback);

    storage.onTimetablesSaved((timetables) => {
        select.set(timetables);
    });
    new Popup();
}

async function onSelectedCallback(timetable) {
    calendar.destroy();
    preloader.start();
    if(!timetable.id) {
        calendar.removeEvents();
        calendar.render();
        preloader.stop();
        return;
    }
        
    console.log(timetable);
    timetable = await storage.getTimetable(timetable.id);
    calendar.setTimetable(timetable);
    calendar.removeEvents();
    calendar.loadEvents(timetable.events);
    calendar.render();
    preloader.stop();
}