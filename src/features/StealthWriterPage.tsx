

import React, { useState, useCallback, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { WritingTone } from '../types';
import { generateText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import EditIcon from '../components/icons/EditIcon';
import SparklesIcon from '../components/icons/SparklesIcon'; 
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 
import SendToToolDropdown from '../components/common/SendToToolDropdown'; 
import ThumbsUpIcon from '../components/icons/ThumbsUpIcon';
import ThumbsDownIcon from '../components/icons/ThumbsDownIcon';

enum RewriteAction {
  HUMANIZE_SUBTLE = "Subtle Humanization",
  HUMANIZE_MODERATE = "Moderate Humanization",
  HUMANIZE_STRONG = "Strong Humanization",
  IMPROVE_CLARITY = "Improve Clarity & Flow",
  CHANGE_TONE = "Change Tone",
  CUSTOM = "Custom Instructions"
}

const StealthWriterPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const location = ReactRouterDOM.useLocation();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [rewriteAction, setRewriteAction] = useState<RewriteAction>(RewriteAction.HUMANIZE_MODERATE);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined); 
  const [sourceFeatureName, setSourceFeatureName] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (location.state?.initialText) {
      setInputText(location.state.initialText);
      if (location.state.documentName) {
        setSourceDocumentName(location.state.documentName);
      }
      if (location.state.sourceFeatureName) {
        setSourceFeatureName(location.state.sourceFeatureName);
      }
      const sourceTool = location.state.sourceFeatureName ? ` from ${location.state.sourceFeatureName}` : " from previous tool";
      const docName = location.state.documentName ? ` for "${location.state.documentName}"` : "";
      addToast(`Text loaded${sourceTool}${docName} into StealthWriter.`, 'info');
      
      if (location.state.sourceFeatureName) { 
        window.history.replaceState({}, document.title); 
      }
    }
  }, [location.state, addToast]);

  const rewriteActionOptions = Object.values(RewriteAction).map(mode => ({ value: mode, label: mode }));
  const toneOptions = Object.values(WritingTone).map(tone => ({ value: tone, label: tone }));

  const handleRewriteText = useCallback(async () => {
    if (!inputText.trim()) {
      addToast("Input text is empty. Please enter text to rewrite.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutputText('');

    let actionDescription = "";
    switch (rewriteAction) {
      case RewriteAction.HUMANIZE_SUBTLE:
        actionDescription = `The goal is to subtly vary sentence structures and vocabulary to make the text sound more natural and less like typical AI output. Focus on minor alterations that enhance readability and flow while strictly preserving the original meaning and information. Maintain a ${settings.writingTone} tone.`;
        break;
      case RewriteAction.HUMANIZE_MODERATE:
        actionDescription = `The goal is to moderately rewrite the text to enhance its human-like qualities and reduce AI detection characteristics. Employ a wider range of sentence structures, synonyms, and phrasing. Ensure the original meaning, key information, and arguments are accurately preserved. Maintain a ${settings.writingTone} tone.`;
        break;
      case RewriteAction.HUMANIZE_STRONG:
        actionDescription = `The goal is to significantly rewrite the text to maximize its natural, human-authored feel and minimize AI detection probability. This may involve more substantial paraphrasing, rephrasing of complex sentences, and diverse vocabulary usage. Critically, the core meaning, all essential information, and logical flow must be meticulously preserved. Maintain a ${settings.writingTone} tone.`;
        break;
      case RewriteAction.IMPROVE_CLARITY:
        actionDescription = `The goal is to improve clarity, conciseness, logical flow, and overall readability. Simplify complex sentences, remove jargon where possible (or explain it if essential), and ensure the core message is conveyed effectively. Maintain a ${settings.writingTone} tone.`;
        break;
      case RewriteAction.CHANGE_TONE:
        actionDescription = `Change the tone of the text to ${settings.writingTone}. Ensure the meaning is preserved while adapting the language, style, and attitude to reflect the new tone.`;
        break;
      case RewriteAction.CUSTOM:
        if (!customInstructions.trim()) {
            addToast("Custom instructions are empty.", "warning");
            setIsLoading(false);
            return;
        }
        actionDescription = `Follow these specific instructions for rewriting: "${customInstructions}". Maintain a ${settings.writingTone} tone unless specified otherwise in the custom instructions.`;
        break;
    }
    
    const prompt = `Original text:\n"""\n${inputText}\n"""\n\nRewrite Action: ${rewriteAction}\n${actionDescription}\n\nOutput ONLY the rewritten text. Do not include any preambles, apologies, or explanations about your process.`;

    const result = await generateText("", { ...settings, customPromptOverride: prompt });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setOutputText(result.text);
      addToast(`Text rewritten successfully using ${rewriteAction}!`, "success");
    }
    setIsLoading(false);
  }, [inputText, rewriteAction, settings, customInstructions, addToast]);

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'RewrittenText';
    return `${APP_NAME} - StealthWriter - ${safeBase}.${extension}`;
  };

  const handleCopyToClipboard = () => {
    if (!outputText) {
        addToast('Nothing to copy.', 'info');
        return;
    }
    navigator.clipboard.writeText(outputText);
    addToast('Rewritten text copied to clipboard!', 'success');
  };

  const handleDownloadText = () => {
    if (!outputText) {
      addToast('No rewritten text to download.', 'info');
      return;
    }
    const filename = getSafeFilename(sourceDocumentName || 'StealthWriterOutput', 'txt');
    downloadTextFile(outputText, filename);
    addToast('Rewritten text download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!outputText) {
      addToast('No rewritten text to save.', 'info');
      return;
    }
    const filename = getSafeFilename(sourceDocumentName || 'StealthWriterOutput', 'txt');
    openSaveToDriveModal(outputText, filename);
  };


  const handleClearAll = () => {
    setInputText('');
    setOutputText('');
    setCustomInstructions('');
    setSourceDocumentName(undefined);
    setSourceFeatureName(undefined);
    setError(null);
    addToast('Input and output cleared.', 'info');
  };

  const effectiveDocumentName = sourceDocumentName || "Rewritten Text";


  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <EditIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          StealthWriter
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Refine your writing with nuanced control. Paraphrase, improve clarity, change tone, or humanize text.</p>
      </header>

      <Card title="Rewrite Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Rewrite Action"
            options={rewriteActionOptions}
            value={rewriteAction}
            onChange={(e) => setRewriteAction(e.target.value as RewriteAction)}
          />
          <Select
            label="Target Writing Tone"
            options={toneOptions}
            value={settings.writingTone}
            onChange={(e) => updateSettings({ writingTone: e.target.value as WritingTone })}
            disabled={rewriteAction === RewriteAction.CHANGE_TONE && settings.writingTone === WritingTone.ACADEMIC}
          />
        </div>
        {rewriteAction === RewriteAction.CUSTOM && (
             <div className="mt-4">
                <label htmlFor="customInstructions" className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">
                Custom Rewrite Instructions
                </label>
                <textarea
                id="customInstructions"
                rows={3}
                className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
                placeholder="e.g., Make it sound more persuasive, shorten by 20%, explain for a non-expert audience."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                aria-label="Custom rewrite instructions"
                />
            </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={sourceFeatureName ? `Original Text (from ${sourceFeatureName})` : "Original Text"}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={12}
            className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
            placeholder="Paste your text here or use 'Send to Tool' from another feature..."
            aria-label="Original text input"
          />
        </Card>
        <Card title="Rewritten Text">
          <div aria-live="polite" aria-busy={isLoading} className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[240px]">
              <Spinner text="StealthWriter is artfully rephrasing your text..." />
            </div>
          ) : outputText ? (
            <>
              <textarea
                readOnly
                value={outputText}
                rows={12}
                className="w-full h-full p-2.5 border rounded-md bg-muted/50 dark:bg-dark-input/30 dark:text-dark-foreground dark:border-dark-border whitespace-pre-wrap transition-all"
                aria-label="Rewritten text"
              />
              <div className="mt-3 flex flex-wrap gap-2 justify-between items-center">
                 <SendToToolDropdown 
                    textToShare={outputText} 
                    documentName={effectiveDocumentName}
                    sourceFeatureName="StealthWriter"
                  />
                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground dark:text-dark-muted-foreground mr-1">Helpful?</span>
                    <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-primary"><ThumbsUpIcon /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-destructive"><ThumbsDownIcon /></Button>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button onClick={handleCopyToClipboard} variant="outline" size="sm">Copy</Button>
                  <Button onClick={handleDownloadText} variant="outline" size="sm">Download as .txt</Button>
                  <Button onClick={handleSaveToDrive} variant="outline" size="sm">Save to Google Drive</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-muted-foreground dark:text-dark-muted-foreground p-4 text-center">
              <SparklesIcon className="h-12 w-12 text-primary/30 dark:text-dark-primary/30 mb-4" />
              <p className="font-semibold">Ready for Transformation</p>
              <p className="text-sm mt-1">Enter your original text, choose a rewrite action, and let StealthWriter work its magic.</p>
            </div>
          )}
          </div>
        </Card>
      </div>

      {error && !isLoading && <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive"><p className="font-semibold">Error Rewriting</p><p className="text-sm">{error}</p></Card>}

      <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-y-2 sm:space-y-0 sm:space-x-3">
        <Button onClick={handleRewriteText} isLoading={isLoading} disabled={!inputText.trim()} size="lg">
          Rewrite Text
        </Button>
        {(inputText || outputText) && (
             <Button onClick={handleClearAll} variant="outline" size="lg" disabled={isLoading}>
                Clear All Fields
             </Button>
        )}
      </div>
    </div>
  );
};

export default StealthWriterPage;