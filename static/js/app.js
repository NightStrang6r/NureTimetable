import Preloader from './preloader.js';
import Calendar from './calendar.js';
import Storage from './storage.js';
import Select from './select.js';
import PopupAdd from './popupAdd.js';
import DarkTheme from './darkTheme.js';
import PopupFilter from './popupFilter.js';
import PopupLanguage from './popupLanguage.js';
import Auth from './auth.js';

export default class App {
    run() {
        document.addEventListener('DOMContentLoaded', (event) => this.main(event));
        this.init();
    }

    async init() {
        this.darkTheme = new DarkTheme('.dark-trigger');
        this.preloader = new Preloader('.preloader');
        this.preloader.start();
    }

    async main() {
        this.calendar = new Calendar('#calendar');
        this.storage = new Storage();
        this.select = new Select('.timetable-select');
        this.auth = new Auth('.auth');
        
        this.reloadButton = document.querySelector('.reload-trigger');
        this.storage.setClearTrigger('.clear-button');

        let timetables = this.storage.getTimetables();
        let lastTimetableId = this.storage.getSelected();
        this.select.set(timetables);

        if(lastTimetableId) {
            this.select.setSelected(lastTimetableId);
            this.loadTimetable(lastTimetableId);
        } else {
            
            this.preloader.stop();
        }

        this.select.onSelected((prop) => this.onSelectedCallback(prop));
        this.storage.onTimetablesSaved((prop) => this.onTimetablesSavedCallback(prop));
        this.storage.onFiltersSaved((prop) => this.onFiltersSavedCallback(prop));
        this.reloadButton.addEventListener('click', (prop) => this.onReloadButton(prop));
        
        this.popupAdd = new PopupAdd('.cd-popup-add', '.cd-popup-add-trigger');
        new PopupFilter('.cd-popup-filter', '.cd-popup-filter-trigger');
        new PopupLanguage('.cd-popup-language', '.cd-popup-language-trigger');

        this.popupAdd.addOpenSelect('.timetable-select', 0);
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
            this.ttUnavailable = document.querySelector('#timetable-unavailable');
            alert(this.ttUnavailable.innerHTML);
        } else {
            this.calendar.setTimetable(timetable);
            this.calendar.loadEvents(timetable.events);
            this.calendar.loadAllCustomEvents();
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