
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import PresentationChartBarIcon from '../components/icons/PresentationChartBarIcon';
import { PresentationOutline, PresentationSlide } from '../types';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext';
import { downloadTextFile } from '../utils/downloadHelper';
import { APP_NAME } from '../constants';

interface SlideWithImageType extends PresentationSlide {
  suggestedImageType?: string;
}

interface PresentationOutlineWithImageType extends PresentationOutline {
  slides: SlideWithImageType[];
}


const PresentationCrafterPage: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave();

  const [projectText, setProjectText] = useState('');
  const [presentationOutline, setPresentationOutline] = useState<PresentationOutlineWithImageType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (location.state?.initialText) {
      setProjectText(location.state.initialText);
      if (location.state.documentName) {
        setSourceDocumentName(location.state.documentName);
      }
      const docName = location.state.documentName ? ` from "${location.state.documentName}"` : "";
      addToast(`Project text loaded${docName} for Presentation Crafter.`, 'info');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  const handleGenerateOutline = useCallback(async () => {
    if (!projectText.trim()) {
      setError("Please paste your project text to generate a presentation outline.");
      addToast("Project text is empty.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPresentationOutline(null);

    const prompt = `You are an expert academic presentation designer. Based on the following project text, generate a structured outline for a PowerPoint-style presentation.
The outline should include an overall presentation title and a series of slides. Each slide should have a title, key bullet points, and a "suggestedImageType" string. The suggestedImageType should describe a type of visual that would complement the slide (e.g., "Bar chart showing growth", "Conceptual diagram of X", "Photograph of Y", "Timeline of events", "Relevant quote"). Optionally, include brief speaker notes for some slides if appropriate.

Consider a logical flow for an academic presentation, typically including:
-   Introduction (Background, Problem, Objectives, Roadmap)
-   Literature Review (Key concepts, theories, gaps addressed - if substantial in text)
-   Methodology (Design, Data Collection, Analysis)
-   Key Results/Findings (Presented clearly, perhaps one key finding per slide or grouped thematically)
-   Discussion (Interpretation of results, relation to literature, implications)
-   Conclusion (Summary, contributions, future work)
-   Q&A slide

Output the result as a single JSON object with the following structure:
{
  "overallTitle": "A compelling overall title for the presentation",
  "slides": [
    {
      "title": "Slide 1 Title (e.g., Introduction)",
      "bullets": [
        "Key point 1 for this slide",
        "Key point 2 for this slide",
        "Key point 3 for this slide (aim for 3-5 bullets per slide generally)"
      ],
      "suggestedImageType": "e.g., Graph illustrating key statistic from background",
      "speakerNotes": "Optional brief notes for the presenter for this slide."
    },
    {
      "title": "Slide 2 Title (e.g., Methodology)",
      "bullets": ["...", "...", "..."],
      "suggestedImageType": "e.g., Flowchart of research process",
      "speakerNotes": "Optional notes..."
    }
    // ... more slides (aim for 8-12 slides)
  ]
}

Project Text:
"""
${projectText}
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
      const parsedOutline = parseJsonFromText<PresentationOutlineWithImageType>(result.text);
      if (parsedOutline && parsedOutline.overallTitle && Array.isArray(parsedOutline.slides) && parsedOutline.slides.every(s => s.title && Array.isArray(s.bullets))) {
        setPresentationOutline(parsedOutline);
        addToast(`Presentation outline for "${parsedOutline.overallTitle}" generated!`, "success");
      } else {
        setError("AI returned data in an unexpected format. Could not parse presentation outline. Displaying raw output if available.");
        addToast("Failed to parse AI response into structured outline.", "error");
        setPresentationOutline({ overallTitle: "Error Parsing Response. Raw: " + result.text, slides: [] });
      }
    }
    setIsLoading(false);
  }, [projectText, settings, addToast]);

  const formatOutlineToText = (outline: PresentationOutlineWithImageType): string => {
    let textContent = `Presentation Outline\n====================\n\nOverall Title: ${outline.overallTitle}\n\n`;
    outline.slides.forEach((slide, index) => {
      textContent += `Slide ${index + 1}: ${slide.title}\n`;
      textContent += `  Bullets:\n`;
      slide.bullets.forEach(bullet => {
        textContent += `    - ${bullet}\n`;
      });
      if (slide.suggestedImageType) {
        textContent += `  Suggested Image Type: ${slide.suggestedImageType}\n`;
      }
      if (slide.speakerNotes) {
        textContent += `  Speaker Notes: ${slide.speakerNotes}\n`;
      }
      textContent += `\n--------------------\n\n`;
    });
    return textContent;
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'PresentationOutline';
    return `${APP_NAME} - PresentationCrafter - ${safeBase}.${extension}`;
  };

  const handleDownloadOutline = () => {
    if (!presentationOutline) {
      addToast('No outline to download.', 'info');
      return;
    }
    const content = formatOutlineToText(presentationOutline);
    const filename = getSafeFilename(presentationOutline.overallTitle, 'txt');
    downloadTextFile(content, filename);
    addToast('Presentation outline download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!presentationOutline) {
      addToast('No outline to save.', 'info');
      return;
    }
    const content = formatOutlineToText(presentationOutline);
    const filename = getSafeFilename(presentationOutline.overallTitle, 'txt');
    openSaveToDriveModal(content, filename);
  };

  const handleClearAll = () => {
    setProjectText('');
    setPresentationOutline(null);
    setError(null);
    setSourceDocumentName(undefined);
    addToast('Input and outline cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <PresentationChartBarIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Presentation Crafter
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Generate a structured outline, including image type suggestions, for your academic presentation.
        </p>
      </header>

      <Card title="Input Your Project Text">
        <textarea
          value={projectText}
          onChange={(e) => setProjectText(e.target.value)}
          rows={15}
          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
          placeholder="Paste the core text of your project/thesis here..."
          aria-label="Project text input for Presentation Crafter"
        />
        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
           {(projectText || presentationOutline) && (
            <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
              Clear All
            </Button>
          )}
          <Button onClick={handleGenerateOutline} isLoading={isLoading} disabled={!projectText.trim()} className="w-full sm:w-auto">
            Generate Presentation Outline
          </Button>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Crafting your presentation outline..." />}
        {error && !isLoading && (
            <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error Generating Outline</p>
            <p className="text-sm">{error}</p>
            </Card>
        )}

        {!isLoading && !presentationOutline && !error && !projectText.trim() && (
            <Card>
                <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                    <PresentationChartBarIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                    <p className="font-semibold text-lg">Ready to Craft Your Presentation</p>
                    <p className="text-sm">Paste your project text above to generate an outline.</p>
                </div>
            </Card>
        )}

        {!isLoading && presentationOutline && (
            <Card title={`Presentation Outline: ${presentationOutline.overallTitle}`}>
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2">
                <Button onClick={handleDownloadOutline} variant="outline" size="sm" className="w-full sm:w-auto">Download Outline</Button>
                <Button onClick={handleSaveToDrive} variant="outline" size="sm" className="w-full sm:w-auto">Save Outline to Google Drive</Button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {presentationOutline.slides.length === 0 && presentationOutline.overallTitle.startsWith("Error Parsing Response") && (
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">Could not generate slides due to parsing error. Raw response displayed above if available.</p>
                )}
                {presentationOutline.slides.map((slide, index) => (
                <div key={index} className="p-4 border border-border dark:border-dark-border rounded-md bg-muted/30 dark:bg-dark-muted/30">
                    <h4 className="text-lg font-semibold text-primary dark:text-dark-primary mb-1.5">Slide {index + 1}: {slide.title}</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground dark:text-dark-foreground pl-4">
                    {slide.bullets.map((bullet, bIndex) => (
                        <li key={bIndex}>{bullet}</li>
                    ))}
                    </ul>
                    {slide.suggestedImageType && (
                    <div className="mt-2 pt-2 border-t border-border/30 dark:border-dark-border/30">
                        <p className="text-xs font-semibold text-muted-foreground dark:text-dark-muted-foreground">Suggested Image Type:</p>
                        <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground italic">{slide.suggestedImageType}</p>
                    </div>
                    )}
                    {slide.speakerNotes && (
                    <div className="mt-2 pt-2 border-t border-border/30 dark:border-dark-border/30">
                        <p className="text-xs font-semibold text-muted-foreground dark:text-dark-muted-foreground">Speaker Notes:</p>
                        <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground italic whitespace-pre-line">{slide.speakerNotes}</p>
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

export default PresentationCrafterPage;