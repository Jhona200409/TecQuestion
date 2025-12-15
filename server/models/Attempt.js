const mongoose = require('mongoose');

const attemptSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOptionText: String,
        isCorrect: Boolean,
        pointsAwarded: Number
    }]
}, {
    timestamps: true
});

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
