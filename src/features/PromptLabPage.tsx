

import React, { useState, useCallback, useEffect } from 'react';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import SparklesIcon from '../components/icons/SparklesIcon';
import Select from '../components/common/Select';
import { AcademicLevel, WritingTone, FormattingStyle, ProjectScope, SavedPrompt } from '../types'; 
import { useToast } from '../hooks/useToast'; 
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 
import Input from '../components/common/Input'; 
import SaveIcon from '../components/icons/SaveIcon'; 
import TrashIcon from '../components/icons/TrashIcon';
import { GEMINI_TEXT_MODEL } from '../constants';

const examplePromptsList = [
  { name: "Concept Explainer", text: "Explain the concept of [specific concept, e.g., quantum entanglement] in simple terms for a beginner." },
  { name: "Research Questions", text: "Generate three potential research questions about [broad topic, e.g., climate change impacts on agriculture in West Africa]." },
  { name: "Abstract Draft", text: "Draft a short abstract (around 150 words) for a paper titled '[Your Tentative Paper Title]'." },
  { name: "Keyword Suggester", text: "Suggest five relevant keywords for a study on [your research area, e.g., artificial intelligence in healthcare diagnostics]." },
  { name: "Lit Review Outline", text: "Provide a brief outline for a literature review on [specific theme, e.g., the history of feminist theory]." },
  { name: "Compare & Contrast", text: "Compare and contrast [theory A, e.g., Keynesian economics] with [theory B, e.g., Monetarism]." },
  { name: "Methodology Challenges", text: "What are some common methodological challenges when researching [type of study, e.g., social media usage patterns]?" },
];

const LOCAL_STORAGE_KEY_PROMPTS = 'sharon-savedPrompts';

const PromptLabPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToast(); 
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptName, setPromptName] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  const [temperature, setTemperature] = useState<number>(0.75);
  const [topK, setTopK] = useState<number>(40);
  const [topP, setTopP] = useState<number>(0.95);
  const [thinkingBudget, setThinkingBudget] = useState<number | undefined>(undefined);

  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem(LOCAL_STORAGE_KEY_PROMPTS);
      if (storedPrompts) {
        setSavedPrompts(JSON.parse(storedPrompts));
      }
    } catch (e) {
      console.error("Failed to load saved prompts:", e);
      addToast("Could not load saved prompts.", "error");
    }
  }, [addToast]);

  const academicLevelOptions = Object.values(AcademicLevel).map(level => ({ value: level, label: level }));
  const toneOptions = Object.values(WritingTone).map(tone => ({ value: tone, label: tone }));
  const styleOptions = Object.values(FormattingStyle).map(style => ({ value: style, label: style }));
  const projectScopeOptions = Object.values(ProjectScope).map(scope => ({ value: scope, label: scope })); 

  const handleExamplePromptClick = (exampleText: string) => {
    setPrompt(exampleText);
    setPromptName(''); 
  };

  const handleSubmitPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      addToast("Prompt cannot be empty.", "warning"); 
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutput('');

    const generationOptions: any = {
      ...settings,
      temperature,
      topK,
      topP,
      thinkingBudget,
    };


    const result = await generateText(prompt, generationOptions);

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error"); 
    } else {
      setOutput(result.text);
      addToast("AI response received!", "success"); 
    }
    setIsLoading(false);
  }, [prompt, settings, temperature, topK, topP, thinkingBudget, addToast]);

  const handleSavePrompt = () => {
    if (!prompt.trim()) {
      addToast("Cannot save an empty prompt.", "warning");
      return;
    }
    if (!promptName.trim()) {
      addToast("Please enter a name for your prompt.", "warning");
      return;
    }
    const newSavedPrompt: SavedPrompt = { id: crypto.randomUUID(), name: promptName, text: prompt };
    const updatedPrompts = [...savedPrompts, newSavedPrompt];
    setSavedPrompts(updatedPrompts);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROMPTS, JSON.stringify(updatedPrompts));
    addToast(`Prompt "${promptName}" saved!`, "success");
    setPromptName(''); 
  };

  const handleLoadPrompt = (savedPrompt: SavedPrompt) => {
    setPrompt(savedPrompt.text);
    setPromptName(savedPrompt.name);
    addToast(`Prompt "${savedPrompt.name}" loaded.`, "info");
  };

  const handleDeletePrompt = (idToDelete: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== idToDelete);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROMPTS, JSON.stringify(updatedPrompts));
    addToast("Prompt deleted.", "info");
  };
  
  const getSafeFilename = (base: string, extension: string) => {
    const shortPrompt = base.substring(0, 30).replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
    const safeBase = shortPrompt || 'PromptLabOutput';
    return `${APP_NAME} - PromptLab - ${safeBase}.${extension}`;
  };

  const handleDownloadOutput = () => {
    if (!output) {
      addToast('No output to download.', 'info');
      return;
    }
    const filename = getSafeFilename(prompt, 'txt');
    downloadTextFile(output, filename);
    addToast('Output download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!output) {
      addToast('No output to save.', 'info');
      return;
    }
    const filename = getSafeFilename(prompt, 'txt');
    openSaveToDriveModal(output, filename);
  };

  const handleCopyToClipboard = () => {
    if (!output) {
        addToast('Nothing to copy.', 'info');
        return;
    }
    navigator.clipboard.writeText(output);
    addToast('Output copied to clipboard!', 'success');
  };

  const handleClearAll = () => {
    setPrompt('');
    setOutput('');
    setPromptName('');
    setError(null);
    addToast('Prompt and output cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <SparklesIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Prompt Lab
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Experiment with prompts, see direct AI responses, and save your favorites. Configure global settings below.</p>
      </header>

      <Card title="Global AI Settings for Lab">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="Academic Level" name="academicLevel" options={academicLevelOptions} value={settings.academicLevel} onChange={(e) => updateSettings({ academicLevel: e.target.value as AcademicLevel })} />
          <Select label="Writing Tone" name="writingTone" options={toneOptions} value={settings.writingTone} onChange={(e) => updateSettings({ writingTone: e.target.value as WritingTone })} />
          <Select label="Formatting Style (Guidance)" name="formattingStyle" options={styleOptions} value={settings.formattingStyle} onChange={(e) => updateSettings({ formattingStyle: e.target.value as FormattingStyle })} />
          <Input label="Current Subject" name="currentSubject" placeholder="e.g., Physics, Literature" value={settings.currentSubject || ''} onChange={(e) => updateSettings({ currentSubject: e.target.value })} />
          <Select label="Project Scope" name="projectScope" options={projectScopeOptions} value={settings.projectScope} onChange={(e) => updateSettings({ projectScope: e.target.value as ProjectScope})} />
          <Input label="Target Word Count" name="targetWordCount" type="number" placeholder="e.g., 500" value={settings.targetWordCount === undefined ? '' : settings.targetWordCount} onChange={(e) => updateSettings({ targetWordCount: e.target.value ? parseInt(e.target.value, 10) : undefined })} />
        </div>
      </Card>

      <Card title="Model Configuration (Optional)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Temperature (0-1)" type="number" step="0.05" min="0" max="1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
            <Input label="Top-K (Integer)" type="number" step="1" min="1" value={topK} onChange={e => setTopK(parseInt(e.target.value))} />
            <Input label="Top-P (0-1)" type="number" step="0.05" min="0" max="1" value={topP} onChange={e => setTopP(parseFloat(e.target.value))} />
             {GEMINI_TEXT_MODEL === "gemini-2.5-flash" && ( 
                <Input label="Thinking Budget (0-1, Flash Only)" type="number" step="0.05" min="0" max="1" value={thinkingBudget === undefined ? '' : thinkingBudget} onChange={e => setThinkingBudget(e.target.value === '' ? undefined : parseFloat(e.target.value))} title="0 disables thinking (low latency), omit for default (higher quality)." />
             )}
        </div>
        <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground mt-2">Adjust these for more fine-grained control. For "Thinking Budget", 0 usually means lower latency (Flash model specific).</p>
      </Card>
      
      <Card title="Enter Your Prompt">
        <div className="mb-3">
            <label className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">Example Prompts:</label>
            <div className="flex flex-wrap gap-2">
                {examplePromptsList.map((ex, idx) => (
                    <Button key={idx} variant="outline" size="sm" onClick={() => handleExamplePromptClick(ex.text)} className="text-xs" title={ex.text}>
                        {ex.name}
                    </Button>
                ))}
            </div>
        </div>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all" placeholder="Type your detailed prompt here..." aria-label="Prompt input" />
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input name="promptName" placeholder="Name this prompt to save" value={promptName} onChange={(e) => setPromptName(e.target.value)} className="flex-grow sm:min-w-[200px] h-9" />
                <Button onClick={handleSavePrompt} variant="outline" size="sm" title="Save current prompt" disabled={!prompt.trim() || !promptName.trim()} className="h-9">
                    <SaveIcon className="h-4 w-4 mr-1.5"/> Save
                </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
                 <Button onClick={handleClearAll} variant="outline" className="h-9">Clear</Button>
                 <Button onClick={handleSubmitPrompt} isLoading={isLoading} disabled={!prompt.trim()} className="h-9">Send Prompt</Button>
            </div>
        </div>
      </Card>

      {savedPrompts.length > 0 && (
        <Card title="Your Saved Prompts">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {savedPrompts.map(sp => (
                    <div key={sp.id} className="flex items-center justify-between p-2.5 border rounded-md bg-muted/30 dark:bg-dark-muted/30 border-border dark:border-dark-border hover:shadow-sm transition-shadow">
                        <div className="flex-grow cursor-pointer mr-2" onClick={() => handleLoadPrompt(sp)} title={`Load: ${sp.name}`}>
                            <p className="text-sm font-medium text-foreground dark:text-dark-foreground">{sp.name}</p>
                            <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground truncate" title={sp.text}>{sp.text}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button onClick={() => handleLoadPrompt(sp)} variant="ghost" size="sm" title="Load this prompt" className="p-1.5 text-primary hover:bg-primary/10">
                            Load
                          </Button>
                          <Button onClick={() => handleDeletePrompt(sp.id)} variant="ghost" size="icon" title="Delete this prompt" className="ml-1 p-1.5 text-destructive hover:bg-destructive/10">
                              <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      )}
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="AI is crafting a response..." />}
        {error && !isLoading && <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive"><p className="font-semibold">Error</p><p className="text-sm">{error}</p></Card>}

        {!isLoading && !output && !error && !prompt.trim() && (
             <Card>
                <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                    <SparklesIcon className="h-12 w-12 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                    <p className="font-semibold text-lg">Ready to Experiment</p>
                    <p className="text-sm">Enter a prompt, select an example, or load a saved prompt to get started.</p>
                </div>
             </Card>
         )}
         
        {!isLoading && output && (
          <Card title="AI Response">
            <pre className="whitespace-pre-wrap p-4 bg-muted/50 dark:bg-dark-muted/50 rounded-md text-sm text-foreground dark:text-dark-foreground overflow-x-auto min-h-[100px]">
              {output}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm">Copy Output</Button>
              <Button onClick={handleDownloadOutput} variant="outline" size="sm">Download .txt</Button>
              <Button onClick={handleSaveToDrive} variant="outline" size="sm">Save to Google Drive</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PromptLabPage;