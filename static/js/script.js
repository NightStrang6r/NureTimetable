import Calendar from './calendar.js';
import API from './API.js';
import Preloader from './preloader.js';
import Popup from './popup.js';

let calendar, preloader;

document.addEventListener('DOMContentLoaded', main);
init();

async function init() {
    preloader = new Preloader('#preloader-img');
    preloader.start();
}

async function main() {
    calendar = await new Calendar('#calendar');

    let api = new API();
    let timetable = null;

    if(!localStorage.timetable) {
        timetable = await api.getTimetable(9291672);
        localStorage.timetable = JSON.stringify(timetable);
    } else {
        timetable = JSON.parse(localStorage.timetable);
    }

    calendar.setTimetable(timetable);
    calendar.loadEvents(timetable.events);

    preloader.stop();

    let popup = new Popup();
}