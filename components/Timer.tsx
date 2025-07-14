import React, { useState, useEffect } from 'react';

interface TimerProps {
  startTime: number;
  duration: number; // in seconds
}

const Timer: React.FC<TimerProps> = ({ startTime, duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      return Math.max(0, Math.ceil(duration - elapsed));
    };
    
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  const percentage = (timeLeft / duration) * 100;
  const color = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-48 bg-gray-700 rounded-full h-6 border-2 border-gray-600 overflow-hidden relative shadow-lg">
      <div 
        className={`absolute top-0 left-0 h-full transition-all duration-1000 linear ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="absolute inset-0 flex items-center justify-center font-bold text-sm text-white mix-blend-difference">
        Tiempo restante: {timeLeft}s
      </span>
    </div>
  );
};

export default Timer;
