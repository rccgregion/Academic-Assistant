import React from 'react';

const FlagDeIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 60 30" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="10" fill="#000000"/>
      <rect width="60" height="10" y="10" fill="#FF0000"/>
      <rect width="60" height="10" y="20" fill="#FFCC00"/>
    </svg>
  );
};

export default FlagDeIcon;
