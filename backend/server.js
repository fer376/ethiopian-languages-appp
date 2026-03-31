const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Import our OpenAI service
const { generateAmharicLesson } = require('./services/openaiService');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

// 1. AI Lesson Generation Route

app.get('/api/lesson', async (req, res) => {
  try {
    const topic = req.query.topic || "Basics";
    const lessonData = await generateAmharicLesson(topic);
    res.json(lessonData);
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: 'Failed to generate Amharic lesson' });
  }
});


// 2. Gamification Routes (Postgres)


// Get a user's current stats (Hearts, XP, Streak)
app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, hearts, xp, streak FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while fetching user' });
  }
});

// Update progress (Add XP for correct answer, subtract Heart for wrong answer)
app.post('/api/user/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCorrect } = req.body; // Frontend will send { isCorrect: true/false }

    let query = '';
    
    if (isCorrect) {
      // Add 10 XP
      query = 'UPDATE users SET xp = xp + 10 WHERE id = $1 RETURNING hearts, xp';
    } else {
      // Lose 1 Heart
      query = 'UPDATE users SET hearts = GREATEST(hearts - 1, 0) WHERE id = $1 RETURNING hearts, xp';
    }

    const result = await pool.query(query, [id]);
    res.json(result.rows[0]); // Return the updated stats to the frontend
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while updating progress' });
  }
});


// Server Init

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Amharic Server running on port ${PORT}`);
});