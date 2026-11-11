// ERROR HANDLER - the LAST middleware. Every error thrown in a route ends up here
// and becomes a JSON answer:  { "error": "a message the app can show" }
//
// Express 5 also catches errors thrown inside `async` functions, so controllers can
// simply `throw new HttpError(...)` - no try/catch needed.

const HttpError = require('../utils/HttpError');

// A URL that does not exist -> 404.
function notFound(req, res, next) {
  next(new HttpError(404, `There is no ${req.method} ${req.originalUrl} endpoint.`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  // Errors we threw on purpose.
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, ...(error.extra || {}) });
  }

  // The body is not valid JSON (express.json() could not read it).
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body is not valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request body is too large.' });
  }

  // Anything else is a bug or a database problem. Log it for the developer, but never
  // send the details (SQL, stack trace ...) to the app.
  console.error(error);
  return res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
}

module.exports = { notFound, errorHandler };
