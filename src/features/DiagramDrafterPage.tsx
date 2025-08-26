
import React, { useState, useCallback } from 'react';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateDiagramImage } from '../services/geminiService';
import DiagramNodeIcon from '../components/icons/DiagramNodeIcon';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext';
import { downloadDataUri } from '../utils/downloadHelper';
import { APP_NAME } from '../constants';

const DiagramDrafterPage: React.FC = () => {
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave();

  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // Base64 string
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<'image/jpeg' | 'image/png'>('image/jpeg');


  const handleGenerateDiagram = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your diagram.");
      addToast("Diagram description is empty.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    // The generateDiagramImage function uses 'image/jpeg'
    const result = await generateDiagramImage(prompt);
    setImageMimeType('image/jpeg'); 

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else if (result.base64Image) {
      setGeneratedImage(result.base64Image);
      addToast("Diagram generated successfully!", "success");
    } else {
      setError("No image data received from the AI.");
      addToast("No image data received.", "error");
    }
    setIsLoading(false);
  }, [prompt, addToast]);

  const handleDownloadImage = () => {
    if (!generatedImage) {
      addToast('No image to download.', 'info');
      return;
    }
    const dataUrl = `data:${imageMimeType};base64,${generatedImage}`;
    const safePrompt = prompt.substring(0, 30).replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'Diagram';
    const filename = `${APP_NAME}_DiagramDrafter_${safePrompt}.${imageMimeType === 'image/png' ? 'png' : 'jpg'}`;
    downloadDataUri(dataUrl, filename); // Use the new helper
    addToast('Image download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!generatedImage) {
      addToast('No image to save.', 'info');
      return;
    }
    // The content passed to openSaveToDriveModal for images should be the base64 string itself.
    // The modal will construct the data URI.
    const safePrompt = prompt.substring(0, 30).replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'Diagram';
    const filename = `${APP_NAME}_DiagramDrafter_${safePrompt}.${imageMimeType === 'image/png' ? 'png' : 'jpg'}`;
    openSaveToDriveModal(generatedImage, filename, imageMimeType);
  };

  const handleClearAll = () => {
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
    addToast('Input and image cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <DiagramNodeIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Diagram Drafter
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Describe the diagram you need, and let AI visualize it for you.
        </p>
      </header>

      <Card title="Describe Your Diagram">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
          placeholder="e.g., 'A simple flowchart for a coffee making process', 'Circuit diagram of a full wave rectifier', 'Conceptual diagram of the water cycle'"
          aria-label="Diagram description input"
        />
        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          {(prompt || generatedImage) && (
            <Button onClick={handleClearAll} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
              Clear All
            </Button>
          )}
          <Button onClick={handleGenerateDiagram} isLoading={isLoading} disabled={!prompt.trim()} className="w-full sm:w-auto">
            Generate Diagram
          </Button>
        </div>
      </Card>

      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Drafting your diagram, please wait..." />}
        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error Generating Diagram</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {!isLoading && !generatedImage && !error && !prompt.trim() && (
          <Card>
            <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
              <DiagramNodeIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
              <p className="font-semibold text-lg">Ready to Visualize</p>
              <p className="text-sm">Enter your diagram description above to get started.</p>
            </div>
          </Card>
        )}

        {!isLoading && generatedImage && (
          <Card title="Generated Diagram">
            <div className="flex justify-center items-center p-4 bg-muted/50 dark:bg-dark-muted/50 rounded-md">
              <img
                src={`data:${imageMimeType};base64,${generatedImage}`}
                alt="Generated Diagram"
                className="max-w-full max-h-[60vh] object-contain rounded-md shadow-md"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <Button onClick={handleDownloadImage} variant="outline" size="sm">Download Image</Button>
              <Button onClick={handleSaveToDrive} variant="outline" size="sm">Save to Google Drive</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiagramDrafterPage;