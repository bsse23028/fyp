// SERVER - starts the API:  npm start   (or  npm run dev  to restart on every file change)
//
// It first checks the database connection, so a stopped XAMPP or a wrong password in .env
// gives a clear message instead of failing on the first request.

const app = require('./app');
const config = require('./config');
const { checkConnection } = require('./db/connection');

async function start() {
  try {
    await checkConnection();
  } catch (error) {
    console.error(`Could not connect to MySQL database "${config.db.name}" on ${config.db.host}:${config.db.port}.`);
    console.error('Is MySQL started in the XAMPP Control Panel? Are DB_USER / DB_PASSWORD in .env right?');
    console.error(`(${error.message})`);
    process.exit(1);
  }

  // 0.0.0.0 = also reachable from a phone on the same Wi-Fi (not only from this computer).
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`KidBuddy API running on http://localhost:${config.port}  (database: ${config.db.name})`);
  });
}

start();
