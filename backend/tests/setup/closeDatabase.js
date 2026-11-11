// After each test file: close its database connections so Jest can exit cleanly.
const { closeDatabase } = require('../../src/db/connection');

afterAll(async () => {
  await closeDatabase();
});
