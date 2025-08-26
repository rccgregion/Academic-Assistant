

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleClassName = '', footer }) => {
  return (
    <div
      className={`rounded-xl border bg-card/90 text-card-foreground shadow-lg dark:border-dark-border/50 dark:bg-dark-card/80 dark:text-dark-card-foreground 
                 backdrop-blur-sm
                 transition-all duration-300 ease-in-out hover:shadow-xl dark:hover:shadow-2xl 
                 hover:border-primary/30 dark:hover:border-dark-primary/30 
                 ${className}`}
    >
      {title && (
        <div className={`p-4 sm:p-5 border-b border-border/70 dark:border-dark-border/50 ${titleClassName}`}>
          <h3 className="text-xl font-semibold leading-none tracking-tight text-card-foreground dark:text-dark-card-foreground">{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
      {footer && <div className="p-4 sm:p-5 border-t border-border/70 dark:border-dark-border/50">{footer}</div>}
    </div>
  );
};

export default Card;