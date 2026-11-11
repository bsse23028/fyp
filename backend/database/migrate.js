// MIGRATE - runs the new .sql files in database/migrations, once each.
//
//   npm run migrate
//
// It remembers what already ran in a small table `schema_migrations`, so running it twice
// is safe. Migrations only ADD things; they never delete your data.
// (01_schema.sql and 02_seed.sql are NOT run here: they were already imported in phpMyAdmin.)

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

const MIGRATIONS_FOLDER = path.join(__dirname, 'migrations');

async function runMigrations(databaseName, log = console.log) {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: databaseName,
    charset: 'utf8mb4',
    multipleStatements: true, // a migration file may contain several statements
  });

  try {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name       VARCHAR(190) NOT NULL PRIMARY KEY,
         applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
       ) ENGINE=InnoDB`
    );
    const [doneRows] = await connection.query('SELECT name FROM schema_migrations');
    const done = new Set(doneRows.map((row) => row.name));

    const files = fs.readdirSync(MIGRATIONS_FOLDER).filter((file) => file.endsWith('.sql')).sort();
    let count = 0;
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_FOLDER, file), 'utf8');
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      log(`  applied ${file}`);
      count++;
    }
    log(count === 0 ? `Database "${databaseName}" is already up to date.` : `Done: ${count} migration(s) applied to "${databaseName}".`);
  } finally {
    await connection.end();
  }
}

// `npm run migrate` -> the database from .env (DB_NAME)
if (require.main === module) {
  console.log(`Migrating database "${config.db.name}" ...`);
  runMigrations(config.db.name).catch((error) => {
    console.error('Migration failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runMigrations };
