

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { SharonLogo } from './icons/SharonLogo';
import { APP_NAME } from '../constants';

const Navbar: React.FC = () => {
  const location = ReactRouterDOM.useLocation(); 

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 bg-card dark:bg-dark-card border-b border-border dark:border-dark-border shadow-md sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <ReactRouterDOM.Link to={location.pathname === '/' ? '/' : "/dashboard"} className="flex items-center space-x-2.5 group">
          <SharonLogo className="h-9 w-auto" /> 
          <span className="text-xl font-bold text-foreground dark:text-dark-foreground group-hover:text-primary dark:group-hover:text-dark-primary transition-colors duration-300 hidden sm:inline">
            {APP_NAME}
          </span>
        </ReactRouterDOM.Link>
      </div>

      {/* Theme toggle button removed from here, now a global fixed component */}
      {/* The global ThemeToggleButton will be positioned top-right, potentially overlapping slightly or next to this navbar on HomePage */}

    </nav>
  );
};

export default Navbar;