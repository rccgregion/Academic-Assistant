

import React, { useState, useCallback } from 'react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { FormattingStyle } from '../types';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import QuotationMarkIcon from '../components/icons/QuotationMarkIcon';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 
import { useTranslation } from '../hooks/useTranslation';

interface SourceDetails {
  authors: string;
  title: string;
  year: string;
  sourceType: string; 
  urlOrDoi: string; 
  publisherOrJournal: string; 
  volumeIssuePages: string; 
}

const initialSourceDetails: SourceDetails = {
  authors: '', title: '', year: '', sourceType: "Journal Article", urlOrDoi: '', publisherOrJournal: '', volumeIssuePages: ''
};

const sourceTypes = [
  { value: "Journal Article", label: "Journal Article" },
  { value: "Book", label: "Book" },
  { value: "Book Chapter", label: "Book Chapter" },
  { value: "Website", label: "Website / Webpage" },
  { value: "Conference Paper", label: "Conference Paper" },
  { value: "Thesis/Dissertation", label: "Thesis / Dissertation" },
  { value: "Report", label: "Report" },
  { value: "Other", label: "Other" },
];

const CiteWisePage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [sourceDetails, setSourceDetails] = useState<SourceDetails>(initialSourceDetails);
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styleOptions = Object.values(FormattingStyle).map(style => ({ 
    value: style, 
    label: t(`settings.formattingStyles.${style.toLowerCase().replace(/\s+/g, '')}`) 
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSourceDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateCitation = useCallback(async () => {
    if (!sourceDetails.authors.trim() || !sourceDetails.title.trim() || !sourceDetails.year.trim()) {
      addToast(t('citeWise.fieldsRequired'), "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCitation('');

    let detailsString = `Authors: ${sourceDetails.authors}\nTitle: ${sourceDetails.title}\nYear: ${sourceDetails.year}\nSource Type: ${sourceDetails.sourceType}`;
    if (sourceDetails.urlOrDoi.trim()) detailsString += `\nURL/DOI: ${sourceDetails.urlOrDoi}`;
    if (sourceDetails.publisherOrJournal.trim()) detailsString += `\nPublisher/Journal: ${sourceDetails.publisherOrJournal}`;
    if (sourceDetails.volumeIssuePages.trim()) detailsString += `\nVolume/Issue/Pages: ${sourceDetails.volumeIssuePages}`;

    let promptInstruction = `Generate a citation in ${settings.formattingStyle} style for the following academic source:`;
    if (settings.formattingStyle === FormattingStyle.NIGERIAN_ACADEMIC_APA && settings.geographicRegion === 'Nigeria') {
        promptInstruction = `Generate a citation strictly adhering to Nigerian Academic APA style (which is APA style with potential nuances for citing local Nigerian authors or government publications, ensuring names are fully spelled out if common practice). Use the following source details:`;
    }

    const prompt = `${promptInstruction}\n${detailsString}\n\nOutput ONLY a valid JSON object with a single key: "citation", which holds the formatted citation string. Do not include any extra text, labels, or explanations before or after the JSON.`;
    
    const result = await generateText("", { 
        ...settings, 
        responseMimeType: "application/json",
        customPromptOverride: prompt 
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
        const parsedResponse = parseJsonFromText<{ citation: string }>(result.text);
        if (parsedResponse && typeof parsedResponse.citation === 'string') {
            setGeneratedCitation(parsedResponse.citation);
            addToast(t('citeWise.generationSuccess', { style: settings.formattingStyle }), "success");
        } else if (result.text.trim().length > 10) { // Fallback for when AI doesn't return JSON but gives text
            setGeneratedCitation(result.text.trim());
            addToast(t('citeWise.generationSuccess', { style: settings.formattingStyle }), "success");
        } else {
            setError("AI returned data in an unexpected format. Could not parse citation.");
            addToast("Failed to parse citation from AI response.", "error");
        }
    }
    setIsLoading(false);
  }, [sourceDetails, settings, addToast, t]);

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'Citation';
    return `${APP_NAME} - CiteWise - ${safeBase}.${extension}`;
  };

  const handleCopyToClipboard = () => {
    if (!generatedCitation) {
        addToast(t('global.noContentToCopy'), 'info');
        return;
    }
    navigator.clipboard.writeText(generatedCitation);
    addToast(t('global.copiedToClipboard'), 'success');
  };

  const handleDownloadCitation = () => {
    if (!generatedCitation) {
      addToast(t('global.noContentToDownload'), 'info');
      return;
    }
    const filename = getSafeFilename(sourceDetails.title, 'txt');
    downloadTextFile(generatedCitation, filename);
    addToast(t('global.downloadInitiated'), 'success');
  };

  const handleSaveToDrive = () => {
    if (!generatedCitation) {
      addToast(t('global.noContentToSave'), 'info');
      return;
    }
    const filename = getSafeFilename(sourceDetails.title, 'txt');
    openSaveToDriveModal(generatedCitation, filename);
  };
  
  const handleClearAll = () => {
    setSourceDetails(initialSourceDetails);
    setGeneratedCitation('');
    setError(null);
    addToast(t('citeWise.fieldsCleared'), 'info');
  };


  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <QuotationMarkIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          {t('citeWise.title')}
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">{t('citeWise.description')}</p>
      </header>

      <Card title={t('citeWise.sourceDetailsTitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input label={t('citeWise.authorsLabel')} name="authors" value={sourceDetails.authors} onChange={handleInputChange} placeholder={t('citeWise.authorsPlaceholder')} />
          <Input label={t('citeWise.titleLabel')} name="title" value={sourceDetails.title} onChange={handleInputChange} placeholder={t('citeWise.titlePlaceholder')} />
          <Input label={t('citeWise.yearLabel')} name="year" type="number" value={sourceDetails.year} onChange={handleInputChange} placeholder={t('citeWise.yearPlaceholder')} />
          <Select label={t('citeWise.sourceTypeLabel')} name="sourceType" options={sourceTypes} value={sourceDetails.sourceType} onChange={handleInputChange} />
          <Input label={t('citeWise.publisherLabel')} name="publisherOrJournal" value={sourceDetails.publisherOrJournal} onChange={handleInputChange} placeholder={t('citeWise.publisherPlaceholder')} />
          <Input label={t('citeWise.volumeLabel')} name="volumeIssuePages" value={sourceDetails.volumeIssuePages} onChange={handleInputChange} placeholder={t('citeWise.volumePlaceholder')} />
          <Input label={t('citeWise.urlLabel')} name="urlOrDoi" value={sourceDetails.urlOrDoi} onChange={handleInputChange} placeholder={t('citeWise.urlPlaceholder')} containerClassName="md:col-span-2"/>
          <Select
            label={t('citeWise.styleLabel')}
            name="formattingStyle"
            options={styleOptions}
            value={settings.formattingStyle}
            onChange={(e) => updateSettings({ formattingStyle: e.target.value as FormattingStyle })}
            containerClassName="md:col-span-2"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
            {t('global.clearAllFields')}
          </Button>
          <Button onClick={handleGenerateCitation} isLoading={isLoading} disabled={!sourceDetails.authors || !sourceDetails.title || !sourceDetails.year} className="w-full sm:w-auto">
            {t('citeWise.generateButton')}
          </Button>
        </div>
      </Card>

      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text={t('global.loading')} />}
        {error && !isLoading && <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive"><p className="font-semibold">{t('global.error')}</p><p className="text-sm">{error}</p></Card>}

        {!isLoading && !generatedCitation && !error && (
            <Card>
                <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                    <QuotationMarkIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                    <p className="font-semibold text-lg">{t('citeWise.readyTitle')}</p>
                    <p className="text-sm">{t('citeWise.readyDescription')}</p>
                </div>
            </Card>
        )}

        {!isLoading && generatedCitation && (
          <Card title={t('citeWise.generatedTitle', { style: settings.formattingStyle })}>
            <div className="p-3 bg-muted/50 dark:bg-dark-muted/30 rounded-md">
              <p className="text-sm text-foreground dark:text-dark-foreground whitespace-pre-wrap font-mono" aria-label="Generated citation text">{generatedCitation}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm">{t('citeWise.copyButton')}</Button>
              <Button onClick={handleDownloadCitation} variant="outline" size="sm">{t('citeWise.downloadButton')}</Button>
              <Button onClick={handleSaveToDrive} variant="outline" size="sm">{t('citeWise.saveToDriveButton')}</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CiteWisePage;