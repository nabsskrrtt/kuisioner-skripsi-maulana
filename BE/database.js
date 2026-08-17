const { Pool } = require('pg');
const pg = require('pg');
require('dotenv').config();

// Cast PostgreSQL types so they match SQLite behavior in JS
pg.types.setTypeParser(20, (val) => parseInt(val, 10));   // bigint (used by COUNT) -> number
pg.types.setTypeParser(1700, (val) => parseFloat(val));  // numeric (used by AVG) -> number

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('Warning: DATABASE_URL environment variable is missing.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon cloud database connection
  }
});

// Automatically verify and initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        parent_name TEXT NOT NULL,
        parent_student_name TEXT NOT NULL,
        parent_signature TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_signature TEXT NOT NULL,
        gender INTEGER NOT NULL,
        age INTEGER NOT NULL,
        school TEXT NOT NULL,
        is_transfer INTEGER NOT NULL,
        transfer_duration DOUBLE PRECISION,
        class_grade INTEGER NOT NULL,
        has_back_pain INTEGER,
        pain_duration INTEGER,
        cause_cedera INTEGER DEFAULT 0,
        cause_duduk_lama INTEGER DEFAULT 0,
        cause_skoliosis INTEGER DEFAULT 0,
        cause_tumor INTEGER DEFAULT 0,
        cause_dokter INTEGER DEFAULT 0,
        cause_dokter_detail TEXT,
        cause_lainnya INTEGER DEFAULT 0,
        cause_lainnya_detail TEXT,
        area_cervical INTEGER DEFAULT 0,
        area_thoracal INTEGER DEFAULT 0,
        area_lumbal INTEGER DEFAULT 0,
        action_obat_bebas INTEGER DEFAULT 0,
        action_dr_tanpa_obat INTEGER DEFAULT 0,
        action_dr_dengan_obat INTEGER DEFAULT 0,
        action_pijat INTEGER DEFAULT 0,
        action_chiro INTEGER DEFAULT 0,
        action_operasi INTEGER DEFAULT 0,
        action_lainnya INTEGER DEFAULT 0,
        action_lainnya_detail TEXT,
        pain_severity INTEGER,
        pain_severity_cat INTEGER,
        is_eligible INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables verified/created successfully in Postgres (Neon).');
  } catch (err) {
    console.error('Error creating database table in Postgres:', err.message);
  }
}

// Call initialization
initializeDatabase();

// SQLite Query Parameters Translation Helper (? -> $1, $2, ...)
function convertSql(sql) {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
}

const dbRun = async (sql, params = []) => {
  const converted = convertSql(sql);
  return await pool.query(converted, params);
};

const dbAll = async (sql, params = []) => {
  const converted = convertSql(sql);
  const result = await pool.query(converted, params);
  return result.rows;
};

const dbGet = async (sql, params = []) => {
  const converted = convertSql(sql);
  const result = await pool.query(converted, params);
  return result.rows[0];
};

module.exports = {
  pool,
  dbRun,
  dbAll,
  dbGet
};
