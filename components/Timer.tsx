import React, { useState, useEffect } from 'react';

export const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(15);

  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play sound or alert could go here
      alert("Время урока вышло!");
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setTimeLeft(selectedDuration * 60);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 pr-3 border border-gray-700">
      {!isRunning ? (
        <>
          <select 
            value={selectedDuration} 
            onChange={(e) => setSelectedDuration(Number(e.target.value))}
            className="bg-transparent text-xs text-gray-300 focus:outline-none border-none cursor-pointer py-1 pl-2"
          >
            <option value={5}>5 мин</option>
            <option value={15}>15 мин</option>
            <option value={30}>30 мин</option>
            <option value={45}>45 мин</option>
            <option value={60}>60 мин</option>
          </select>
          <button 
            onClick={startTimer}
            className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors"
            title="Запустить таймер"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </>
      ) : (
        <>
           <div className="flex items-center gap-2 px-2">
             <span className={`font-mono text-sm font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
               {formatTime(timeLeft)}
             </span>
             <button 
                onClick={stopTimer}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                title="Остановить"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </button>
           </div>
        </>
      )}
    </div>
  );
};