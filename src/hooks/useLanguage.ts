import { useContext } from 'react';
import { LanguageContext, languageDetails as langDetailsArray } from '../contexts/LanguageContext'; // Ensure languageDetails is exported
import { LanguageCode } from '../types';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  // Optionally, make languageDetails available as an object for easier lookup
  const languageDetailsMap = langDetailsArray.reduce((acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  }, {} as Record<LanguageCode, { code: LanguageCode; nativeName: string; englishName: string }>);
  
  return { 
    language: context.language,
    setLanguage: context.setLanguage,
    t: context.t,
    showLangPrompt: context.showLangPrompt,
    dismissLangPrompt: context.dismissLangPrompt,
    languageDetails: langDetailsArray,
    languageDetailsMap 
  };
};