// OPTIONS CONTROLLER - the choice lists for the app's forms.

const optionsService = require('../services/optionsService');

async function getOptions(req, res) {
  res.status(200).json(await optionsService.getOptions());
}

module.exports = { getOptions };
