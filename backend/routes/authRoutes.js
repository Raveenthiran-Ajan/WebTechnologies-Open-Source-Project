const express = require('express');
const router = express.Router();
const { 
    forgotPassword, resetPassword 
} = require('../controllers/auth-controller.js');

// Password Reset Routes
router.post('/Admin/forgot-password', forgotPassword);
router.put('/Admin/reset-password/:token', resetPassword);

router.post('/Student/forgot-password', forgotPassword);
router.put('/Student/reset-password/:token', resetPassword);

router.post('/Teacher/forgot-password', forgotPassword);
router.put('/Teacher/reset-password/:token', resetPassword);

module.exports = router;
