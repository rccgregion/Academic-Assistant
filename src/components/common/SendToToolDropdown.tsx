import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
// import Card from './Card'; // Card not used directly for dropdown menu items
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

type ToolDestination =
  | '/idea-spark'
  | '/docu-craft'
  | '/stealth-writer'
  | '/prompt-lab'
  | '/professor-ai'
  | '/resource-rover'
  | '/paper-analyzer'
  | '/study-buddy'
  | '/integrity-guard'
  | '/cite-wise'
  | '/viva-voce-prep'
  | '/presentation-crafter'
  | '/insight-weaver'
  | '/document-lab'; // Added Document Lab as a potential destination

interface ToolInfo {
  path: ToolDestination;
  name: string;
  description?: string; 
}

const availableTools: ToolInfo[] = [
  { path: '/idea-spark', name: 'Idea Spark' },
  { path: '/docu-craft', name: 'DocuCraft' },
  { path: '/stealth-writer', name: 'StealthWriter' },
  { path: '/prompt-lab', name: 'Prompt Lab' },
  { path: '/professor-ai', name: 'Professor AI' },
  { path: '/resource-rover', name: 'Resource Rover' },
  { path: '/paper-analyzer', name: 'Paper Analyzer' },
  { path: '/integrity-guard', name: 'IntegrityGuard' },
  { path: '/viva-voce-prep', name: 'Viva Voce Prep' },
  { path: '/presentation-crafter', name: 'Presentation Crafter' },
  { path: '/insight-weaver', name: 'InsightWeaver' },
  { path: '/document-lab', name: 'Document Lab'}, // Added Document Lab
];

interface SendToToolDropdownProps {
  textToShare: string;
  documentName?: string;
  sourceFeatureName: string; 
  buttonClassName?: string;
  menuPosition?: 'left' | 'right' | 'center';
}

const SendToToolDropdown: React.FC<SendToToolDropdownProps> = ({
  textToShare,
  documentName,
  sourceFeatureName,
  buttonClassName = '',
  menuPosition = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);


  const currentPath = location.pathname;
  const filteredTools = availableTools.filter(tool => tool.path !== currentPath);


  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setFocusedIndex(0); // Focus first item on open
    }
  }, [isOpen]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    },
    [isOpen, closeDropdown]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleSendTo = (tool: ToolInfo) => {
    if (!textToShare) {
        addToast(t('sendToTool.toast_noText', { sourceFeatureName }), 'warning');
        closeDropdown();
        return;
    }
    navigate(tool.path, {
      state: {
        initialText: textToShare,
        documentName: documentName,
        sourceFeatureName: sourceFeatureName,
      },
    });
    addToast(t('sendToTool.toast_sent', { sourceFeatureName, toolName: tool.name }), 'info');
    closeDropdown();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDropdown();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        closeDropdown();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % filteredTools.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && filteredTools[focusedIndex]) {
          handleSendTo(filteredTools[focusedIndex]);
        }
        break;
      default:
        break;
    }
  };
  
  let menuAlignmentClasses = 'right-0';
  if (menuPosition === 'left') menuAlignmentClasses = 'left-0';
  else if (menuPosition === 'center') menuAlignmentClasses = 'left-1/2 -translate-x-1/2';


  return (
    <div className="relative inline-block text-left" onKeyDown={handleKeyDown}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className={`p-1.5 text-muted-foreground hover:text-primary dark:text-dark-muted-foreground dark:hover:text-dark-primary transition-colors ${buttonClassName}`}
        aria-label={t('sendToTool.buttonAria')}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={t('sendToTool.buttonTitle')}
      >
        <PaperAirplaneIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 mt-2 w-56 origin-top-right rounded-md bg-card dark:bg-dark-card shadow-lg ring-1 ring-border dark:ring-dark-border focus:outline-none ${menuAlignmentClasses} animate-scaleIn`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={buttonRef.current?.id || undefined}
        >
          <div className="py-1" role="none">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool, index) => (
                <button
                  key={tool.path}
                  ref={el => { itemRefs.current[index] = el; }}
                  onClick={() => handleSendTo(tool)}
                  className="w-full text-left block px-4 py-2 text-sm text-card-foreground dark:text-dark-card-foreground hover:bg-muted dark:hover:bg-dark-muted hover:text-primary dark:hover:text-dark-primary focus:bg-muted dark:focus:bg-dark-muted focus:outline-none focus:ring-1 focus:ring-ring dark:focus:ring-dark-ring transition-colors rounded-sm"
                  role="menuitem"
                  tabIndex={-1} // Make focusable programmatically
                >
                  {tool.name}
                </button>
              ))
            ) : (
              <p className="px-4 py-2 text-sm text-muted-foreground dark:text-dark-muted-foreground">{t('sendToTool.noTools')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendToToolDropdown;