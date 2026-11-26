// HTTP ERROR - an Error that also carries the HTTP status and (optionally) extra fields
// for the JSON answer. Throw it anywhere; middleware/errorHandler.js turns it into
//   { "error": "message", ...extra }   with the right status.

class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

module.exports = HttpError;
