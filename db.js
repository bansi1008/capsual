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
    process.exit(0);
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
})();

module.exports = pool;
