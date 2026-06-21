const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const interviewController = require('../controllers/interviewController');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/profile', authMiddleware, (req, res) => {
    res.json({ 
        message: "Welcome to your private profile!", 
        user: req.user 
    });
});

router.post('/interview/start', authMiddleware, authController.startInterview);
router.post('/interview/answer', authMiddleware, authController.submitAnswer);
router.get('/history', authMiddleware, interviewController.getHistory);
router.post('/submit-answer', authMiddleware, interviewController.submitAnswer);

module.exports = router;