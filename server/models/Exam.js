const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['multiple-choice'],
        default: 'multiple-choice'
    },
    points: {
        type: Number,
        default: 10
    },
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false }
    }]
});

const examSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    questions: [questionSchema],
    settings: {
        accessCode: {
            type: String // Optional: Specific access code for this exam
        },
        timeLimitPerQuestion: {
            type: Number,
            default: 30
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
