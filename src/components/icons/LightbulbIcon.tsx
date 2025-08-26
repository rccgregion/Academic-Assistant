
import React from 'react';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-5.657 2.926A7.003 7.003 0 0 0 3 12c0 2.802 1.571 5.22 3.868 6.368A6.994 6.994 0 0 0 12 22a6.994 6.994 0 0 0 5.132-2.632A6.994 6.994 0 0 0 21 12c0-3.132-1.868-5.733-4.48-6.66A6.98 6.98 0 0 0 12 2Z" />
  </svg>
);

export default LightbulbIcon;