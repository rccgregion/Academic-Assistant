

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import { useSettings } from '../contexts/SettingsContext';
import { AcademicLevel, WritingTone, FormattingStyle, ProjectScope, LanguageCode } from '../types';
import CogIcon from '../components/icons/CogIcon';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettingsToDefaults, isInitialLoadComplete } = useSettings();
  const { addToast } = useToast();
  const { t, language: currentContextLanguage, setLanguage: setContextLanguage, languageDetails } = useLanguage();

  const [formState, setFormState] = useState(settings);

  useEffect(() => {
    if (isInitialLoadComplete) {
      setFormState(prev => ({
        ...prev, 
        ...settings, 
        language: settings.language || 'en',
        geographicRegion: settings.geographicRegion || 'Global',
        department: settings.department || '',
        dataSaverMode: settings.dataSaverMode || false,
      }));
    }
  }, [settings, isInitialLoadComplete]);
  
  const academicLevelOptions = Object.values(AcademicLevel).map(level => ({ value: level, label: level }));
  const writingToneOptions = Object.values(WritingTone).map(tone => ({ value: tone, label: tone }));
  const formattingStyleOptions = Object.values(FormattingStyle).map(style => ({ value: style, label: t(`settings.formattingStyles.${style.toLowerCase().replace(/\s+/g, '')}`) }));
  const projectScopeOptions = Object.values(ProjectScope).map(scope => ({ value: scope, label: scope }));

  const geographicRegionOptions = [
    { value: 'Global', label: t('settings.regions.global') },
    { value: 'Nigeria', label: t('settings.regions.nigeria') },
  ];

  const dynamicLanguageOptions = languageDetails.map(lang => ({
    value: lang.code,
    label: `${lang.nativeName} (${t(`languages.${lang.englishName.toLowerCase().replace(/\s+/g, '')}`)})`
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as LanguageCode;
    setFormState(prev => ({ ...prev, language: newLang }));
    setContextLanguage(newLang); 
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value === '' ? undefined : parseInt(value, 10) }));
  };
  
  const handleSave = useCallback(() => {
    updateSettings(formState); 
    setContextLanguage(formState.language as LanguageCode); 
    addToast(t('settings.settingsSavedSuccess'), 'success');
  }, [formState, updateSettings, addToast, t, setContextLanguage]);

  const handleReset = useCallback(() => {
    resetSettingsToDefaults(); 
    setContextLanguage('en'); 
    addToast(t('settings.settingsResetSuccess'), 'info');
  }, [resetSettingsToDefaults, addToast, t, setContextLanguage]);


  if (!isInitialLoadComplete) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>{t('global.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b border-border dark:border-dark-border">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <CogIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          {t('settings.description')}
        </p>
      </header>

      <Card title={t('settings.preferencesTitle')}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label={t('settings.academicLevelLabel')}
              name="academicLevel"
              options={academicLevelOptions}
              value={formState.academicLevel}
              onChange={handleInputChange}
            />
            <Select
              label={t('settings.writingToneLabel')}
              name="writingTone"
              options={writingToneOptions}
              value={formState.writingTone}
              onChange={handleInputChange}
            />
            <Select
              label={t('settings.formattingStyleLabel')}
              name="formattingStyle"
              options={formattingStyleOptions}
              value={formState.formattingStyle}
              onChange={handleInputChange}
            />
            <Select
              label={t('settings.projectScopeLabel')}
              name="projectScope"
              options={projectScopeOptions}
              value={formState.projectScope || ProjectScope.GENERAL_RESEARCH}
              onChange={handleInputChange}
            />
            <Select
              label={t('settings.languageLabel')}
              name="language"
              options={dynamicLanguageOptions}
              value={formState.language}
              onChange={handleLanguageChange}
            />
            <Select
              label={t('settings.geographicRegionLabel')}
              name="geographicRegion"
              options={geographicRegionOptions}
              value={formState.geographicRegion}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input
              label={t('settings.currentSubjectLabel')}
              name="currentSubject"
              placeholder={t('settings.currentSubjectPlaceholder')}
              value={formState.currentSubject || ''}
              onChange={handleInputChange}
            />
            <Input
              label={t('settings.targetWordCountLabel')}
              name="targetWordCount"
              type="number"
              placeholder="e.g., 1500"
              value={formState.targetWordCount === undefined ? '' : formState.targetWordCount}
              onChange={handleNumericInputChange}
              min="0"
            />
            {formState.geographicRegion === 'Nigeria' && (
              <Input
                label={t('settings.departmentLabel')}
                name="department"
                placeholder={t('settings.departmentPlaceholder')}
                value={formState.department || ''}
                onChange={handleInputChange}
              />
            )}
            <div className="flex items-center space-x-2 pt-4 md:pt-6">
              <input
                type="checkbox"
                id="dataSaverMode"
                name="dataSaverMode"
                checked={formState.dataSaverMode}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary dark:text-dark-primary border-border dark:border-dark-border rounded focus:ring-primary dark:focus:ring-dark-primary"
              />
              <label htmlFor="dataSaverMode" className="text-sm font-medium text-foreground dark:text-dark-foreground">
                {t('settings.dataSaverModeLabel')}
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
            <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
              {t('settings.resetToDefaults')}
            </Button>
            <Button onClick={handleSave} variant="primary" className="w-full sm:w-auto">
              {t('settings.saveSettings')}
            </Button>
          </div>
           <p className="text-xs text-center text-muted-foreground dark:text-dark-muted-foreground pt-2">
            {t('settings.notes')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;