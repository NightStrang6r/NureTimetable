import Preloader from './preloader.js';
import Calendar from './calendar.js';
import Storage from './storage.js';
import Select from './select.js';
import PopupAdd from './popupAdd.js';
import DarkTheme from './darkTheme.js';
import PopupFilter from './popupFilter.js';

export default class App {
    run() {
        document.addEventListener('DOMContentLoaded', (event) => this.main(event));
        this.init();
    }

    async init() {
        this.darkTheme = new DarkTheme('.dark-trigger');
        this.preloader = new Preloader('#preloader-img');
        this.preloader.start();
    }

    async main() {
        this.calendar = new Calendar('#calendar');
        this.storage = new Storage();
        this.select = new Select('.timetable-select');
        this.reloadButton = document.querySelector('.reload-trigger');

        let timetables = this.storage.getTimetables();
        let lastTimetableId = this.storage.getSelected();
        this.select.set(timetables);

        if(lastTimetableId) {
            this.select.setSelected(lastTimetableId);
            this.onSelectedCallback(lastTimetableId);
        } else {
            this.preloader.stop();
        }

        this.select.onSelected((prop) => this.onSelectedCallback(prop));
        this.storage.onTimetablesSaved((prop) => this.onTimetablesSavedCallback(prop));
        this.storage.onFiltersSaved((prop) => this.onFiltersSavedCallback(prop));
        this.reloadButton.addEventListener('click', (prop) => this.onReloadButton(prop));
        
        new PopupFilter('.cd-popup-filter', '.cd-popup-filter-trigger');
        new PopupAdd('.cd-popup-add', '.cd-popup-add-trigger');
    }

    async loadTimetable(id) {
        let timetable;

        this.calendar.destroy();
        this.preloader.start();

        if(!id) {
            this.calendar.removeEvents();
            this.calendar.render();
            this.preloader.stop();
            return;
        }

        this.storage.saveSelected(id);
        this.calendar.removeEvents();
        timetable = await this.storage.getTimetable(id);
        
        if(timetable.error) {
            this.preloader.stop();
            alert(`Расписание устарело либо более недоступно.`);
        } else {
            this.calendar.setTimetable(timetable);
            this.calendar.loadEvents(timetable.events);
        }

        this.calendar.render();
        this.preloader.stop();
    }

    onSelectedCallback(id) {
        this.loadTimetable(id);
    }

    onTimetablesSavedCallback(timetables) {
        this.select.set(timetables);
    }
    
    onFiltersSavedCallback(filters) {
        let selected = this.storage.getSelected();
        if(!selected) return;
        this.loadTimetable(selected);
    }
    
    onReloadButton() {
        let selected = this.storage.getSelected();
        if(!selected) return;
        this.storage.deleteCacheById(selected);
        this.loadTimetable(selected);
    }
}