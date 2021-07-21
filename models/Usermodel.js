require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required:true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    image: {
        type: Buffer,
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task',
    }]
}, { timestamps: true });

const User = model('User', userSchema);
module.exports = User;