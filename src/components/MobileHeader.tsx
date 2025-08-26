import React from 'react';
import MenuIcon from './icons/MenuIcon';
import { SharonLogo } from './icons/SharonLogo';
import { useTranslation } from '../hooks/useTranslation';

interface MobileHeaderProps {
  onMenuClick: () => void;
  appName: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, appName }) => {
  const { t } = useTranslation();
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-card dark:bg-dark-card border-b border-border dark:border-dark-border shadow-sm h-14">
      <button
        onClick={onMenuClick}
        className="p-2 text-foreground dark:text-dark-foreground hover:bg-muted dark:hover:bg-dark-muted rounded-md"
        aria-label={t('mobileHeader.openMenu')}
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <div className="flex items-center space-x-2">
        <SharonLogo className="h-7 w-auto" />
        <span className="text-lg font-semibold text-foreground dark:text-dark-foreground">
          {appName}
        </span>
      </div>
      <div className="w-10"></div> {/* Spacer to balance the menu button */}
    </header>
  );
};

export default MobileHeader;