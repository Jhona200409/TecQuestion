const mongoose = require('mongoose');

const classroomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    accessCode: {
        type: String,
        required: true,
        unique: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId, // Now storing references to User documents
        ref: 'User'
    }]
}, {
    timestamps: true
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
