// HTTP ERROR - an Error that also knows which HTTP status code to send.
//
//   throw new HttpError(404, 'Child profile not found.');
//
// The error handler (middleware/errorHandler.js) turns it into:
//   status 404,  { "error": "Child profile not found." }
//
// Common codes used in this API:
//   400 Bad Request   - the data sent is wrong (missing field, wrong code ...)
//   401 Unauthorized  - not logged in, or the login token expired
//   403 Forbidden     - logged in / known, but not allowed (e.g. email not verified yet)
//   404 Not Found     - it does not exist (or it belongs to another parent)
//   409 Conflict      - it already exists (e.g. email already registered)
//   429 Too Many      - too many tries, wait a little
//   502 Bad Gateway   - the email server did not accept the email

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra; // optional object added to the JSON answer, e.g. { details: [...] }
  }
}

module.exports = HttpError;
