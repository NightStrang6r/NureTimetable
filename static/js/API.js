export default class API {
    async getAllGroups() {
        const url = '/api/groups/';
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        let groups = [];
        json.university.faculties.forEach(faculty => {
            faculty.directions.forEach(direction => {
                groups = groups.concat(direction.groups);
            })
        });
    
        return groups;
    }
    
    async getTimetable(groupId) {
        const url = `/get?groupId=${groupId}`;
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        return json;
    }
}