import React, { useState, useEffect } from "react";

interface TimerProps {
  initialMinutes?: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes = 30, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`font-semibold ${
    timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'
  }`}>
    ⏱️ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
  </div>
  );
};

export default Timer;