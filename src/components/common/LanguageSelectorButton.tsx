import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage'; // Changed to useLanguage
import { LanguageCode } from '../../types';
import GlobeIcon from '../icons/GlobeIcon';
import Button from './Button';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import FlagEnIcon from '../icons/FlagEnIcon';
import FlagEsIcon from '../icons/FlagEsIcon';
import FlagFrIcon from '../icons/FlagFrIcon';
import FlagDeIcon from '../icons/FlagDeIcon';
import FlagPidginIcon from '../icons/FlagPidginIcon';
import FlagHaIcon from '../icons/FlagHaIcon';
import FlagYoIcon from '../icons/FlagYoIcon';
import FlagIgIcon from '../icons/FlagIgIcon';

const flagIcons: Record<LanguageCode, React.ComponentType<{ className?: string }>> = {
  'en': FlagEnIcon,
  'es': FlagEsIcon,
  'fr': FlagFrIcon,
  'de': FlagDeIcon,
  'en-NG-x-pidgin': FlagPidginIcon,
  'ha': FlagHaIcon,
  'yo': FlagYoIcon,
  'ig': FlagIgIcon,
};

const LanguageSelectorButton: React.FC<{ className?: string }> = ({ className }) => {
  const { language, setLanguage, t, languageDetails } = useLanguage(); // Get languageDetails
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setLanguage(langCode);
    closeDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      closeDropdown();
      buttonRef.current?.focus();
    }
    // Basic arrow key navigation could be added here if desired
  };
  
  const currentLangDetails = languageDetails.find(opt => opt.code === language);
  const CurrentFlagIcon = flagIcons[language] || FlagEnIcon;
  const currentLangLabel = currentLangDetails?.nativeName || language.toUpperCase();


  return (
    <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <Button
        ref={buttonRef}
        onClick={toggleDropdown}
        variant="ghost"
        size="icon"
        aria-label={t('settings.languageLabel')}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="p-2 rounded-full shadow-md hover:shadow-lg transition-all text-muted-foreground hover:text-primary dark:text-dark-muted-foreground dark:hover:text-dark-primary"
        title={t('settings.languageLabel')}
      >
        <div className="flex items-center space-x-1.5">
          <CurrentFlagIcon className="h-4 w-4" />
          <GlobeIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{currentLangLabel}</span> 
          <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-card dark:bg-dark-card shadow-lg ring-1 ring-border dark:ring-dark-border focus:outline-none animate-scaleIn z-50 border border-border/50 dark:border-dark-border/50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {languageDetails.map(option => {
              const FlagIcon = flagIcons[option.code] || FlagEnIcon;
              const isSelected = language === option.code;
              
              return (
                <button
                  key={option.code}
                  onClick={() => handleSelectLanguage(option.code)}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm 
                              ${isSelected 
                                ? 'bg-primary/20 text-primary dark:bg-dark-primary/30 dark:text-dark-primary font-semibold' 
                                : 'text-card-foreground dark:text-dark-card-foreground hover:bg-muted/50 dark:hover:bg-dark-muted/50'}
                              focus:bg-muted dark:focus:bg-dark-muted focus:outline-none transition-colors rounded-sm group`}
                  role="menuitem"
                >
                  <FlagIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="flex-1">
                    {option.nativeName}
                    <span className="text-xs text-muted-foreground dark:text-dark-muted-foreground ml-2">
                      ({t(`languages.${option.englishName.toLowerCase()}`)})
                    </span>
                  </span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary dark:bg-dark-primary rounded-full ml-2 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelectorButton;