
import React from 'react';

const BrainCircuitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor"
  >
    {/* Brain Outline */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.642m0 0a5.232 5.232 0 01-4.49 5.232H3.75m2.092-8.472c.024.11.044.222.06.336M14.25 3.104v5.642m0 0a5.232 5.232 0 004.49 5.232h1.508M18.158 5.972a22.458 22.458 0 01.06-.336M5.842 5.972c.832-.822 1.844-1.476 2.958-1.928m5.392 0c1.114.452 2.126 1.106 2.958 1.928M9.75 14.25h4.5m-4.5 0a2.25 2.25 0 01-2.25-2.25V10.5m2.25 3.75v2.25m4.5-2.25a2.25 2.25 0 002.25-2.25V10.5m-2.25 3.75v2.25m-4.5 0a2.25 2.25 0 00-2.25 2.25v1.125c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V18.75a2.25 2.25 0 00-2.25-2.25M12 12.375a2.625 2.625 0 110-5.25 2.625 2.625 0 010 5.25z" />
    {/* Circuit nodes/dots - simplified representation */}
    <circle cx="7" cy="9" r="0.75" fill="currentColor" />
    <circle cx="17" cy="9" r="0.75" fill="currentColor" />
    <circle cx="12" cy="6" r="0.75" fill="currentColor" />
    <circle cx="9.5" cy="15.5" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="15.5" r="0.75" fill="currentColor" />
  </svg>
);

export default BrainCircuitIcon;