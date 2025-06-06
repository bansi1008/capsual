const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const sendEmail = require("../utils/sendEmail");

const genratecapsual = async (req, res) => {
  const { id, recipient_email, message, send_date, sent } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO capsules (id, recipient_email, message, send_date,sent)
       VALUES ($1, $2, $3, $4,$5) RETURNING *`,
      [id, recipient_email, message, send_date, sent]
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

const sendPendingCapsules = async (req, res) => {
  try {
    const capsules = await pool.query(
      `SELECT * FROM capsules WHERE send_date <= NOW() AND sent = false`
    );

    if (capsules.rows.length === 0) {
      return res.status(200).json({ message: "No capsules to send" });
    }

    for (const capsule of capsules.rows) {
      await sendEmail({
        to: capsule.recipient_email,
        subject: "You have a new Time Capsule message!",
        text: `Hi! You have received a time capsule message:\n\n"${capsule.message}"\n\nIt was scheduled for delivery on ${capsule.send_date}.`,
        html: `<p>Hi! You have received a time capsule message:</p>
                <blockquote>${capsule.message}</blockquote>
                <p>It was scheduled for delivery on <strong>${capsule.send_date}</strong>.</p>`,
      });

      await pool.query(`UPDATE capsules SET sent = true WHERE id = $1`, [
        capsule.id,
      ]);
    }

    res.status(200).json({
      message: "Capsules sent successfully",
      count: capsules.rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending pending capsules" });
  }
};

// const sendPendingCapsules = async () => {
//   try {
//     const now = new Date();

//     const result = await pool.query(
//       `SELECT * FROM capsules WHERE send_date <= $1 AND sent = false`,
//       [now]
//     );

//     for (const capsule of result.rows) {
//       await sendEmail({
//         to: capsule.recipient_email,
//         subject: "You have a new Time Capsule message!",
//         text: `Hi! You have received a time capsule message:\n\n"${capsule.message}"\n\nSent on ${capsule.send_date}.`,
//         html: `<p>Hi! You have received a time capsule message:</p>
//                <blockquote>${capsule.message}</blockquote>
//                <p>Sent on <strong>${capsule.send_date}</strong>.</p>`,
//       });

//       await pool.query(`UPDATE capsules SET sent = true WHERE id = $1`, [
//         capsule.id,
//       ]);
//     }

//     console.log("Pending capsules processed at", now);
//   } catch (error) {
//     console.error("Error sending pending capsules:", error);
//   }
// };

// cron.schedule("* * * * *", () => {
//   console.log("Running cron job to send pending capsules...");
//   sendPendingCapsules();
// });

module.exports = {
  genratecapsual,
  sendPendingCapsules,
};
