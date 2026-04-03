import React, { useState, useEffect } from 'react';
import LessonCard from './components/LessonCard';
import './App.css';

// For testing, we'll hardcode user ID 1. In a real app, this comes from login/auth.
const USER_ID = 1; 
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [userStats, setUserStats] = useState({ hearts: 5, xp: 0, streak: 0 });
  const [lessonData, setLessonData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Stats on load
  useEffect(() => {
    fetch(`${API_BASE_URL}/user/${USER_ID}`)
      .then(res => res.json())
      .then(data => {
        setUserStats(data);
      })
      .catch(err => console.error("Error fetching user:", err));
  }, []);

  // 2. Fetch the Amharic Lesson
  useEffect(() => {
    fetch(`${API_BASE_URL}/lesson?topic=Food`)
      .then(res => res.json())
      .then(data => {
        setLessonData(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching lesson:", err));
  }, []);

  // 3. Handle Answer & Update Database
  const handleAnswer = async (isCorrect) => {
    try {
      // Tell the backend if we were right or wrong
      const response = await fetch(`${API_BASE_URL}/user/${USER_ID}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCorrect })
      });
      
      const updatedStats = await response.json();
      
      // Update our React UI with the new database values
      setUserStats(prev => ({ ...prev, hearts: updatedStats.hearts, xp: updatedStats.xp }));

      // Move to next question if correct, or if we want to power through mistakes
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 1000); // 1-second delay so they can see the correct/wrong feedback

    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (loading) return <div className="loading">Loading Amharic Lesson... 🇪🇹</div>;
  if (userStats.hearts <= 0) return <div className="game-over">Game Over! You ran out of hearts. 💔</div>;
  if (currentIdx >= lessonData.exercises.length) return <div className="victory">Lesson Complete! 🎉 +XP</div>;

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="top-bar">
        <div className="stat">🔥 {userStats.streak}</div>
        <div className="stat">⭐ {userStats.xp} XP</div>
        <div className="stat">❤️ {userStats.hearts}</div>
      </header>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${(currentIdx / lessonData.exercises.length) * 100}%` }}
        ></div>
      </div>

      {/* The Active Lesson Card */}
      <LessonCard 
        exercise={lessonData.exercises[currentIdx]} 
        onAnswer={handleAnswer} 
      />
    </div>
  );
}

export default App;
