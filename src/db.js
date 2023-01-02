const mongoose = require('mongoose');
const User = require('./models/user-model.js');
const Group = require('./models/group-model.js');

class DB {
    constructor() {
        this.connectionString = global.storage.config.db;
    }

    async connect() {
        try {
            mongoose.set("strictQuery", false);
            await mongoose.connect(this.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Connected to DB');
        } catch (err) {
            console.log('Error connecting to DB');
        }
    }

    async createOrUpdateUser(user) {
        try {
            let query = {
                    email: user.email
                },
                update = { 
                    name: user.name,
                    surname: user.surname
                },
                options = { upsert: true, new: true, setDefaultsOnInsert: true };

            await User.findOneAndUpdate(query, update, options);
            return true;
        } catch (err) {
            console.log(`Error in createOrUpdateUser: ${err}`);
        }
    }

    async createOrUpdateGroups(groups) {
        try {
            for(let i = 0; i < groups.length; i++) {
                let query = {
                        cist_id: groups[i].cist_id
                    },
                    update = {
                        name: groups[i].name
                    },
                    options = { upsert: true, new: true, setDefaultsOnInsert: true };

                const res = await Group.findOneAndUpdate(query, update, options);
                console.log(res);
            }
            
            return true;
        } catch (err) {
            console.log(`Error in createOrUpdateGroups: ${err}`);
        }
    }
}

module.exports = DB;