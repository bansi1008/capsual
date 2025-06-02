const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const sendEmail = require("../utils/sendEmail");

const genratecapsual = async (req, res) => {
  const { user_id, recipient_email, message, send_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO capsules (user_id, recipient_email, message, send_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, recipient_email, message, send_date]
    );
    await sendEmail({
      to: recipient_email,
      subject: "You have a new Time Capsule message!",
      text: `Hi! You have received a time capsule message:\n\n"${message}"\n\nIt will be delivered on ${send_date}.`,
      html: `<p>Hi! You have received a time capsule message:</p>
             <blockquote>${message}</blockquote>
             <p>It will be delivered on <strong>${send_date}</strong>.</p>`,
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating capsual" });
  }
};

module.exports = {
  genratecapsual,
};
