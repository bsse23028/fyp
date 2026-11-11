// DATABASE CONNECTION - one shared "pool" of MySQL connections.
//
// Use it like this in a service:
//   const { query } = require('../db/connection');
//   const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
//
// ALWAYS put values in the [ ] list and a ? in the SQL. mysql2 escapes them for you, so a
// value can never change the SQL itself (this is what stops "SQL injection").
//
// Several queries that must ALL succeed (or all be undone) go in a transaction:
//   await withTransaction(async (run) => {
//     await run('INSERT ...', [...]);
//     await run('UPDATE ...', [...]);
//   });

const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  charset: 'utf8mb4', // needed for Urdu text and emoji
  timezone: 'Z', // JavaScript dates <-> UTC in the database
  dateStrings: ['DATE'], // DATE columns come back as '2026-10-12', not as a Date object
  waitForConnections: true,
  connectionLimit: 10,
});

// Every new connection works in UTC, so CURRENT_TIMESTAMP and UTC_TIMESTAMP() agree.
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

// Runs one SQL statement and returns the rows (or the result of an INSERT / UPDATE).
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Runs `work(run)` inside a transaction. `run` works exactly like `query` above.
// If anything throws, every change is undone (ROLLBACK).
async function withTransaction(work) {
  const connection = await pool.getConnection();
  const run = async (sql, params = []) => {
    const [rows] = await connection.query(sql, params);
    return rows;
  };
  try {
    await connection.beginTransaction();
    const result = await work(run);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Used by server.js at start-up, so a wrong password / stopped XAMPP is reported clearly.
async function checkConnection() {
  await query('SELECT 1');
}

// Closes every connection (used when the tests finish).
async function closeDatabase() {
  await pool.end();
}

module.exports = { query, withTransaction, checkConnection, closeDatabase };
