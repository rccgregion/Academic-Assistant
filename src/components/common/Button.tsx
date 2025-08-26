

import React, { ReactNode, forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}, ref) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-lg font-semibold tracking-wide transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-dark-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-background disabled:opacity-60 disabled:pointer-events-none ring-offset-background dark:ring-offset-dark-background transform active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 dark:shadow-dark-primary/20 dark:hover:shadow-dark-primary/30',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 dark:bg-dark-secondary dark:text-dark-secondary-foreground dark:hover:bg-dark-secondary/90 shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/25',
    ghost: 'text-foreground hover:bg-muted hover:text-accent-foreground dark:text-dark-foreground dark:hover:bg-dark-muted dark:hover:text-dark-accent-foreground active:scale-100',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80 shadow-md shadow-destructive/20 hover:shadow-lg hover:shadow-destructive/30',
    outline: 'border border-border bg-transparent hover:bg-muted hover:text-accent-foreground dark:border-dark-border dark:hover:bg-dark-muted dark:hover:text-dark-accent-foreground',
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;