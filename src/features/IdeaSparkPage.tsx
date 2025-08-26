

import React, { useState, useCallback, useEffect } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { AcademicLevel, ProjectIdea, ProjectScope } from '../types';
import { generateText, parseJsonFromText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import SparklesIcon from '../components/icons/SparklesIcon';
import { useToast } from '../hooks/useToast';
import { useGoogleDriveSave } from '../contexts/GoogleDriveSaveContext';
import { downloadTextFile } from '../utils/downloadHelper';
import { APP_NAME } from '../constants';
import SendToToolDropdown from '../components/common/SendToToolDropdown'; 
import * as ReactRouterDOM from 'react-router-dom';
import { useFeatureState, IdeaSparkState } from '../contexts/FeatureStateContext';

const courseOptions = [
  { value: "", label: "Select Field (Optional)" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Engineering (General)", label: "Engineering (General)" },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Business Administration", label: "Business Administration" },
  { value: "Economics", label: "Economics" },
  { value: "Psychology", label: "Psychology" },
  { value: "Sociology", label: "Sociology" },
  { value: "History", label: "History" },
  { value: "Literature", label: "Literature" },
  { value: "Biology", label: "Biology" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Physics", label: "Physics" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Political Science", label: "Political Science" },
  { value: "Environmental Science", label: "Environmental Science" },
  { value: "Medicine", label: "Medicine" },
  { value: "Law", label: "Law" },
  { value: "Education", label: "Education" },
  { value: "Other...", label: "Other (Specify)" },
];

const regionOptions = [
  { value: "", label: "Select Region (Optional)" },
  { value: "Global", label: "Global" },
  { value: "Africa (General)", label: "Africa (General)" },
  { value: "West Africa", label: "West Africa" },
  { value: "East Africa", label: "East Africa" },
  { value: "Southern Africa", label: "Southern Africa" },
  { value: "North Africa", label: "North Africa" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Europe", label: "Europe" },
  { value: "North America", label: "North America" },
  { value: "South America", label: "South America" },
  { value: "Asia (General)", label: "Asia (General)" },
  { value: "Southeast Asia", label: "Southeast Asia" },
  { value: "Middle East", label: "Middle East" },
  { value: "Oceania", label: "Oceania" },
  { value: "Other...", label: "Other (Specify)" },
];


const IdeaSparkPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { openSaveToDriveModal } = useGoogleDriveSave();
  const { getFeatureState, setFeatureState, clearFeatureState } = useFeatureState();
  const location = ReactRouterDOM.useLocation();
  
  const [selectedCourse, setSelectedCourse] = useState(settings.currentSubject && courseOptions.some(c => c.value === settings.currentSubject) ? settings.currentSubject : "");
  const [customCourse, setCustomCourse] = useState(settings.currentSubject && !courseOptions.some(c => c.value === settings.currentSubject) ? settings.currentSubject : "");
  const [showCustomCourseField, setShowCustomCourseField] = useState(!settings.currentSubject || !courseOptions.some(c => c.value === settings.currentSubject));

  const [selectedRegion, setSelectedRegion] = useState("");
  const [customRegion, setCustomRegion] = useState("");
  const [showCustomRegionField, setShowCustomRegionField] = useState(false);
  
  const [researchTrends, setResearchTrends] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [projectScope, setProjectScope] = useState<ProjectScope>(settings.projectScope || ProjectScope.GENERAL_RESEARCH);
  
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const academicLevelOptions = Object.values(AcademicLevel).map(level => ({ value: level, label: level }));
  const projectScopeOptions = Object.values(ProjectScope).map(scope => ({ value: scope, label: scope }));

  const finalCourse = selectedCourse === "Other..." ? customCourse : selectedCourse;
  const finalRegion = selectedRegion === "Other..." ? customRegion : selectedRegion;

  useEffect(() => {
    const savedState = getFeatureState<IdeaSparkState>(location.pathname);
    if (savedState) {
      setIdeas(savedState.ideas || []);
      setSelectedCourse(savedState.selectedCourse !== undefined ? savedState.selectedCourse : (settings.currentSubject && courseOptions.some(c => c.value === settings.currentSubject) ? settings.currentSubject : ""));
      setCustomCourse(savedState.customCourse || (settings.currentSubject && !courseOptions.some(c => c.value === settings.currentSubject) ? settings.currentSubject : ""));
      setShowCustomCourseField(savedState.selectedCourse === "Other..." || (!savedState.selectedCourse && !!savedState.customCourse) );
      
      setSelectedRegion(savedState.selectedRegion || "");
      setCustomRegion(savedState.customRegion || "");
      setShowCustomRegionField(savedState.selectedRegion === "Other...");

      setResearchTrends(savedState.researchTrends || '');
      setCustomKeywords(savedState.customKeywords || '');
      setProjectScope(savedState.projectScope || settings.projectScope || ProjectScope.GENERAL_RESEARCH);
      if (savedState.ideas && savedState.ideas.length > 0) {
        addToast("Loaded previously generated ideas and form state.", "info");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, getFeatureState, addToast, settings.currentSubject, settings.projectScope]);


  useEffect(() => {
    if (finalCourse) {
        updateSettings({ currentSubject: finalCourse });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalCourse]); // updateSettings is memoized

  const saveCurrentStateToContext = (currentIdeas: ProjectIdea[]) => {
    const stateToSave: IdeaSparkState = {
      ideas: currentIdeas,
      selectedCourse,
      customCourse,
      selectedRegion,
      customRegion,
      researchTrends,
      customKeywords,
      projectScope,
    };
    setFeatureState<IdeaSparkState>(location.pathname, stateToSave);
  };


  const handleGenerateIdeas = async () => {
    if (!finalCourse.trim()) {
        addToast("Please specify a course or field of study.", "warning");
        return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas([]); // Clear previous ideas before generating new ones

    updateSettings({ currentSubject: finalCourse, academicLevel: settings.academicLevel, projectScope });

    const prompt = `Generate 3 unique and detailed academic project ideas based on the following criteria:
    Academic Level: ${settings.academicLevel}.
    Project Scope: ${projectScope}.
    Course/Field: ${finalCourse}.
    ${finalRegion ? `Consider research relevant to the region: ${finalRegion}.` : ''}
    ${researchTrends ? `Incorporate current research trends like: ${researchTrends}.` : ''}
    ${customKeywords ? `Focus on keywords: ${customKeywords}.` : ''}

    For each idea, provide:
    1.  "title": A concise and engaging title.
    2.  "description": A detailed description (3-4 sentences) explaining the project's core concept and significance.
    3.  "potentialResearchQuestion": A specific, focused research question the project could aim to answer.
    4.  "suggestedMethodology": A brief suggestion for a primary research methodology (e.g., "Qualitative interviews with experts", "Quantitative survey analysis of student data", "Systematic literature review and meta-analysis", "Experimental design with control groups", "Case study approach").
    5.  "keywords": An array of 3-5 relevant keywords.
    6.  "level": The specified academic level ("${settings.academicLevel}").
    7.  "scopeSuitability": A brief comment on how the idea fits the specified project scope ("${projectScope}"), possibly suggesting adjustments if needed.

    Format the output as a single JSON array of objects. Ensure the JSON is valid.
    Example of one object:
    {
      "title": "The Impact of Gamified Learning on Student Engagement in Online STEM Courses",
      "description": "This project investigates how incorporating game mechanics into online STEM (Science, Technology, Engineering, and Mathematics) courses influences undergraduate student engagement and learning outcomes. It will explore various gamification elements like points, badges, leaderboards, and narratives, and their perceived effectiveness from student and instructor perspectives.",
      "potentialResearchQuestion": "To what extent does the integration of specific gamification elements in online STEM courses affect undergraduate student engagement levels and their academic performance compared to non-gamified courses?",
      "suggestedMethodology": "Mixed-methods approach: quantitative analysis of platform engagement data and grades, supplemented by qualitative student surveys and interviews.",
      "keywords": ["gamification", "online learning", "STEM education", "student engagement", "educational technology"],
      "level": "${settings.academicLevel}",
      "scopeSuitability": "Suitable for a Master's thesis or an in-depth undergraduate research project, potentially scalable for a dissertation chapter by focusing on a specific STEM discipline or gamification aspect."
    }`;

    const result = await generateText("", { 
        ...settings, 
        currentSubject: finalCourse, 
        projectScope,
        responseMimeType: "application/json",
        customPromptOverride: prompt 
    });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      const parsedIdeas = parseJsonFromText<ProjectIdea[]>(result.text);
      if (parsedIdeas && Array.isArray(parsedIdeas)) {
        setIdeas(parsedIdeas);
        saveCurrentStateToContext(parsedIdeas);
        addToast(`Generated ${parsedIdeas.length} project ideas!`, "success");
      } else {
        const tempIdeas = [{ title: "Raw AI Output (JSON Parsing Failed)", description: result.text, keywords: [], level: settings.academicLevel, scopeSuitability: "N/A" }];
        setIdeas(tempIdeas);
        saveCurrentStateToContext(tempIdeas);
        setError("AI returned data in an unexpected format. Displaying raw output if available. The AI might not have followed the JSON structure perfectly.");
        addToast("Failed to parse AI response into structured ideas.", "error");
      }
    }
    setIsLoading(false);
  };

  const formatIdeasForDownload = (ideasToFormat: ProjectIdea[]): string => {
    return ideasToFormat.map((idea, index) => `
Idea ${index + 1}: ${idea.title || 'N/A'}
--------------------------------------------------
Description: ${idea.description || 'N/A'}
Potential Research Question: ${idea.potentialResearchQuestion || 'N/A'}
Suggested Methodology: ${idea.suggestedMethodology || 'N/A'}
Keywords: ${(idea.keywords || []).join(', ') || 'N/A'}
Academic Level: ${idea.level || 'N/A'}
Scope Suitability: ${idea.scopeSuitability || 'N/A'}
==================================================
    `).join('\n').trim();
  };

  const getSafeFilename = (base: string, extension: string) => {
    const safeBase = base.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'ProjectIdeas';
    return `${APP_NAME} - IdeaSpark - ${safeBase}.${extension}`;
  };

  const handleDownloadIdeas = () => {
    if (ideas.length === 0) {
      addToast('No ideas to download.', 'info');
      return;
    }
    const content = formatIdeasForDownload(ideas);
    const filename = getSafeFilename(finalCourse, 'txt');
    downloadTextFile(content, filename);
    addToast('Ideas download initiated.', 'success');
  };

  const handleSaveToDrive = () => {
    if (ideas.length === 0) {
      addToast('No ideas to save.', 'info');
      return;
    }
    const content = formatIdeasForDownload(ideas);
    const filename = getSafeFilename(finalCourse, 'txt');
    openSaveToDriveModal(content, filename);
  };

  const handleClearFormAndIdeas = () => {
    setSelectedCourse(settings.currentSubject && courseOptions.some(c => c.value === settings.currentSubject) ? settings.currentSubject : "");
    setCustomCourse(settings.currentSubject && !courseOptions.some(c => c.value === settings.currentSubject) ? settings.currentSubject : "");
    setShowCustomCourseField(!settings.currentSubject || !courseOptions.some(c => c.value === settings.currentSubject));
    setSelectedRegion("");
    setCustomRegion("");
    setShowCustomRegionField(false);
    setResearchTrends('');
    setCustomKeywords('');
    setProjectScope(settings.projectScope || ProjectScope.GENERAL_RESEARCH);
    setIdeas([]);
    setError(null);
    clearFeatureState(location.pathname);
    addToast('All input fields and generated ideas cleared.', 'info');
  };

  const handleClearIdeasOnly = () => {
    setIdeas([]);
    setError(null); // Clear error if only ideas are cleared
    // Don't clear feature state entirely, just update the ideas part
    const currentState = getFeatureState<IdeaSparkState>(location.pathname);
    if (currentState) {
        setFeatureState<IdeaSparkState>(location.pathname, { ...currentState, ideas: [] });
    }
    addToast('Generated ideas cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <SparklesIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Idea Spark
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Discover your next research project with detailed, AI-generated ideas.</p>
      </header>

      <Card title="Define Your Research Context">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Academic Level"
            name="academicLevel" // Name added for potential future form handling
            options={academicLevelOptions}
            value={settings.academicLevel}
            onChange={(e) => updateSettings({ academicLevel: e.target.value as AcademicLevel })}
          />
          <Select
            label="Project Scope"
            name="projectScope"
            options={projectScopeOptions}
            value={projectScope}
            onChange={(e) => setProjectScope(e.target.value as ProjectScope)}
          />
          
          <Select
            label="Course / Field of Study"
            name="selectedCourse"
            options={courseOptions}
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              if (e.target.value === "Other...") {
                setShowCustomCourseField(true);
                setCustomCourse(""); 
              } else {
                setShowCustomCourseField(false);
              }
            }}
            containerClassName="md:col-span-2"
          />
          {showCustomCourseField && (
            <Input
              label="Specify Course/Field"
              name="customCourse"
              placeholder="Enter your specific field"
              value={customCourse}
              onChange={(e) => setCustomCourse(e.target.value)}
              containerClassName="md:col-span-2 -mt-2"
            />
          )}

          <Select
            label="Geographic Region (Optional)"
            name="selectedRegion"
            options={regionOptions}
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              if (e.target.value === "Other...") {
                setShowCustomRegionField(true);
                setCustomRegion("");
              } else {
                setShowCustomRegionField(false);
              }
            }}
          />
          {showCustomRegionField && (
            <Input
              label="Specify Region"
              name="customRegion"
              placeholder="Enter specific region"
              value={customRegion}
              onChange={(e) => setCustomRegion(e.target.value)}
              containerClassName="-mt-2"
            />
          )}
          
          <Input
            label="Current Research Trends (Optional)"
            name="researchTrends"
            placeholder="e.g., AI ethics, climate adaptation"
            value={researchTrends}
            onChange={(e) => setResearchTrends(e.target.value)}
             containerClassName={showCustomRegionField ? "" : "md:col-start-2"} 
          />
          <Input
            label="Custom Keywords (Optional, comma-separated)"
            name="customKeywords"
            containerClassName="md:col-span-2"
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
          />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          {ideas.length > 0 && (
            <Button onClick={handleClearIdeasOnly} variant="outline" disabled={isLoading}>
              Clear Ideas Only
            </Button>
          )}
          <Button onClick={handleClearFormAndIdeas} variant="outline" disabled={isLoading}>
            Clear Form & Ideas
          </Button>
          <Button onClick={handleGenerateIdeas} isLoading={isLoading} disabled={!finalCourse.trim()}>
            Generate Detailed Ideas
          </Button>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Sparking brilliant ideas, hold tight..." />}
        {error && !isLoading && <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive"><p className="font-semibold">Error Generating Ideas</p><p className="text-sm">{error}</p></Card>}

        {!isLoading && ideas.length === 0 && !error && (
          <Card>
            <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                <SparklesIcon className="h-12 w-12 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                <p className="font-semibold text-lg">Ready to Spark Some Ideas?</p>
                <p className="text-sm">Fill in your research context above and let AI help you brainstorm.</p>
            </div>
          </Card>
        )}

        {!isLoading && ideas.length > 0 && (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground dark:text-dark-foreground">Generated Project Ideas</h2>
                  <div className="flex space-x-2 flex-shrink-0">
                      <Button onClick={handleDownloadIdeas} variant="outline" size="sm">Download Ideas</Button>
                      <Button onClick={handleSaveToDrive} variant="outline" size="sm">Save to Google Drive</Button>
                  </div>
              </div>
              {ideas.map((idea, index) => (
                <Card key={index} title={idea.title || `Idea ${index + 1}`} className="shadow-lg mb-4">
                  <div className="space-y-3 text-sm">
                    <div>
                        <h4 className="font-semibold text-foreground dark:text-dark-foreground">Description:</h4>
                        <p className="text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-line">{idea.description}</p>
                    </div>
                    {idea.potentialResearchQuestion && (
                        <div>
                            <h4 className="font-semibold text-foreground dark:text-dark-foreground">Potential Research Question:</h4>
                            <p className="text-muted-foreground dark:text-dark-muted-foreground italic">"{idea.potentialResearchQuestion}"</p>
                        </div>
                    )}
                    {idea.suggestedMethodology && (
                        <div>
                            <h4 className="font-semibold text-foreground dark:text-dark-foreground">Suggested Methodology:</h4>
                            <p className="text-muted-foreground dark:text-dark-muted-foreground">{idea.suggestedMethodology}</p>
                        </div>
                    )}
                    {idea.keywords && idea.keywords.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-foreground dark:text-dark-foreground">Keywords:</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {idea.keywords.map(kw => <span key={kw} className="px-2 py-0.5 bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary text-xs rounded-full">{kw}</span>)}
                        </div>
                    </div>
                    )}
                    <div className="pt-2 border-t border-border dark:border-dark-border flex justify-between items-center">
                        <div>
                          <p className="text-xs"><strong>Level:</strong> {idea.level || settings.academicLevel}</p>
                          {idea.scopeSuitability && <p className="text-xs"><strong>Scope Suitability:</strong> {idea.scopeSuitability}</p>}
                        </div>
                         <SendToToolDropdown 
                          textToShare={idea.description} 
                          documentName={idea.title}
                          sourceFeatureName="Idea Spark"
                          buttonClassName="ml-auto"
                          menuPosition="left"
                        />
                    </div>
                  </div>
                </Card>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaSparkPage;