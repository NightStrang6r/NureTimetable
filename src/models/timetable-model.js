const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timetableSchema = new Schema({
    cist_id: {
        type: String,
        unique: true
    },
    name: String,
    type: Number,
    request_count: Number,
    data: Object
}, { timestamps: true });

const Timetable = mongoose.model('timetables', timetableSchema);

module.exports = Timetable;