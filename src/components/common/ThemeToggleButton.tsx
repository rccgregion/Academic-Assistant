import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import Button from './Button';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import { useTranslation } from '../../hooks/useTranslation';

const ThemeToggleButton: React.FC<{ title?: string }> = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      aria-label={t('themeToggle.toggleTheme')}
      title={title || t('themeToggle.toggleTheme')}
      className="text-muted-foreground hover:text-primary dark:text-dark-muted-foreground dark:hover:text-dark-primary bg-card dark:bg-dark-card p-2 rounded-full shadow-md hover:shadow-lg transition-all" // Removed fixed positioning
    >
      {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </Button>
  );
};

export default ThemeToggleButton;