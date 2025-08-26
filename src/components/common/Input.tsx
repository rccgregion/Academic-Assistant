

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground
                   ring-offset-background dark:ring-offset-dark-background 
                   file:border-0 file:bg-transparent file:text-sm file:font-medium 
                   placeholder:text-muted-foreground dark:placeholder:text-dark-muted-foreground 
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-dark-ring focus-visible:ring-offset-2 
                   disabled:cursor-not-allowed disabled:opacity-50 
                   dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground 
                   transition-all duration-150 ease-in-out
                   ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;