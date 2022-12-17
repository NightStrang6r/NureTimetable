const uuid = require('uuid');

class DB {
    constructor() {
        this.config = global.storage.config.db;
    }

    connect() {
        this.knex = require('knex')({
            client: 'mysql2',
            connection: {
                host : this.config.host,
                port : this.config.port,
                user : this.config.user,
                password : this.config.pass,
                database : this.config.db
            }
        });
    }
    
    async checkConnection() {
        try {
            await this.knex.raw('SELECT 1+1 AS result');
            console.log('DB connection established!');
        } catch (err) {
            console.log('DB connection failed!');
            console.log(err);
        }
    }

    async query(query, params) {
        try {
            const result = await this.knex.raw(query, params);
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateUser(user) {
        try {
            user.user_id = uuid.v4();
            user.lastactive_date = this.knex.fn.now();

            let result = await this.knex('users').where('email', user.email).update(user);

            if(result == 0) {
                user.registration_date = user.lastactive_date;
                result = await this.knex('users').insert(user);
            }

            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async updateUserLastActive(email) {
        try {
            let result = await this.knex('users').where('email', email).update({lastactive_date: this.knex.fn.now()});
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateTimetable(id, typeId, name) {
        try {
            let timetable = {
                cist_id: id,
                name: name,
                type: typeId,
                request_count: 0,
                update_date: this.knex.fn.now()
            };

            let result = await this.knex('timetables').where('cist_id', id).update(timetable);

            if(result == 0) {
                timetable.timetable_id = uuid.v4();
                timetable.creation_date = timetable.update_date;
                result = await this.knex('timetables').insert(timetable);
            } else {
                //await this.knex('timetables').where('cist_id', id).increment('request_count');
            }

            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTimetable(id, typeId) {
        try {
            const timetable = await this.knex('timetables').where('cist_id', id).andWhere('type', typeId).first();
            if(!timetable) return false;

            const events = await this.getEvents(timetable.timetable_id);
            const groups = await this.getGroups();
            const teachers = await this.getTeachers();
            const subjects = await this.getSubjects();
            const types = await this.getEventTypes();

            await this.knex('timetables').where('timetable_id', timetable.timetable_id).increment('request_count');
            
            return {
                events: events,
                groups: groups,
                teachers: teachers,
                subjects: subjects,
                types: types
            };
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateGroups(groups) {
        try {
            for(let i = 0; i < groups.length; i++) {
                let group = groups[i];
                if(!group || typeof group != 'object' || !group.id) continue;

                let newGroup = {
                    group_id: uuid.v4(),
                    cist_id: group.id,
                    name: group.name
                }
                
                let result = await this.knex('groups').where('cist_id', newGroup.cist_id).first();

                if(!result) {
                    result = await this.knex('groups').insert(newGroup);
                }
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getGroups() {
        try {
            const result = await this.knex('groups').select('cist_id as id', 'name').orderBy('name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateTeachers(teachers) {
        try {
            for(let i = 0; i < teachers.length; i++) {
                let teacher = teachers[i];
                if(!teacher || typeof teacher != 'object' || !teacher.id) continue;

                let name = teacher.full_name.split(' ');

                let newTeacher = {
                    teacher_id: uuid.v4(),
                    cist_id: teacher.id,
                    surname: name[0],
                    name: name[1],
                    patronymic: name[2],
                }
                
                let result = await this.knex('teachers').where('cist_id', newTeacher.cist_id).first();

                if(!result) {
                    result = await this.knex('teachers').insert(newTeacher);
                }
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTeachers() {
        try {
            const result = await this.knex('teachers').select('cist_id as id', this.knex.raw('CONCAT(surname, " ", name, " ", patronymic) as full_name'), this.knex.raw('CONCAT(surname, " ", name, " ", patronymic) as short_name')).orderBy('surname');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateAudiences(audiences) {
        try {
            for(let i = 0; i < audiences.length; i++) {
                let audience = audiences[i];
                if(!audience || typeof audience != 'object' || !audience.id) continue;

                let floor = Number(audience.floor);
                if(isNaN(floor)) floor = null;

                let newAudience = {
                    audience_id: uuid.v4(),
                    cist_id: audience.id,
                    name: audience.short_name,
                    floor: floor,
                    is_have_power: Number(audience.is_have_power)
                };
                
                let result = await this.knex('audiences').where('cist_id', newAudience.cist_id).first();

                if(!result) {
                    result = await this.knex('audiences').insert(newAudience);
                }
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getAudiences() {
        try {
            const result = await this.knex('audiences').select('cist_id as id', 'name', 'is_have_power').orderBy('name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateEvents(id, events) {
        try {
            let timetable_id = await this.getTimetableIdByCistId(id);
            await this.knex('events').where('timetable_id', timetable_id).del();

            for(let i = 0; i < events.length; i++) {
                let event = events[i];
                if(!event || typeof event != 'object') continue;

                let start_time = new Date(event.start_time * 1000);
                let end_time = new Date(event.end_time * 1000);

                let subject_id = await this.getSubjectIdByCistId(event.subject_id);
                let event_type_id = await this.getEventTypeIdByCistId(event.type);
                let audience_id = await this.getAudienceIdByName(event.auditory);

                let newEvent = {
                    event_id: uuid.v4(),
                    start_time: start_time,
                    end_time: end_time,
                    pair_number: event.number_pair,
                    subject_id: subject_id,
                    event_type_id: event_type_id,
                    audience_id: audience_id,
                    timetable_id: timetable_id
                };

                await this.knex('events').insert(newEvent);

                await this.createOrUpdateEventsTeachers(newEvent.event_id, event.teachers);
                await this.createOrUpdateEventsGroups(newEvent.event_id, event.groups);
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getEvents(timetable_id) {
        try {
            const result = await this.knex('events').select('event_id', 'start_time', 'end_time', 'pair_number as number_pair', 'subject_id', 'event_type_id', 'audience_id').where('timetable_id', timetable_id);
            let newEvents = [];

            for(let i = 0; i < result.length; i++) {
                let event = result[i];
                let newEvent = {};

                newEvent.start_time = event.start_time.getTime() / 1000;
                newEvent.end_time = event.end_time.getTime() / 1000;
                newEvent.number_pair = event.number_pair;
                newEvent.subject_id = await this.getCistIdBySubjectId(event.subject_id);
                newEvent.type = await this.getCistIdByEventTypeId(event.event_type_id);
                newEvent.auditory = await this.getNameByAudienceId(event.audience_id);
                newEvent.teachers = await this.getTeachersByEventId(event.event_id);
                newEvent.groups = await this.getGroupsByEventId(event.event_id);

                newEvents.push(newEvent);
            }

            return newEvents;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateEventTypes(eventTypes) {
        try {
            for(let i = 0; i < eventTypes.length; i++) {
                let eventType = eventTypes[i];
                if(!eventType || typeof eventType != 'object') continue;

                let newEventType = {
                    event_type_id: uuid.v4(),
                    cist_id: eventType.id,
                    short_name: eventType.short_name,
                    full_name: eventType.full_name,
                    tech_name: eventType.type
                };
                
                let result = await this.knex('event_types').where('cist_id', newEventType.cist_id).first();

                if(!result) {
                    result = await this.knex('event_types').insert(newEventType);
                }
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getEventTypes() {
        try {
            const result = await this.knex('event_types').select('cist_id as id', 'short_name', 'full_name', 'tech_name as type').orderBy('short_name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateSubjects(subjects) {
        try {
            for(let i = 0; i < subjects.length; i++) {
                let subject = subjects[i];
                if(!subject || typeof subject != 'object' || !subject.id) continue;

                let newSubject = {
                    subject_id: uuid.v4(),
                    cist_id: subject.id,
                    short_name: subject.brief,
                    full_name: subject.title
                };
                
                let result = await this.knex('subjects').where('cist_id', newSubject.cist_id).first();

                if(!result) {
                    result = await this.knex('subjects').insert(newSubject);
                }
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getSubjects() {
        try {
            const result = await this.knex('subjects').select('cist_id as id', 'short_name as brief', 'full_name as title').orderBy('short_name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateEventsTeachers(event_id, cist_ids) {
        try {
            await this.knex('events_teachers').where('event_id', event_id).del();

            for(let i = 0; i < cist_ids.length; i++) {
                let cist_id = cist_ids[i];
                if(!cist_id) continue;

                let teacher_id = await this.getTeacherIdByCistId(cist_id);
                if(!teacher_id) continue;

                let newEventTeacher = {
                    event_id: event_id,
                    teacher_id: teacher_id
                };

                await this.knex('events_teachers').insert(newEventTeacher);
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTeachersByEventId(event_id) {
        try {
            const result = await this.knex('events_teachers').select('teacher_id').where('event_id', event_id);
            let cist_ids = [];

            for(let i = 0; i < result.length; i++) {
                let teacher_id = result[i].teacher_id;
                let cist_id = await this.getCistIdByTeacherId(teacher_id);
                if(!cist_id) continue;

                cist_ids.push(cist_id);
            }

            return cist_ids;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateEventsGroups(event_id, cist_ids) {
        try {
            await this.knex('events_groups').where('event_id', event_id).del();

            for(let i = 0; i < cist_ids.length; i++) {
                let cist_id = cist_ids[i];
                if(!cist_id) continue;

                let group_id = await this.getGroupIdByCistId(cist_id);
                if(!group_id) continue;

                let newEventGroup = {
                    event_id: event_id,
                    group_id: group_id
                };

                await this.knex('events_groups').insert(newEventGroup);
            }
        } catch (err) {
            //console.log(err);
            return false;
        }
    }

    async getGroupsByEventId(event_id) {
        try {
            const result = await this.knex('events_groups').select('group_id').where('event_id', event_id);
            let cist_ids = [];

            for(let i = 0; i < result.length; i++) {
                let group_id = result[i].group_id;
                let cist_id = await this.getCistIdByGroupId(group_id);
                if(!cist_id) continue;

                cist_ids.push(cist_id);
            }

            return cist_ids;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getEventTypeIdByCistId(cistId) {
        try {
            const result = await this.knex('event_types').where('cist_id', cistId).first();
            return result.event_type_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getAudienceIdByName(name) {
        try {
            const result = await this.knex('audiences').where('name', name).first();
            return result.audience_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getSubjectIdByCistId(cistId) {
        try {
            const result = await this.knex('subjects').where('cist_id', cistId).first();
            return result.subject_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTimetableIdByCistId(cistId) {
        try {
            const result = await this.knex('timetables').where('cist_id', cistId).first();
            return result.timetable_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getCistIdBySubjectId(subjectId) {
        try {
            const result = await this.knex('subjects').where('subject_id', subjectId).first();
            return result.cist_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getCistIdByEventTypeId(eventTypeId) {
        try {
            const result = await this.knex('event_types').where('event_type_id', eventTypeId).first();
            return result.cist_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getNameByAudienceId(audienceId) {
        try {
            const result = await this.knex('audiences').where('audience_id', audienceId).first();
            return result.name;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTeacherIdByCistId(cistId) {
        try {
            const result = await this.knex('teachers').where('cist_id', cistId).first();
            return result.teacher_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getCistIdByTeacherId(teacherId) {
        try {
            const result = await this.knex('teachers').where('teacher_id', teacherId).first();
            return result.cist_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getGroupIdByCistId(cistId) {
        try {
            const result = await this.knex('groups').where('cist_id', cistId).first();
            if(!result) return false;
            return result.group_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getCistIdByGroupId(groupId) {
        try {
            const result = await this.knex('groups').where('group_id', groupId).first();
            return result.cist_id;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getAudienceNameByCistId(cistId) {
        try {
            const result = await this.knex('audiences').where('cist_id', cistId).first();
            return result.name;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

module.exports = DB;