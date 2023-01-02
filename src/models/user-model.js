const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    is_admin: String
}, { timestamps: true });

const User = mongoose.model('users', userSchema);

module.exports = User;