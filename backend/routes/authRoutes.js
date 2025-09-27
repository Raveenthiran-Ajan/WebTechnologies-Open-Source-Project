const express = require('express');
const router = express.Router();
const { 
    forgotPassword, resetPassword 
} = require('../controllers/auth-controller.js');

// Password Reset Routes
router.post('/Admin/forgot-password', forgotPassword);
router.put('/Admin/reset-password/:token', (req, res, next) => {
    req.userRole = 'Admin';
    resetPassword(req, res, next);
});

router.post('/Student/forgot-password', forgotPassword);
router.put('/Student/reset-password/:token', (req, res, next) => {
    req.userRole = 'Student';
    resetPassword(req, res, next);
});

router.post('/Teacher/forgot-password', forgotPassword);
router.put('/Teacher/reset-password/:token', (req, res, next) => {
    req.userRole = 'Teacher';
    resetPassword(req, res, next);
});

module.exports = router;
