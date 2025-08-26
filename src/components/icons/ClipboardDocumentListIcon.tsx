import React from 'react';

const ClipboardDocumentListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M10.5 17.25H8.25A2.25 2.25 0 016 15V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08M15.75 8.25v6.75a2.25 2.25 0 01-2.25 2.25H9.375a2.25 2.25 0 01-2.25-2.25V8.25A2.25 2.25 0 019.375 6h6.375a2.25 2.25 0 012.25 2.25z" />
  </svg>
);

export default ClipboardDocumentListIcon;
