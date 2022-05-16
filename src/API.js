const fetch = require('node-fetch');
const URL = require('./URL.js');
const iconv = require('iconv-lite');

class API {
    constructor() {
        API.URL = new URL();
    }
    
    async getTimetable(id, typeId) {
        const url = API.URL.getTimetableUrl(id, typeId);
        const response = await fetch(url);
        const data = this.decode(response);
        return data;
    }

    async getGroups() {
        const url = API.URL.getGroupsUrl();
        const response = await fetch(url);
        const data = this.decode(response);
        return data;
    }

    async getTeachers() {
        const url = API.URL.getTeachersUrl();
        const response = await fetch(url);
        const data = this.decode(response);
        return data;
    }

    async getAudiences() {
        const url = API.URL.getAudiencesUrl();
        const response = await fetch(url);
        const data = this.decode(response);
        return data;
    }

    async decode(response) {
        const buffer = await response.buffer();
        const data = iconv.encode(iconv.decode(buffer, 'win1251'), 'utf8');
        return data;
    }
}

module.exports = API;