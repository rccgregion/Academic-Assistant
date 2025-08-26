

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { ChatMessage as ChatMessageType, AcademicLevel, WritingTone } from '../types';
import { startChat, streamMessageInChat } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import StudyBotIcon from '../components/icons/StudyBotIcon';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button'; 
import { Chat, Content } from '@google/genai'; 
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants';
import { GEMINI_TEXT_MODEL } from '../constants'; 

const LOCAL_STORAGE_KEY = 'sharon-studyBuddyMessages';

const StudyBuddyPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { openSaveToDriveModal } = useGoogleDriveSave(); 
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSubject, setSessionSubject] = useState(settings.currentSubject || ''); 
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const { addToast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (settings.currentSubject && !isSessionStarted) { 
      setSessionSubject(settings.currentSubject);
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.subject === settings.currentSubject && Array.isArray(parsedData.messages)) {
            setMessages(parsedData.messages.map((msg: ChatMessageType) => ({...msg, timestamp: new Date(msg.timestamp)})));
            initializeStudySession(settings.currentSubject, parsedData.messages.map((m:ChatMessageType) => ({role:m.sender === 'user' ? 'user' : 'model', parts: [{text:m.text}]})));
            setIsSessionStarted(true);
            addToast(`Resumed study session for ${settings.currentSubject}.`, "info");
            return; 
          }
        } catch (e) {
          console.error("Failed to parse stored messages:", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      if (settings.currentSubject) {
        initializeStudySession(settings.currentSubject);
        setIsSessionStarted(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.currentSubject]); 

  useEffect(() => {
    if (isSessionStarted && sessionSubject) {
      try {
        const dataToStore = JSON.stringify({ subject: sessionSubject, messages });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToStore);
      } catch (e) {
        console.error("Failed to save messages to localStorage:", e);
        addToast("Could not save chat history.", "warning");
      }
    }
  }, [messages, sessionSubject, isSessionStarted, addToast]);

  const initializeStudySession = useCallback((subjectToInit: string, historyForChat?: Content[]) => {
    setIsLoading(true);
    setError(null);

    let studyBuddySystemPrompt = `You are "Study Buddy AI," a friendly, patient, and encouraging AI tutor.
    Your current subject of focus is: "${subjectToInit}".
    The user is at the ${settings.academicLevel || AcademicLevel.UNDERGRADUATE} level. Assume they have some foundational knowledge but might need clarification on specifics.
    Your primary goals are to:
    1.  Explain concepts clearly and concisely related to "${subjectToInit}".
    2.  Help the user practice by asking relevant questions or creating mini-quizzes on the topic.
    3.  Assist with problem-solving by guiding them through steps rather than giving direct answers immediately.
    4.  Engage in discussions about "${subjectToInit}" to deepen understanding.
    5.  Offer encouragement and effective study tips.

    Interaction style:
    - Be interactive. Ask follow-up questions to check understanding.
    - Use examples to illustrate points.`;
    
    if (settings.geographicRegion === 'Nigeria') {
        studyBuddySystemPrompt += `\n    - When explaining concepts or providing examples, try to use contexts relevant to Nigeria (e.g., Nigerian history, culture, common student experiences) where appropriate and natural.`;
    }

    studyBuddySystemPrompt += `
    - If asked a question outside of "${subjectToInit}", politely steer the conversation back or state you're focused on the current subject.
    - Keep your tone supportive and positive. Avoid overly complex jargon unless explaining it.
    - Where appropriate, end your responses by suggesting 1-2 brief follow-up questions or discussion points the user might consider to deepen their understanding or practice further. Start these suggestions with a clear marker, like "Next, you could ask:".
    - Start by warmly greeting the user and confirming the subject you're ready to discuss.`;

    const studyBuddySettings: any = { 
      ...settings,
      writingTone: WritingTone.EXPLANATORY,
      currentSubject: subjectToInit,
      systemInstruction: studyBuddySystemPrompt 
    };
    
    try {
      const newChatInstance = startChat(studyBuddySettings, historyForChat);
      setChat(newChatInstance);
      
      if (!historyForChat || historyForChat.length === 0) { 
        const aiIntroMessage: ChatMessageType = {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: `Hi there! I'm your Study Buddy, ready to help you with ${subjectToInit}! What specific topic within ${subjectToInit} shall we dive into first? Or, ask me anything to get started!`,
            timestamp: new Date(),
        };
        setMessages([aiIntroMessage]);
      }
      setIsSessionStarted(true); 
      addToast(`Study session for ${subjectToInit} started!`, "success");

    } catch (e: any) {
      console.error("Failed to initialize Study Buddy chat:", e);
      const errorMessage = e.message || "Could not start Study Buddy. Check API Key/network.";
      setError(errorMessage);
      addToast(errorMessage, "error");
      setChat(null);
      setIsSessionStarted(false);
    } finally {
      setIsLoading(false);
    }
  }, [settings, addToast]);


  const handleStartSession = () => {
    if (!sessionSubject.trim()) {
      addToast("Subject is required to start a study session.", "warning");
      return;
    }
    updateSettings({ currentSubject: sessionSubject }); 
    setMessages([]); 
    localStorage.removeItem(LOCAL_STORAGE_KEY); 
    initializeStudySession(sessionSubject);
  };
  
  const handleClearChatHistory = () => {
    const currentAIMessage = messages.find(msg => msg.sender === 'ai');
    if (currentAIMessage) {
       setMessages([currentAIMessage]);
    } else {
       setMessages([]);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    addToast("Chat history cleared.", "info");
    if (chat && sessionSubject) {
      initializeStudySession(sessionSubject); 
    }
  };
  
  const formatTranscript = (msgs: ChatMessageType[]): string => {
    return msgs.map(msg => 
      `[${msg.sender.toUpperCase()}] (${msg.timestamp.toLocaleString()}):\n${msg.text}\n`
    ).join('\n---\n');
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'StudySession';
    return `${APP_NAME} - StudyBuddy - ${safeBase}_Transcript.${extension}`;
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) {
      addToast("No messages to download.", "info");
      return;
    }
    const transcriptContent = formatTranscript(messages);
    const filename = getSafeFilename(sessionSubject, 'txt');
    downloadTextFile(transcriptContent, filename);
    addToast('Transcript download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (messages.length === 0) {
      addToast('No transcript to save.', 'info');
      return;
    }
    const transcriptContent = formatTranscript(messages);
    const filename = getSafeFilename(sessionSubject, 'txt');
    openSaveToDriveModal(transcriptContent, filename);
  };

  const handleEndSession = () => {
    setChat(null);
    setSessionSubject(''); 
    setError(null);
    setIsSessionStarted(false);
    updateSettings({ currentSubject: '' }); 
    addToast("Study session ended.", "info");
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (text: string) => {
    if (!chat) {
      setError("Study session is not active. Please start a session.");
      addToast("Session not active. Please start.", "warning");
      return;
    }

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    let aiResponseText = "";
    const aiMessageId = crypto.randomUUID();
    let currentSuggestions: string[] = [];
    
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: aiMessageId, sender: 'ai', text: '...', timestamp: new Date(), metadata: { suggestions: [] } },
    ]);

    try {
        await streamMessageInChat(chat, text, (chunkFullText, isFinal, err) => {
            if (err) {
                setError(err);
                setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: `Error: ${err}`} : m));
                setIsLoading(false);
                return;
            }
            
            aiResponseText = chunkFullText; 
            
            if (isFinal) {
                const suggestionMarker = "Next, you could ask:";
                if (aiResponseText.includes(suggestionMarker)) {
                    const parts = aiResponseText.split(suggestionMarker);
                    if (parts[1]) {
                        currentSuggestions = parts[1].split('\n').map(s => s.replace(/^[-*]?\s*/, '').trim()).filter(s => s.length > 0 && s.length < 100);
                    }
                }
            }

            setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: aiResponseText, metadata: { suggestions: currentSuggestions } } : m));

            if (isFinal) {
                setIsLoading(false);
            }
        });
    } catch (e: any) {
        console.error("Error during Study Buddy stream:", e);
        const errorMessage = e.message || "An error occurred while sending the message.";
        setError(errorMessage);
        setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: `Error: ${errorMessage}`} : m));
        setIsLoading(false);
        addToast(errorMessage, "error");
    }
  };

  if (!isSessionStarted) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <header className="pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
            <StudyBotIcon className="h-8 w-8 mr-2 text-primary dark:text-dark-primary" />
            Study Buddy AI
          </h1>
          <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Your personal AI tutor for any subject.</p>
        </header>
        <Card title="Start Your Study Session">
          <p className="mb-4 text-sm text-muted-foreground dark:text-dark-muted-foreground">
            Tell Study Buddy what subject you'd like to focus on today.
          </p>
          <Input
            label="Subject of Study"
            placeholder="e.g., Organic Chemistry, World War II History, Python Programming"
            value={sessionSubject}
            onChange={(e) => setSessionSubject(e.target.value)}
            containerClassName="mb-4"
            aria-required="true"
          />
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <Button onClick={handleStartSession} disabled={!sessionSubject.trim() || isLoading}>
            {isLoading ? <Spinner size="sm" /> : `Start Studying ${sessionSubject || '...'}`}
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] bg-card dark:bg-dark-card rounded-lg shadow-xl">
      <header className="p-4 border-b border-border dark:border-dark-border flex justify-between items-center">
        <h1 className="text-xl font-semibold text-foreground dark:text-dark-foreground flex items-center">
          <StudyBotIcon className="h-6 w-6 mr-2 text-primary dark:text-dark-primary" />
          Study Buddy: {sessionSubject}
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
                <Spinner text="Study Buddy is thinking..." size="sm" />
            </div>
        )}
      </div>
       {error && !isLoading && <p className="p-2 text-sm text-center text-destructive bg-destructive/10">{error}</p>}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder={`Ask about ${sessionSubject}...`} />
    </div>
  );
};

export default StudyBuddyPage;