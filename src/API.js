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
        const url = this.URL.getTimetableUrl(id, typeId);
        return this.request(url);
    }

    async getGroups() {
        const url = this.URL.getGroupsUrl();
        return this.request(url);
    }

    async getTeachers() {
        const url = this.URL.getTeachersUrl();
        return this.request(url);
    }

    async getAudiences() {
        const url = this.URL.getAudiencesUrl();
        return this.request(url);
    }

    async decode(response) {
        const buffer = await response.buffer();
        const data = iconv.encode(iconv.decode(buffer, 'win1251'), 'utf8');
        return data;
    }
}

module.exports = API;