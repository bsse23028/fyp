// ROUTES - every URL of the API starts with /api and is listed here.
//
//   /api/auth      sign up, log in, forgot password       (mostly public)
//   /api/account   name, password, Parent PIN             (login needed)
//   /api/children  child profiles + progress              (login needed)
//   /api/reading   Read-Along topics                      (login needed)
//   /api/options   the choice lists for the forms         (public)

const express = require('express');
const requireAuth = require('../middleware/auth');
const { getTopics } = require('../controllers/readingController');
const { getOptions } = require('../controllers/optionsController');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/account', requireAuth, require('./accountRoutes'));
router.use('/children', requireAuth, require('./childRoutes'));
router.get('/reading/topics', requireAuth, getTopics);
router.get('/options', getOptions);

module.exports = router;
