// ERROR HANDLER - turns every problem into the SAME JSON shape the shared API uses:
//   { "error": "A message you can show to the parent.", ...extra }
// Unknown errors become a 500 with a general message (the details only go to the server log).

const config = require('../config');

function notFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That is too much data to send at once.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The data sent was not valid JSON.' });
  }
  if (error.status && error.status < 500) {
    return res.status(error.status).json({ error: error.message, ...(error.extra || {}) });
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  if (!config.isTest) console.error('[gateway] unexpected error:', error);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
}

module.exports = { notFound, errorHandler };
