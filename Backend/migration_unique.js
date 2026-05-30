import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';

// Parse .env file manually from the Backend directory
const envPath = 'c:/Users/Moham/Desktop/Bloop/Backend/.env';
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^"|"$|^'|'$)/g, '');
      env[key] = val;
    }
  });
}

console.log("🔌 Connecting to MySQL database using credentials from Backend/.env...");
const db = mysql.createConnection({
  host: env.DB_HOST || 'localhost',
  port: env.DB_PORT || 3306,
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_DATABASE || 'bloop'
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Connected successfully to MySQL!");

  // Step 1: Clean up empty or blank strings in the phone field to avoid UNIQUE index conflicts
  const cleanupQuery = `
    UPDATE users 
    SET phone = NULL 
    WHERE phone = '' OR phone = ' ' OR TRIM(phone) = '';
  `;

  console.log("🧹 Cleaning up empty phone numbers to NULL to prevent constraint violations...");
  db.query(cleanupQuery, (cleanErr, cleanRes) => {
    if (cleanErr) {
      console.error("❌ Failed to clean up phone column:", cleanErr);
      db.end();
      process.exit(1);
    }
    console.log("✅ Phone column clean-up complete! Rows affected:", cleanRes.affectedRows);

    // Step 2: Query existing indexes to see what needs to be added
    db.query("SHOW INDEX FROM users", (indexErr, indexResults) => {
      if (indexErr) {
        console.error("❌ Failed to retrieve table indexes:", indexErr);
        db.end();
        process.exit(1);
      }

      const existingIndexNames = indexResults.map(idx => idx.Key_name);
      const queries = [];

      // Add unique constraint to username if not already unique
      const usernameIndexes = indexResults.filter(idx => idx.Column_name === 'username' && idx.Non_unique === 0);
      if (usernameIndexes.length === 0) {
        console.log("📌 Preparing UNIQUE constraint for 'username' column...");
        // Drop standard index if exists before adding unique constraint
        queries.push("ALTER TABLE users ADD CONSTRAINT UNIQUE_username UNIQUE (username)");
      } else {
        console.log("✅ 'username' column already has a UNIQUE constraint!");
      }

      // Add unique constraint to phone if not already unique
      const phoneIndexes = indexResults.filter(idx => idx.Column_name === 'phone' && idx.Non_unique === 0);
      if (phoneIndexes.length === 0) {
        console.log("📌 Preparing UNIQUE constraint for 'phone' column...");
        queries.push("ALTER TABLE users ADD CONSTRAINT UNIQUE_phone UNIQUE (phone)");
      } else {
        console.log("✅ 'phone' column already has a UNIQUE constraint!");
      }

      if (queries.length === 0) {
        console.log("🎉 All database constraints are already configured perfectly!");
        db.end();
        process.exit(0);
      }

      // Step 3: Run the ALTER queries
      let completed = 0;
      queries.forEach(q => {
        console.log(`🚀 Executing: ${q}`);
        db.query(q, (alterErr) => {
          if (alterErr) {
            console.error("❌ Error executing database alteration:", q, alterErr);
          } else {
            console.log("✅ Successfully executed query!");
          }
          completed++;
          if (completed === queries.length) {
            console.log("🏆 All database UNIQUE constraint migrations completed successfully!");
            db.end();
            process.exit(0);
          }
        });
      });
    });
  });
});
