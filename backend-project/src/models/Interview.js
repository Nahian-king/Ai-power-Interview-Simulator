const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    nextQuestion: { type: String }, 
    score: { type: Number, default: 0 },
    feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);