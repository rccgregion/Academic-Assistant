import React from 'react';

const FlagFrIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 60 30" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="30" fill="#0055A4"/>
      <rect width="20" height="30" x="20" fill="#FFFFFF"/>
      <rect width="20" height="30" x="40" fill="#EF4135"/>
    </svg>
  );
};

export default FlagFrIcon;
