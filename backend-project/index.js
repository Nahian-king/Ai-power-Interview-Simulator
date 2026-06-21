require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectdb = require('./src/config/db');
const { rateLimit } = require('express-rate-limit');

const app = express();

app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: { message: 'You are submitting responses quickly. Please wait a minute before trying again.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

connectdb();

app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/interview/start', aiLimiter);
app.use('/api/interview/submit-answer', aiLimiter);

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/interview', require('./src/routes/interviewRoutes'));

app.get('/', (req, res) => {
  res.send('Server running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});