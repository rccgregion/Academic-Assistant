

import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import ThemeToggleButton from './components/common/ThemeToggleButton';
import LanguageSelectorButton from './components/common/LanguageSelectorButton';
import ToastContainer from './components/common/ToastContainer';
import { APP_NAME } from './constants';
import SaveToDriveModal from './components/common/SaveToDriveModal';
import Spinner from './components/common/Spinner';
import { useTranslation } from './hooks/useTranslation';
import LanguagePromptBanner from './components/common/LanguagePromptBanner';
import { useLanguage } from './hooks/useLanguage';

// Lazy load all feature pages
const HomePage = lazy(() => import('./features/HomePage'));
const DashboardPage = lazy(() => import('./features/DashboardPage'));
const IdeaSparkPage = lazy(() => import('./features/IdeaSparkPage'));
const DocuCraftPage = lazy(() => import('./features/DocuCraftPage'));
const StealthWriterPage = lazy(() => import('./features/StealthWriterPage'));
const PromptLabPage = lazy(() => import('./features/PromptLabPage'));
const ProfessorAIPage = lazy(() => import('./features/ProfessorAIPage'));
const ResourceRoverPage = lazy(() => import('./features/ResourceRoverPage'));
const PaperAnalyzerPage = lazy(() => import('./features/PaperAnalyzerPage'));
const StudyBuddyPage = lazy(() => import('./features/StudyBuddyPage'));
const IntegrityGuardPage = lazy(() => import('./features/IntegrityGuardPage'));
const CiteWisePage = lazy(() => import('./features/CiteWisePage'));
const VivaVocePrepPage = lazy(() => import('./features/VivaVocePrepPage'));
const PresentationCrafterPage = lazy(() => import('./features/PresentationCrafterPage'));
const DocumentLabPage = lazy(() => import('./features/DocumentLabPage'));
const SuccessHubPage = lazy(() => import('./features/SuccessHubPage'));
const SettingsPage = lazy(() => import('./features/SettingsPage'));
const DiagramDrafterPage = lazy(() => import('./features/DiagramDrafterPage'));
const LitReviewSnippetsPage = lazy(() => import('./features/LitReviewSnippetsPage'));
const InsightWeaverPage = lazy(() => import('./features/InsightWeaverPage'));


const MainAppLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setIsMobileSidebarOpen(prev => !prev), []);

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <MobileHeader onMenuClick={toggleMobileSidebar} appName={t('appName')} />
      <div className="flex h-screen pt-14 md:pt-0 bg-transparent">
        <Sidebar isMobileOpen={isMobileSidebarOpen} closeMobileSidebar={closeMobileSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main
            className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent transition-opacity duration-300 ease-out ${isPageLoading ? 'opacity-0' : 'opacity-100 animate-fadeInContent'}`}
            key={location.pathname}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};


const HomePageLayout: React.FC = () => {
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main className={`transition-opacity duration-300 ease-out ${isPageLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Outlet />
      </main>
    </>
  );
};


const AppContent: React.FC = () => {
  const { t, language } = useTranslation();
  const { showLangPrompt, setLanguage, dismissLangPrompt, languageDetails } = useLanguage();
  
  useEffect(() => {
    const appName = t('appName');
    const appDescription = t('appDescription');
    document.title = `${appName} - ${appDescription}`;
  }, [t, language]);

  const detectedLanguageInfo = showLangPrompt ? languageDetails.find(ld => ld.code === showLangPrompt) : null;
  const detectedLangNativeName = detectedLanguageInfo ? detectedLanguageInfo.nativeName : '';

  return (
    <>
      <ToastContainer />
      <SaveToDriveModal />

      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <LanguageSelectorButton />
        <ThemeToggleButton />
      </div>

      {detectedLanguageInfo && (
        <LanguagePromptBanner
          detectedLangCode={detectedLanguageInfo.code}
          detectedLangNativeName={detectedLangNativeName}
          onSwitch={setLanguage}
          onDismiss={dismissLangPrompt}
        />
      )}
      
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner text={t('global.loadingPage')} /></div>}>
        <Routes>
          {/* Homepage Route */}
          <Route element={<HomePageLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Main App Routes */}
          <Route element={<MainAppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/idea-spark" element={<IdeaSparkPage />} />
            <Route path="/docu-craft" element={<DocuCraftPage />} />
            <Route path="/stealth-writer" element={<StealthWriterPage />} />
            <Route path="/prompt-lab" element={<PromptLabPage />} />
            <Route path="/professor-ai" element={<ProfessorAIPage />} />
            <Route path="/resource-rover" element={<ResourceRoverPage />} />
            <Route path="/paper-analyzer" element={<PaperAnalyzerPage />} />
            <Route path="/study-buddy" element={<StudyBuddyPage />} />
            <Route path="/integrity-guard" element={<IntegrityGuardPage />} />
            <Route path="/cite-wise" element={<CiteWisePage />} />
            <Route path="/viva-voce-prep" element={<VivaVocePrepPage />} />
            <Route path="/presentation-crafter" element={<PresentationCrafterPage />} />
            <Route path="/insight-weaver" element={<InsightWeaverPage />} />
            <Route path="/document-lab" element={<DocumentLabPage />} />
            <Route path="/success-hub" element={<SuccessHubPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
            <Route path="/diagram-drafter" element={<DiagramDrafterPage />} />
            <Route path="/litreview-snippets" element={<LitReviewSnippetsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;