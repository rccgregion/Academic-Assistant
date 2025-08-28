import React, { useState, useCallback } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';
import { InsightWeaverAnalysis, GroundingChunk } from '../types';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 

export default function InsightWeaverPage(): React.ReactElement {
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [topic, setTopic] = useState('');
  const [analysis, setAnalysis] = useState<InsightWeaverAnalysis | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFocusItem, setCurrentFocusItem] = useState<string | null>(null); 

  const handleWeaveInsights = useCallback(async (focusItem?: string) => {
    if (!topic.trim()) {
      setError("Please enter a research topic or question.");
      addToast("Topic is required.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    if (!focusItem) { 
      setAnalysis(null);
      setSources([]);
    }
    setCurrentFocusItem(focusItem || null);

    let promptContext = `Given the research topic: "${topic}"`;
    if (focusItem) {
      promptContext += `\nSpecifically, elaborate and dig deeper on the following aspect: "${focusItem}". Integrate this focus into your broader analysis of "${topic}".`;
    }

    const prompt = `${promptContext}

Perform a comprehensive literature search using your available tools. Based on the most relevant academic sources, synthesize the information and provide a structured analysis.

Format your entire response as a single, valid JSON object with the following keys and value types:
- "overallSummary": (String) A synthesized, comprehensive summary of the current state of research on this topic (or the focused aspect), integrating findings from multiple sources. This should be about 300-400 words.
- "keyThemes": (Array of Strings) A list of 3-5 dominant themes or core arguments found across the literature related to the topic/focus.
- "contrastingViewpoints": (Array of Strings, optional) A list of 2-3 significant contrasting findings, debates, or alternative perspectives identified. If none are prominent, this can be an empty array or omitted.
- "commonMethodologies": (Array of Strings) A list of 2-4 research methodologies frequently employed.
- "identifiedGaps": (Array of Strings) A list of 2-4 specific research gaps explicitly mentioned or strongly implied.
- "futureDirections": (Array of Strings, optional) A list of 1-3 potential future research directions suggested. If none are prominent, this can be an empty array or omitted.

Ensure the JSON is well-formed. Do not include any introductory or concluding text outside of the JSON object itself.`;

    const result = await generateText("", { 
      ...settings, 
      useGrounding: true,
      customPromptOverride: prompt
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      const parsedAnalysis = parseJsonFromText<InsightWeaverAnalysis>(result.text);
      if (parsedAnalysis) {
        setAnalysis(parsedAnalysis);
        if (result.sources && result.sources.length > 0) {
          setSources(result.sources);
        }
        addToast(focusItem ? `Deeper insights for "${focusItem}" woven!` : "Insights woven successfully!", "success");
      } else {
        setError("AI returned data in an unexpected format. Could not parse insights. Displaying raw output if available.");
        addToast("Failed to parse AI response into structured insights.", "error");
        setAnalysis({
          overallSummary: "Raw AI Output (JSON parsing failed):\n" + result.text,
          keyThemes: [],
          commonMethodologies: [],
          identifiedGaps: [],
          rawAIResponse: result.text
        });
      }
    }
    setIsLoading(false);
  }, [topic, settings, addToast]);

  const handleDigDeeper = (itemText: string) => {
    handleWeaveInsights(itemText);
  };
  
  const renderListWithButtons = (items: string[] | undefined, itemType: 'theme' | 'gap', defaultText: string = "Not specified."): React.ReactNode => {
    if (!items || items.length === 0) return <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{defaultText}</p>;
    return (
      <ul className="space-y-1.5 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="text-muted-foreground dark:text-dark-muted-foreground mr-2">&bull;</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDigDeeper(item)}
              className="text-left justify-start p-1 h-auto hover:bg-primary/10 dark:hover:bg-dark-primary/10 text-muted-foreground dark:text-dark-muted-foreground hover:text-primary dark:hover:text-dark-primary"
              title={`Dig deeper into: ${item}`}
            >
              {item}
            </Button>
          </li>
        ))}
      </ul>
    );
  };


  const renderListToString = (items: string[] | undefined, title: string, defaultText: string = "Not specified."): string => {
    if (!items || items.length === 0) return `${title}: ${defaultText}\n`;
    return `${title}:\n${items.map(item => `- ${item}`).join('\n')}\n`;
  };

  const formatInsightsForDownload = (analysisData: InsightWeaverAnalysis, sourceList: GroundingChunk[], rawResp: string | null): string => {
    if (!analysisData) return "No insights data available.";
    let content = `InsightWeaver Report for Topic: ${topic}\n`;
    if(currentFocusItem) content += `Focused on: ${currentFocusItem}\n`;
    content += `=========================================\n\n`;
    content += `Overall Summary:\n${analysisData.overallSummary || "Not provided."}\n\n`;
    content += renderListToString(analysisData.keyThemes, "Key Themes");
    content += renderListToString(analysisData.contrastingViewpoints, "Contrasting Viewpoints", "None highlighted.");
    content += renderListToString(analysisData.commonMethodologies, "Common Methodologies", "Not specified.");
    content += renderListToString(analysisData.identifiedGaps, "Identified Research Gaps", "None identified.");
    content += renderListToString(analysisData.futureDirections, "Suggested Future Research", "None suggested.");
    
    if (sourceList.length > 0) {
      content += "\nKey Sources Used:\n";
      sourceList.forEach((sourceItem, index) => {
        const source = sourceItem.web || sourceItem.retrievedContext;
        if (source && source.uri) {
          content += `${index + 1}. ${source.title || source.uri} (${source.uri})\n`;
        }
      });
    } else {
      content += "\nNo specific web sources were cited by the AI for this synthesis.\n";
    }
    if (rawResp) {
        content += `\n\n--- Raw AI Response (JSON Parsing Failed) ---\n${rawResp}`;
    }
    return content;
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'Insights';
    return `${APP_NAME} - InsightWeaver - ${safeBase}.${extension}`;
  };

  const handleDownloadInsights = () => {
    if (!analysis) {
      addToast('No insights to download.', 'info');
      return;
    }
    const content = formatInsightsForDownload(analysis, sources, analysis.rawAIResponse || null);
    const filename = getSafeFilename(topic, 'txt');
    downloadTextFile(content, filename);
    addToast('Insights download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!analysis) {
      addToast('No insights to save.', 'info');
      return;
    }
    const content = formatInsightsForDownload(analysis, sources, analysis.rawAIResponse || null);
    const filename = getSafeFilename(topic, 'txt');
    openSaveToDriveModal(content, filename);
  };

  const renderList = (items: string[] | undefined, defaultText: string = "Not specified."): React.ReactNode => {
    if (!items || items.length === 0) return <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{defaultText}</p>;
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground dark:text-dark-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };
  
  const handleClearAll = () => {
    setTopic('');
    setAnalysis(null);
    setSources([]);
    setError(null);
    setCurrentFocusItem(null);
    addToast('Topic and insights cleared.', 'info');
  };

  const spinnerActionText = currentFocusItem ? `Digging deeper into "${currentFocusItem}"...` : "Weaving insights from academic sources...";

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <BrainCircuitIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          InsightWeaver
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          AI-Powered Research Synthesis: Uncover themes, gaps, and connections in academic literature.
        </p>
      </header>

      <Card title="Define Your Research Area">
        <div className="space-y-4">
          <Input
            label="Research Topic / Question"
            id="researchTopic"
            placeholder="e.g., 'The impact of AI on creative industries', 'What are the ethical implications of gene editing?'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            {(topic || analysis) && (
                <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">Clear Topic</Button>
            )}
            <Button onClick={() => handleWeaveInsights()} isLoading={isLoading} disabled={!topic.trim()} className="w-full sm:w-auto">
              {currentFocusItem || analysis ? 'Re-Weave/Dig Deeper' : 'Weave Insights'}
            </Button>
          </div>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text={spinnerActionText} />}
        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error Weaving Insights</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {!isLoading && !analysis && !error && !topic.trim() && (
          <Card>
            <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                <BrainCircuitIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                <p className="font-semibold text-lg">Ready to Weave Insights</p>
                <p className="text-sm">Enter your research topic above to begin synthesizing academic literature.</p>
            </div>
          </Card>
        )}

        {!isLoading && analysis && (
          <Card title={currentFocusItem ? `Focused Insights: ${currentFocusItem}` : "Synthesized Insights"}>
           <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2">
             <Button onClick={handleDownloadInsights} variant="outline" size="sm" className="w-full sm:w-auto">Download Insights</Button>
             <Button onClick={handleSaveToDrive} variant="outline" size="sm" className="w-full sm:w-auto">Save Insights to Google Drive</Button>
          </div>
          {analysis.rawAIResponse && (
            <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300">Note: Parsing Error</h4>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    The AI's response could not be fully parsed into a structured format. Displaying raw output below for review.
                    This might happen if the AI didn't strictly adhere to the requested JSON structure.
                </p>
                <pre className="mt-2 text-xs whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-2 rounded">
                    {analysis.rawAIResponse}
                </pre>
            </div>
          )}
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Overall Summary</h3>
              <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-line">{analysis.overallSummary || "Summary not provided."}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Key Themes (Click to Dig Deeper)</h3>
              {renderListWithButtons(analysis.keyThemes, 'theme', "No key themes identified.")}
            </div>
            {analysis.contrastingViewpoints && analysis.contrastingViewpoints.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Contrasting Viewpoints</h3>
                {renderList(analysis.contrastingViewpoints, "No contrasting viewpoints highlighted.")}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Common Methodologies</h3>
              {renderList(analysis.commonMethodologies, "Not specified.")}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Identified Research Gaps</h3>
              {renderListWithButtons(analysis.identifiedGaps, 'gap', "No research gaps identified.")}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1.5 text-foreground dark:text-dark-foreground">Suggested Future Research</h3>
              {renderList(analysis.futureDirections, "None suggested.")}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Key Sources</h3>
              {sources && sources.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground dark:text-dark-muted-foreground space-y-1">
                  {sources.map((s, i) => (
                    <li key={i}>{(s.web && s.web.title) || (s.retrievedContext && s.retrievedContext.title) || s.web?.uri || 'Source'}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">No specific web sources were cited by the AI for this synthesis.</p>
              )}
            </div>
            <div className="pt-2 flex justify-end">
               <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground dark:text-dark-muted-foreground mr-1">Helpful?</span>
                  <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-primary">👍</Button>
                  <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-destructive">👎</Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  </div>
  );
}

// single default export is declared at function definition