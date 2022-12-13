export default class API {
    async getTimetable(id, type) {
        const url = `/get?id=${id}&type=${type}`;
        const options = {
            method: 'GET'
        };

        let res, json;
    
        try {
            res = await fetch(url, options);
            json = await res.json();
        } catch (err) {
            json = false;
        }
    
        return json;
    }

    async getAllGroups() {
        const url = '/getGroups';
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        return json;
    }

    async getAllTeachers() {
        const url = '/getTeachers';
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        return json;
    }

    async getAllAudiences() {
        const url = '/getAudiences';
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        return json;
    }
}