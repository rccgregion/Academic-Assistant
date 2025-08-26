import React from 'react';
import Button from './Button';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageCode } from '../../types'; // Assuming LanguageCode is here

interface LanguagePromptBannerProps {
  detectedLangCode: LanguageCode;
  detectedLangNativeName: string; // e.g., "Español"
  onSwitch: (langCode: LanguageCode) => void;
  onDismiss: () => void;
}

const LanguagePromptBanner: React.FC<LanguagePromptBannerProps> = ({
  detectedLangCode,
  detectedLangNativeName,
  onSwitch,
  onDismiss,
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-primary/90 dark:bg-dark-primary/90 text-primary-foreground dark:text-dark-primary-foreground p-3 shadow-lg animate-fadeIn z-50"
      role="alertdialog"
      aria-labelledby="lang-prompt-title"
      aria-describedby="lang-prompt-desc"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <h3 id="lang-prompt-title" className="font-semibold text-sm sm:text-base">
            {t('languagePrompt.title')}
          </h3>
          <p id="lang-prompt-desc" className="text-xs sm:text-sm opacity-90">
            {t('languagePrompt.description', { languageName: detectedLangNativeName })}
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
          <Button
            onClick={() => onSwitch(detectedLangCode)}
            variant="secondary" // Or a custom variant that fits the banner
            size="sm"
            className="!bg-white/20 hover:!bg-white/30 !text-white dark:!bg-black/20 dark:hover:!bg-black/30 dark:!text-white"
          >
            {t('languagePrompt.switchTo', { languageName: detectedLangNativeName })}
          </Button>
          <Button
            onClick={onDismiss}
            variant="ghost" // Or a custom variant
            size="sm"
            className="hover:!bg-white/10 !text-white/80 hover:!text-white dark:hover:!bg-black/10 dark:!text-white/80 dark:hover:!text-white"
          >
            {t('languagePrompt.dismiss')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguagePromptBanner;