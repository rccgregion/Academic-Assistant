import React from 'react';

const FlagPidginIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 60 30" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="30" fill="#008751"/>
      <rect width="60" height="20" y="5" fill="#FFFFFF"/>
      <rect width="60" height="10" y="10" fill="#008751"/>
      <circle cx="30" cy="15" r="6" fill="#E31B23"/>
    </svg>
  );
};

export default FlagPidginIcon;
