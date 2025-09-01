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

// In-memory messages for demonstration purposes
const messages = [
  { id: 1, text: 'Welcome to Music with Melissa!' },
  { id: 2, text: 'This is your second message.' },
];

// READMSG command: return a message by id
app.get('/api/messages/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const msg = messages.find((m) => m.id === id);
  if (msg) {
    res.json(msg);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// REPLYMSG command: handle replies to a message
app.post('/api/messages/:id/reply', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { reply } = req.body;
  console.log(`Reply to message ${id}: ${reply}`);
  res.json({ success: true });
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
