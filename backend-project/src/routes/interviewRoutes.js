const express = require('express');
const router = express.Router();

const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware, interviewController.startInterview);

router.post('/submit-answer', authMiddleware, interviewController.submitAnswer);

router.get('/history', authMiddleware, interviewController.getHistory);

module.exports = router;