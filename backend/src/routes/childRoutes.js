// CHILD ROUTES - /api/children/...   (every route needs a login: see routes/index.js)
// requireOwnChild stops a parent from reaching another parent's child (404).

const express = require('express');
const validate = require('../middleware/validate');
const requireOwnChild = require('../middleware/childAccess');
const { checkCreateChild, checkUpdateChild } = require('../validation/childValidation');
const { checkReadingSession, checkStruggleWord } = require('../validation/progressValidation');
const { checkCustomTopic } = require('../validation/readingValidation');
const childController = require('../controllers/childController');

const router = express.Router();

// Profiles
router.get('/', childController.listChildren);
router.post('/', validate(checkCreateChild), childController.createChild);
router.get('/:childId', requireOwnChild, childController.getChild);
router.patch('/:childId', requireOwnChild, validate(checkUpdateChild), childController.updateChild);
router.delete('/:childId', requireOwnChild, childController.deleteChild);

// Child Mode ("Continue as Zara")
router.post('/:childId/select', requireOwnChild, childController.selectChild);

// Progress
router.get('/:childId/progress', requireOwnChild, childController.getProgress);
router.post('/:childId/sessions', requireOwnChild, validate(checkReadingSession), childController.recordReadingSession);

// Struggle words
router.get('/:childId/struggle-words', requireOwnChild, childController.listStruggleWords);
router.post('/:childId/struggle-words', requireOwnChild, validate(checkStruggleWord), childController.addStruggleWord);

// Custom (personalised) reading topics
router.post('/:childId/topics', requireOwnChild, validate(checkCustomTopic), childController.createCustomTopic);

module.exports = router;
