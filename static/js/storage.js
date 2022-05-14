import API from './API.js';
let api = new API();

let onTimetablesSaved = null;

export default class Storage {
    constructor() {
        this.timetable = null;
        this.groups = null;
    }

    getTimetables() {
        if(!localStorage.timetables) return [];
        
        return JSON.parse(localStorage.timetables);
    }

    saveTimetables(timetables) {
        localStorage.timetables = JSON.stringify(timetables);
        onTimetablesSaved(timetables);
    }

    onTimetablesSaved(callback) {
        onTimetablesSaved = callback;
    }

    async getTimetable(groupId) {
        /*let timetables = JSON.parse(localStorage.timetables);
        timetables.forEach(timetable => {
            if(timetable.type == "groups" && timetable.id == groupId) {
                this.timetable = JSON.parse(timetable);
                return this.timetable;
            }
        });*/

        this.timetable = await api.getTimetable(groupId);

        /*timetables.push({
            type: "groups",
            id: groupId, 
            data: JSON.stringify(this.timetable)
        });*/

        //localStorage.timetables = JSON.stringify(timetables)

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