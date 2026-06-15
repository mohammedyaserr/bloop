import mysql from 'mysql2';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ override: true });

console.log("🔌 Connecting to MySQL database...");
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'bloop',
  ssl: {
    rejectUnauthorized: false
  }
});

db.query("DESCRIBE users", (err, result) => {
  if (err) {
    console.error("❌ Error describing users table:", err);
    process.exit(1);
  }
  console.log("📋 Current Users Schema Columns:", result.map(col => col.Field));
  
  const columns = result.map(col => col.Field);
  const queries = [];
  
  if (!columns.includes('bio')) queries.push("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL");
  if (!columns.includes('phone')) queries.push("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL");
  if (!columns.includes('location')) queries.push("ALTER TABLE users ADD COLUMN location VARCHAR(100) DEFAULT NULL");
  if (!columns.includes('website')) queries.push("ALTER TABLE users ADD COLUMN website VARCHAR(150) DEFAULT NULL");
  if (!columns.includes('avatar')) queries.push("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL");
  if (!columns.includes('avatarColor')) queries.push("ALTER TABLE users ADD COLUMN avatarColor VARCHAR(50) DEFAULT NULL");
  if (!columns.includes('statusMessage')) queries.push("ALTER TABLE users ADD COLUMN statusMessage VARCHAR(255) DEFAULT NULL");
  if (!columns.includes('joinedAt')) queries.push("ALTER TABLE users ADD COLUMN joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  
  if (queries.length === 0) {
    console.log("✅ All columns already exist in the database users table!");
    process.exit(0);
  }
  
  console.log(`🚀 Executing ${queries.length} database migrations...`);
  
  let completed = 0;
  queries.forEach(q => {
    db.query(q, (alterErr) => {
      if (alterErr) {
        console.error("❌ Error executing migration:", q, alterErr);
      } else {
        console.log("✅ Executed migration query successfully:", q);
      }
      completed++;
      if (completed === queries.length) {
        console.log("🏆 All database migrations completed successfully!");
        process.exit(0);
      }
    });
  });
});
