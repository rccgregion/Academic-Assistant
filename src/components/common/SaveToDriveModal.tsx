import React, { useEffect, useRef } from 'react';
import Modal from './Modal';
import { useGoogleDriveSave } from '../../contexts/GoogleDriveSaveContext';
import { useToast } from '../../hooks/useToast';
import { APP_NAME } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';

declare global {
  interface Window {
    gapi: any;
  }
}

const SaveToDriveModal: React.FC = () => {
  const { 
    isSaveModalOpen, 
    closeSaveModal, 
    currentContentToSave, 
    currentFilenameToSave,
    currentMimeType 
  } = useGoogleDriveSave();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const gdriveButtonTargetRef = useRef<HTMLDivElement>(null);
  const [dataUri, setDataUri] = React.useState<string | null>(null);

  useEffect(() => {
    if (isSaveModalOpen && currentContentToSave) {
      let uri;
      if (currentMimeType.startsWith('image/')) { 
        uri = `data:${currentMimeType};base64,${currentContentToSave}`; 
      } else {
        uri = `data:${currentMimeType};charset=utf-8,${encodeURIComponent(currentContentToSave)}`; 
      }
      setDataUri(uri);
    } else {
      setDataUri(null); 
    }
  }, [isSaveModalOpen, currentContentToSave, currentMimeType]);

  useEffect(() => {
    if (isSaveModalOpen && dataUri && currentFilenameToSave && gdriveButtonTargetRef.current) {
      if (window.gapi && window.gapi.savetodrive) {
      gdriveButtonTargetRef.current.replaceChildren();
        try {
            window.gapi.savetodrive.render(gdriveButtonTargetRef.current, {
                src: dataUri,
                filename: currentFilenameToSave,
                sitename: t('appName'),
                oncomplete: () => {
                    addToast(t('global.saveToDriveInitiated'), 'success');
                    closeSaveModal();
                },
                oncancel: () => {
                    addToast(t('global.saveToDriveCancelled'), 'info');
                    closeSaveModal();
                },
                onerror: (error: any) => { 
                    console.error('Google Drive save error:', error);
                    addToast(t('global.saveToDriveError', { error: error?.type || 'Unknown error' }), 'error');
                    closeSaveModal();
                }
            });
        } catch (e) {
            console.error("Error rendering GDrive button:", e);
            addToast(t('global.gDriveButtonError'), "error");
            closeSaveModal();
        }
      } else {
        console.warn("Google API (gapi.savetodrive) not loaded yet or render target not ready.");
        addToast(t('global.gDriveLoading'), "info");
      }
    }
  }, [isSaveModalOpen, dataUri, currentFilenameToSave, addToast, closeSaveModal, t]);

  return (
    <Modal
      isOpen={isSaveModalOpen}
      onClose={closeSaveModal}
      title={t('global.gDriveModalTitle', { filename: currentFilenameToSave || 'Document' })}
    >
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-4">
          {t('global.gDriveModalDescription')}
        </p>
        <div id="gdrive-save-button-render-target" ref={gdriveButtonTargetRef} className="flex justify-center">
            {!dataUri && <p>{t('global.preparingContent')}</p>}
            {dataUri && !(window.gapi && window.gapi.savetodrive) && <p>{t('global.gDriveLoading')}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default SaveToDriveModal;