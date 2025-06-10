const express = require("express");
const pool = require("../db.js");
const app = express();
const cron = require("node-cron");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genratecapsual = async (req, res) => {
  const { recipientEmail, subject, message, sendAt, sendMethod } = req.body;

  const userId = req.user.id;
  try {
    const newCapsule = await pool.query(
      `INSERT INTO capsules ("userId", "recipientEmail", subject, message, "sendAt", "sendMethod") 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, recipientEmail, subject, message, sendAt, sendMethod]
    );

    res.status(201).json(newCapsule.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating capsual" });
  }
};

const getCapsules = async (req, res) => {
  try {
    const userId = req.user.id;

    const userCapsules = await pool.query(
      'SELECT * FROM capsules WHERE "userId" = $1 ORDER BY "sendAt" ASC',
      [userId]
    );

    res.status(200).json(userCapsules.rows);
  } catch (error) {
    console.error("GET CAPSULES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch capsules" });
  }
};

const sendPendingCapsules = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM "capsules" WHERE "sendAt" <= NOW() AND "status" = 'scheduled'`
    );
    const dueCapsules = result.rows;

    // This log is helpful for knowing the scheduler ran.
    if (dueCapsules.length === 0) {
      console.log("Scheduler ran: No capsules to send right now.");
      return;
    }

    console.log(`Scheduler found ${dueCapsules.length} capsule(s) to process.`);

    // 2. Loop through each capsule
    for (const capsule of dueCapsules) {
      // 3. Use a try...catch block FOR EACH capsule
      try {
        // A. Send the email using the CORRECT camelCase property names
        await sendEmail({
          to: capsule.recipientEmail,
          subject: "You have a new Time Capsule message!",
          html: `<p>Hi! You have received a time capsule message:</p>
                 <blockquote>${capsule.message}</blockquote>
                 <p>This message was scheduled for <strong>${new Date(
                   capsule.sendAt
                 ).toLocaleString()}</strong>.</p>`,
        });

        // B. If sending was successful, update the status to 'sent'
        await pool.query(
          `UPDATE "capsules" SET "status" = 'sent' WHERE "id" = $1`,
          [capsule.id]
        );
        console.log(`Successfully sent capsule ID: ${capsule.id}`);
      } catch (emailError) {
        // C. If an error occurred for THIS capsule, mark it as 'failed'
        console.error(`Error processing capsule ID ${capsule.id}:`, emailError);
        await pool.query(
          `UPDATE "capsules" SET "status" = 'failed' WHERE "id" = $1`,
          [capsule.id]
        );
      }
    }
  } catch (dbError) {
    console.error("A database error occurred in sendPendingCapsules:", dbError);
  }
};

// CORRECTED CRON JOB: Use FIVE asterisks to run every minute.
cron.schedule("* * * * *", () => {
  console.log("-----------------------------------------");
  console.log("Running cron job to send pending capsules...");
  sendPendingCapsules();
});
//const { occasion, relationship, tone, age, gender, interests } = req.body;
const generateMessage = async (req, res) => {
  try {
    const { occasion, relationship, tone, age, gender, interests } = req.body;
    // const userName = req.user.name || "the sender";

    if (!occasion || !relationship) {
      return res
        .status(400)
        .json({ message: "Occasion and relationship are required." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are a creative writing assistant. Your task is to write a personal whatsapp message from the perspective of a user named is bansi".

      Here are the details for the message:
      - Occasion: "${occasion}"
      - Recipient is the user's: "${relationship}"
      - Desired Tone: "${tone || "thoughtful"}"
      - The recipient is turning ${age || "an unspecified"} years old.
      - Their interests include: "${interests || "various things"}".

      IMPORTANT: Your entire response must be ONLY the plain text for whatsapp of the message itself, written from bansi's point of view. Do not include any other words, explanations, or formatting never ever add backslash nlike this (/n or \n) in you resposne and not a singlr breacket should in response plain onlt text with little bit emoji.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();
    generatedText = generatedText
      .replace(/\[.*?\]/g, "") // Removes any text inside square brackets
      .replace(/\n/g, " ") // Replaces newline characters with a space
      .replace(/\\n/g, " ") // Replaces escaped newline characters with a space
      .trim();

    return res.status(200).json({ generatedMessage: generatedText.trim() });
  } catch (error) {
    console.error("Error from Google GenAI:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate message from AI." });
  }
};

module.exports = {
  genratecapsual,
  getCapsules,
  sendPendingCapsules,
  generateMessage,
};
