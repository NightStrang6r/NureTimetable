import API from './API.js';
let api = new API();

export default class Storage {
    constructor() {
        this.timetable = null;
        this.groups = null;
    }

    async getTimetable(groupId) {
        if(!localStorage.timetable) {
            this.timetable = await api.getTimetable(groupId);
            localStorage.timetable = JSON.stringify(this.timetable);
        } else {
            this.timetable = JSON.parse(localStorage.timetable);
        }

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