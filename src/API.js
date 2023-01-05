const fetch = require('node-fetch');
const URL = require('./URL.js');
const iconv = require('iconv-lite');

class API {
    constructor() {
        this.URL = new URL();
    }

    async request(url) {
        try {
            const response = await fetch(url);
            const data = this.decode(response);
            return data;
        } catch (e) {
            console.log(`Error while cist request: ${e}`);
            return null;
        }
    }
    
    async getTimetable(id, typeId) {
        try {
            const url = this.URL.getTimetableUrl(id, typeId);
            const res = await this.request(url);
            return res.toString();
        } catch (err) {
            console.log(`Error while getTimetable: ${err}`);
            return null;
        }
    }

    async getGroups() {
        try {
            const url = this.URL.getGroupsUrl();

            let data = await this.request(url);
    
            let parsed = JSON.parse(data.toString());
            let groups = [];
            parsed.university.faculties.forEach(faculty => {
                faculty.directions.forEach(direction => {
                    groups = groups.concat(direction.groups);
                })
            });
    
            return groups;
        } catch (err) {
            console.log(`Error while getGroups: ${err}`);
            return null;
        }
    }

    async getTeachers() {
        try {
            const url = this.URL.getTeachersUrl();

            let data = await this.request(url);
    
            data = data.toString('utf8');
            data = data.replace(']}]}]}', ']}]}]}]}'); // This fixes cist json encoding error
    
            let parsed = JSON.parse(data);
            let teachers = [];
            parsed.university.faculties.forEach(faculty => {
                faculty.departments.forEach(department => {
                    if(department.teachers) {
                        teachers = teachers.concat(department.teachers);
                    }
    
                    if(department.departments) {
                        department.departments.forEach(department2 => {
                            if(department2.teachers) {
                                teachers = teachers.concat(department2.teachers);
                            }
                        });
                    }
                });
            });
    
            return teachers;
        } catch (err) {
            console.log(`Error while getTeachers: ${err}`);
            return null;
        }
    }

    async getAudiences() {
        const url = this.URL.getAudiencesUrl();

        let data = await this.request(url);

        let parsed = JSON.parse(data.toString());
        let audiences = [];
        parsed.university.buildings.forEach(building => {
            audiences = audiences.concat(building.auditories);
        });

        return audiences;
    }

    async decode(response) {
        const buffer = await response.buffer();
        const data = iconv.encode(iconv.decode(buffer, 'win1251'), 'utf8');
        return data;
    }
}

module.exports = API;