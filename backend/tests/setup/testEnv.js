// Runs before every test file: switch the backend to TEST mode.
// In test mode config/index.js uses TEST_DB_NAME (kidbuddy_test), never your real database,
// and emails are kept in memory instead of being sent.
process.env.NODE_ENV = 'test';
