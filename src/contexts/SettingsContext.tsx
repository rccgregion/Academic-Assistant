

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { AcademicLevel, WritingTone, FormattingStyle, AISettings, ProjectScope } from '../types';

interface SettingsContextType {
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => void;
  saveSettingsToLocalStorage: () => void;
  resetSettingsToDefaults: () => void;
  isInitialLoadComplete: boolean;
}

const LOCAL_STORAGE_KEY_SETTINGS = 'sharon-appSettings';

const initialDefaultSettings: AISettings = {
  academicLevel: AcademicLevel.UNDERGRADUATE,
  writingTone: WritingTone.ACADEMIC,
  formattingStyle: FormattingStyle.APA,
  currentSubject: '', 
  projectScope: ProjectScope.GENERAL_RESEARCH,
  targetWordCount: undefined,
  language: 'en', 
  geographicRegion: 'Global', 
  department: '',
  dataSaverMode: false, 
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AISettings>(initialDefaultSettings);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge ensuring new fields get defaults if not in localStorage
        const mergedSettings = { 
          ...initialDefaultSettings, 
          ...parsedSettings,
          // Ensure boolean fields get default if undefined in parsedSettings
          dataSaverMode: parsedSettings.dataSaverMode !== undefined ? parsedSettings.dataSaverMode : initialDefaultSettings.dataSaverMode,
        };
        setSettings(mergedSettings);
      } else {
        setSettings(initialDefaultSettings); 
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setSettings(initialDefaultSettings); 
    }
    setIsInitialLoadComplete(true);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
  }, []);

  const saveSettingsToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [settings]);

  const resetSettingsToDefaults = useCallback(() => {
    setSettings(initialDefaultSettings);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(initialDefaultSettings));
    } catch (error) {
      console.error("Failed to save reset settings to localStorage:", error);
    }
  }, []);


  useEffect(() => {
    if (isInitialLoadComplete) {
      saveSettingsToLocalStorage();
    }
  }, [settings, saveSettingsToLocalStorage, isInitialLoadComplete]);


  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettingsToLocalStorage, resetSettingsToDefaults, isInitialLoadComplete }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};