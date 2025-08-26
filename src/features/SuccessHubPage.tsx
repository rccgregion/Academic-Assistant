
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../components/common/Card';
import ClipboardCheckIcon from '../components/icons/ClipboardCheckIcon';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { ChatMessage as ChatMessageType, AcademicLevel, WritingTone } from '../types';
import { startChat, streamMessageInChat } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { Chat, Content } from '@google/genai';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext';
import { downloadTextFile } from '../utils/downloadHelper';
import { APP_NAME } from '../constants';

const LOCAL_STORAGE_KEY_SUCCESS_HUB = 'sharon-successHubMessages';

const SuccessHubPage: React.FC = () => {
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { openSaveToDriveModal } = useGoogleDriveSave();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY_SUCCESS_HUB);
    let historyForChat: Content[] | undefined;
    if (storedData) {
      try {
        const parsedMessages = JSON.parse(storedData) as ChatMessageType[];
        setMessages(parsedMessages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
        historyForChat = parsedMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
        addToast("Resumed previous Success Hub session.", "info");
      } catch (e) {
        console.error("Failed to parse stored Success Hub messages:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY_SUCCESS_HUB);
      }
    }
    initializeChatSession(historyForChat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (messages.length > 0) { // Only save if there are messages
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SUCCESS_HUB, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save Success Hub messages:", e);
        addToast("Could not save chat history.", "warning");
      }
    }
  }, [messages, addToast]);

  const initializeChatSession = useCallback(async (history?: Content[]) => {
    setIsLoading(true);
    setError(null);

    const systemPrompt = `You are an AI academic success assistant for SHARON. 
    Users will ask questions about academic writing, research practices, university guidelines (especially Nigerian university contexts if mentioned), study skills, and thesis/dissertation development. 
    Provide helpful, concise, and actionable advice. Use web grounding to find relevant and up-to-date information where appropriate. 
    Tailor responses to a ${settings.academicLevel} student using a ${settings.writingTone} tone.
    Be interactive. Where appropriate, you can end your response by suggesting 1-2 brief follow-up questions or discussion points the user might consider. Clearly mark these suggestions, for example, by starting them with "Next, you could ask:".
    ${(!history || history.length === 0) ? "Start by warmly greeting the user and asking how you can assist them with their academic success today." : ""}`;

    const chatOptions = {
      ...settings,
      systemInstruction: systemPrompt,
      useGrounding: true,
    };

    try {
      const newChat = startChat(chatOptions, history);
      setChat(newChat);
      if (!history || history.length === 0) {
        // Trigger initial greeting from AI if no history
        await handleSendMessage("Hello!", newChat, true, true); // Automated first message, but user initiated "Hello!"
      }
    } catch (e: any) {
      setError(e.message || "Could not start chat.");
      addToast(e.message || "Could not start chat.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [settings, addToast]);

  const handleSendMessage = async (text: string, currentChatInstance?: Chat | null, isAutomatedFirstMessage = false, isGreeting = false) => {
    const activeChat = currentChatInstance || chat;
    if (!activeChat) {
      setError("Chat not initialized.");
      addToast("Chat not initialized. Please refresh.", "error");
      return;
    }

    if (!isGreeting) { // Don't add the automated "Hello!" to message list if it's just to trigger AI intro
        const userMessage: ChatMessageType = { id: crypto.randomUUID(), sender: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);
    setError(null);
    
    const aiMessageId = crypto.randomUUID();
    let currentAiResponseText = "";
    let currentSources: ChatMessageType['metadata'] = { sources: [] };
    let currentSuggestions: string[] = [];

    if (!isAutomatedFirstMessage || (isAutomatedFirstMessage && !isGreeting) ) { // Only add AI placeholder if it's not the initial greeting response that is pre-formed
        setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '...', timestamp: new Date(), metadata: { sources: [], suggestions: []} }]);
    }


    try {
      await streamMessageInChat(activeChat, text, (chunkFullText, isFinal, err, sourcesChunk) => {
        if (err) {
          setError(err);
          setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: `Error: ${err}`} : m));
          setIsLoading(false);
          return;
        }
        
        currentAiResponseText = chunkFullText;
        if (sourcesChunk && sourcesChunk.length > 0) {
          currentSources = { sources: sourcesChunk };
        }
        
        if (isFinal) {
            const suggestionMarker = "Next, you could ask:";
            if (currentAiResponseText.includes(suggestionMarker)) {
                const parts = currentAiResponseText.split(suggestionMarker);
                if (parts[1]) {
                    currentSuggestions = parts[1].split('\n').map(s => s.replace(/^[-*]?\s*/, '').trim()).filter(s => s.length > 0 && s.length < 100);
                }
            }
        }

        if (isAutomatedFirstMessage && isGreeting && isFinal) { // If it's the initial greeting, just set it as the first AI message
            setMessages([{ id: aiMessageId, sender: 'ai', text: currentAiResponseText, timestamp: new Date(), metadata: { sources: currentSources?.sources, suggestions: currentSuggestions } }]);
        } else {
            setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: currentAiResponseText, metadata: { sources: currentSources?.sources, suggestions: currentSuggestions } } : m));
        }

        if (isFinal) setIsLoading(false);
      });
    } catch (e: any) {
      const errorMessage = e.message || "Error sending message.";
      setError(errorMessage);
      setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: `Error: ${errorMessage}`} : m));
      setIsLoading(false);
      addToast(errorMessage, "error");
    }
  };
  
  const handleClearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SUCCESS_HUB);
    addToast("Chat history cleared.", "info");
    if (chat) initializeChatSession(); // Re-init for new greeting
  };

  const formatTranscript = (msgs: ChatMessageType[]): string => {
    return msgs.map(msg => 
      `[${msg.sender.toUpperCase()}] (${msg.timestamp.toLocaleString()}):\n${msg.text}${msg.metadata?.sources?.length ? '\nSources:\n' + msg.metadata.sources.map(s=>(s.web || s.retrievedContext)?.uri).join('\n') : ''}\n`
    ).join('\n---\n');
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'SuccessHub_Chat';
    return `${APP_NAME} - ${safeBase}_Transcript.${extension}`;
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) {
      addToast("No messages to download.", "info");
      return;
    }
    const transcriptContent = formatTranscript(messages);
    const filename = getSafeFilename("SuccessHub", 'txt');
    downloadTextFile(transcriptContent, filename);
    addToast('Transcript download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (messages.length === 0) {
      addToast('No transcript to save.', "info");
      return;
    }
    const transcriptContent = formatTranscript(messages);
    const filename = getSafeFilename("SuccessHub", 'txt');
    openSaveToDriveModal(transcriptContent, filename);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <ClipboardCheckIcon className="h-8 w-8 md:h-9 md:w-9 mr-3 text-primary dark:text-dark-primary" />
          Academic Success Hub
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">
          Ask questions about academic writing, research, study skills, and more.
        </p>
      </header>
      
      <Card className="flex flex-col h-[calc(100vh-16rem)] md:h-[calc(100vh-18rem)] max-h-[calc(100vh-18rem)]">
        <div className="p-4 border-b border-border dark:border-dark-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chat with SHARON Success AI</h2>
            <div className="flex gap-2">
                <Button onClick={handleDownloadTranscript} variant="outline" size="sm" disabled={messages.length === 0}>Download</Button>
                <Button onClick={handleSaveToDrive} variant="outline" size="sm" disabled={messages.length === 0}>Save to Drive</Button>
                <Button onClick={handleClearChatHistory} variant="outline" size="sm" disabled={messages.length === 0 && !isLoading}>Clear</Button>
            </div>
        </div>
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
                  <Spinner text="Thinking..." size="sm" />
              </div>
          )}
        </div>
         {error && !isLoading && <p className="p-2 text-sm text-center text-destructive bg-destructive/10">{error}</p>}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="Ask about academic success..." />
      </Card>
    </div>
  );
};

export default SuccessHubPage;