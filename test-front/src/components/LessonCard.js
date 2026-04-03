import React, { useState, useEffect } from 'react';

const LessonCard = ({ exercise, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'

  // Reset state when a new exercise loads
  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
  }, [exercise]);

  const handleCheck = (option) => {
    // Prevent clicking again while waiting for the next question
    if (selectedOption) return; 

    setSelectedOption(option);
    
    const isCorrect = option === exercise.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // Pass the result back up to App.js to update the database
    onAnswer(isCorrect); 
  };

  return (
    <div className="lesson-card">
      <h2>Translate this sentence</h2>
      
      <div className="question-box">
        <h1 className="amharic-text">{exercise.question}</h1>
        <p className="phonetic-text">({exercise.phonetic})</p>
      </div>
      
      <div className="options-grid">
        {exercise.options.map((opt, i) => {
          let btnClass = "option-btn";
          if (selectedOption === opt) {
            btnClass += feedback === 'correct' ? " correct-btn" : " wrong-btn";
          } else if (selectedOption && opt === exercise.correctAnswer) {
             // Highlight correct answer if they got it wrong
            btnClass += " correct-btn";
          }

          return (
            <button 
              key={i} 
              className={btnClass}
              onClick={() => handleCheck(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
// Inside LessonCard.js
const playSound = async (text) => {
  const response = await fetch('http://localhost:5000/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
};

// Add this button next to your Amharic text in the JSX:
<button className="speaker-btn" onClick={() => playSound(exercise.question)}>
  🔊 Listen
</button>

export default LessonCard;