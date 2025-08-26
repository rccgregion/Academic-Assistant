import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ProjectIdea, AcademicLevel, ProjectScope, DocumentType } from '../types';

// Specific state interfaces for each feature
export interface IdeaSparkState {
  ideas: ProjectIdea[];
  selectedCourse?: string;
  customCourse?: string;
  selectedRegion?: string;
  customRegion?: string;
  researchTrends?: string;
  customKeywords?: string;
  projectScope?: ProjectScope;
  // academicLevel is typically global, but snapshotting it here might be useful if generation params depend on it.
}

export interface DocuCraftState {
  generatedContent: string;
  projectTitle?: string;
  mainArguments?: string;
  documentType?: DocumentType;
  targetWordCount?: number;
  sourceDocumentName?: string;
  refinementInstructions?: string; 
}

// Add other feature states here as needed
// export interface StealthWriterState { /* ... */ }

// Union type for all possible feature states
export type FeatureSpecificState = IdeaSparkState | DocuCraftState; // | StealthWriterState ...;

export interface FeatureStates {
  [featurePath: string]: FeatureSpecificState | undefined;
}

interface FeatureStateContextType {
  featureStates: FeatureStates;
  setFeatureState: <T extends FeatureSpecificState>(path: string, state: T) => void;
  getFeatureState: <T extends FeatureSpecificState>(path: string) => T | undefined;
  clearFeatureState: (path: string) => void;
  clearAllFeatureStates: () => void;
}

const FeatureStateContext = createContext<FeatureStateContextType | undefined>(undefined);

export const FeatureStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [featureStates, setFeatureStates] = useState<FeatureStates>({});

  const setFeatureState = useCallback(<T extends FeatureSpecificState>(path: string, state: T) => {
    setFeatureStates(prev => ({ ...prev, [path]: state }));
  }, []);

  const getFeatureState = useCallback(<T extends FeatureSpecificState>(path: string): T | undefined => {
    return featureStates[path] as T | undefined;
  }, [featureStates]);

  const clearFeatureState = useCallback((path: string) => {
    setFeatureStates(prev => {
      const newState = { ...prev };
      delete newState[path];
      return newState;
    });
  }, []);

  const clearAllFeatureStates = useCallback(() => {
    setFeatureStates({});
  }, []);

  return (
    <FeatureStateContext.Provider value={{
      featureStates,
      setFeatureState,
      getFeatureState,
      clearFeatureState,
      clearAllFeatureStates
    }}>
      {children}
    </FeatureStateContext.Provider>
  );
};

export const useFeatureState = (): FeatureStateContextType => {
  const context = useContext(FeatureStateContext);
  if (context === undefined) {
    throw new Error('useFeatureState must be used within a FeatureStateProvider');
  }
  return context;
};