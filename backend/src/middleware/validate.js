// VALIDATE - runs a check function on the request body BEFORE the controller.
//
//   router.post('/login', validate(checkLogIn), authController.logIn);
//
// A check function (see src/validation/) gets the body and returns a list of problems:
//   []                                  -> everything is fine, go on
//   ['Enter a valid email address.']    -> stop here with status 400
//
// The answer is  { "error": "<first problem>", "details": [ ...all problems ] }
// so the app can show one clear message.

const HttpError = require('../utils/HttpError');

function validate(check) {
  return function validateRequest(req, res, next) {
    const problems = check(req.body || {}, req);
    if (problems.length > 0) {
      return next(new HttpError(400, problems[0], { details: problems }));
    }
    next();
  };
}

module.exports = validate;
