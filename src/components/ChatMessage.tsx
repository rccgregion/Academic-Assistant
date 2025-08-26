import React from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk } from '../types';
import { SharonLogo } from './icons/SharonLogo'; // Using the image logo
import Button from './common/Button'; // For suggestion chips
import { useTranslation } from '../hooks/useTranslation';

// Fallback UserIcon
const DefaultUserIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);


const ChatMessage: React.FC<{ message: ChatMessageType; onSuggestionClick?: (suggestion: string) => void; }> = ({ message, onSuggestionClick }) => {
  const { t } = useTranslation();
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const formatText = (text: string): React.ReactNode => {
    const suggestionMarker = "Next, you could ask:";
    let mainText = text;
    let suggestions: string[] = message.metadata?.suggestions || [];

    if (text.includes(suggestionMarker)) {
        const parts = text.split(suggestionMarker);
        mainText = parts[0].trim(); 
        if (parts[1]) {
            suggestions = parts[1].split('\n').map(s => s.replace(/^[-*]?\s*/, '').trim()).filter(s => s.length > 0 && s.length < 100); 
        }
    }
    
    if (message.metadata?.suggestions && message.metadata.suggestions.length > 0) {
      suggestions = message.metadata.suggestions;
    }

    const lines = mainText.split('\n').map((line, index, arr) => (
      <React.Fragment key={`line-${index}`}>
        {line}
        {index < arr.length - 1 && <br />}
      </React.Fragment>
    ));

    return (
        <>
            {lines}
            {message.sender === 'ai' && suggestions.length > 0 && onSuggestionClick && (
                <div className="mt-3 pt-2 border-t border-white/10 dark:border-black/20">
                    <p className="text-xs font-medium mb-1.5 opacity-80">{t('chatMessage.suggestions')}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((suggestion, idx) => (
                            <Button
                                key={`suggestion-${idx}`}
                                variant="outline" 
                                size="sm" 
                                onClick={() => onSuggestionClick(suggestion)}
                                className="text-xs !px-2.5 !py-1 bg-primary/5 text-primary dark:bg-dark-primary/10 dark:text-dark-primary border border-primary/20 dark:border-dark-primary/30 hover:bg-primary/10 dark:hover:bg-dark-primary/20 rounded-full shadow-sm hover:shadow-md transition-all"
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
  };
  
  const renderSources = (sources?: GroundingChunk[]) => {
    if (!sources || sources.length === 0) return null;
    return (
      <div className="mt-2.5 pt-2 border-t border-white/20 dark:border-black/20 text-xs">
        <h4 className="font-semibold mb-1 opacity-90">{t('chatMessage.sources')}</h4>
        <ul className="list-disc list-inside space-y-1">
          {sources.map((source, index) => {
            const S = source.web || source.retrievedContext;
            if (!S || !S.uri) return null;
            return (
              <li key={index}>
                <a 
                  href={S.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline opacity-80 hover:opacity-100"
                  title={S.uri}
                >
                  {S.title || new URL(S.uri).hostname}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (isSystem) {
    return (
      <div className="my-2 py-2 px-4 text-xs text-center text-muted-foreground dark:text-dark-muted-foreground">
        <em>{message.text}</em>
      </div>
    );
  }

  return (
    <div className={`flex my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shadow-sm overflow-hidden ${isUser ? 'ml-2 sm:ml-2.5 bg-secondary dark:bg-dark-secondary' : 'mr-2 sm:mr-2.5 bg-primary dark:bg-dark-primary'}`}>
          {isUser ? <DefaultUserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground dark:text-dark-secondary-foreground" /> : <SharonLogo className="h-full w-full object-cover scale-150" />}
        </div>
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-md ${
            isUser 
              ? 'bg-primary text-primary-foreground dark:bg-dark-primary dark:text-dark-primary-foreground rounded-br-none' 
              : 'bg-card text-card-foreground dark:bg-dark-card dark:text-dark-card-foreground rounded-bl-none'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{formatText(message.text)}</div>
          {message.sender === 'ai' && renderSources(message.metadata?.sources)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;