

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DocumentArrowUpIcon from '../components/icons/DocumentArrowUpIcon';
import { useToast } from '../hooks/useToast';
import SparklesIcon from '../components/icons/SparklesIcon'; 
import AcademicCapIcon from '../components/icons/AcademicCapIcon'; 
import DocumentMagnifyingGlassIcon from '../components/icons/DocumentMagnifyingGlassIcon'; 
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon'; 
import ChatBubbleQuestionIcon from '../components/icons/ChatBubbleQuestionIcon';
import PresentationChartBarIcon from '../components/icons/PresentationChartBarIcon';
import Spinner from '../components/common/Spinner';
// Removed unused generateText and useSettings as per new scope.

const DocumentLabPage: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false); // Keep for potential future use
  const [summary, setSummary] = useState<string | null>(null); // Keep for potential future use
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  // Removed useSettings as it's not directly used for summarization in this simplified version.

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        addToast('PDF parsing is not fully supported yet. This feature requires an additional PDF library (like pdf.js or pdf-lib) to be integrated into the application. For now, please use .txt or .md files.', 'warning', 7000);
        setFileName(file.name + " (PDF - content not loaded)");
        setFileContent("PDF content cannot be displayed without a parsing library.");
        setIsLoadingFile(false);
        // Keep the file in fileInputRef so it can still be "sent" if another tool could handle raw file objects
        return;
      }
      if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        setIsLoadingFile(true);
        setFileName(file.name);
        setSummary(null); 
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target?.result as string);
          setIsLoadingFile(false);
          addToast(`${file.name} loaded successfully! Ready to process.`, 'success');
        };
        reader.onerror = () => {
          setIsLoadingFile(false);
          addToast(`Error reading file: ${file.name}`, 'error');
          setFileName(null);
          setFileContent(null);
        };
        reader.readAsText(file);
      } else {
        addToast(`File '${file.name}' is not supported. Please upload a plain text (.txt), Markdown (.md), or PDF file.`, 'warning', 6000);
        setFileName(null);
        setFileContent(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
      }
    }
  }, [addToast]);

  const handleClearFile = () => {
    setFileName(null);
    setFileContent(null);
    setSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    addToast('Document cleared. Upload a new one.', 'info');
  };

  // Summarize functionality might be re-added later if needed, for now it's commented
  // const handleSummarizeDocument = async () => { /* ... */ };

  const sendToTool = (path: string, toolName: string) => {
    if (fileContent && !(fileContent.startsWith("PDF content cannot be displayed"))) {
      navigate(path, { state: { initialText: fileContent, sourceFeatureName: 'Document Lab', documentName: fileName } });
    } else if (fileContent && fileContent.startsWith("PDF content cannot be displayed")) {
      addToast(`Cannot send PDF content to ${toolName} as it's not parsed. Please use .txt or .md.`, 'warning');
    } else {
      addToast(`No document content to send to ${toolName}. Please upload a document first.`, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <DocumentArrowUpIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Document Lab
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Upload your text documents (.txt, .md) to analyze, rewrite, or get feedback using SHARON's suite of tools. (Basic PDF upload supported, content parsing coming soon).
        </p>
      </header>

      <Card title={fileName ? `Loaded: ${fileName}` : "Upload Your Document"}>
        {!fileContent && !isLoadingFile && (
            <div className="text-center py-8 text-muted-foreground dark:text-dark-muted-foreground">
                <DocumentArrowUpIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                <p className="font-semibold text-lg">No Document Loaded</p>
                <p className="text-sm mb-4">Click below to select a .txt, .md, or .pdf file from your device to begin.</p>
            </div>
        )}
        {!fileContent || (fileContent && fileName?.endsWith('(PDF - content not loaded)')) ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground dark:text-dark-muted-foreground
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-primary/10 file:text-primary
                         dark:file:bg-dark-primary/20 dark:file:text-dark-primary
                         hover:file:bg-primary/20 dark:hover:file:bg-dark-primary/30
                         cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary rounded-md p-1"
              aria-label="Document upload input"
              disabled={isLoadingFile}
            />
            {isLoadingFile && <div className="mt-2 flex justify-center"><Spinner text="Loading file..." /></div>}
            <p className="mt-2 text-xs text-muted-foreground dark:text-dark-muted-foreground text-center">
              Supported formats: .txt, .md, .pdf (PDF content preview/processing requires future library integration)
            </p>
             {fileName && fileContent && (
                 <div className="mt-4 flex justify-end">
                    <Button onClick={handleClearFile} variant="outline" className="w-full sm:w-auto">
                        Clear & Upload New
                    </Button>
                 </div>
             )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-dark-foreground">Document Content Preview:</h3>
              <textarea
                value={fileContent}
                readOnly
                rows={10}
                className="w-full p-2.5 border rounded-md bg-muted/50 dark:bg-dark-input/50 dark:border-dark-border dark:text-dark-foreground whitespace-pre-wrap transition-all"
                aria-label="Uploaded document content preview"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end items-center gap-2">
              {/* <Button onClick={handleSummarizeDocument} variant="outline" isLoading={isSummarizing} className="w-full sm:w-auto">
                Summarize Document
              </Button> */}
              <Button onClick={handleClearFile} variant="outline" className="w-full sm:w-auto">
                Clear & Upload New
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* 
      <div aria-live="polite" aria-busy={isSummarizing}>
        {isSummarizing && (
            <Card title="Generating Summary...">
            <Spinner text="Summarizing document content..." />
            </Card>
        )}

        {summary && !isSummarizing && (
            <Card title="Document Summary">
            <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-line">{summary}</p>
            </Card>
        )}
      </div> 
      */}

      {fileContent && !fileContent.startsWith("PDF content cannot be displayed") && ( // Only show process options if content is loaded and not the PDF placeholder
        <Card title="Process Document With:">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="secondary" 
              onClick={() => sendToTool('/stealth-writer', 'StealthWriter')}
              className="flex items-center justify-center py-3 dark:bg-dark-secondary dark:text-dark-secondary-foreground"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Rewrite (StealthWriter)
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendToTool('/professor-ai', 'Professor AI')}
              className="flex items-center justify-center py-3 dark:bg-dark-secondary dark:text-dark-secondary-foreground"
            >
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Get Feedback (Prof. AI)
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendToTool('/paper-analyzer', 'Paper Analyzer')}
              className="flex items-center justify-center py-3 dark:bg-dark-secondary dark:text-dark-secondary-foreground"
            >
              <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Analyze as Paper
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendToTool('/integrity-guard', 'IntegrityGuard')}
              className="flex items-center justify-center py-3 dark:bg-dark-secondary dark:text-dark-secondary-foreground"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Check Integrity
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendToTool('/viva-voce-prep', 'Viva Voce Prep')}
              className="flex items-center justify-center py-3 dark:bg-dark-secondary dark:text-dark-secondary-foreground"
            >
              <ChatBubbleQuestionIcon className="h-5 w-5 mr-2" />
              Prep for Viva Voce
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendToTool('/presentation-crafter', 'Presentation Crafter')}
              className="flex items-center justify-center py-3 dark:bg-dark-secondary dark:text-dark-secondary-foreground"
            >
              <PresentationChartBarIcon className="h-5 w-5 mr-2" />
              Craft Presentation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentLabPage;