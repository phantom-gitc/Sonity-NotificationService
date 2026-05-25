import config from '../config/config.js';
import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────
// Gmail SMTP transporter using App Password (simpler & more reliable
// than OAuth2 — no expiring tokens).
//
// To generate an App Password:
//  1. Go to myaccount.google.com → Security → 2-Step Verification
//  2. Scroll to "App Passwords" at the bottom
//  3. Select "Mail" + "Other (Custom name)" → Generate
//  4. Copy the 16-char password into EMAIL_PASS in .env
// ─────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS on port 587
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS, // Gmail App Password (NOT your regular Gmail password)
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify the connection configuration at startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email server connection failed:', error.message);
    console.error('   → Make sure EMAIL_USER and EMAIL_PASS (App Password) are set in .env');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sonity" <${config.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('✅ Email sent to %s | MessageID: %s', to, info.messageId);
  } catch (error) {
    console.error('❌ Error sending email to %s:', to, error.message);
  }
};

export default sendEmail;