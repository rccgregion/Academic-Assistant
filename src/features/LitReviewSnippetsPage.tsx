import React, { useState, useCallback } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import ClipboardDocumentListIcon from '../components/icons/ClipboardDocumentListIcon';
import { LitReviewSnippet, GroundingChunk } from '../types';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext';
import { downloadTextFile } from '../utils/downloadHelper';
import { APP_NAME } from '../constants';

const LitReviewSnippetsPage: React.FC = () => {
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave();

  const [topic, setTopic] = useState('');
  const [snippets, setSnippets] = useState<LitReviewSnippet[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponseForDebug, setRawResponseForDebug] = useState<string | null>(null);

  const handleGenerateSnippets = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a research topic or question.");
      addToast("Topic is required.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSnippets([]);
    setSources([]);
    setRawResponseForDebug(null);

    const prompt = `For the research topic: "${topic}", find and summarize 3-5 key academic articles or findings using web search grounding.
For each, provide:
1.  "title": The original article title (or a descriptive title for the finding).
2.  "snippetText": A concise summary snippet (2-4 sentences) of its main contribution or finding related to the topic.
3.  "sourceUrl": The primary URL of the source, if available from your search grounding.
4.  "sourceTitle": The title of the webpage/document at the sourceUrl, if available from your search grounding.

Format the output as a single JSON array of objects, where each object has these four keys.
Ensure the JSON is valid. Do not include any introductory or concluding text outside of the JSON object itself.`;

    const result = await generateText("", {
      ...settings,
      useGrounding: true,
      customPromptOverride: prompt
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      if (result.sources && result.sources.length > 0) {
        setSources(result.sources);
      }
      const parsedSnippets = parseJsonFromText<LitReviewSnippet[]>(result.text);
      if (parsedSnippets && Array.isArray(parsedSnippets)) {
        // Attempt to map grounding chunk URLs to snippets if AI didn't include them
        const enhancedSnippets = parsedSnippets.map((snippet, index) => {
          if ((!snippet.sourceUrl || !snippet.sourceTitle) && result.sources && result.sources[index]) {
             const sourceInfo = result.sources[index].web || result.sources[index].retrievedContext;
             return {
                ...snippet,
                sourceUrl: snippet.sourceUrl || sourceInfo?.uri,
                sourceTitle: snippet.sourceTitle || sourceInfo?.title,
             };
          }
          return snippet;
        });
        setSnippets(enhancedSnippets);
        addToast(`Generated ${enhancedSnippets.length} literature snippets!`, "success");
      } else {
        setError("AI returned data in an unexpected format. Could not parse snippets. Raw response available for download.");
        addToast("Failed to parse AI response into structured snippets.", "error");
        setRawResponseForDebug(result.text); // Store raw response for debugging/download
      }
    }
    setIsLoading(false);
  }, [topic, settings, addToast]);

  const formatSnippetsForDownload = (snippetData: LitReviewSnippet[], sourceList: GroundingChunk[], rawResp: string | null): string => {
    let content = `Literature Review Snippets for Topic: ${topic}\n`;
    content += `==============================================\n\n`;
    if (snippetData.length > 0) {
      snippetData.forEach((item, index) => {
        content += `Snippet ${index + 1}:\n`;
        content += `  Title: ${item.title || 'N/A'}\n`;
        content += `  Snippet: ${item.snippetText || 'N/A'}\n`;
        if (item.sourceUrl) {
          content += `  Source: ${item.sourceTitle || item.sourceUrl} (${item.sourceUrl})\n`;
        }
        content += `----------------------------------------------\n\n`;
      });
    } else if (rawResp) {
        content += `Could not parse snippets. Raw AI response:\n${rawResp}\n\n`;
    } else {
        content += `No snippets were generated or parsed.\n\n`;
    }
    
    if (sourceList.length > 0 && !snippetData.some(s => s.sourceUrl)) { // Show grounding sources if not in snippets
      content += "\nGrounding Sources Retrieved by AI:\n";
      sourceList.forEach((sourceItem, index) => {
        const sourceInfo = sourceItem.web || sourceItem.retrievedContext;
        if (sourceInfo && sourceInfo.uri) {
          content += `${index + 1}. ${sourceInfo.title || sourceInfo.uri} (${sourceInfo.uri})\n`;
        }
      });
    }
    return content;
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'LitReview';
    return `${APP_NAME}_LitReviewSnippets_${safeBase}.${extension}`;
  };

  const handleDownloadSnippets = () => {
    if (snippets.length === 0 && !rawResponseForDebug) {
      addToast('No snippets to download.', 'info');
      return;
    }
    const content = formatSnippetsForDownload(snippets, sources, rawResponseForDebug);
    const filename = getSafeFilename(topic, 'txt');
    downloadTextFile(content, filename);
    addToast('Snippets download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (snippets.length === 0 && !rawResponseForDebug) {
      addToast('No snippets to save.', 'info');
      return;
    }
    const content = formatSnippetsForDownload(snippets, sources, rawResponseForDebug);
    const filename = getSafeFilename(topic, 'txt');
    openSaveToDriveModal(content, filename);
  };

  const handleClearAll = () => {
    setTopic('');
    setSnippets([]);
    setSources([]);
    setError(null);
    setRawResponseForDebug(null);
    addToast('Topic and snippets cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <ClipboardDocumentListIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          LitReview Snippets
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Get AI-generated summary snippets from relevant academic sources for your research topic.
        </p>
      </header>

      <Card title="Enter Your Research Topic">
        <div className="space-y-4">
          <Input
            label="Research Topic or Sub-Theme"
            id="researchTopic"
            placeholder="e.g., 'AI in personalized medicine', 'Sustainable urban development in Africa'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            {(topic || snippets.length > 0 || rawResponseForDebug) && (
              <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
                Clear All
              </Button>
            )}
            <Button onClick={handleGenerateSnippets} isLoading={isLoading} disabled={!topic.trim()} className="w-full sm:w-auto">
              Generate Snippets
            </Button>
          </div>
        </div>
      </Card>

      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Searching and synthesizing literature snippets..." />}
        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error Generating Snippets</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {!isLoading && snippets.length === 0 && !error && !topic.trim() && !rawResponseForDebug && (
          <Card>
            <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
              <ClipboardDocumentListIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
              <p className="font-semibold text-lg">Ready for Literature Insights</p>
              <p className="text-sm">Enter your research topic above to get started.</p>
            </div>
          </Card>
        )}
        
        {(!isLoading && (snippets.length > 0 || rawResponseForDebug)) && (
          <Card title="Generated Literature Snippets">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2">
              <Button onClick={handleDownloadSnippets} variant="outline" size="sm" className="w-full sm:w-auto">Download Snippets</Button>
              <Button onClick={handleSaveToDrive} variant="outline" size="sm" className="w-full sm:w-auto">Save Snippets to Google Drive</Button>
            </div>
            {rawResponseForDebug && (
                 <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300">Note: Parsing Error</h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Raw AI response:
                    </p>
                    <pre className="mt-2 text-xs whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-2 rounded">
                        {rawResponseForDebug}
                    </pre>
                </div>
            )}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {snippets.map((snippet, index) => (
                <div key={index} className="p-4 border border-border dark:border-dark-border rounded-md bg-muted/30 dark:bg-dark-muted/30">
                  <h4 className="text-md font-semibold text-foreground dark:text-dark-foreground mb-1">{snippet.title || "Untitled Snippet"}</h4>
                  <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-line">{snippet.snippetText}</p>
                  {snippet.sourceUrl && (
                    <div className="mt-2 pt-2 border-t border-border/30 dark:border-dark-border/30">
                      <p className="text-xs font-medium text-muted-foreground dark:text-dark-muted-foreground">
                        Source: 
                        <a
                          href={snippet.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-primary hover:underline dark:text-dark-primary break-all"
                          title={snippet.sourceUrl}
                        >
                          {snippet.sourceTitle || snippet.sourceUrl}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Optionally display combined grounding sources if not mapped individually */}
            {sources.length > 0 && !snippets.some(s => s.sourceUrl) && !rawResponseForDebug && (
                 <div className="pt-3 mt-4 border-t border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Grounding Sources Retrieved by AI:</h3>
                    <ul className="list-decimal list-inside space-y-1.5 text-sm">
                    {sources.map((sourceItem, index) => {
                        const source = sourceItem.web || sourceItem.retrievedContext;
                        if (!source || !source.uri) return null;
                        return (
                        <li key={`ground-source-${index}`} className="text-muted-foreground dark:text-dark-muted-foreground">
                            <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline dark:text-dark-primary break-all"
                            title={source.uri}
                            >
                            {source.title || source.uri}
                            </a>
                        </li>
                        );
                    })}
                    </ul>
                </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default LitReviewSnippetsPage;