import React from 'react';

interface CallTimerProps {
  time: string;
  className?: string;
}

export const CallTimer: React.FC<CallTimerProps> = ({ time, className = '' }) => {
  return (
    <span className={`font-mono tabular-nums tracking-wider select-none ${className}`}>
      {time}
    </span>
  );
};
export default CallTimer;
