import React from 'react';

const FlagIgIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 60 30" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="30" fill="#008751"/>
      <rect width="60" height="20" y="5" fill="#FFFFFF"/>
      <rect width="60" height="10" y="10" fill="#008751"/>
      <rect width="20" height="30" fill="#C8102E"/>
    </svg>
  );
};

export default FlagIgIcon;
