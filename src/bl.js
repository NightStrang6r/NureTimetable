const API = require('./API.js');
const c = require('chalk')

class BL {
    constructor() {
        this.API = new API();

        this.updateInterval = 14400000; // 4 hours
        this.timetableExpiry = 14400000; // 4 hours

        this.getGroups();
        this.getTeachers();
        this.getAudiences();

        this.cacheAllTimetables();

        setInterval(() => {
            this.cacheAllTimetables();
        }, this.updateInterval);
    }

    async cacheAllTimetables() {
        let groups = await global.db.getGroups();
        let teachers = await global.db.getTeachers();
        let audiences = await global.db.getAudiences();
    
        console.log(c.green('Caching timetables...'));
    
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
        for (let group of groups) {
            await this.cacheTimetable(group, 'groups', 'name', 'setGroupValidTimetable');
            await delay(5000);
        }
    
        for (let teacher of teachers) {
            await this.cacheTimetable(teacher, 'teachers', 'full_name', 'setTeacherValidTimetable');
            await delay(5000);
        }
    
        for (let audience of audiences) {
            await this.cacheTimetable(audience, 'audiences', 'short_name', 'setAudienceValidTimetable');
            await delay(5000);
        }
    
        console.log(c.green('All timetables cached.'));
    }
    
    async cacheTimetable(entity, entityType, nameField, validTimetableSetter) {
        let res = await this.getTimetable(entity.id, entityType);
    
        if (res.error) {
            console.log(c.cyan(`Timetable for ${entityType.slice(0, -1)} ${entity[nameField]}: ${res.data}`));
            if (res.data === 'Invalid timetable') {
                global.db[validTimetableSetter](entity.id, false);
            }
        } else {
            console.log(c.green(`Timetable for ${entityType.slice(0, -1)} ${entity[nameField]} cached.`));
        }
    }

    async getTimetable(id, typeName) {
        let error = false;
        let parsed = null;
        let string = null;
        let typeId = this.getTimetableTypeId(typeName);
        let timetable = await global.db.getTimetable(id, typeId);

        if(timetable && timetable.data) {
            if ((new Date() - new Date(timetable.update_date)) < this.timetableExpiry) {
                global.db.incrementTimetableReqCount(id, typeId);
                return { data: timetable.data, error: false };
            }
        }
        
        let data = await this.API.getTimetable(id, typeId);

        if(data) {
            try {
                parsed = JSON.parse(data);
                string = JSON.stringify(parsed);
            } catch(err) {
                error = "Invalid timetable";
            }
        } else {
            error = "Cist API failed";
        }

        if(error) {
            if(timetable.data) return { data: timetable.data, error: false };
            return { data: error, error: true };
        }

        let timetableName = '';
        if(typeId == 3) {
            timetableName = await global.db.getAudienceNameByCistId(id);
        } else {
            timetableName = this.getTimetableName(id, typeId, parsed);
        }
            
        global.db.createOrUpdateTimetable(id, typeId, timetableName, string);
        
        return { data: string, error: false };
    }

    getTimetableTypeId(name) {
        let typeId;
        switch (name) {
            case 'groups':
                typeId = 1;
                break;
            case 'teachers':
                typeId = 2;
                break;
            case 'audiences':
                typeId = 3;
                break;
            default:
                typeId = 1;
                break;
        }
        return typeId;
    }

    async getGroups() {
        let result = null;

        if(!global.storage.groupsUpdateTimestamp 
        || (global.storage.groupsUpdateTimestamp + 14400000) < Date.now()) {
            global.storage.groupsUpdateTimestamp = Date.now();

            let groups = await this.API.getGroups();

            if(!groups) return false;

            let newGroups = [];
            for(let i = 0; i < groups.length; i++) {
                let group = groups[i];
                if(!group || typeof group != 'object' || !group.id) continue;

                let newGroup = {
                    cist_id: group.id,
                    name: group.name
                }
                
                newGroups.push(newGroup);
            }

            result = groups;
            global.db.createOrUpdateGroups(newGroups);
        } else {
            result = await global.db.getGroups();
        }

        return result;
    }

    async getTeachers() {
        let result = null;

        if(!global.storage.teachersUpdateTimestamp 
        || (global.storage.teachersUpdateTimestamp + 14400000) < Date.now()) {
            global.storage.teachersUpdateTimestamp = Date.now();

            let teachers = await this.API.getTeachers();

            if(!teachers) return false;
            
            result = teachers;
            global.db.createOrUpdateTeachers(teachers);
        } else {
            result = await global.db.getTeachers();
        }

        return result;
    }

    async getAudiences() {
        let result = null;

        if(!global.storage.audiencesUpdateTimestamp 
        || (global.storage.audiencesUpdateTimestamp + 14400000) < Date.now()) {
            global.storage.audiencesUpdateTimestamp = Date.now();

            let audiences = await this.API.getAudiences();

            if(!audiences) return false;
            
            result = audiences;
            global.db.createOrUpdateAudiences(audiences);
        } else {
            result = await global.db.getAudiences();
        }

        return result;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getTimetableName(id, type, timetable) {
        let name = '';

        switch (type) {
            case 2:
                name = this.getTeacherById(timetable, id).short_name;
                break;
            default:
                name = this.getGroupById(timetable, id).name;
                break;
        }

        return name;
    }

    getSubjectById(timetable, id) {
        let subject = {};
        
        timetable.subjects.forEach(subj => {
            if(subj.id == id) {
                subject = subj;
                return;
            }
        });
    
        return subject;
    }

    getTypeById(timetable, id) {
        let type = {};
        
        timetable.types.forEach(tp => {
            if(tp.id == id) {
                type = tp;
                return;
            }
        });
    
        return type;
    }

    getGroupById(timetable, id) {
        let group = {};
        
        timetable.groups.forEach(gr => {
            if(gr.id == id) {
                group = gr;
                return;
            }
        });
    
        return group;
    }

    getTeacherById(timetable, id) {
        let teacher = {};
        
        timetable.teachers.forEach(teach => {
            if(teach.id == id) {
                teacher = teach;
                return;
            }
        });
    
        return teacher;
    }
}

module.exports = BL;