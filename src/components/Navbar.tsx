import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { APP_NAME } from '../constants';
import LanguageSelectorButton from './common/LanguageSelectorButton';
import ThemeToggleButton from './common/ThemeToggleButton';

const Navbar: React.FC = () => {
  const location = ReactRouterDOM.useLocation(); 

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-2 bg-card dark:bg-dark-card border-b border-border dark:border-dark-border shadow-md sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <ReactRouterDOM.Link to={location.pathname === '/' ? '/' : "/dashboard"} className="flex items-center space-x-2.5 group">
          <span className="text-xl font-bold text-foreground dark:text-dark-foreground group-hover:text-primary dark:group-hover:text-dark-primary transition-colors duration-300 hidden sm:inline">
            {APP_NAME}
          </span>
        </ReactRouterDOM.Link>
      </div>

      <div className="flex items-center space-x-3">
        <LanguageSelectorButton />
        <ThemeToggleButton />
        {location.pathname === '/dashboard' && (
          <button className="profile-btn group" title="Profile Settings">
            <span className="sr-only">Open profile</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white bg-gradient-to-br from-primary to-secondary shadow-md group-hover:shadow-lg transition-all duration-200 transform group-hover:scale-105">
              {/* Removed S */}
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
