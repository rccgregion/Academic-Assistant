

import React, { useState, useCallback, useMemo, useEffect } from 'react'; 
import * as ReactRouterDOM from 'react-router-dom'; 
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { DocumentType, FormattingStyle, WritingTone, AcademicLevel, ProjectScope } from '../types';
import { generateText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext'; 
import { downloadTextFile } from '../utils/downloadHelper'; 
import { APP_NAME } from '../constants'; 
import SendToToolDropdown from '../components/common/SendToToolDropdown'; 
import ThumbsUpIcon from '../components/icons/ThumbsUpIcon';
import ThumbsDownIcon from '../components/icons/ThumbsDownIcon';
import { useFeatureState, DocuCraftState } from '../contexts/FeatureStateContext';

interface ChapterStructureDetail {
  components: string[];
  wordCountRange: string;
  title: string;
}

const getChapterDetails = (docType: DocumentType, level: AcademicLevel, region: 'Global' | 'Nigeria' = 'Global'): ChapterStructureDetail => {
  const details: { [key in DocumentType]?: { [key in AcademicLevel]?: Partial<ChapterStructureDetail> } } = {
    [DocumentType.PRELIMINARIES]: {
      [AcademicLevel.ALL]: { title: "Preliminaries", components: ["Title page structure", "Declaration sample", "Certification sample", "Dedication placeholder", "Acknowledgments placeholder", "Abstract (250–300 words)", "Table of Contents structure", "List of Figures/Tables placeholder", "List of Abbreviations placeholder"], wordCountRange: "Abstract: 250-300 words; other sections are structural." }
    },
    [DocumentType.CHAPTER_1_INTRODUCTION]: {
      [AcademicLevel.UNDERGRADUATE]: { title: "Chapter 1: Introduction", components: ["Background of the study", "Statement of the problem", "Objectives of the study", "Research questions or hypotheses", "Justification/Significance of the study", "Scope of the study", "Limitations of the study", "Definition of key terms (optional)"], wordCountRange: "1,200–1,500 words" },
      [AcademicLevel.POSTGRADUATE]: { title: "Chapter 1: Introduction", components: ["Background of the study", "Statement of the problem", "Aim and Objectives of the study", "Research questions and/or hypotheses", "Significance of the study", "Scope and Delimitations of the study", "Conceptual Clarifications/Operational definition of terms"], wordCountRange: "2,000–2,500 words" },
      [AcademicLevel.PHD]: { title: "Chapter 1: Introduction", components: ["In-depth Background of the study", "Clear Statement of the research problem", "Well-defined Aim and Objectives", "Formulated Research questions and/or hypotheses", "Comprehensive Justification and Significance", "Detailed Scope and Delimitations", "Operational definition of key constructs"], wordCountRange: "4,000–6,000 words" }
    },
    [DocumentType.CHAPTER_2_LITERATURE_REVIEW]: {
      [AcademicLevel.UNDERGRADUATE]: { title: "Chapter 2: Literature Review", components: ["Introduction to the chapter", "Conceptual framework/Theoretical underpinning", "Review of relevant empirical studies (thematic or chronological)", "Summary of literature and identification of gap(s)"], wordCountRange: "2,000–2,500 words" },
      [AcademicLevel.POSTGRADUATE]: { title: "Chapter 2: Literature Review", components: ["Introduction", "Conceptual Review/Theoretical Framework", "Critical review of empirical literature (organized thematically)", "Synthesis of literature and identification of research gap"], wordCountRange: "4,000–6,000 words" },
      [AcademicLevel.PHD]: { title: "Chapter 2: Literature Review & Theoretical Framework", components: ["Extensive introduction", "Development of Theoretical/Conceptual Framework", "Comprehensive and critical review of existing literature (global, regional, local perspectives)", "In-depth synthesis identifying precise research gaps and positioning the current study"], wordCountRange: "10,000–15,000 words" }
    },
    // ... (other standard chapter details)
    [DocumentType.CHAPTER_3_METHODOLOGY]: {
      [AcademicLevel.UNDERGRADUATE]: { title: "Chapter 3: Methodology", components: ["Research design", "Population of the study", "Sample size and sampling technique(s)", "Instrumentation (Data collection tools, validity, reliability)", "Procedure for data collection", "Method(s) of data analysis", "Ethical considerations"], wordCountRange: "1,500–2,000 words" },
      [AcademicLevel.POSTGRADUATE]: { title: "Chapter 3: Methodology", components: ["Research philosophy and design", "Population, sample, and sampling procedures", "Data collection instruments (development, validation, reliability)", "Detailed data collection procedure", "Data analysis techniques (quantitative and/or qualitative)", "Ethical considerations"], wordCountRange: "3,500–4,500 words" },
      [AcademicLevel.PHD]: { title: "Chapter 3: Research Methodology", components: ["Research paradigm and philosophical stance", "Detailed research design and justification", "Target population, sampling frame, sample size determination, and complex sampling techniques", "Instrumentation: development, rigorous validation, and reliability testing of instruments", "Pilot study (if applicable)", "Comprehensive data collection procedures", "Advanced data analysis methods (quantitative, qualitative, or mixed)", "Ethical protocol and approvals"], wordCountRange: "6,000–10,000 words" }
    },
    [DocumentType.CHAPTER_4_RESULTS]: {
      [AcademicLevel.UNDERGRADUATE]: { title: "Chapter 4: Data Presentation, Analysis and Findings", components: ["Introduction to data presentation", "Presentation of demographic data (if applicable)", "Presentation of findings according to research questions/objectives/hypotheses", "Use of tables, charts, and figures with clear descriptions", "Summary of key findings"], wordCountRange: "Approx. 2,000 words" },
      [AcademicLevel.POSTGRADUATE]: { title: "Chapter 4: Results and Findings", components: ["Introduction", "Presentation of descriptive and inferential statistics (if quantitative) or thematic analysis (if qualitative)", "Clear presentation of results aligned with research questions/hypotheses", "Visualizations of data (tables, figures, charts) with interpretations", "Summary of findings"], wordCountRange: "Approx. 3,000 words" },
      [AcademicLevel.PHD]: { title: "Chapter 4: Presentation and Analysis of Results", components: ["In-depth introduction", "Detailed presentation of data using advanced statistical/analytical techniques", "Rigorous testing of hypotheses/answering of research questions", "Sophisticated visualization and interpretation of complex data", "Clear articulation of findings without discussion (reserved for Chapter 5)"], wordCountRange: "8,000–12,000 words" }
    },
    [DocumentType.CHAPTER_5_DISCUSSION]: {
      [AcademicLevel.POSTGRADUATE]: { title: "Chapter 5: Discussion of Findings", components: ["Introduction", "Interpretation of key findings", "Relating findings to existing literature (agreement/disagreement, new insights)", "Implications of the study (theoretical, practical, policy)", "Limitations of the study", "Conclusion (brief summary of discussion)", "Suggestions for further research"], wordCountRange: "3,000–4,000 words" },
      [AcademicLevel.PHD]: { title: "Chapter 5: Discussion of Findings", components: ["Comprehensive introduction", "In-depth interpretation and discussion of each major finding", "Critical engagement with literature (situating findings within broader scholarly context)", "Elaboration of theoretical and practical implications", "Acknowledgement and thorough discussion of study limitations", "Contribution to knowledge", "Directions for future research"], wordCountRange: "8,000–12,000 words" }
    },
    [DocumentType.CHAPTER_6_CONCLUSION_RECOMMENDATIONS]: {
      [AcademicLevel.UNDERGRADUATE]: { title: "Chapter 5/6: Discussion, Summary, Conclusion & Recommendations", components: ["Introduction (brief recap)", "Discussion of findings (interpretation, relation to literature, implications)", "Summary of major findings", "Conclusion (overall statement)", "Contribution to knowledge (brief)", "Recommendations (practical, policy, further research)"], wordCountRange: "Approx. 1,500 words" }, 
      [AcademicLevel.POSTGRADUATE]: { title: "Chapter 6: Summary, Conclusion, and Recommendations", components: ["Summary of the study (brief overview of all chapters)", "Summary of major findings", "Conclusion (overall conclusive statement based on findings)", "Contribution to knowledge", "Recommendations (practical, policy-oriented, for further research)"], wordCountRange: "2,000–2,500 words" },
      [AcademicLevel.PHD]: { title: "Chapter 6: Summary, Conclusion, and Recommendations", components: ["Overall summary of the research", "Recapitulation of key findings in relation to research questions/objectives", "Drawing robust conclusions", "Significant contributions to theory, practice, and policy", "Specific and actionable recommendations", "Suggestions for impactful future research directions", "Concluding remarks"], wordCountRange: "4,000–6,000 words" }
    },
    [DocumentType.REFERENCES_BIBLIOGRAPHY]: {
      [AcademicLevel.ALL]: { title: "References / Bibliography", components: ["List all cited sources", "Follow the specified formatting style (e.g., APA, MLA) consistently"], wordCountRange: "Not applicable (list of sources)"}
    },
    [DocumentType.APPENDICES]: {
      [AcademicLevel.ALL]: { title: "Appendices", components: ["Include supplementary materials like: research instruments (questionnaires, interview guides)", "Consent forms", "Ethics approval letters", "Detailed statistical outputs (if too lengthy for main text)", "Transcripts (samples, if applicable)"], wordCountRange: "Not applicable (supplementary materials)"}
    },
    [DocumentType.ABSTRACT]: {
        [AcademicLevel.ALL]: { title: "Abstract (Standalone)", components: ["Background/Purpose", "Methods", "Key Findings", "Conclusion", "Keywords (optional)"], wordCountRange: "250-300 words" }
    },
    [DocumentType.FULL_PROJECT_OUTLINE]: {
        [AcademicLevel.ALL]: { title: "Full Project Outline", components: ["Chapter-by-chapter breakdown", "Key sections and sub-sections for each chapter", "Brief description of content for each section"], wordCountRange: "Varies (outline structure)" }
    },
    [DocumentType.PROJECT_PROPOSAL]: {
        [AcademicLevel.ALL]: { title: "Project Proposal (Detailed)", components: ["Introduction/Background", "Problem Statement", "Research Questions/Objectives/Hypotheses", "Significance/Justification", "Brief Literature Review (key sources, gap)", "Proposed Methodology (design, population, sampling, data collection, analysis plan)", "Expected Outcomes", "Timeline (brief)", "Preliminary Bibliography (optional)"], wordCountRange: "Varies (typically 1500-3000 words or more)" }
    },
    // Nigerian Specific Formats
    [DocumentType.NG_PRELIMINARIES]: {
        [AcademicLevel.ALL]: { title: "NG Preliminaries (Nigerian Format)", components: ["Title Page (University Specific)", "Declaration", "Certification", "Dedication", "Acknowledgements", "Abstract (Comprehensive)", "Table of Contents", "List of Tables/Figures (if any)"], wordCountRange: "Abstract: 250-350 words" }
    },
    [DocumentType.NG_CHAPTER_1_INTRODUCTION]: {
        [AcademicLevel.ALL]: { title: "NG Chapter 1: Introduction", components: ["Background to the Study", "Statement of the Problem", "Aim and Objectives of the Study", "Research Questions", "Research Hypotheses (if applicable)", "Significance of the Study", "Scope of the Study (Delimitation)", "Operational Definition of Terms"], wordCountRange: "Varies by university/level" }
    },
    [DocumentType.NG_CHAPTER_2_LITERATURE_REVIEW]: {
        [AcademicLevel.ALL]: { title: "NG Chapter 2: Review of Related Literature", components: ["Conceptual Review (key concepts)", "Theoretical Framework", "Empirical Review (thematic, chronological)", "Summary and Appraisal of Literature (identifying gap)"], wordCountRange: "Varies" }
    },
    [DocumentType.NG_CHAPTER_3_METHODOLOGY]: {
        [AcademicLevel.ALL]: { title: "NG Chapter 3: Research Methodology", components: ["Research Design", "Area of Study", "Population of the Study", "Sample and Sampling Technique(s)", "Instrument for Data Collection (including validity & reliability)", "Procedure for Data Collection", "Method of Data Analysis"], wordCountRange: "Varies" }
    },
    [DocumentType.NG_CHAPTER_4_RESULTS_DISCUSSION]: { // Common for BSc/HND
        [AcademicLevel.ALL]: { title: "NG Chapter 4: Results and Discussion (BSc/HND)", components: ["Data Presentation and Analysis (according to research questions/objectives)", "Discussion of Findings (interpretation, relation to literature, implications)", "Summary of Findings"], wordCountRange: "Varies" }
    },
    [DocumentType.NG_CHAPTER_5_CONCLUSION_RECOMMENDATIONS]: { // Common for BSc/HND
        [AcademicLevel.ALL]: { title: "NG Chapter 5: Summary, Conclusion & Recommendations (BSc/HND)", components: ["Summary of the Study", "Conclusion", "Recommendations (based on findings)", "Suggestions for Further Research", "Contribution to Knowledge (if applicable)"], wordCountRange: "Varies" }
    },
    [DocumentType.NG_MSC_PHD_CHAPTER_4_RESULTS]: {
        [AcademicLevel.POSTGRADUATE]: { title: "NG Chapter 4: Data Presentation and Analysis (MSc/PhD)", components: ["Presentation of Demographic Data", "Analysis of Data based on Research Questions/Hypotheses", "Detailed statistical/thematic presentation"], wordCountRange: "Varies" },
        [AcademicLevel.PHD]: { title: "NG Chapter 4: Data Presentation and Analysis (PhD)", components: ["Presentation of Demographic Data", "Analysis of Data based on Research Questions/Hypotheses", "Detailed statistical/thematic presentation"], wordCountRange: "Varies" }
    },
    [DocumentType.NG_MSC_PHD_CHAPTER_5_DISCUSSION]: {
        [AcademicLevel.POSTGRADUATE]: { title: "NG Chapter 5: Discussion of Findings (MSc/PhD)", components: ["Discussion of Major Findings", "Implications of the Findings", "Relating findings to theoretical framework and existing literature"], wordCountRange: "Varies" },
        [AcademicLevel.PHD]: { title: "NG Chapter 5: Discussion of Findings (PhD)", components: ["Discussion of Major Findings", "Implications of the Findings", "Relating findings to theoretical framework and existing literature"], wordCountRange: "Varies" }
    },
     [DocumentType.NG_MSC_PHD_CHAPTER_6_CONCLUSION]: {
        [AcademicLevel.POSTGRADUATE]: { title: "NG Chapter 6: Summary, Conclusion & Recommendations (MSc/PhD)", components: ["Summary", "Conclusion", "Recommendations", "Contribution to Knowledge", "Suggestions for Further Studies"], wordCountRange: "Varies" },
        [AcademicLevel.PHD]: { title: "NG Chapter 6: Summary, Conclusion & Recommendations (PhD)", components: ["Summary", "Conclusion", "Recommendations", "Contribution to Knowledge", "Suggestions for Further Studies"], wordCountRange: "Varies" }
    },
  };
  
  const defaultDetail: ChapterStructureDetail = { title: "Document Section", components: ["General content based on title"], wordCountRange: "User-defined" };
  
  const levelSpecificDetail = details[docType]?.[level] || details[docType]?.[AcademicLevel.ALL];

  if (levelSpecificDetail) {
    return { 
      ...defaultDetail, 
      ...levelSpecificDetail, 
      title: levelSpecificDetail.title || defaultDetail.title,
      components: levelSpecificDetail.components || defaultDetail.components,
      wordCountRange: levelSpecificDetail.wordCountRange || defaultDetail.wordCountRange
    };
  } 
  
  return defaultDetail;
};


const DocuCraftPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const location = ReactRouterDOM.useLocation(); 
  const { openSaveToDriveModal } = useGoogleDriveSave(); 
  const { getFeatureState, setFeatureState, clearFeatureState } = useFeatureState();

  const initialDocType = settings.geographicRegion === 'Nigeria' ? DocumentType.NG_CHAPTER_1_INTRODUCTION : DocumentType.CHAPTER_1_INTRODUCTION;
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocType);
  const [projectTitle, setProjectTitle] = useState('');
  const [mainArguments, setMainArguments] = useState('');
  const [targetWordCount, setTargetWordCount] = useState<number | undefined>(settings.targetWordCount);
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [refinementInstructions, setRefinementInstructions] = useState('');
  const [sourceDocumentName, setSourceDocumentName] = useState<string | undefined>(undefined); 

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const defaultDocType = settings.geographicRegion === 'Nigeria' ? DocumentType.NG_CHAPTER_1_INTRODUCTION : DocumentType.CHAPTER_1_INTRODUCTION;
    const savedState = getFeatureState<DocuCraftState>(location.pathname);
    if (savedState) {
      setDocumentType(savedState.documentType || defaultDocType);
      setProjectTitle(savedState.projectTitle || '');
      setMainArguments(savedState.mainArguments || '');
      setTargetWordCount(savedState.targetWordCount === undefined ? settings.targetWordCount : savedState.targetWordCount);
      setGeneratedContent(savedState.generatedContent || '');
      setRefinementInstructions(savedState.refinementInstructions || '');
      setSourceDocumentName(savedState.sourceDocumentName);
    } else {
      setDocumentType(defaultDocType); 
    }

    if (location.state?.initialText) {
      setMainArguments(prev => prev ? `${prev}\n\n--- From ${location.state.sourceFeatureName || 'Previous Tool'} ---\n${location.state.initialText}` : location.state.initialText);
      if (location.state.documentName) {
        setProjectTitle(prev => prev || location.state.documentName); 
        setSourceDocumentName(location.state.documentName);
      }
      const sourceTool = location.state.sourceFeatureName ? ` from ${location.state.sourceFeatureName}` : "";
      addToast(`Text loaded${sourceTool} into DocuCraft's "Key Points" field.`, 'info');
      window.history.replaceState({}, document.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, getFeatureState, addToast, settings.targetWordCount, settings.geographicRegion]);


  const documentTypeOptions = useMemo(() => {
    const allTypes = Object.values(DocumentType);
    let filteredTypes: DocumentType[];

    if (settings.geographicRegion === 'Nigeria') {
      filteredTypes = allTypes.filter(type => type.startsWith('NG_'));
    } else {
      filteredTypes = allTypes.filter(type => !type.startsWith('NG_'));
    }
    
    if (settings.academicLevel === AcademicLevel.UNDERGRADUATE && settings.geographicRegion !== 'Nigeria') {
      filteredTypes = filteredTypes.filter(type => type !== DocumentType.CHAPTER_5_DISCUSSION);
    }
    
    return filteredTypes.map(type => {
      const details = getChapterDetails(type, settings.academicLevel, settings.geographicRegion);
      if (type === DocumentType.CHAPTER_6_CONCLUSION_RECOMMENDATIONS && settings.academicLevel === AcademicLevel.UNDERGRADUATE && settings.geographicRegion !== 'Nigeria') {
        return { value: type, label: "Chapter 5/6: Discussion, Conclusion & Recommendations" };
      }
      return { value: type, label: details.title };
    });
  }, [settings.academicLevel, settings.geographicRegion]);
  
  
  const toneOptions = Object.values(WritingTone).map(tone => ({ value: tone, label: tone }));
  const styleOptions = Object.values(FormattingStyle).map(style => ({ value: style, label: style }));
  const academicLevelOptions = Object.values(AcademicLevel).filter(level => level !== AcademicLevel.ALL).map(level => ({ value: level, label: level }));

  const currentChapterDetails = useMemo(() => getChapterDetails(documentType, settings.academicLevel, settings.geographicRegion), [documentType, settings.academicLevel, settings.geographicRegion]);

  const saveCurrentState = (currentGeneratedContent: string) => {
    setFeatureState<DocuCraftState>(location.pathname, {
      documentType,
      projectTitle,
      mainArguments,
      targetWordCount,
      generatedContent: currentGeneratedContent,
      sourceDocumentName,
      refinementInstructions,
    });
  };

  const constructBasePrompt = useCallback(() => {
    const chapterInfo = getChapterDetails(documentType, settings.academicLevel, settings.geographicRegion);
    let chapterTitleForPrompt = chapterInfo.title;
    let componentsForPrompt = chapterInfo.components;

    if (settings.geographicRegion === 'Nigeria' && settings.department) {
      chapterTitleForPrompt += ` (Department: ${settings.department})`;
    }
    
    let basePrompt = `You are an AI academic assistant. Generate content for the ${chapterTitleForPrompt} of a ${settings.academicLevel} level academic project.
Project Title: "${projectTitle || sourceDocumentName || 'Untitled Project'}".
Core Components to include for this chapter/section:
${componentsForPrompt.map(c => `- ${c}`).join('\n')}
${mainArguments.trim() ? `User's Additional Key Points/Specific Instructions: ${mainArguments}.\n` : ''}
The writing tone should be ${settings.writingTone}.
If applicable for structure or citations, provide guidance based on ${settings.formattingStyle} style, but prioritize generating well-written text content over attempting complex document formatting like a full reference list.
Aim for approximately ${targetWordCount || chapterInfo.wordCountRange} for this chapter/section (unless specific instructions like for Abstract override this).`;
    
    if (settings.geographicRegion === 'Nigeria') {
        basePrompt += `\nStrictly adhere to common Nigerian university project writing standards and structure for this section. Ensure the language and examples are suitable for a Nigerian academic context.`;
    }


    if (documentType === DocumentType.REFERENCES_BIBLIOGRAPHY || documentType === DocumentType.NG_PRELIMINARIES && chapterInfo.title.includes("References")) { 
      basePrompt = `This is the "${chapterInfo.title}" section for an academic project titled "${projectTitle || sourceDocumentName || 'Untitled Project'}". 
      Please provide a brief explanation of what this section typically contains and state that it should be formatted according to ${settings.formattingStyle} style. 
      You can provide 2-3 generic examples of how different source types (e.g., book, journal article, website) might be formatted in ${settings.formattingStyle} style. 
      Do not attempt to generate a full reference list based on the project title. Output only this guidance.`;
    } else if (documentType === DocumentType.APPENDICES || documentType === DocumentType.NG_PRELIMINARIES && chapterInfo.title.includes("Appendices")) {
       basePrompt = `This is the "${chapterInfo.title}" section for an academic project titled "${projectTitle || sourceDocumentName || 'Untitled Project'}". 
      Please provide a brief explanation of what this section is for and list 3-4 examples of common items found in appendices (e.g., research instruments, consent forms, detailed data tables). 
      Output only this guidance.`;
    }
    return basePrompt;
  }, [documentType, settings, projectTitle, mainArguments, targetWordCount, sourceDocumentName]);


  const handleGenerateContent = useCallback(async () => {
    const isTitleRequired = ![DocumentType.REFERENCES_BIBLIOGRAPHY, DocumentType.APPENDICES].includes(documentType);
    if (isTitleRequired && !projectTitle.trim() && !sourceDocumentName) {
      addToast("Project title is required for most document types.", "warning");
      return;
    }
    setIsLoading(true);
    setIsRefining(false); 
    setError(null);
    setGeneratedContent('');
    setRefinementInstructions(''); 

    updateSettings({ targetWordCount }); 

    const prompt = `${constructBasePrompt()}
Output only the generated content. Ensure comprehensive coverage of all core components in a well-structured academic manner. Avoid conversational preambles or apologies.`;
    
    const result = await generateText("", { ...settings, targetWordCount, customPromptOverride: prompt });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setGeneratedContent(result.text);
      saveCurrentState(result.text);
      addToast(`${currentChapterDetails.title} content generated!`, "success");
    }
    setIsLoading(false);
  }, [constructBasePrompt, projectTitle, sourceDocumentName, documentType, settings, targetWordCount, addToast, updateSettings, currentChapterDetails.title, saveCurrentState]);

  const handleRefineContent = useCallback(async () => {
    if (!generatedContent.trim()) {
      addToast("No content to refine. Please generate content first.", "warning");
      return;
    }
    if (!refinementInstructions.trim()) {
      addToast("Refinement instructions are empty.", "warning");
      return;
    }
    setIsLoading(true);
    setIsRefining(true);
    setError(null);
    
    const basePromptContent = constructBasePrompt(); 

    const refinementPrompt = `${basePromptContent}
The following text was previously generated:
"""
${generatedContent}
"""
Now, refine this text based on the following instructions: "${refinementInstructions}".
Ensure the refined output maintains the core academic integrity and addresses all original components while incorporating the refinements.
Output ONLY the refined content. Avoid conversational preambles or apologies.`;

    const result = await generateText("", { ...settings, targetWordCount, customPromptOverride: refinementPrompt });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setGeneratedContent(result.text); 
      saveCurrentState(result.text);
      addToast(`Content refined successfully!`, "success");
    }
    setIsLoading(false);
    setIsRefining(false);
  }, [generatedContent, refinementInstructions, constructBasePrompt, settings, targetWordCount, addToast, saveCurrentState]);


  const handleCopyToClipboard = () => {
    if (!generatedContent) {
        addToast('Nothing to copy.', 'info');
        return;
    }
    navigator.clipboard.writeText(generatedContent);
    addToast('Content copied to clipboard!', 'success');
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'Document';
    return `${APP_NAME} - DocuCraft - ${safeBase}.${extension}`;
  };
  
  const handleDownloadAsMarkdown = () => {
    if (!generatedContent) {
        addToast('Nothing to download.', 'info');
        return;
    }
    const filename = getSafeFilename(projectTitle || sourceDocumentName || currentChapterDetails.title, 'md');
    downloadTextFile(generatedContent, filename, 'text/markdown;charset=utf-8');
    addToast('Markdown file download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (!generatedContent) {
      addToast('Nothing to save to Google Drive.', 'info');
      return;
    }
    const filename = getSafeFilename(projectTitle || sourceDocumentName || currentChapterDetails.title, 'md');
    openSaveToDriveModal(generatedContent, filename, 'text/markdown');
  };


  const handleClearFormAndOutput = () => {
    setProjectTitle('');
    setMainArguments('');
    setGeneratedContent('');
    setTargetWordCount(settings.targetWordCount); 
    setRefinementInstructions('');
    setError(null);
    setSourceDocumentName(undefined);
    setDocumentType(settings.geographicRegion === 'Nigeria' ? DocumentType.NG_CHAPTER_1_INTRODUCTION : DocumentType.CHAPTER_1_INTRODUCTION);
    clearFeatureState(location.pathname);
    addToast('All fields and output cleared.', 'info');
  };

  const handleClearOutputOnly = () => {
    setGeneratedContent('');
    setRefinementInstructions('');
    setError(null); // Clear error if only output is cleared
    const currentState = getFeatureState<DocuCraftState>(location.pathname);
    if (currentState) {
        setFeatureState<DocuCraftState>(location.pathname, { ...currentState, generatedContent: '', refinementInstructions: '' });
    }
    addToast('Generated output cleared.', 'info');
  };

  const handleClearFormInputsOnly = () => {
    setProjectTitle('');
    setMainArguments('');
    setTargetWordCount(settings.targetWordCount);
    setDocumentType(settings.geographicRegion === 'Nigeria' ? DocumentType.NG_CHAPTER_1_INTRODUCTION : DocumentType.CHAPTER_1_INTRODUCTION);
    setSourceDocumentName(undefined);
    // Don't clear generatedContent or refinementInstructions
    // Update feature state accordingly
    const currentState = getFeatureState<DocuCraftState>(location.pathname);
    if (currentState) {
        setFeatureState<DocuCraftState>(location.pathname, { 
            ...currentState, 
            projectTitle: '', 
            mainArguments: '', 
            targetWordCount: settings.targetWordCount,
            documentType: settings.geographicRegion === 'Nigeria' ? DocumentType.NG_CHAPTER_1_INTRODUCTION : DocumentType.CHAPTER_1_INTRODUCTION,
            sourceDocumentName: undefined,
            refinementInstructions: currentState.refinementInstructions, // Keep existing refinement instructions
        });
    }
    addToast('Form inputs cleared.', 'info');
  };

  const spinnerMsg = isRefining ? "Refining your document..." : "Crafting your document...";
  const effectiveProjectTitle = projectTitle || sourceDocumentName || "Your Document";
  
  const isGenerateDisabled = () => {
    const isTitleRequired = ![DocumentType.REFERENCES_BIBLIOGRAPHY, DocumentType.APPENDICES].includes(documentType);
    if (isTitleRequired && !projectTitle.trim() && !sourceDocumentName) {
      return true;
    }
    return isLoading || isRefining;
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <BookOpenIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          DocuCraft
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Draft sections of your academic documents with enhanced AI precision. {settings.geographicRegion === 'Nigeria' && "Nigerian academic project structures are prioritized."}</p>
      </header>

      <Card title="Document Configuration & Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Select
            label="Academic Level"
            options={academicLevelOptions}
            value={settings.academicLevel}
            onChange={(e) => {
                updateSettings({ academicLevel: e.target.value as AcademicLevel });
            }}
          />
           <Select
            label="Document Type / Chapter"
            name="documentType"
            options={documentTypeOptions}
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          />
          <Input
            label="Project Title / Topic"
            name="projectTitle"
            placeholder="e.g., The Impact of AI on Modern Education"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            disabled={[DocumentType.REFERENCES_BIBLIOGRAPHY, DocumentType.APPENDICES].includes(documentType)}
            aria-required={![DocumentType.REFERENCES_BIBLIOGRAPHY, DocumentType.APPENDICES].includes(documentType)}
          />
           <Input
            label="Target Word Count (Approx.)"
            type="number"
            name="targetWordCount"
            placeholder="e.g., 1500"
            value={targetWordCount === undefined ? '' : targetWordCount}
            onChange={(e) => setTargetWordCount(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          />
           {currentChapterDetails.wordCountRange !== "User-defined" && (
             <div className="md:col-span-2 -mt-2">
                <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground">
                    Suggested range for {settings.academicLevel} {currentChapterDetails.title}: {currentChapterDetails.wordCountRange}
                </p>
             </div>
           )}

          <div className="md:col-span-2">
            <label htmlFor="mainArguments" className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">
              Key Points / Main Arguments / Specific Instructions (Optional)
            </label>
            <textarea
              id="mainArguments"
              name="mainArguments"
              rows={4}
              className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
              placeholder="e.g., For Chapter 1, focus on ethical implications in Nigerian context... (Text from other tools may appear here)"
              value={mainArguments}
              onChange={(e) => setMainArguments(e.target.value)}
              aria-label="Key points or specific instructions"
            />
          </div>
          <Select
            label="Writing Tone"
            name="writingTone"
            options={toneOptions}
            value={settings.writingTone}
            onChange={(e) => updateSettings({ writingTone: e.target.value as WritingTone })}
          />
          <Select
            label="Formatting Style (Guidance for Citations)"
            name="formattingStyle"
            options={styleOptions}
            value={settings.formattingStyle}
            onChange={(e) => updateSettings({ formattingStyle: e.target.value as FormattingStyle })}
          />
        </div>
         {currentChapterDetails.components.length > 0 && ![DocumentType.REFERENCES_BIBLIOGRAPHY, DocumentType.APPENDICES].includes(documentType) && (
             <div className="mt-4 p-3 bg-muted/30 dark:bg-dark-muted/30 rounded-md">
                <h4 className="text-sm font-semibold text-foreground dark:text-dark-foreground mb-1">Core Components for {currentChapterDetails.title} ({settings.academicLevel}{settings.geographicRegion === 'Nigeria' ? ', Nigeria' : ''}):</h4>
                <ul className="list-disc list-inside text-xs text-muted-foreground dark:text-dark-muted-foreground space-y-0.5">
                    {currentChapterDetails.components.map(c => <li key={c}>{c}</li>)}
                </ul>
             </div>
         )}
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          {generatedContent && (
             <Button onClick={handleClearOutputOnly} variant="outline" disabled={isLoading}>Clear Output Only</Button>
          )}
          {(projectTitle || mainArguments || targetWordCount !== settings.targetWordCount) && (
            <Button onClick={handleClearFormInputsOnly} variant="outline" disabled={isLoading}>Clear Form Inputs</Button>
          )}
          <Button onClick={handleClearFormAndOutput} variant="outline" disabled={isLoading}>
            Clear Form & Output
          </Button>
          <Button 
            onClick={handleGenerateContent} 
            isLoading={isLoading && !isRefining} 
            disabled={isGenerateDisabled()}
           >
            Generate Content
          </Button>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading || isRefining}>
        {(isLoading || isRefining) && <Spinner text={spinnerMsg} />}
        {error && !isLoading && <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive"><p className="font-semibold">Error</p><p className="text-sm">{error}</p></Card>}

        {!isLoading && !generatedContent && !error && !(projectTitle.trim() || sourceDocumentName || mainArguments.trim()) && (
            <Card>
                <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                    <BookOpenIcon className="h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                    <p className="font-semibold text-lg">Ready to Craft Your Document</p>
                    <p className="text-sm">Fill in the details above and provide key points to generate academic document sections.</p>
                </div>
            </Card>
        )}

        {!isLoading && generatedContent && (
          <Card title={`Generated: ${currentChapterDetails.title}`}>
            <textarea
              readOnly
              value={generatedContent}
              className="w-full h-96 p-2.5 border rounded-md bg-muted/50 dark:bg-dark-input/30 dark:text-dark-foreground dark:border-dark-border whitespace-pre-wrap transition-all"
              aria-label="Generated content"
            />
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="refinementInstructions" className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">
                  Refinement Instructions (Optional)
                </label>
                <textarea
                  id="refinementInstructions"
                  rows={3}
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all"
                  placeholder="e.g., Make the introduction more engaging, expand on the third point, shorten the conclusion."
                  value={refinementInstructions}
                  onChange={(e) => setRefinementInstructions(e.target.value)}
                  aria-label="Refinement instructions"
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <SendToToolDropdown 
                  textToShare={generatedContent}
                  documentName={effectiveProjectTitle}
                  sourceFeatureName="DocuCraft"
                  buttonClassName="mr-auto" 
                  menuPosition="left"
                />
                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground dark:text-dark-muted-foreground mr-1">Helpful?</span>
                    <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-primary"><ThumbsUpIcon /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { addToast('Feedback recorded (mock).', 'info');}} className="p-1 text-muted-foreground hover:text-destructive"><ThumbsDownIcon /></Button>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <Button onClick={handleCopyToClipboard} variant="outline">Copy to Clipboard</Button>
                    <Button onClick={handleDownloadAsMarkdown} variant="outline">Download as .md</Button>
                    <Button onClick={handleSaveToDrive} variant="outline">Save to Google Drive</Button>
                    <Button 
                    onClick={handleRefineContent} 
                    isLoading={isLoading && isRefining} 
                    disabled={!refinementInstructions.trim() || (isLoading && !isRefining)}
                    variant="primary"
                    >
                    Refine Generated Content
                    </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocuCraftPage;