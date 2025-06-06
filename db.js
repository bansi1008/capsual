// db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected at:", res.rows[0].now);
  } catch (err) {
    console.error("Connection error:", err);
  }
})();

module.exports = pool;
