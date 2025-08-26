import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Translations, LanguageCode } from '../types';
import { en } from '../locales/en';
import { es } from '../locales/es';
import { fr } from '../locales/fr';
import { de } from '../locales/de';
import { pidgin } from '../locales/pidgin'; // Nigerian Pidgin
import { ha } from '../locales/ha'; // Hausa
import { yo } from '../locales/yo'; // Yoruba
import { ig } from '../locales/ig'; // Igbo


interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  showLangPrompt: LanguageCode | null;
  dismissLangPrompt: () => void;
}

const messages: Record<LanguageCode, Translations> = {
  en,
  es,
  fr,
  de,
  'en-NG-x-pidgin': pidgin,
  ha,
  yo,
  ig,
};

export const languageDetails: { code: LanguageCode; nativeName: string, englishName: string }[] = [
    { code: 'en', nativeName: 'English', englishName: 'English' },
    { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
    { code: 'fr', nativeName: 'Français', englishName: 'French' },
    { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
    { code: 'en-NG-x-pidgin', nativeName: 'Naija Pidgin', englishName: 'Nigerian Pidgin' },
    { code: 'ha', nativeName: 'Hausa', englishName: 'Hausa' },
    { code: 'yo', nativeName: 'Yorùbá', englishName: 'Yoruba' },
    { code: 'ig', nativeName: 'Igbo', englishName: 'Igbo' },
];


const DEFAULT_LANGUAGE: LanguageCode = 'en';
const LOCAL_STORAGE_KEY_LANG = 'sharon-language';
const LOCAL_STORAGE_KEY_LANG_PROMPT_DISMISSED = 'sharon-lang-prompt-dismissed';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const storedLang = localStorage.getItem(LOCAL_STORAGE_KEY_LANG) as LanguageCode | null;
      return storedLang && messages[storedLang] ? storedLang : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });
  const [showLangPrompt, setShowLangPrompt] = useState<LanguageCode | null>(null);

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let currentMessages = messages[language] || messages[DEFAULT_LANGUAGE];
    let result: any = currentMessages;
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        currentMessages = messages[DEFAULT_LANGUAGE];
        result = currentMessages;
        for (const k_fb of keys) {
            result = result?.[k_fb];
            if (result === undefined) {
                return key; 
            }
        }
        break; 
      }
    }

    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((str, [optKey, optValue]) => {
        return str.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optValue));
      }, result);
    }
    
    return typeof result === 'string' ? result : key;
  }, [language]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, language);
    document.documentElement.lang = language;
    const appName = t('appName'); 
    const appDescription = t('appDescription');
    document.title = `${appName} - ${appDescription}`;

  }, [language, t]);


  useEffect(() => {
    const storedLangChoice = localStorage.getItem(LOCAL_STORAGE_KEY_LANG);
    const promptDismissed = localStorage.getItem(LOCAL_STORAGE_KEY_LANG_PROMPT_DISMISSED);

    if (!storedLangChoice && !promptDismissed) {
      const browserLangFull = navigator.language; 
      let browserLangPrimary = browserLangFull.split('-')[0] as LanguageCode; 

      // Special handling for Nigerian Pidgin if browser reports 'en-NG'
      if (browserLangFull.toLowerCase() === 'en-ng' && messages['en-NG-x-pidgin']) {
        browserLangPrimary = 'en-NG-x-pidgin';
      }
      
      const supportedBrowserLang = languageDetails.find(ld => ld.code === browserLangPrimary);

      if (supportedBrowserLang && supportedBrowserLang.code !== DEFAULT_LANGUAGE) {
        setShowLangPrompt(supportedBrowserLang.code);
      }
    }
  }, []); 


  const setLanguage = useCallback((lang: LanguageCode) => {
    if (messages[lang]) {
      setLanguageState(lang);
      localStorage.setItem(LOCAL_STORAGE_KEY_LANG, lang); 
      setShowLangPrompt(null); 
    } else {
      console.warn(`Language "${lang}" not supported. Defaulting to ${DEFAULT_LANGUAGE}.`);
      setLanguageState(DEFAULT_LANGUAGE);
    }
  }, []);
  
  const dismissLangPrompt = useCallback(() => {
    setShowLangPrompt(null);
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG_PROMPT_DISMISSED, 'true');
  }, []);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, showLangPrompt, dismissLangPrompt }}>
      {children}
    </LanguageContext.Provider>
  );
};