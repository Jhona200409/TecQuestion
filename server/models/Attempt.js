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
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    },
    lastQuestionIndex: {
        type: Number,
        default: 0
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
