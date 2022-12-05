import API from './API.js';
let api = new API();

let onTimetablesSaved = null;
let onFiltersSaved = null;
let getTimetable = null;
let getTimetables = null;

export default class Storage {
    constructor() {
        this.timetable = null;
        this.groups = null;
        this.reloadButton = null;

        getTimetable = this.getTimetable;
        getTimetables = this.getTimetables;
    }

    // Возвращает все расписания из кэша
    getTimetables() {
        if(!localStorage.timetables) return [];
        
        return JSON.parse(localStorage.timetables);
    }

    // Сохраняет все расписания в кэш
    saveTimetables(timetables) {
        localStorage.timetables = JSON.stringify(timetables);
        onTimetablesSaved(timetables);
    }

    // Колбэк функция, вызывается при сохранении расписания
    onTimetablesSaved(callback) {
        onTimetablesSaved = callback;
    }

    deleteSelected() {
        return delete localStorage.selected;
    }

    // Сохраняет id выбранного расписания
    saveSelected(id) {
        localStorage.selected = id;
    }

    // Возвращает id выбранного расписания
    getSelected() {
        if(localStorage.selected) return Number(localStorage.selected);
        return null;
    }

    saveFilters(filter) {
        localStorage.filter = JSON.stringify(filter);
        onFiltersSaved(filter);
    }

    getFilters() {
        if(localStorage.filter) return JSON.parse(localStorage.filter);
        return null;
    }

    onFiltersSaved(callback) {
        onFiltersSaved = callback;
    }

    saveDarkTheme(enabled) {
        this.deleteCookie('dark');
        this.setCookie('dark', enabled);
    }

    getDarkTheme() {
        let dark = this.getCookie('dark');
        if(dark == 'true') return true;
        if(dark == 'false') return false;
        return null;
    }

    saveDarkCSS(css) {
        localStorage.darkCSS = css;
    }

    getDarkCSS() {
        if(localStorage.darkCSS) return localStorage.darkCSS;
        return null;
    }

    saveCustomEvents(events) {
        let updatedEvents = [];

        events.forEach(event => {
            updatedEvents.push(event);
        });

        localStorage.customEvents = JSON.stringify(updatedEvents);
    }

    addCustomEvent(event) {
        let events = [];

        if(localStorage.customEvents) {
            events = JSON.parse(localStorage.customEvents);
        }
        
        events.push(event);
        localStorage.customEvents = JSON.stringify(events);
    }

    getCustomEvents() {
        if(localStorage.customEvents) return JSON.parse(localStorage.customEvents);
        return [];
    }

    setAuth(auth) {
        this.setCookie('key', auth);
    }

    deleteAuth() {
        this.deleteCookie('key');
    }

    getAuth() {
        let auth = this.getCookie('key');
        if(auth) return auth;
        return null;
    }

    getClient() {
        let client = this.getCookie('client');
        if(client) return decodeURIComponent(client).split(';');
        return null;
    }

    updateCustomEvent(newEvent, oldEvent) {
        let events = this.getCustomEvents();

        events.forEach((event, index) => {
            if(!this.isEventEqual(event, oldEvent)) return;

            events.splice(index, 1);

            if(newEvent != null) {
                newEvent.allDayEvent = true;
                events.push(newEvent);
                console.log('Storage: Event updated');
                return;
            }

            console.log('Storage: Event removed');
        });

        this.saveCustomEvents(events);
    }

    isEventEqual(event1, event2) {
        //if(event1.allDay != event2.allDay) return;
        //console.log(1)
        if(event2.start && event2.end) {
            if(new Date(event1.start).getTime() != event2.start.getTime()) return false;
            //console.log(2)
            if(new Date(event1.end).getTime() != event2.end.getTime()) return false;
            //console.log(3)
        }
        if(event1.title != event2.title) return false;
        //console.log(4)
        if(String(event1.extendedProps.description) != event2.extendedProps.description) return false;
        //console.log(5)

        return true;
    }

    deleteCacheById(id) {
        let timetables = this.getTimetables();

        if(timetables.length > 0) {
            for(let i = 0; i < timetables.length; i++) {
                let timetable = timetables[i];
    
                // Находим нужное расписание
                if(timetable.id == id) {
                    // Если кэша нет, выходим
                    if(!timetable.data)
                        break;
                
                    delete timetable.data;
                    break;
                }
            }
        }

        localStorage.timetables = JSON.stringify(timetables);
    }

    // Возвращает расписание по id с учётом возможного кэша
    async getTimetable(id, reload = false) {
        // Получаем кэш расписаний из localStorage
        let timetables = this.getTimetables();
        let type, name;

        // Если кэш не пуст
        if(timetables.length > 0) {
            for(let i = 0; i < timetables.length; i++) {
                let timetable = timetables[i];
    
                // Находим нужное расписание
                if(timetable.id == id) {
                    // Если кэша нет, выходим
                    if(!timetable.data) {
                        type = timetable.type;
                        name = timetable.name;
                        timetables.splice(i, 1);
                        break;
                    } else if(reload) {
                        delete timetable.data;
                        break;
                    }

                    this.timetable = JSON.parse(timetable.data);
                    return this.timetable;
                }
            }
        }

        // Если кэша нет, используем API
        this.timetable = await api.getTimetable(id, type);

        if(!this.timetable) {
            this.timetable = {};
            this.timetable.error = true;
            return this.timetable;
        }

        // Готовим массив для кэша
        timetables.push({
            id: id, 
            type: type,
            name: name,
            data: JSON.stringify(this.timetable)
        });

        // Записываем в кэш
        localStorage.timetables = JSON.stringify(timetables);

        return this.timetable;
    }

    async getAllGroups() {
        if(!localStorage.groups) {
            this.groups = await api.getAllGroups();
            localStorage.groups = JSON.stringify(this.groups);
        } else {
            this.groups = JSON.parse(localStorage.groups);
        }

        return this.groups;
    }

    async getAllTeachers() {
        if(!localStorage.teachers) {
            this.teachers = await api.getAllTeachers();
            localStorage.teachers = JSON.stringify(this.teachers);
        } else {
            this.teachers = JSON.parse(localStorage.teachers);
        }

        return this.teachers;
    }

    async getAllAudiences() {
        if(!localStorage.audiences) {
            this.audiences = await api.getAllAudiences();
            localStorage.audiences = JSON.stringify(this.audiences);
        } else {
            this.audiences = JSON.parse(localStorage.audiences);
        }

        return this.audiences;
    }

    saveLanguage(language) {
        this.setCookie('lang', language);
    }

    getLanguage() {
        let lang = this.getCookie('lang');
        if(!lang) return null;
        return lang;
    }

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    setCookie(name, value, options = {}) {
        options = {
            path: '/',
            ...options
        };
      
        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }
      
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
      
        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }
      
        document.cookie = updatedCookie;
    }

    deleteCookie(name) {
        this.setCookie(name, "", {
          'max-age': -1
        });
    }

    deleteAllCookies() {
        let cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
            document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    }

    setClearTrigger(selector) {
        let trigger = document.querySelector(selector);
        trigger.addEventListener('click', (event) => this.clear(event));
    }

    clear() {
        let lToClearCache = document.querySelector('#l-toClearCache');
        if(!confirm(lToClearCache.innerHTML)) return;

        localStorage.clear();
        this.deleteAllCookies();
        window.location.reload();
    }
};