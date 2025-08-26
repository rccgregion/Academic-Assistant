import React from 'react';

const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9.594 3.94c.09-.542.56-1.007 1.11-.965 1.578.121 2.638.26 3.732.514.542.127.876.66.753 1.195L14.25 8.55M14.25 8.55l3.252 1.504a1.125 1.125 0 01.668 1.285l-1.095 5.474a1.125 1.125 0 01-1.285.668l-1.504-3.252m0 0l-3.252-1.504a1.125 1.125 0 01-.668-1.285l1.095-5.474a1.125 1.125 0 011.285-.668l1.504 3.252M12 11.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12.75 15l3.252 1.504a1.125 1.125 0 01.668 1.285l-1.095 5.474a1.125 1.125 0 01-1.285.668l-1.504-3.252m0 0l-3.252-1.504a1.125 1.125 0 01-.668-1.285l1.095-5.474a1.125 1.125 0 011.285-.668l1.504 3.252M12 15.75a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" 
    />
  </svg>
);

export default CogIcon;
