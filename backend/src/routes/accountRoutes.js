// ACCOUNT ROUTES - /api/account/...   (every route needs a login: see routes/index.js)

const express = require('express');
const validate = require('../middleware/validate');
const check = require('../validation/accountValidation');
const accountController = require('../controllers/accountController');

const router = express.Router();

router.patch('/', validate(check.checkUpdateName), accountController.updateName);
router.post('/verify-password', validate(check.checkPassword), accountController.verifyPassword);

// Change password (old password + 6-digit email code)
router.post('/password/send-code', accountController.sendChangePasswordCode);
router.post('/password/verify-code', validate(check.checkCodeOnly), accountController.verifyChangePasswordCode);
router.put('/password', validate(check.checkChangePassword), accountController.changePassword);

// Parent PIN
router.get('/pin', accountController.getPinStatus);
router.post('/pin', validate(check.checkCreatePin), accountController.createPin);
router.post('/pin/verify', validate(check.checkVerifyPin), accountController.verifyPin);
router.put('/pin', validate(check.checkChangePin), accountController.changePin);
router.post('/pin/reset', validate(check.checkResetPin), accountController.resetPin);

module.exports = router;
