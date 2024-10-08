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
        window.storage = new Storage();
        this.storage = window.storage;
        this.darkTheme = new DarkTheme('.dark-trigger');
    }

    async main() {
        this.preloader = new Preloader('.preloader');
        this.preloader.start();

        this.calendar = new Calendar('#calendar');
        this.select = new Select('.timetable-select');
        this.auth = new Auth('.auth');
        
        this.calendarContainer = document.querySelector('#calendar-container');
        this.addTip = document.querySelector('.addTip');
        this.reloadButton = document.querySelector('.reload-trigger');
        this.printButton = document.querySelector('.print-trigger')
        this.storage.setClearTrigger('.clear-button');

        let timetables = this.storage.getTimetables();
        let lastTimetableId = this.storage.getSelected();
        this.select.set(timetables);

        if(lastTimetableId) {
            this.select.setSelected(lastTimetableId);
            this.loadTimetable(lastTimetableId);
        } else {
            if(!this.calendarContainer.className.includes('d-none')) {
                this.calendarContainer.classList.add('d-none');
                this.addTip.classList.remove('d-none');
                this.addTip.addEventListener('click', () => {
                    document.querySelector('.cd-popup-add-trigger').click()
                });
            }

            this.preloader.stop();
        }

        this.select.onSelected((prop) => this.onSelectedCallback(prop));
        this.storage.onTimetablesSaved((prop) => this.onTimetablesSavedCallback(prop));
        this.storage.onFiltersSaved((prop) => this.onFiltersSavedCallback(prop));
        this.reloadButton.addEventListener('click', (prop) => this.onReloadButton(prop));
        this.printButton.addEventListener('click', (prop) => this.onPrintButton(prop));
        
        this.popupAdd = new PopupAdd('.cd-popup-add', '.cd-popup-add-trigger');
        new PopupFilter('.cd-popup-filter', '.cd-popup-filter-trigger');
        new PopupLanguage('.cd-popup-language', '.cd-popup-language-trigger');

        this.popupAdd.addOpenSelect('.timetable-select', 0);
    }

    async loadTimetable(id, reload = false) {
        let timetable;

        if(this.auth.check()) {
            this.calendarContainer.classList.remove('d-none');
            this.addTip.classList.add('d-none');
        }

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
        timetable = await this.storage.getTimetable(id, reload);
        
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
        //this.storage.deleteCacheById(selected);
        this.loadTimetable(selected, true);
    }

    onPrintButton() {
        window.print();
    }
}