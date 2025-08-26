

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { ChatMessage as ChatMessageType, WritingTone, AcademicLevel } from '../types';
import { startChat, streamMessageInChat } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button'; 
import { Chat, Content } from '@google/genai'; 
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME, GEMINI_TEXT_MODEL } from '../constants'; 

const LOCAL_STORAGE_KEY_PROF = 'sharon-professorAiMessages';

const ProfessorAIPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const location = ReactRouterDOM.useLocation();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSubject, setSessionSubject] = useState(settings.currentSubject || '');
  const [textToProcess, setTextToProcess] = useState<string | null>(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined); 

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialTextProcessedRef = useRef(false); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (location.state?.initialText && !isSessionStarted) { 
      setTextToProcess(location.state.initialText);
      if (location.state.documentName) {
        setSourceDocumentName(location.state.documentName);
      }
      const docName = location.state.documentName ? ` from "${location.state.documentName}"` : "";
      addToast(`Text loaded${docName} for Professor AI. Please set a subject to begin.`, 'info');
      if (location.state.sourceFeatureName) { 
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, isSessionStarted, addToast]);

  useEffect(() => {
    const globalSubject = settings.currentSubject;
    if (globalSubject && !isSessionStarted && !textToProcess) { 
      setSessionSubject(globalSubject);
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY_PROF);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.subject === globalSubject && Array.isArray(parsedData.messages)) {
            setMessages(parsedData.messages.map((msg: ChatMessageType) => ({...msg, timestamp: new Date(msg.timestamp)})));
            const historyForChat = parsedData.messages.map((m:ChatMessageType) => ({role:m.sender === 'user' ? 'user' : 'model', parts: [{text:m.text}]}));
            initializeProfessorAISession(globalSubject, historyForChat);
            addToast(`Resumed Professor AI session for ${globalSubject}.`, "info");
            return; 
          }
        } catch (e) {
          console.error("Failed to parse stored messages:", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY_PROF);
        }
      }
      if (globalSubject) { 
        initializeProfessorAISession(globalSubject);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.currentSubject, textToProcess]);

  useEffect(() => {
    if (isSessionStarted && sessionSubject) {
      try {
        const dataToStore = JSON.stringify({ subject: sessionSubject, messages });
        localStorage.setItem(LOCAL_STORAGE_KEY_PROF, dataToStore);
      } catch (e) {
        console.error("Failed to save Professor AI messages:", e);
        addToast("Could not save chat history.", "warning");
      }
    }
  }, [messages, sessionSubject, isSessionStarted, addToast]);

  const handleSendMessage = async (text: string, currentChatInstanceParam?: Chat | null, isAutomatedFirstMessage = false, isGreeting = false) => {
    const activeChat = currentChatInstanceParam || chat;
    if (!activeChat) {
      setError("Professor AI session is not active. Please start a session.");
      addToast("Session not active. Please start.", "warning");
      return;
    }

    if (!isGreeting) { 
        const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        sender: 'user',
        text,
        timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
    }
    
    setIsLoading(true);
    setError(null);

    let aiResponseText = "";
    const aiMessageId = crypto.randomUUID();
    let currentSuggestions: string[] = [];
    let currentSources: ChatMessageType['metadata'] = { sources: [] }; 
    
    if (!isAutomatedFirstMessage || (isAutomatedFirstMessage && !isGreeting) ) {
        setMessages((prevMessages) => [
        ...prevMessages,
        { id: aiMessageId, sender: 'ai', text: '...', timestamp: new Date(), metadata: { suggestions: [], sources: [] } },
        ]);
    }


    try {
        await streamMessageInChat(activeChat, text, (chunkFullText, isFinal, err, sourcesChunk) => {
            if (err) {
                setError(err);
                setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: `Error: ${err}`} : m));
                setIsLoading(false);
                return;
            }
            
            aiResponseText = chunkFullText; 
            if (sourcesChunk && sourcesChunk.length > 0) { 
              currentSources = { sources: sourcesChunk };
            }
            
            if (isFinal) {
                const suggestionMarker = "Next, you could ask:";
                if (aiResponseText.includes(suggestionMarker)) {
                    const parts = aiResponseText.split(suggestionMarker);
                    if (parts[1]) {
                        currentSuggestions = parts[1].split('\n').map(s => s.replace(/^[-*]?\s*/, '').trim()).filter(s => s.length > 0 && s.length < 100);
                    }
                }
            }
            
            if (isAutomatedFirstMessage && isGreeting && isFinal) { 
                setMessages([{ id: aiMessageId, sender: 'ai', text: aiResponseText, timestamp: new Date(), metadata: { sources: currentSources?.sources, suggestions: currentSuggestions } }]);
            } else {
                 setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: aiResponseText, metadata: { sources: currentSources?.sources, suggestions: currentSuggestions } } : m));
            }


            if (isFinal) {
                setIsLoading(false);
            }
        });
    } catch (e: any) {
        console.error("Error during Professor AI stream:", e);
        const errorMessage = e.message || "An error occurred while sending the message.";
        setError(errorMessage);
        setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: `Error: ${errorMessage}`} : m));
        setIsLoading(false);
        addToast(errorMessage, "error");
    }
  };


  const initializeProfessorAISession = useCallback(async (subjectToInit: string, historyForChat?: Content[]) => {
    setIsLoading(true);
    setError(null);
    initialTextProcessedRef.current = false; 
    
    let professorSystemPrompt = `You are "Professor AI," an expert academic mentor.
    Your current subject of expertise is: "${subjectToInit || 'General Academic Topics'}".
    The user is at the ${settings.academicLevel || AcademicLevel.UNDERGRADUATE} level. Your feedback should be tailored accordingly.
    Your writing tone should be ${settings.writingTone || WritingTone.ACADEMIC_CRITICAL}.

    Primary tasks:
    1.  Provide constructive, critical feedback on submitted academic text (essays, proposals, arguments, etc.).
    2.  Identify strengths and weaknesses in reasoning, structure, clarity, and academic rigor.
    3.  Suggest specific, actionable revisions to enhance the quality of the work.
    4.  Explain complex concepts within "${subjectToInit}" clearly.
    5.  Reference appropriate academic standards and conventions.`;

    if (settings.geographicRegion === 'Nigeria') {
        professorSystemPrompt += `\n    - The student is likely from a Nigerian university context. When providing examples or discussing academic norms, consider this context where relevant (e.g., project structures, common student challenges). Use examples relevant to Nigeria if natural.`;
        if (settings.department) {
            professorSystemPrompt += ` The student's department is ${settings.department}.`;
        }
    }

    professorSystemPrompt += `
    Interaction style:
    - Be thorough and analytical.
    - If reviewing text, structure your feedback clearly (e.g., "Overall Impression," "Strengths," "Areas for Improvement," "Specific Suggestions").
    - Where appropriate, end your responses by suggesting 1-2 brief follow-up questions or discussion points the user might consider to deepen their understanding or refine their work further. Start these suggestions with a clear marker, like "Next, you could ask:".
    ${(!historyForChat || historyForChat.length === 0) ? "Start by warmly greeting the user and confirming the subject you are ready to provide feedback on. Ask how you can assist." : ""}`;


    const professorSettingsForChat: any = { 
      ...settings,
      writingTone: settings.writingTone || WritingTone.ACADEMIC_CRITICAL, 
      currentSubject: subjectToInit,
      systemInstruction: professorSystemPrompt,
    };
    
    try {
      const newChatInstance = startChat(professorSettingsForChat, historyForChat);
      setChat(newChatInstance);
      setIsSessionStarted(true); 
      
      if (!historyForChat || historyForChat.length === 0) {
          await handleSendMessage("Hello Professor AI!", newChatInstance, true, true); 
      }
      
      if (textToProcess && newChatInstance && !initialTextProcessedRef.current) {
        setTimeout(async () => {
          await handleSendMessage(`Please provide feedback on the following text related to ${subjectToInit}:\n\n"""\n${textToProcess}\n"""`, newChatInstance, true, false);
          initialTextProcessedRef.current = true; 
          setTextToProcess(null); 
        }, 100);
      } else if (!textToProcess) { 
         addToast(`Professor AI session for ${subjectToInit} started/resumed.`, "success");
      }

    } catch (e: any) {
      console.error("Failed to initialize Professor AI chat:", e);
      setError(e.message || "Could not start Professor AI chat. Check API Key/network.");
      setChat(null);
      setIsSessionStarted(false);
    } finally {
      setIsLoading(false);
    }
  }, [settings, textToProcess, addToast]); 


  const handleSubjectChangeAndInit = () => {
    if (!sessionSubject.trim()) {
      addToast("Subject is required to start the session.", "warning");
      return;
    }
    updateSettings({ currentSubject: sessionSubject });
    setMessages([]); 
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROF); 
    initializeProfessorAISession(sessionSubject);
  };
  
  const handleClearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROF);
    addToast("Chat history cleared.", "info");
    if (chat && sessionSubject) {
      initializeProfessorAISession(sessionSubject);
    }
  };
  
  const formatTranscript = (msgs: ChatMessageType[]): string => {
    return msgs.map(msg => 
      `[${msg.sender.toUpperCase()}] (${msg.timestamp.toLocaleString()}):\n${msg.text}\n`
    ).join('\n---\n');
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'ProfessorAI_Session';
    return `${APP_NAME} - ProfessorAI - ${safeBase}_Transcript.${extension}`;
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) {
      addToast("No messages to download.", "info");
      return;
    }
    const transcriptContent = formatTranscript(messages);
    const filename = getSafeFilename(sourceDocumentName || sessionSubject, 'txt');
    downloadTextFile(transcriptContent, filename);
    addToast('Transcript download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (messages.length === 0) {
      addToast('No transcript to save.', 'info');
      return;
    }
    const transcriptContent = formatTranscript(messages);
    const filename = getSafeFilename(sourceDocumentName || sessionSubject, 'txt');
    openSaveToDriveModal(transcriptContent, filename);
  };

  const handleEndSession = () => {
    setChat(null);
    setMessages([]);
    setSessionSubject('');
    setError(null);
    setIsSessionStarted(false);
    updateSettings({ currentSubject: '' });
    addToast("Professor AI session ended.", "info");
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!isSessionStarted) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <header className="pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
            <AcademicCapIcon className="h-8 w-8 mr-2 text-primary dark:text-dark-primary" />
            Professor AI
          </h1>
          <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
            Get expert feedback on your academic work.
          </p>
        </header>
        <Card title="Start Your Feedback Session">
          {textToProcess && sourceDocumentName && (
            <p className="mb-3 text-sm text-primary dark:text-dark-primary bg-primary/10 dark:bg-dark-primary/20 p-2 rounded-md">
              Loaded text from "{sourceDocumentName}". Please confirm or set a subject below to proceed with feedback.
            </p>
          )}
          {textToProcess && !sourceDocumentName && (
            <p className="mb-3 text-sm text-primary dark:text-dark-primary bg-primary/10 dark:bg-dark-primary/20 p-2 rounded-md">
              Loaded text from another tool. Please confirm or set a subject below to proceed with feedback.
            </p>
          )}
           <p className="mb-4 text-sm text-muted-foreground dark:text-dark-muted-foreground">
            What subject is your work related to? This helps Professor AI provide targeted feedback.
          </p>
          <Input
            label="Subject of Work"
            placeholder="e.g., Sociology, Quantum Physics, Renaissance Literature"
            value={sessionSubject}
            onChange={(e) => setSessionSubject(e.target.value)}
            containerClassName="mb-4"
            aria-required="true"
          />
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <Button onClick={handleSubjectChangeAndInit} disabled={!sessionSubject.trim() || isLoading}>
            {isLoading ? <Spinner size="sm" /> : `Start Session on ${sessionSubject || '...'}`}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] bg-card dark:bg-dark-card rounded-lg shadow-xl">
      <header className="p-4 border-b border-border dark:border-dark-border flex justify-between items-center">
        <h1 className="text-xl font-semibold text-foreground dark:text-dark-foreground flex items-center">
          <AcademicCapIcon className="h-6 w-6 mr-2 text-primary dark:text-dark-primary" />
          Professor AI: {sessionSubject}
        </h1>
         <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadTranscript} variant="outline" size="sm" disabled={messages.length === 0}>
              Download Transcript
            </Button>
            <Button onClick={handleSaveToDrive} variant="outline" size="sm" disabled={messages.length === 0}>
             Save to Google Drive
            </Button>
            <Button onClick={handleClearChatHistory} variant="outline" size="sm" disabled={messages.length <=1 && messages[0]?.sender === 'ai'}>
              Clear History
            </Button>
            <Button onClick={handleEndSession} variant="outline" size="sm">
              End Session
            </Button>
        </div>
      </header>
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-2 bg-muted/30 dark:bg-dark-background"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onSuggestionClick={handleSuggestionClick} />
        ))}
        <div ref={messagesEndRef} />
        {isLoading && messages.length > 0 && messages[messages.length-1]?.sender === 'ai' && messages[messages.length-1]?.text === '...' && ( 
            <div className="flex justify-start py-2 pl-12"> 
                <Spinner text="Professor AI is reviewing..." size="sm" />
            </div>
        )}
      </div>
       {error && !isLoading && <p className="p-2 text-sm text-center text-destructive bg-destructive/10">{error}</p>}
      <ChatInput onSendMessage={(text) => handleSendMessage(text)} isLoading={isLoading} placeholder={`Ask Professor AI about ${sessionSubject}...`} />
    </div>
  );
};
export default ProfessorAIPage;