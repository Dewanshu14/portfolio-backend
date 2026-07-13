// config/db.js — PostgreSQL connection pool (works with Supabase or local Postgres)
const { Pool } = require('pg');
require('dotenv').config();

const isSupabase = (process.env.DB_HOST || '').includes('supabase.co');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // Supabase requires SSL — local Postgres usually doesn't
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log(`✅ PostgreSQL connected${isSupabase ? ' (Supabase)' : ' (local)'}`));
pool.on('error',  (err) => console.error('❌ DB error:', err.message));

module.exports = pool;
