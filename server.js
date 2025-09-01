const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: parseInt(process.env.SMTP_PORT, 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  const { name, email, role, phone, community, message, mc } = req.body;

  const text = `Name: ${name}\nEmail: ${email}\nRole: ${role}\nPhone: ${phone}\nCommunity: ${community}\nInterested in MC: ${mc ? 'Yes' : 'No'}\nMessage: ${message}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      subject: 'New Contact Form Submission',
      text,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
