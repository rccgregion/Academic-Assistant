
import React from 'react';

const StudyBotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Head shape */}
    <path d="M12 2L6 4v3.34c0 1.25.27 2.44.78 3.52L8 14h8l1.22-3.14c.51-1.08.78-2.27.78-3.52V4L12 2z" />
    {/* Face plate */}
    <rect x="7" y="7" width="10" height="5" rx="1" />
    {/* Eyes - two small circles or dots */}
    <circle cx="9.5" cy="9.5" r="0.75" fill="currentColor"/>
    <circle cx="14.5" cy="9.5" r="0.75" fill="currentColor"/>
    {/* Antenna */}
    <line x1="12" y1="2" x2="12" y2="0.5" />
    <circle cx="12" cy="0.5" r="0.5" fill="currentColor" />
     {/* Neck/Base */}
    <path d="M8 14v2a1 1 0 001 1h6a1 1 0 001-1v-2" />
    {/* Optional: subtle book or graduation cap element - keeping it simple for now */}
  </svg>
);

export default StudyBotIcon;
