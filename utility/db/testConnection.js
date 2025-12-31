import pool from './index.js';

export async function testDbConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}
