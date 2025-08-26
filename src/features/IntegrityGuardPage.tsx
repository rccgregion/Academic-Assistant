
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import EditIcon from '../components/icons/EditIcon'; 
import { useToast } from '../hooks/useToast';
import { PlagiarismAnalysis, PlagiarismSegment } from '../types';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 


const IntegrityGuardPage: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<PlagiarismAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (location.state?.initialText) {
      setInputText(location.state.initialText);
      const docName = location.state.documentName ? ` from "${location.state.documentName}"` : "";
      setSourceDocumentName(location.state.documentName);
      addToast(`Text loaded${docName} into IntegrityGuard.`, 'info');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  const handleCheckIntegrity = useCallback(async () => {
    if (!inputText.trim()) {
      addToast("Input text is empty. Please enter text to analyze.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    let prompt = `Analyze the following text for originality and academic integrity.
Provide a simulated "originality score" between 0 and 100, where 100 is perfectly original.
Identify specific sentences or short phrases (segments) that seem very common, unoriginal, or might require citation if they are not common knowledge or properly attributed. For each segment, provide the text of the segment and a brief suggestion for review.
Provide a brief overall summary message.`;

    if (settings.geographicRegion === 'Nigeria') {
        prompt += `\nConsider the Nigerian academic context: be aware of common Nigerian academic writing styles or phrases that might be acceptable locally versus those indicating plagiarism, while still upholding global academic integrity standards.`;
    }

    prompt += `
Output the result as a single JSON object with the following keys:
- "overallScore": A number representing the simulated originality score (e.g., 85).
- "segmentsToReview": An array of objects, where each object has:
    - "originalText": The exact text of the segment identified.
    - "suggestion": A brief suggestion (e.g., "This phrase is common, consider rephrasing or citing if specific.", "Review for potential citation.").
- "summaryMessage": A brief overall summary of the findings.

Example of a segment object:
{ "originalText": "The quick brown fox jumps over the lazy dog.", "suggestion": "This is a very common pangram, ensure it's used appropriately." }

Text to Analyze:
"""
${inputText}
"""

Ensure the output is ONLY a valid JSON object.`;

    const result = await generateText("", {
      ...settings,
      responseMimeType: "application/json",
      customPromptOverride: prompt,
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      const parsedAnalysis = parseJsonFromText<PlagiarismAnalysis>(result.text);
      if (parsedAnalysis && typeof parsedAnalysis.overallScore === 'number' && Array.isArray(parsedAnalysis.segmentsToReview)) {
        setAnalysisResult(parsedAnalysis);
        addToast("Integrity check complete!", "success");
      } else {
        setError("AI returned data in an unexpected format. Could not parse analysis.");
        addToast("Failed to parse AI response into structured analysis.", "error");
        setAnalysisResult({ 
            overallScore: 0, 
            segmentsToReview: [{originalText: "Error parsing response.", suggestion: "AI output was not valid JSON."}], 
            summaryMessage:"Could not retrieve structured analysis from AI." 
        });
      }
    }
    setIsLoading(false);
  }, [inputText, settings, addToast]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-destructive dark:text-red-500';
  };

  const handleRewriteWithStealthWriter = (segmentText: string) => {
    navigate('/stealth-writer', { state: { initialText: segmentText, sourceFeatureName: 'IntegrityGuard', documentName: sourceDocumentName } });
  };

  const formatAnalysisForDownload = (analysis: PlagiarismAnalysis): string => {
    let content = `IntegrityGuard Analysis Report\n=============================\n\n`;
    content += `Original Text Analyzed:\n-------------------------\n${inputText}\n\n`;
    content += `Simulated Originality Score: ${analysis.overallScore}%\n`;
    content += `Summary Message: ${analysis.summaryMessage || 'N/A'}\n\n`;
    if (analysis.segmentsToReview.length > 0) {
      content += `Segments to Review:\n---------------------\n`;
      analysis.segmentsToReview.forEach((segment, index) => {
        content += `Segment ${index + 1}:\n`;
        content += `  Text: "${segment.originalText}"\n`;
        content += `  Suggestion: ${segment.suggestion}\n\n`;
      });
    } else {
      content += `No specific segments flagged for review.\n`;
    }
    return content;
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'IntegrityReport';
    return `${APP_NAME} - IntegrityGuard - ${safeBase}.${extension}`;
  };

  const handleDownloadAnalysis = () => {
    if (!analysisResult) {
      addToast('No analysis to download.', 'info');
      return;
    }
    const content = formatAnalysisForDownload(analysisResult);
    const filename = getSafeFilename(sourceDocumentName || 'Analysis', 'txt');
    downloadTextFile(content, filename);
    addToast('Analysis download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!analysisResult) {
      addToast('No analysis to save.', 'info');
      return;
    }
    const content = formatAnalysisForDownload(analysisResult);
    const filename = getSafeFilename(sourceDocumentName || 'Analysis', 'txt');
    openSaveToDriveModal(content, filename);
  };

  const handleClearAll = () => {
    setInputText('');
    setAnalysisResult(null);
    setError(null);
    setSourceDocumentName(undefined);
    addToast('Input and analysis cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <ShieldCheckIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          IntegrityGuard
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Get a simulated originality check on your text and identify areas that might need review or citation.
        </p>
      </header>

      <Card title="Input Text for Integrity Check">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={12}
          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
          placeholder="Paste your text here or upload via Document Lab..."
          aria-label="Text input for integrity check"
        />
        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
           {(inputText || analysisResult) && (
            <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
              Clear All Fields
            </Button>
          )}
          <Button onClick={handleCheckIntegrity} isLoading={isLoading} disabled={!inputText.trim()} className="w-full sm:w-auto">
            Check Integrity
          </Button>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Guarding integrity by analyzing your text..." />}
        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error During Analysis</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {!isLoading && !analysisResult && !inputText.trim() && !error && (
            <Card>
                <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                    <ShieldCheckIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                    <p className="font-semibold text-lg">Ready to Guard Your Integrity</p>
                    <p className="text-sm">Paste your text above to begin the analysis for potential originality issues.</p>
                </div>
            </Card>
        )}

        {!isLoading && analysisResult && (
          <Card title="Integrity Analysis Results">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2">
              <Button onClick={handleDownloadAnalysis} variant="outline" size="sm" className="w-full sm:w-auto">Download Analysis</Button>
              <Button onClick={handleSaveToDrive} variant="outline" size="sm" className="w-full sm:w-auto">Save Analysis to Google Drive</Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-1 text-foreground dark:text-dark-foreground">
                  Simulated Originality Score: 
                  <span className={`ml-2 ${getScoreColor(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}%
                  </span>
                </h3>
                {analysisResult.summaryMessage && (
                  <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{analysisResult.summaryMessage}</p>
                )}
              </div>

              {analysisResult.segmentsToReview.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-foreground dark:text-dark-foreground">Segments to Review:</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {analysisResult.segmentsToReview.map((segment, index) => (
                      <div key={index} className="p-3 border rounded-md bg-muted/50 dark:bg-dark-muted/30 border-border dark:border-dark-border">
                        <p className="text-sm text-foreground dark:text-dark-foreground italic">"{segment.originalText}"</p>
                        <p className="mt-1 text-xs text-primary dark:text-dark-primary font-medium">Suggestion: {segment.suggestion}</p>
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRewriteWithStealthWriter(segment.originalText)}
                            className="text-xs text-secondary dark:text-dark-secondary hover:bg-secondary/10 dark:hover:bg-dark-secondary/20"
                          >
                            <EditIcon className="h-3.5 w-3.5 mr-1.5" />
                            Rewrite with StealthWriter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysisResult.segmentsToReview.length === 0 && analysisResult.overallScore > 0 && (
                  <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">No specific segments were flagged for review based on the current analysis.</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IntegrityGuardPage;