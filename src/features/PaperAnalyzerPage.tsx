

import React, { useState, useCallback, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import DocumentMagnifyingGlassIcon from '../components/icons/DocumentMagnifyingGlassIcon';
import { useToast } from '../hooks/useToast';
import { PaperAnalysis } from '../types'; 
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 
import ThumbsUpIcon from '../components/icons/ThumbsUpIcon';
import ThumbsDownIcon from '../components/icons/ThumbsDownIcon';
import SparklesIcon from '../components/icons/SparklesIcon'; 

const PaperAnalyzerPage: React.FC = () => {
  const { settings } = useSettings();
  const location = ReactRouterDOM.useLocation();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [paperText, setPaperText] = useState('');
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined);
  
  const [elaboration, setElaboration] = useState<string | null>(null);
  const [isElaborating, setIsElaborating] = useState(false);
  const [focusedItemText, setFocusedItemText] = useState<string | null>(null);


  useEffect(() => {
    if (location.state?.initialText) {
      setPaperText(location.state.initialText);
      if (location.state.documentName) {
        setSourceDocumentName(location.state.documentName);
      }
      const docName = location.state.documentName ? ` from "${location.state.documentName}"` : "";
      const sourceTool = location.state.sourceFeatureName ? ` from ${location.state.sourceFeatureName}` : "";
      addToast(`Text loaded${sourceTool}${docName} into Paper Analyzer.`, 'info');
      window.history.replaceState({}, document.title); // Clear location state after processing
    }
  }, [location.state, addToast]);

  const handleAnalyzePaper = useCallback(async () => {
    if (!paperText.trim()) {
      setError("Please paste the text of the research paper to analyze.");
      addToast("Please paste paper text.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setElaboration(null);
    setFocusedItemText(null);

    const prompt = `You are an expert academic paper analyzer. Analyze the following research paper text.
Please provide a structured analysis in JSON format with the following keys:
- "summary": A concise summary of the paper (around 200-300 words), covering purpose, methods, key findings, and conclusions.
- "keyFindings": A bulleted list of the main findings or results (3-5 key points). If providing a list, use an array of strings.
- "methodology": A brief description of the methodology used in the research (1-2 paragraphs), including design, participants/sample, and data collection tools/procedures.
- "limitations": A bulleted list of limitations identified by the authors or apparent from the text (2-4 key points). If providing a list, use an array of strings.
- "identifiedGaps": A bulleted list or a short paragraph describing any research gaps explicitly mentioned or strongly implied by the authors that their research addresses or that remain. If providing a list, use an array of strings. If none clearly identified, state so.
- "suggestedFutureResearch": Based on the paper's findings and limitations, suggest 1-2 potential avenues for future research. If providing a list, use an array of strings.

Ensure the output is ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.

Paper Text:
"""
${paperText}
"""`;

    const result = await generateText("", { 
        ...settings, 
        responseMimeType: "application/json",
        customPromptOverride: prompt 
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      const parsedAnalysis = parseJsonFromText<PaperAnalysis>(result.text);
      if (parsedAnalysis) {
        setAnalysis(parsedAnalysis);
        addToast("Paper analysis complete with detailed insights!", "success");
      } else {
        setError("AI returned data in an unexpected format. Could not parse analysis. Displaying raw output if available.");
        addToast("Failed to parse AI response into structured analysis.", "error");
        setAnalysis({ 
            summary: "Raw AI Output (JSON parsing failed):\n" + result.text, 
            keyFindings: [], 
            methodology: "", 
            limitations: [],
            identifiedGaps: "Could not parse from AI response.",
            suggestedFutureResearch: "Could not parse from AI response."
        });
      }
    }
    setIsLoading(false);
  }, [paperText, settings, addToast]);
  
  const handleDigDeeper = async (itemText: string) => {
    if (!paperText.trim()) {
        addToast("Original paper text is missing for elaboration.", "warning");
        return;
    }
    setIsElaborating(true);
    setFocusedItemText(itemText);
    setElaboration(null); 
    
    const prompt = `Based on the original paper text provided below, please elaborate on the following specific point: "${itemText}". Provide a more detailed explanation, context, or implications related to this point as found in or directly derivable from the paper.
    Output only the elaboration.

    Original Paper Text:
    """
    ${paperText}
    """

    Elaboration on "${itemText}":`;

    const result = await generateText("", { ...settings, customPromptOverride: prompt });
    if (result.error) {
        addToast(`Error elaborating: ${result.error}`, "error");
        setElaboration(`Failed to elaborate on "${itemText}".`);
    } else {
        setElaboration(result.text);
        addToast(`Elaboration for "${itemText.substring(0,30)}..." ready.`, "success");
    }
    setIsElaborating(false);
  };

  const renderListOrTextToString = (items: string[] | string | undefined, title: string, defaultText: string = "Not provided."): string => {
    if (items === undefined || items === null) return `${title}: ${defaultText}\n`;
    if (typeof items === 'string') {
        return items.trim() === '' ? `${title}: ${defaultText}\n` : `${title}:\n${items}\n`;
    }
    if (items.length === 0) return `${title}: None listed.\n`;
    return `${title}:\n${items.map(item => `- ${item}`).join('\n')}\n`;
  };

  const formatAnalysisForDownload = (analysisData: PaperAnalysis): string => {
    if (!analysisData) return "No analysis data available.";
    let content = `Paper Analysis Report\n=========================\n\n`;
    content += `Summary:\n${analysisData.summary || "Not provided."}\n\n`;
    content += renderListOrTextToString(analysisData.keyFindings, "Key Findings");
    content += `Methodology:\n${analysisData.methodology || "Not described."}\n\n`;
    content += renderListOrTextToString(analysisData.limitations, "Limitations");
    content += renderListOrTextToString(analysisData.identifiedGaps, "Identified Research Gaps", "No specific gaps highlighted.");
    content += renderListOrTextToString(analysisData.suggestedFutureResearch, "Suggested Future Research", "No specific future research suggestions provided or parsed.");
    if (elaboration && focusedItemText) {
        content += `\nElaboration on "${focusedItemText}":\n${elaboration}\n`;
    }
    return content;
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'PaperAnalysis';
    return `${APP_NAME} - PaperAnalyzer - ${safeBase}.${extension}`;
  };

  const handleDownloadAnalysis = () => {
    if (!analysis) {
      addToast('No analysis to download.', 'info');
      return;
    }
    const content = formatAnalysisForDownload(analysis);
    const filename = getSafeFilename(sourceDocumentName || 'Analysis', 'txt');
    downloadTextFile(content, filename);
    addToast('Analysis download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!analysis) {
      addToast('No analysis to save.', 'info');
      return;
    }
    const content = formatAnalysisForDownload(analysis);
    const filename = getSafeFilename(sourceDocumentName || 'Analysis', 'txt');
    openSaveToDriveModal(content, filename);
  };

   const handleClearAll = () => {
    setPaperText('');
    setAnalysis(null);
    setError(null);
    setElaboration(null);
    setFocusedItemText(null);
    setSourceDocumentName(undefined);
    addToast('Input and analysis cleared.', 'info');
  };
  
  const renderListOrTextWithDigDeeper = (items: string[] | string | undefined, listType: string, defaultText: string = "Not provided."): React.ReactNode => {
    if (items === undefined || items === null) return <p className="text-muted-foreground dark:text-dark-muted-foreground">{defaultText}</p>;
    if (typeof items === 'string') {
        return items.trim() === '' ? <p className="text-muted-foreground dark:text-dark-muted-foreground">{defaultText}</p> : <p className="whitespace-pre-wrap">{items}</p>;
    }
    if (items.length === 0) return <p className="text-muted-foreground dark:text-dark-muted-foreground">None listed.</p>;
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={`${listType}-${index}`} className="flex items-start justify-between group">
            <span>{item}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDigDeeper(item)}
              className="ml-2 p-1 opacity-50 group-hover:opacity-100 transition-opacity text-primary dark:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/20"
              title={`Dig deeper into: ${item.substring(0,50)}...`}
              disabled={isElaborating && focusedItemText === item}
            >
                {isElaborating && focusedItemText === item ? <Spinner size="sm" /> : <SparklesIcon className="h-4 w-4" />}
            </Button>
          </li>
        ))}
      </ul>
    );
  };
  const renderListOrText = (items: string[] | string | undefined, defaultText: string = "Not provided."): React.ReactNode => {
    if (items === undefined || items === null) return <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{defaultText}</p>;
    if (typeof items === 'string') {
        return items.trim() === '' 
            ? <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{defaultText}</p> 
            : <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-wrap">{items}</p>;
    }
    if (items.length === 0) return <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">None listed.</p>;
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground dark:text-dark-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };
  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <DocumentMagnifyingGlassIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Paper Analyzer
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Get a detailed AI-powered analysis of any research paper.</p>
      </header>

      <Card title="Paste Research Paper Text">
        <textarea
          value={paperText}
          onChange={(e) => setPaperText(e.target.value)}
          rows={12}
          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
          placeholder="Paste the abstract, introduction, or full text of a research paper here..."
          aria-label="Research paper text input"
        />
        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
            Clear All
          </Button>
          <Button onClick={handleAnalyzePaper} isLoading={isLoading} disabled={!paperText.trim()} className="w-full sm:w-auto">
            Analyze Paper
          </Button>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading || isElaborating}>
        {(isLoading) && <Spinner text="Analyzing paper for key insights..." />}
        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error Analyzing Paper</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {!isLoading && !analysis && !error && !paperText.trim() && (
          <Card>
            <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
              <DocumentMagnifyingGlassIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
              <p className="font-semibold text-lg">Ready to Analyze</p>
              <p className="text-sm">Paste your paper text above to receive a structured analysis.</p>
            </div>
          </Card>
        )}

        {!isLoading && analysis && (
          <Card title="Paper Analysis">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2">
              <Button onClick={handleDownloadAnalysis} variant="outline" size="sm" className="w-full sm:w-auto">Download Analysis</Button>
              <Button onClick={handleSaveToDrive} variant="outline" size="sm" className="w-full sm:w-auto">Save to Google Drive</Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-wrap">{analysis.summary || "Not provided."}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Key Findings</h3>
                {renderListOrTextWithDigDeeper(analysis.keyFindings, 'finding')}
              </div>
              
              {elaboration && (
                <Card title={`Elaboration on: "${focusedItemText}"`} className="my-3 bg-primary/5 dark:bg-dark-primary/10">
                    {isElaborating ? <Spinner size="sm"/> : <p className="text-sm whitespace-pre-line">{elaboration}</p>}
                </Card>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-1">Methodology</h3>
                <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-wrap">{analysis.methodology || "Not described."}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Limitations</h3>
                {renderListOrTextWithDigDeeper(analysis.limitations, 'limitation')}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Identified Research Gaps</h3>
                {renderListOrText(analysis.identifiedGaps, "No specific gaps highlighted.")}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Suggested Future Research</h3>
                {renderListOrText(analysis.suggestedFutureResearch, "No specific future research suggestions provided.")}
              </div>
              <div className="pt-2 flex justify-end">
                 <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground dark:text-dark-muted-foreground mr-1">Helpful?</span>
                    <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-primary"><ThumbsUpIcon /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-destructive"><ThumbsDownIcon /></Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaperAnalyzerPage;