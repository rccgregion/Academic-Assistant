
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface GoogleDriveSaveContextType {
  isSaveModalOpen: boolean;
  currentContentToSave: string | null;
  currentFilenameToSave: string | null;
  currentMimeType: string;
  openSaveToDriveModal: (content: string, filename: string, mimeType?: string) => void;
  closeSaveModal: () => void;
}

const GoogleDriveSaveContext = createContext<GoogleDriveSaveContextType | undefined>(undefined);

export const GoogleDriveSaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentContentToSave, setCurrentContentToSave] = useState<string | null>(null);
  const [currentFilenameToSave, setCurrentFilenameToSave] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>('text/plain');


  const openSaveToDriveModal = useCallback((content: string, filename: string, mimeType: string = 'text/plain') => {
    setCurrentContentToSave(content);
    setCurrentFilenameToSave(filename);
    setCurrentMimeType(mimeType);
    setIsSaveModalOpen(true);
  }, []);

  const closeSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
    // Optionally clear content after a delay to allow modal to animate out
    setTimeout(() => {
        setCurrentContentToSave(null);
        setCurrentFilenameToSave(null);
    }, 300);
  }, []);

  return (
    <GoogleDriveSaveContext.Provider value={{ 
      isSaveModalOpen, 
      currentContentToSave,
      currentFilenameToSave,
      currentMimeType,
      openSaveToDriveModal, 
      closeSaveModal 
    }}>
      {children}
    </GoogleDriveSaveContext.Provider>
  );
};

export const useGoogleDriveSave = (): GoogleDriveSaveContextType => {
  const context = useContext(GoogleDriveSaveContext);
  if (context === undefined) {
    throw new Error('useGoogleDriveSave must be used within a GoogleDriveSaveProvider');
  }
  return context;
};