import React from 'react';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  containerClassName?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, options, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`appearance-none flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm text-foreground
                     ring-offset-background dark:ring-offset-dark-background 
                     focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-dark-ring focus:ring-offset-2 
                     disabled:cursor-not-allowed disabled:opacity-50 
                     dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground
                     transition-all duration-150 ease-in-out
                     ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="dark:bg-dark-input dark:text-dark-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-dark-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
};

export default Select;