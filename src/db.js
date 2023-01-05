const uuid = require('uuid');
const c = require('chalk');

class DB {
    constructor() {
        this.knex = require('knex')({
            client: 'better-sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: "./db/database.sqlite",
            }
        });
    }

    async initDatabase() {
        try {
            let sql = global.storage.getInitSQL();
            sql = sql.split('---');

            for(let i = 0; i < sql.length; i++) {
                await this.knex.raw(sql[i]);
            }
        } catch (err) {
            console.log(`Error in initDatabase: ${err}`);
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
                console.log(`${c.green('New user')} ${c.yellow(user.email)} ${c.green('registered.')}`);
            }

            return result;
        } catch (err) {
            console.log(`Error in createOrUpdateUser: ${err}`);
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

    async createOrUpdateTimetable(cist_id, type, name, data) {
        try {
            let timetable = {
                timetable_id: uuid.v4(),
                cist_id: cist_id,
                data: data,
                type: type,
                name: name,
                update_date: this.knex.fn.now(),
            }

            let result = await this.knex('timetables').where('cist_id', timetable.cist_id).where('type', timetable.type).update(timetable);

            if(result == 0) {
                timetable.creation_date = timetable.update_date;
                timetable.request_count = 1;
                result = await this.knex('timetables').insert(timetable);
                console.log(`${c.green('New timetable')} ${c.yellow(timetable.name)} ${c.green('created.')}`);
            }

            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async incrementTimetableReqCount(cist_id, type) {
        try {
            let result = await this.knex('timetables').where('cist_id', cist_id).where('type', type).increment('request_count', 1);
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTimetable(cist_id, type) {
        try {
            let timetable = await this.knex('timetables').select('*')
                .where('cist_id', cist_id)
                .where('type', type)
                .first();

            if(!timetable) return false;
            return timetable;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateGroups(groups) {
        try {
            let inserted = 0;

            for(let i = 0; i < groups.length; i++) {
                let group = groups[i];
                if(!group || typeof group != 'object' || !group.cist_id) continue;

                let newGroup = {
                    group_id: uuid.v4(),
                    cist_id: group.cist_id,
                    name: group.name
                }
                
                let result = await this.knex('groups').where('cist_id', newGroup.cist_id).first();

                if(!result) {
                    result = await this.knex('groups').insert(newGroup);
                    inserted++;
                }
            }

            if(inserted > 0)
                console.log(`${c.cyan('Groups update:')} Inserted ${inserted} groups.`);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getGroups() {
        try {
            const result = await this.knex('groups').select('cist_id as id', 'name', 'valid_timetable').orderBy('name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateTeachers(teachers) {
        try {
            let inserted = 0;

            for(let i = 0; i < teachers.length; i++) {
                let teacher = teachers[i];
                if(!teacher || typeof teacher != 'object' || !teacher.id) continue;

                let newTeacher = {
                    teacher_id: uuid.v4(),
                    cist_id: teacher.id,
                    short_name: teacher.short_name,
                    full_name: teacher.full_name
                }
                
                let result = await this.knex('teachers').where('cist_id', newTeacher.cist_id).first();

                if(!result) {
                    result = await this.knex('teachers').insert(newTeacher);
                    inserted++;
                }
            }
        
            if(inserted > 0)
                console.log(`${c.cyan('Teachers update:')} Inserted ${inserted} audiences.`);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTeachers() {
        try {
            const result = await this.knex('teachers').select('cist_id as id', 'short_name', 'full_name', 'valid_timetable').orderBy('short_name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateAudiences(audiences) {
        try {
            let inserted = 0;

            for(let i = 0; i < audiences.length; i++) {
                let audience = audiences[i];
                if(!audience || typeof audience != 'object' || !audience.id) continue;

                let newAudience = {
                    audience_id: uuid.v4(),
                    cist_id: audience.id,
                    name: audience.short_name,
                    floor: audience.floor,
                    is_have_power: audience.is_have_power
                }
                
                let result = await this.knex('audiences').where('cist_id', newAudience.cist_id).first();

                if(!result) {
                    result = await this.knex('audiences').insert(newAudience);
                    inserted++;
                }
            }

            if(inserted > 0)
                console.log(`${c.cyan('Audiences update:')} Inserted ${inserted} audiences.`);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getAudiences() {
        try {
            const result = await this.knex('audiences').select('cist_id as id', 'name as short_name', 'floor', 'is_have_power', 'valid_timetable').orderBy('short_name');
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getAudienceNameByCistId(cist_id) {
        try {
            const result = await this.knex('audiences').select('name').where('cist_id', cist_id).first();
            return result.name;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async setGroupValidTimetable(cist_id, valid_timetable) {
        try {
            let result = await this.knex('groups').where('cist_id', cist_id).update('valid_timetable', valid_timetable);
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async setTeacherValidTimetable(cist_id, valid_timetable) {
        try {
            let result = await this.knex('teachers').where('cist_id', cist_id).update('valid_timetable', valid_timetable);
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async setAudienceValidTimetable(cist_id, valid_timetable) {
        try {
            let result = await this.knex('audiences').where('cist_id', cist_id).update('valid_timetable', valid_timetable);
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

module.exports = DB;