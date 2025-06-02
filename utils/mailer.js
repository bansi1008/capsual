const nodemiler = require("nodemailer");

const transporter = nodemiler.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password
  },
});

module.exports = transporter;
