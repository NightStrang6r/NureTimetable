const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    cist_id: {
        type: Number,
        unique: true
    },
    name: String
}, { timestamps: true });

const Group = mongoose.model('groups', groupSchema);

module.exports = Group;