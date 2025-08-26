import React from 'react';

const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 0a8.25 8.25 0 0016.5 0M12 2.25v19.5m0-19.5a8.25 8.25 0 010 19.5m0-19.5a8.25 8.25 0 000 19.5m4.33-15a8.223 8.223 0 010 10.5m-8.66 0a8.223 8.223 0 010-10.5" />
  </svg>
);

export default GlobeIcon;
