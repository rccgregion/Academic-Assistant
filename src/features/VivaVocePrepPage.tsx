
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import ChatBubbleQuestionIcon from '../components/icons/ChatBubbleQuestionIcon';
import { VivaQuestionAnswer } from '../types';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext';
import { downloadTextFile } from '../utils/downloadHelper';
import { APP_NAME } from '../constants';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';

const VivaVocePrepPage: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave();

  const [projectText, setProjectText] = useState('');
  const [qaPairs, setQaPairs] = useState<VivaQuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined);
  const [openAccordionItems, setOpenAccordionItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (location.state?.initialText) {
      setProjectText(location.state.initialText);
      if (location.state.documentName) {
        setSourceDocumentName(location.state.documentName);
      }
      const docName = location.state.documentName ? ` from "${location.state.documentName}"` : "";
      addToast(`Project text loaded${docName} for Viva Voce Prep.`, 'info');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  const handleGenerateQA = useCallback(async () => {
    if (!projectText.trim()) {
      setError("Please paste your project text to generate Q&A.");
      addToast("Project text is empty.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQaPairs([]);
    setOpenAccordionItems({});

    const prompt = `You are an experienced academic supervisor preparing a student for their viva voce (project defense).
Based on the following project text, generate at least 20 potential questions that a supervisor or examiner might ask during the defense.
For each question, provide a concise, well-reasoned, and insightful answer that the student could use as a basis for their response.
Cover various aspects such as:
-   Methodology (justification, limitations)
-   Key findings (significance, interpretation)
-   Contribution to knowledge
-   Theoretical underpinnings
-   Practical implications
-   Potential weaknesses or criticisms
-   Future research directions

Output the result as a single JSON array of objects. Each object should have two keys: "question" (string) and "answer" (string).
Example of one object:
{
  "question": "What was the primary motivation behind choosing this specific research methodology?",
  "answer": "The primary motivation for selecting [Methodology Name, e.g., a qualitative case study approach] was its suitability for in-depth exploration of [Your Topic's Core Aspect]. This methodology allowed for [Specific Benefit 1, e.g., rich, contextual data collection] and [Specific Benefit 2, e.g., understanding nuanced perspectives] which were crucial for addressing the research questions effectively. While quantitative methods could provide breadth, this approach offered the necessary depth to uncover [Key Insight or Phenomenon]."
}

Project Text:
"""
${projectText}
"""

Ensure the output is ONLY a valid JSON array.`;

    const result = await generateText("", {
      ...settings,
      responseMimeType: "application/json",
      customPromptOverride: prompt,
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      const parsedQA = parseJsonFromText<VivaQuestionAnswer[]>(result.text);
      if (parsedQA && Array.isArray(parsedQA) && parsedQA.every(item => typeof item.question === 'string' && typeof item.answer === 'string')) {
        setQaPairs(parsedQA);
        addToast(`${parsedQA.length} Q&A pairs generated!`, "success");
      } else {
        setError("AI returned data in an unexpected format. Could not parse Q&A. Displaying raw output if available.");
        addToast("Failed to parse AI response into structured Q&A.", "error");
        setQaPairs([{ question: "Error Parsing Response", answer: "AI output was not valid JSON. Raw: " + result.text }]);
      }
    }
    setIsLoading(false);
  }, [projectText, settings, addToast]);

  const toggleAccordionItem = (index: number) => {
    setOpenAccordionItems(prev => ({ ...prev, [index]: !prev[index] }));
  };
  
  const handleAccordionKeyPress = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordionItem(index);
    }
  };

  const formatQAToText = (data: VivaQuestionAnswer[]): string => {
    let textContent = `Viva Voce Preparation Q&A\nProject: ${sourceDocumentName || 'Untitled Project'}\n====================================\n\n`;
    data.forEach((item, index) => {
      textContent += `Question ${index + 1}: ${item.question}\n`;
      textContent += `Answer:\n${item.answer}\n\n`;
      textContent += `------------------------------------\n\n`;
    });
    return textContent;
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'VivaPrep';
    return `${APP_NAME} - VivaVocePrep - ${safeBase}.${extension}`;
  };

  const handleDownloadQA = () => {
    if (qaPairs.length === 0) {
      addToast('No Q&A to download.', 'info');
      return;
    }
    const content = formatQAToText(qaPairs);
    const filename = getSafeFilename(sourceDocumentName || 'Q&A', 'txt');
    downloadTextFile(content, filename);
    addToast('Q&A download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (qaPairs.length === 0) {
      addToast('No Q&A to save.', 'info');
      return;
    }
    const content = formatQAToText(qaPairs);
    const filename = getSafeFilename(sourceDocumentName || 'Q&A', 'txt');
    openSaveToDriveModal(content, filename);
  };

  const handleClearAll = () => {
    setProjectText('');
    setQaPairs([]);
    setError(null);
    setOpenAccordionItems({});
    setSourceDocumentName(undefined);
    addToast('Input and Q&A cleared.', 'info');
  };
  
  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <ChatBubbleQuestionIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Viva Voce Prep
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Generate potential viva voce (project defense) questions and answers based on your project text.
        </p>
      </header>

      <Card title="Input Your Project Text">
        <textarea
          value={projectText}
          onChange={(e) => setProjectText(e.target.value)}
          rows={15}
          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
          placeholder="Paste the core text of your project/thesis here (e.g., abstract, introduction, key chapters, conclusion)..."
          aria-label="Project text input for Viva Voce Prep"
        />
        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          {(projectText || qaPairs.length > 0) && (
            <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
              Clear All
            </Button>
          )}
          <Button onClick={handleGenerateQA} isLoading={isLoading} disabled={!projectText.trim()} className="w-full sm:w-auto">
            Generate Q&A
          </Button>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Preparing your defense questions & answers..." />}
        {error && !isLoading && (
            <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error Generating Q&A</p>
            <p className="text-sm">{error}</p>
            </Card>
        )}

        {!isLoading && !qaPairs.length && !error && !projectText.trim() && (
             <Card>
                <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                    <ChatBubbleQuestionIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                    <p className="font-semibold text-lg">Ready to Prep for Your Viva</p>
                    <p className="text-sm">Paste your project text above to generate potential Q&A.</p>
                </div>
             </Card>
        )}

        {!isLoading && qaPairs.length > 0 && (
            <Card title="Generated Viva Voce Q&A">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2">
                <Button onClick={handleDownloadQA} variant="outline" size="sm" className="w-full sm:w-auto">Download Q&A</Button>
                <Button onClick={handleSaveToDrive} variant="outline" size="sm" className="w-full sm:w-auto">Save Q&A to Google Drive</Button>
            </div>
            <div className="space-y-3">
                {qaPairs.map((item, index) => (
                <div key={index} className="border border-border dark:border-dark-border rounded-md">
                    <button
                    onClick={() => toggleAccordionItem(index)}
                    onKeyDown={(e) => handleAccordionKeyPress(e, index)}
                    className="w-full flex justify-between items-center p-3 text-left text-sm font-medium text-foreground dark:text-dark-foreground hover:bg-muted/50 dark:hover:bg-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary rounded-t-md"
                    aria-expanded={openAccordionItems[index] || false}
                    aria-controls={`answer-${index}`}
                    >
                    <span><strong>Q{index + 1}:</strong> {item.question}</span>
                    <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${openAccordionItems[index] ? 'rotate-180' : ''}`} />
                    </button>
                    {openAccordionItems[index] && (
                    <div 
                        id={`answer-${index}`}
                        role="region"
                        aria-labelledby={`question-${index}`}
                        className="p-3 border-t border-border dark:border-dark-border bg-background dark:bg-dark-card rounded-b-md"
                    >
                        <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-line"><strong>Answer:</strong> {item.answer}</p>
                    </div>
                    )}
                </div>
                ))}
            </div>
            </Card>
        )}
      </div>
    </div>
  );
};

export default VivaVocePrepPage;