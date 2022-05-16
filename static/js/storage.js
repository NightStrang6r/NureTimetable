import API from './API.js';
let api = new API();

let onTimetablesSaved = null;

export default class Storage {
    constructor() {
        this.timetable = null;
        this.groups = null;
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

    // Сохраняет id выбранного расписания
    saveSelected(id) {
        localStorage.selected = id;
    }

    // Возвращает id выбранного расписания
    getSelected() {
        if(localStorage.selected) return Number(localStorage.selected);
        return null;
    }

    // Возвращает расписание по id с учётом возможного кэша
    async getTimetable(id) {
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
                    }

                    this.timetable = JSON.parse(timetable.data);
                    return this.timetable;
                }
            }
        }

        // Если кэша нет, используем API
        this.timetable = await api.getTimetable(id, type);

        // Готовим массив для кэша
        timetables.push({
            id: id, 
            type: type,
            name: name,
            data: JSON.stringify(this.timetable)
        });

        // Записываем в кэш
        localStorage.timetables = JSON.stringify(timetables)

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
};