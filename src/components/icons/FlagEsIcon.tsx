import React from 'react';

const FlagEsIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 60 30" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="30" fill="#C60B1E"/>
      <rect width="60" height="20" y="5" fill="#FFC400"/>
      <rect width="60" height="10" y="10" fill="#C60B1E"/>
    </svg>
  );
};

export default FlagEsIcon;
