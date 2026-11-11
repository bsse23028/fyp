// AUTH ROUTES - /api/auth/...
// Each line:  METHOD  path,  [checks],  controller function

const express = require('express');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const check = require('../validation/authValidation');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', validate(check.checkSignUp), authController.signUp);
router.post('/verify-email', validate(check.checkVerifyEmail), authController.verifyEmail);
router.post('/resend-code', validate(check.checkResendCode), authController.resendCode);
router.post('/login', validate(check.checkLogIn), authController.logIn);
router.post('/logout', requireAuth, authController.logOut);
router.get('/me', requireAuth, authController.getMe);
router.post('/forgot-password', validate(check.checkForgotPassword), authController.forgotPassword);
router.post('/verify-reset-code', validate(check.checkVerifyResetCode), authController.verifyResetCode);
router.post('/reset-password', validate(check.checkResetPassword), authController.resetPassword);

module.exports = router;
