import Preloader from './preloader.js';
import Calendar from './calendar.js';
import Storage from './storage.js';
import Select from './select.js';
import PopupAdd from './popupAdd.js';
import PopupFilter from './popupFilter.js';
import DarkTheme from './darkTheme.js';

let calendar, preloader, darkTheme, storage, select, reloadButton;

document.addEventListener('DOMContentLoaded', main);
init();

async function init() {
    darkTheme = new DarkTheme('.dark-trigger');
    preloader = new Preloader('#preloader-img');
    preloader.start();
}

async function main() {
    calendar = new Calendar('#calendar');
    storage = new Storage();
    select = new Select('.timetable-select');
    reloadButton = document.querySelector('.reload-trigger');

    let timetables = storage.getTimetables();
    let lastTimetableId = storage.getSelected();
    select.set(timetables);

    if(lastTimetableId) {
        select.setSelected(lastTimetableId);
        onSelectedCallback(lastTimetableId);
    } else {
        preloader.stop();
    }

    select.onSelected(onSelectedCallback);
    storage.onTimetablesSaved(onTimetablesSavedCallback);
    storage.onFiltersSaved(onFiltersSavedCallback);
    reloadButton.addEventListener('click', onReloadButton);
    
    new PopupFilter('.cd-popup-filter', '.cd-popup-filter-trigger');
    new PopupAdd('.cd-popup-add', '.cd-popup-add-trigger');
}

async function loadTimetable(id) {
    let timetable;

    calendar.destroy();
    preloader.start();

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

function onSelectedCallback(id) {
    loadTimetable(id);
}

function onTimetablesSavedCallback(timetables) {
    select.set(timetables);
}

function onFiltersSavedCallback(filters) {
    let selected = storage.getSelected();
    if(!selected) return;
    loadTimetable(selected);
}

function onReloadButton() {
    let selected = storage.getSelected();
    if(!selected) return;
    storage.deleteCacheById(selected);
    loadTimetable(selected);
}