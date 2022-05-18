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
    let lastTimetableId = storage.getSelected();
    storage.setReloadButton('.reload-trigger');
    select.set(timetables);

    if(lastTimetableId) {
        select.setSelected(lastTimetableId);
        onSelectedCallback(lastTimetableId);
    } else {
        preloader.stop();
    }

    select.onSelected(onSelectedCallback);
    storage.onTimetablesSaved((timetables) => {
        select.set(timetables);
    });
    
    new Popup();
}

async function onSelectedCallback(timetable) {
    let id;

    calendar.destroy();
    preloader.start();

    if((typeof timetable) == 'number') {
        id = timetable;
    } else {
        id = timetable.id;
    }

    if(!id) {
        calendar.removeEvents();
        calendar.render();
        preloader.stop();
        return;
    }

    storage.saveSelected(id);
    calendar.removeEvents();
    timetable = await storage.getTimetable(id);
    
    if(timetable.error) {
        preloader.stop();
        alert(`Расписание устарело либо более недоступно.`);
    } else {
        calendar.setTimetable(timetable);
        calendar.loadEvents(timetable.events);
    }

    calendar.render();
    preloader.stop();
}