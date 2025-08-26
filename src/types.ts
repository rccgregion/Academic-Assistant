


export enum AcademicLevel {
  UNDERGRADUATE = "Undergraduate",
  POSTGRADUATE = "Postgraduate",
  PHD = "PhD",
  ALL = "All Levels"
}

export enum DocumentType {
  FULL_PROJECT_OUTLINE = "Full Project Outline",
  ABSTRACT = "Abstract (Standalone)",
  PROJECT_PROPOSAL = "Project Proposal (Detailed)",

  // Standard Chapter-based types
  PRELIMINARIES = "Preliminaries (Title, Abstract, TOC, etc.)",
  CHAPTER_1_INTRODUCTION = "Chapter 1: Introduction",
  CHAPTER_2_LITERATURE_REVIEW = "Chapter 2: Literature Review",
  CHAPTER_3_METHODOLOGY = "Chapter 3: Methodology",
  CHAPTER_4_RESULTS = "Chapter 4: Results & Findings",
  CHAPTER_5_DISCUSSION = "Chapter 5: Discussion of Findings", 
  CHAPTER_6_CONCLUSION_RECOMMENDATIONS = "Chapter 6: Conclusion & Recommendations",
  REFERENCES_BIBLIOGRAPHY = "References / Bibliography",
  APPENDICES = "Appendices",

  // Nigerian Specific Document Types
  NG_PRELIMINARIES = "NG Preliminaries (Nigerian Format)",
  NG_CHAPTER_1_INTRODUCTION = "NG Chapter 1: Introduction (Nigerian Format)",
  NG_CHAPTER_2_LITERATURE_REVIEW = "NG Chapter 2: Literature Review (Nigerian Format)",
  NG_CHAPTER_3_METHODOLOGY = "NG Chapter 3: Methodology (Nigerian Format)",
  NG_CHAPTER_4_RESULTS_DISCUSSION = "NG Chapter 4: Results & Discussion (Nigerian BSc/HND Format)", // Common for BSc
  NG_CHAPTER_5_CONCLUSION_RECOMMENDATIONS = "NG Chapter 5: Summary, Conclusion & Recommendations (Nigerian BSc/HND Format)",
  NG_MSC_PHD_CHAPTER_4_RESULTS = "NG Chapter 4: Results & Findings (MSc/PhD)",
  NG_MSC_PHD_CHAPTER_5_DISCUSSION = "NG Chapter 5: Discussion of Findings (MSc/PhD)",
  NG_MSC_PHD_CHAPTER_6_CONCLUSION = "NG Chapter 6: Summary, Conclusion & Recommendations (MSc/PhD)",
}


export enum WritingTone {
  FORMAL = "Formal",
  CREATIVE = "Creative",
  ACADEMIC = "Academic",
  NEUTRAL = "Neutral",
  PERSUASIVE = "Persuasive",
  CRITICAL = "Critical",
  EXPLANATORY = "Explanatory",
  ACADEMIC_CRITICAL = "Academic Critical"
}

export enum FormattingStyle {
  APA = "APA",
  MLA = "MLA",
  CHICAGO = "Chicago",
  HARVARD = "Harvard",
  VANCOUVER = "Vancouver",
  NIGERIAN_ACADEMIC_APA = "Nigerian Academic APA" 
}

export enum ProjectScope {
    TERM_PAPER = "Term Paper",
    ESSAY = "Essay",
    THESIS_PROPOSAL = "Thesis Proposal",
    DISSERTATION_CHAPTER = "Dissertation Chapter",
    FULL_DISSERTATION_OUTLINE = "Full Dissertation Outline",
    GENERAL_RESEARCH = "General Research Idea"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  metadata?: {
    sources?: GroundingChunk[];
    suggestions?: string[]; 
  };
}

export interface ProjectIdea {
  title: string;
  description: string; 
  potentialResearchQuestion?: string;
  suggestedMethodology?: string;
  keywords: string[];
  level: AcademicLevel;
  scopeSuitability?: string; 
}

export interface PaperAnalysis {
  summary: string;
  keyFindings: string[] | string;
  methodology: string;
  limitations: string[] | string;
  identifiedGaps?: string[] | string; 
  suggestedFutureResearch?: string[] | string; 
}


export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}
export interface AISettings {
  academicLevel: AcademicLevel;
  writingTone: WritingTone;
  formattingStyle: FormattingStyle;
  currentSubject?: string;
  projectScope?: ProjectScope; 
  targetWordCount?: number;
  language: string;
  geographicRegion: 'Global' | 'Nigeria'; 
  department?: string; 
  dataSaverMode: boolean; 
}

export interface PlagiarismSegment {
  originalText: string; 
  suggestion: string; 
}

export interface PlagiarismAnalysis {
  overallScore: number; 
  segmentsToReview: PlagiarismSegment[];
  summaryMessage?: string; 
}

export interface InsightWeaverAnalysis {
  overallSummary: string;
  keyThemes: string[];
  contrastingViewpoints?: string[];
  commonMethodologies: string[];
  identifiedGaps: string[];
  futureDirections?: string[];
  rawAIResponse?: string; 
}

export interface VivaQuestionAnswer {
  question: string;
  answer: string;
}

export interface PresentationSlide {
  title: string;
  bullets: string[];
  speakerNotes?: string;
}

export interface PresentationOutline {
  overallTitle: string;
  slides: PresentationSlide[];
}

export interface LitReviewSnippet {
  title: string;
  snippetText: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'en-NG-x-pidgin' | 'ha' | 'yo' | 'ig';

export interface Translations {
  [key: string]: string | Translations;
}

export interface LocaleMessages {
  [locale: string]: Translations;
}

export interface SavedPrompt {
  id: string;
  name: string;
  text: string;
}