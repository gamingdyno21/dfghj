require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'carbon_credit_db';

let pool;

async function ensureDatabase() {
  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  } finally {
    if (conn) { try { await conn.end(); } catch (_) {} }
  }
  let connDb;
  try {
    connDb = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
    const [tables] = await connDb.query('SHOW TABLES');
    if (!tables || tables.length === 0) {
      const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
      const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');
      const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : '';
      const seedSql = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf8') : '';
      if (schemaSql) { await connDb.query(schemaSql); }
      if (seedSql) { await connDb.query(seedSql); }
    }
    const [ccCols] = await connDb.query("SHOW COLUMNS FROM CarbonCredit LIKE 'credit_id'");
    if (ccCols && ccCols[0] && ccCols[0].Extra !== 'auto_increment') {
      await connDb.query('ALTER TABLE CarbonCredit MODIFY credit_id INT NOT NULL AUTO_INCREMENT');
    }
    const [tCols] = await connDb.query("SHOW COLUMNS FROM `Transaction` LIKE 'transaction_id'");
    if (tCols && tCols[0] && tCols[0].Extra !== 'auto_increment') {
      await connDb.query('ALTER TABLE `Transaction` MODIFY transaction_id INT NOT NULL AUTO_INCREMENT');
    }

    await connDb.query(`
      CREATE TABLE IF NOT EXISTS ManualReport (
        report_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        remaining_credits DECIMAL(10,2) NOT NULL,
        credits_bought DECIMAL(10,2) NOT NULL,
        penalty_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES Company(company_id)
      ) ENGINE=InnoDB
    `);

    
  } finally {
    if (connDb) { try { await connDb.end(); } catch (_) {} }
  }
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
  }
  return pool;
}

module.exports = { ensureDatabase, getPool };
