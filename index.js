// index.js
require("dotenv").config();
const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // for parsing JSON request bodies

app.get("/data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM data");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/data", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const existinguser = await pool.query("SELECT * FROM data WHERE email = $1", [
    email,
  ]);
  if (existinguser.rows.length > 0) {
    return res.status(400).json({ error: "Email already exists" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO data (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
