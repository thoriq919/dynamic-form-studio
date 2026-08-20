import mysql from 'mysql2/promise';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

async function runSeeder() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const database = process.env.DB_NAME || 'dynamic_form_db';
  const port = Number(process.env.DB_PORT) || 3306;

  console.log(`Connecting to MySQL database "${database}" at ${host}:${port}...`);

  let conn;
  try {
    conn = await mysql.createConnection({ host, user, password, database, port });
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      const rootConn = await mysql.createConnection({ host, user, password, port });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await rootConn.end();
      conn = await mysql.createConnection({ host, user, password, database, port });
    } else {
      throw err;
    }
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'responder',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminHashed = hashPassword('admindf1773');
  const [adminCheck] = await conn.query('SELECT id FROM users WHERE username = ?', ['admin']);
  if (adminCheck.length === 0) {
    await conn.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin', adminHashed, 'Administrator', 'admin']
    );
    console.log('✓ Admin user created: username="admin", password="admindf1773"');
  } else {
    await conn.query('UPDATE users SET password = ?, role = ? WHERE username = ?', [adminHashed, 'admin', 'admin']);
    console.log('✓ Admin user password updated: username="admin", password="admindf1773"');
  }

  console.log('\n--- Admin Seeder Completed Successfully ---');
  await conn.end();
  process.exit(0);
}

runSeeder().catch(err => {
  console.error('Seeder error:', err.message || err);
  process.exit(1);
});
