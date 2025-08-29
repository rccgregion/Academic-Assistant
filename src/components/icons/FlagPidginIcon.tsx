import React from 'react';

const FlagPidginIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 60 30" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="30" fill="#008751"/>
      <rect x="20" width="20" height="30" fill="#FFFFFF"/>
      <rect x="40" width="20" height="30" fill="#008751"/>
    </svg>
  );
};

export default FlagPidginIcon;
