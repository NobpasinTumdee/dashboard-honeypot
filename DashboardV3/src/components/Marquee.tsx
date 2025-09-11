import { useState, useEffect } from 'react';
import { criticalCommands } from '../mockData';

export const Marquee = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % criticalCommands.length);
    }, 5000); 

    return () => clearInterval(intervalId);
  }, []);

  const currentCommand = criticalCommands[currentIndex];

  return (
    <div className='marquee'>
      <span style={{ fontSize: '12px' }}>
        ⚠️ <b>Dangerous command</b>: <b style={{ color: 'var(--accent-primary)' }}>{currentCommand.value}</b> = EN:{currentCommand.EnglishDescription} TH:{currentCommand.Description}
      </span>
    </div>
  );
};