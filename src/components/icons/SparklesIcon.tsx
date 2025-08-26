
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z" />
    <path d="M4 4L6 8L10 10L6 12L4 16L2 12L-2 10L2 8L4 4z" transform="translate(15,3) scale(0.5)" />
    <path d="M4 4L6 8L10 10L6 12L4 16L2 12L-2 10L2 8L4 4z" transform="translate(3,15) scale(0.4)" />
  </svg>
);

export default SparklesIcon;