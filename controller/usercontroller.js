const express = require("express");
const pool = require("../db.js");
const app = express();
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const signup = async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }
  try {
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const hashedPassword = await bycrypt.hash(password, 12);
    if (!hashedPassword) {
      return res.status(500).json({ error: "Password hashing failed" });
    }

    const result = await pool.query(
      'INSERT INTO "user" (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [name, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "sign up error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bycrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login error" });
  }
};

module.exports = { signup, login };
