export default class API {
    async getTimetable(id, type) {
        const url = `/get?id=${id}&type=${type}`;
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        return json;
    }

    async getAllGroups() {
        const url = '/getGroups';
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

    async getAllTeachers() {
        const url = '/getTeachers';
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        let teachers = [];
        json.university.faculties.forEach(faculty => {
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
    }

    async getAllAudiences() {
        const url = '/getAudiences';
        const options = {
            method: 'GET'
        };
    
        const res = await fetch(url, options);
        const json = await res.json();
    
        let audiences = [];
        console.log(json);
        json.university.buildings.forEach(building => {
            audiences = audiences.concat(building.auditories);
        });
    
        return audiences;
    }
}