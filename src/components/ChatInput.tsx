import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import Button from './common/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const componentIsMounted = useRef(true);

  useEffect(() => {
    componentIsMounted.current = true;
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current && !isLoading && componentIsMounted.current) { 
      textareaRef.current.focus();
    }
  }, [isLoading]); 


  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      // Textarea focus is handled by the useEffect hook reacting to isLoading changes
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t bg-card dark:bg-dark-card border-border dark:border-dark-border">
      <div className="flex items-end space-x-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={1}
          className="flex-1 p-2.5 border rounded-md resize-none 
                     bg-background dark:bg-dark-input 
                     border-input dark:border-dark-border 
                     text-foreground dark:text-dark-foreground 
                     placeholder:text-muted-foreground dark:placeholder:text-dark-muted-foreground
                     focus:ring-2 focus:ring-ring dark:focus:ring-dark-ring focus:border-transparent 
                     min-h-[40px] max-h-[120px]
                     transition-all duration-150 ease-in-out" 
          disabled={isLoading}
        />
        <Button onClick={handleSubmit} isLoading={isLoading} disabled={!message.trim()} className="h-[42px]"> {/* Match height */}
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;