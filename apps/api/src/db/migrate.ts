import pg from 'pg';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'price_tracker',
  user: process.env.DB_USER || 'price_tracker',
  password: process.env.DB_PASSWORD || 'price_tracker',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Read and apply init migration
    const initSql = readFileSync(
      join(__dirname, '..', '..', 'db', 'migrations', '001_init.sql'),
      'utf-8',
    );

    const applied = await client.query(
      `SELECT name FROM migrations WHERE name = $1`,
      ['001_init'],
    );

    if (applied.rows.length === 0) {
      await client.query(initSql);
      await client.query(`INSERT INTO migrations (name) VALUES ($1)`, ['001_init']);
      console.log('Applied migration: 001_init');
    } else {
      console.log('Migration 001_init already applied, skipping.');
    }

    console.log('Migrations complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
