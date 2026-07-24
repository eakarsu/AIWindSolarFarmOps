'use strict';

const fs = require('node:fs');
const path = require('node:path');
const pool = require('../config/database');

async function main() {
  const directory = path.join(__dirname, '..', 'migrations');
  const migrations = fs.readdirSync(directory).filter((name) => name.endsWith('.sql')).sort();
  for (const name of migrations) {
    await pool.query(fs.readFileSync(path.join(directory, name), 'utf8'));
    console.log(`Reconciled ${name}`);
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
