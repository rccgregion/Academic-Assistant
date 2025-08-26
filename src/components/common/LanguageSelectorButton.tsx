import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage'; // Changed to useLanguage
import { LanguageCode } from '../../types';
import GlobeIcon from '../icons/GlobeIcon';
import Button from './Button';
import ChevronDownIcon from '../icons/ChevronDownIcon';

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
        className="p-2 rounded-full shadow-md hover:shadow-lg transition-all bg-card dark:bg-dark-card text-muted-foreground hover:text-primary dark:text-dark-muted-foreground dark:hover:text-dark-primary"
        title={t('settings.languageLabel')}
      >
        <GlobeIcon className="h-5 w-5" />
        <span className="ml-1.5 text-xs font-medium sr-only sm:not-sr-only">{currentLangLabel}</span> 
        <ChevronDownIcon className={`h-3 w-3 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} sr-only sm:not-sr-only`} />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card dark:bg-dark-card shadow-lg ring-1 ring-border dark:ring-dark-border focus:outline-none animate-scaleIn z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {languageDetails.map(option => (
              <button
                key={option.code}
                onClick={() => handleSelectLanguage(option.code)}
                className={`w-full text-left block px-4 py-2 text-sm 
                            ${language === option.code 
                              ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-semibold' 
                              : 'text-card-foreground dark:text-dark-card-foreground hover:bg-muted dark:hover:bg-dark-muted'}
                            focus:bg-muted dark:focus:bg-dark-muted focus:outline-none transition-colors rounded-sm`}
                role="menuitem"
              >
                {option.nativeName} ({t(`languages.${option.englishName.toLowerCase()}`)})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelectorButton;