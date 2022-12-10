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

    async getTimetable(id, type) {
        try {
            const result = await this.knex('timetable').where('id', id).andWhere('type', type).first();
            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createOrUpdateTimetable(id, typeId, name) {
        try {
            let timetable = {
                timetable_id: uuid.v4(),
                cist_id: id,
                name: name,
                type: typeId,
                request_count: 0,
                update_date: this.knex.fn.now()
            };

            let result = await this.knex('timetables').where('cist_id', id).update(timetable);

            if(result == 0) {
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

    async createOrUpdateGroups(groups) {
        try {
            console.log(groups.length);
            groups.forEach(group => {
                if(typeof group != 'object') {
                    return;
                }

                group.group_id = uuid.v4();
                group.cist_id = group.id;
                delete group.id;
            });

            for(let i = 0; i < groups.length; i++) {
                let group = groups[i];
                let result = await this.knex('groups').where('cist_id', group.cist_id).update(group);

                if(result == 0) {
                    group.creation_date = this.knex.fn.now();
                    result = await this.knex('groups').insert(group);
                }
            }

            return result;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

module.exports = DB;