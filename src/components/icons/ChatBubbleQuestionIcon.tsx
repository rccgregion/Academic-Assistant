
import React from 'react';

const ChatBubbleQuestionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443h2.29a2.25 2.25 0 002.25-2.25v-1.618c0-.884-.452-1.688-1.214-2.097C17.534 9.986 17.25 9.75 17.25 9.405V9A2.25 2.25 0 0015 6.75H5.25A2.25 2.25 0 003 9v3.76z" />
    {/* Adding a question mark inside */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.875 11.25A1.875 1.875 0 1013.625 9.375V9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.75 14.25h.01" />
  </svg>
);

export default ChatBubbleQuestionIcon;
