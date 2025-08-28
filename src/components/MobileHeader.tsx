import React from 'react';
import MenuIcon from './icons/MenuIcon';
import CogIcon from './icons/CogIcon';
import HeaderAnimation from './HeaderAnimation';
import { useTranslation } from '../hooks/useTranslation';
import * as ReactRouterDOM from 'react-router-dom';

interface MobileHeaderProps {
  onMenuClick: () => void;
  appName: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, appName }) => {
  const { t } = useTranslation();
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 py-2 glass-bg dark:glass-bg-dark border-b border-border dark:border-dark-border shadow-sm h-14 glossy-overlay">
      <button
        onClick={onMenuClick}
        className="p-2 text-foreground dark:text-dark-foreground hover:bg-muted dark:hover:bg-dark-muted rounded-md transition-colors duration-200"
        aria-label={t('mobileHeader.openMenu')}
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <div className="flex items-center space-x-2">
        <HeaderAnimation className="h-7 w-auto" />
        <div className="app-title">
          <span className="name text-foreground dark:text-dark-foreground">{appName}</span>
          <span className="subtitle text-muted-foreground dark:text-dark-muted-foreground">SHARON</span>
        </div>
      </div>
      <ReactRouterDOM.Link 
        to="/settings" 
        className="p-2 text-foreground dark:text-dark-foreground hover:bg-muted dark:hover:bg-dark-muted rounded-md transition-colors duration-200"
        aria-label={t('mobileHeader.settings')}
      >
        <CogIcon className="h-6 w-6" />
      </ReactRouterDOM.Link>
    </header>
  );
};

export default MobileHeader;