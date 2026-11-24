// OPENAPI - a machine-readable description of the website backend, served at GET /web-api/docs.
// The full request/answer shapes of every forwarded route are in fyp/backend/docs/API.md;
// website/backend/docs/API.md explains what the gateway adds.

const errorRef = { $ref: '#/components/schemas/Error' };
const json = (schema) => ({ 'application/json': { schema } });
const errorResponses = {
  400: { description: 'Validation problem', content: json(errorRef) },
  401: { description: 'Not logged in or the login ended', content: json(errorRef) },
  403: { description: 'CSRF check failed, or not allowed', content: json(errorRef) },
  429: { description: 'Too many requests', content: json(errorRef) },
  502: { description: 'The shared KidBuddy API cannot be reached', content: json(errorRef) },
};
const csrfHeader = { name: 'X-CSRF-Token', in: 'header', required: true, schema: { type: 'string' } };

function forwarded(summary, method = 'get', needsLogin = true) {
  return {
    [method]: {
      summary,
      description: `Forwarded to the shared KidBuddy API.${needsLogin ? ' Needs the kb_session cookie.' : ''}`,
      parameters: method === 'get' ? [] : [csrfHeader],
      responses: { 200: { description: 'See fyp/backend/docs/API.md' }, ...errorResponses },
    },
  };
}

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'KidBuddy website backend',
    version: '1.0.0',
    description:
      'Web gateway in front of the shared KidBuddy API. The login is kept in an httpOnly cookie (kb_session); ' +
      'every POST/PUT/PATCH/DELETE must send the X-CSRF-Token header with the value of the kb_csrf cookie ' +
      '(get one from GET /web-api/csrf).',
  },
  servers: [{ url: '/' }],
  components: {
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' }, details: { type: 'array', items: { type: 'string' } } } },
      User: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
      LoginAnswer: {
        type: 'object',
        properties: { user: { $ref: '#/components/schemas/User' }, hasPin: { type: 'boolean' } },
      },
    },
    securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: 'kb_session' } },
  },
  paths: {
    '/web-api/health': { get: { summary: 'Gateway + shared API health', responses: { 200: { description: 'ok' }, 503: { description: 'API down' } } } },
    '/web-api/csrf': { get: { summary: 'Get a CSRF token (also sets the kb_csrf cookie)', responses: { 200: { description: '{ csrfToken }' } } } },
    '/api/auth/login': {
      post: {
        summary: 'Log in. Sets the kb_session cookie; the token is never returned.',
        parameters: [csrfHeader],
        requestBody: { content: json({ type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } }) },
        responses: { 200: { description: 'Logged in', content: json({ $ref: '#/components/schemas/LoginAnswer' }) }, ...errorResponses },
      },
    },
    '/api/auth/verify-email': {
      post: {
        summary: 'Sign-up step 2. Sets the kb_session cookie.',
        parameters: [csrfHeader],
        requestBody: { content: json({ type: 'object', required: ['email', 'code'], properties: { email: { type: 'string' }, code: { type: 'string' } } }) },
        responses: { 200: { description: 'Verified and logged in', content: json({ $ref: '#/components/schemas/LoginAnswer' }) }, ...errorResponses },
      },
    },
    '/api/auth/logout': { post: { summary: 'Ends the login on the API and deletes the cookie', parameters: [csrfHeader], responses: { 204: { description: 'Logged out' } } } },
    '/api/auth/me': { get: { summary: 'Who is logged in', responses: { 200: { description: '{ user, hasPin }' }, ...errorResponses } } },
    '/api/auth/verify-reset-code': {
      post: { summary: 'Checks the reset code; keeps the reset token in an httpOnly cookie', parameters: [csrfHeader], responses: { 200: { description: '{ verified: true }' }, ...errorResponses } },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Sets the new password using the reset cookie',
        parameters: [csrfHeader],
        requestBody: { content: json({ type: 'object', required: ['newPassword'], properties: { newPassword: { type: 'string' } } }) },
        responses: { 200: { description: 'Password changed' }, ...errorResponses },
      },
    },
    '/api/auth/signup': forwarded('Sign-up step 1 (emails a code)', 'post', false),
    '/api/auth/resend-code': forwarded('Resend a code', 'post', false),
    '/api/auth/forgot-password': forwarded('Email a password-reset code', 'post', false),
    '/api/account': forwarded('Change the parent name', 'patch'),
    '/api/account/verify-password': forwarded('Check the account password', 'post'),
    '/api/account/password/send-code': forwarded('Email a change-password code', 'post'),
    '/api/account/password/verify-code': forwarded('Check the change-password code', 'post'),
    '/api/account/password': forwarded('Change the password', 'put'),
    '/api/account/pin': { ...forwarded('Does a Parent PIN exist?'), ...forwarded('Create the first PIN', 'post'), ...forwarded('Change the PIN', 'put') },
    '/api/account/pin/verify': forwarded('Check the PIN (leave Child Mode)', 'post'),
    '/api/account/pin/reset': forwarded('Forgot PIN: password + new PIN', 'post'),
    '/api/children': { ...forwarded('List child profiles'), ...forwarded('Create a child profile', 'post') },
    '/api/children/{childId}': { ...forwarded('One child'), ...forwarded('Update a child', 'patch'), ...forwarded('Delete a child', 'delete') },
    '/api/children/{childId}/select': forwarded('Enter Child Mode with this child', 'post'),
    '/api/children/{childId}/sessions': forwarded('Save a Read-Along session', 'post'),
    '/api/children/{childId}/progress': forwarded('Reading progress'),
    '/api/children/{childId}/struggle-words': { ...forwarded('Struggle words'), ...forwarded('Report a struggle word', 'post') },
    '/api/children/{childId}/topics': forwarded('Save a custom reading topic', 'post'),
    '/api/reading/topics': forwarded('Read-Along topics (optionally ?childId=)'),
    '/api/options': forwarded('All choice lists for the forms', 'get', false),
  },
};
