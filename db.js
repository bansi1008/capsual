// db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true, // Enforce certificate verification
    ca: process.env.DB_CA_CERT,
  },
});

// Test the connection without exiting the process
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected at:", res.rows[0].now);
  } catch (err) {
    console.error("Connection error:", err);
    // Don't exit the process, just log the error
  }
})();

module.exports = pool;
