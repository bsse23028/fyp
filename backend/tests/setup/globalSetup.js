// GLOBAL SETUP - runs ONCE before all tests.
//
// It builds a fresh TEST database (kidbuddy_test) from the same files as the real one:
//   database/01_schema.sql  +  database/02_seed.sql  +  database/migrations/*.sql
//
// YOUR REAL DATABASE (kidbuddy) IS NEVER TOUCHED:
//   1. config refuses a test database name that does not end with "_test" or equals DB_NAME
//   2. the "CREATE DATABASE kidbuddy" and "USE kidbuddy" lines are removed from the SQL,
//      and we stop if any such line is still there
//   3. we connect directly to the test database and check SELECT DATABASE() before running SQL

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

process.env.NODE_ENV = 'test';
const config = require('../../src/config');
const { runMigrations } = require('../../database/migrate');

const DATABASE_FOLDER = path.join(__dirname, '..', '..', 'database');

// Removes the lines that would switch to (or create) the real database.
function forTestDatabase(sql, fileName) {
  const cleaned = sql.replace(/CREATE\s+DATABASE[^;]*;/gi, '').replace(/^\s*USE\s+[^;]+;/gim, '');
  if (/CREATE\s+DATABASE/i.test(cleaned) || /^\s*USE\s/im.test(cleaned)) {
    throw new Error(`Safety stop: ${fileName} still contains CREATE DATABASE or USE.`);
  }
  return cleaned;
}

module.exports = async function globalSetup() {
  const testDatabase = config.db.name;
  if (!/^[a-z0-9_]+_test$/.test(testDatabase) || testDatabase === (process.env.DB_NAME || 'kidbuddy')) {
    throw new Error(`Safety stop: refusing to use "${testDatabase}" as the test database.`);
  }

  const settings = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    charset: 'utf8mb4',
    multipleStatements: true,
  };

  // 1. A brand-new, empty test database.
  const server = await mysql.createConnection(settings);
  await server.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
  await server.query(`CREATE DATABASE \`${testDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  // 2. Schema + seed, run INSIDE the test database.
  const connection = await mysql.createConnection({ ...settings, database: testDatabase });
  const [[current]] = await connection.query('SELECT DATABASE() AS name');
  if (current.name !== testDatabase) throw new Error('Safety stop: not connected to the test database.');

  for (const fileName of ['01_schema.sql', '02_seed.sql']) {
    const sql = fs.readFileSync(path.join(DATABASE_FOLDER, fileName), 'utf8');
    await connection.query(forTestDatabase(sql, fileName));
  }
  await connection.end();

  // 3. The additive migrations.
  await runMigrations(testDatabase, () => {});
};
