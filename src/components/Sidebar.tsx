import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import LightbulbIcon from './icons/LightbulbIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import EditIcon from './icons/EditIcon';
import SparklesIcon from './icons/SparklesIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import SearchIcon from './icons/SearchIcon';
import DocumentMagnifyingGlassIcon from './icons/DocumentMagnifyingGlassIcon';
import StudyBotIcon from './icons/StudyBotIcon';
import DocumentArrowUpIcon from './icons/DocumentArrowUpIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon'; 
import QuotationMarkIcon from './icons/QuotationMarkIcon'; 
import ClipboardCheckIcon from './icons/ClipboardCheckIcon'; 
import BrainCircuitIcon from './icons/BrainCircuitIcon'; 
import ChatBubbleQuestionIcon from './icons/ChatBubbleQuestionIcon';
import PresentationChartBarIcon from './icons/PresentationChartBarIcon';
import CogIcon from './icons/CogIcon';
import DiagramNodeIcon from './icons/DiagramNodeIcon'; 
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import { SharonLogo } from './icons/SharonLogo';
import XIcon from './icons/XIcon';
import { APP_NAME } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void; 
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => {
  const location = ReactRouterDOM.useLocation();
  const isActive = location.pathname === to || (to === '/settings' && location.pathname.startsWith('/settings')); 

  return (
  <ReactRouterDOM.NavLink
    to={to}
    onClick={onClick}
    className={
      `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out group transform
      ${isActive
        ? 'bg-primary text-primary-foreground dark:bg-dark-primary dark:text-dark-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:text-dark-muted-foreground dark:hover:bg-dark-muted dark:hover:text-dark-foreground group-hover:translate-x-0.5'
      }`
    }
  >
    <Icon className={`h-5 w-5 mr-3 transition-colors ${ isActive ? 'text-primary-foreground dark:text-dark-primary-foreground' : 'text-muted-foreground group-hover:text-foreground dark:text-dark-muted-foreground dark:group-hover:text-dark-foreground' } `} />
    <span className="truncate">{label}</span>
  </ReactRouterDOM.NavLink>
  );
};

const DefaultHomeIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, closeMobileSidebar }) => {
  const { t } = useTranslation();

  const mainNavItems = [
    { to: '/dashboard', icon: DefaultHomeIcon, label: t('sidebar.dashboard') },
    { to: '/idea-spark', icon: LightbulbIcon, label: t('sidebar.ideaSpark') },
    { to: '/litreview-snippets', icon: ClipboardDocumentListIcon, label: t('sidebar.litReviewSnippets') },
    { to: '/insight-weaver', icon: BrainCircuitIcon, label: t('sidebar.insightWeaver') }, 
    { to: '/resource-rover', icon: SearchIcon, label: t('sidebar.resourceRover') },
    { to: '/paper-analyzer', icon: DocumentMagnifyingGlassIcon, label: t('sidebar.paperAnalyzer') },
    { to: '/document-lab', icon: DocumentArrowUpIcon, label: t('sidebar.documentLab')},
    { to: '/docu-craft', icon: BookOpenIcon, label: t('sidebar.docuCraft') },
    { to: '/stealth-writer', icon: EditIcon, label: t('sidebar.stealthWriter') },
    { to: '/diagram-drafter', icon: DiagramNodeIcon, label: t('sidebar.diagramDrafter') },
    { to: '/cite-wise', icon: QuotationMarkIcon, label: t('sidebar.citeWise') }, 
    { to: '/integrity-guard', icon: ShieldCheckIcon, label: t('sidebar.integrityGuard') }, 
    { to: '/professor-ai', icon: AcademicCapIcon, label: t('sidebar.professorAI') },
    { to: '/study-buddy', icon: StudyBotIcon, label: t('sidebar.studyBuddyAI') },
    { to: '/viva-voce-prep', icon: ChatBubbleQuestionIcon, label: t('sidebar.vivaVocePrep') },
    { to: '/presentation-crafter', icon: PresentationChartBarIcon, label: t('sidebar.presentationCrafter') },
    { to: '/success-hub', icon: ClipboardCheckIcon, label: t('sidebar.successHub') }, 
    { to: '/prompt-lab', icon: SparklesIcon, label: t('sidebar.promptLab') },
  ];

  const utilityNavItems = [
    { to: '/settings', icon: CogIcon, label: t('sidebar.settings') } 
  ];

  return (
    <aside 
      className={`
        w-64 p-4 bg-card dark:bg-dark-card border-r border-border dark:border-dark-border 
        flex-col space-y-3 flex-shrink-0 
        md:sticky md:top-0 md:h-screen md:overflow-y-auto md:flex 
        fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'} 
        md:translate-x-0 md:shadow-none
      `}
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-between md:justify-start mb-1 md:mb-2">
        <ReactRouterDOM.Link to="/dashboard" className="flex items-center space-x-2 p-2 group" onClick={closeMobileSidebar}>
          <SharonLogo className="h-7 w-auto" />
          <span className="text-lg font-semibold text-foreground dark:text-dark-foreground group-hover:text-primary dark:group-hover:text-dark-primary transition-colors duration-300">{t('appName')}</span>
        </ReactRouterDOM.Link>
        <button 
          onClick={closeMobileSidebar} 
          className="p-2 md:hidden text-muted-foreground hover:text-foreground dark:text-dark-muted-foreground dark:hover:text-dark-foreground"
          aria-label="Close menu"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex flex-col space-y-1.5 flex-grow overflow-y-auto pr-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={closeMobileSidebar} />
        ))}
        <div className="pt-3 mt-3 border-t border-border dark:border-dark-border">
            {utilityNavItems.map((item) => (
                <NavItem key={item.to} {...item} onClick={closeMobileSidebar}/>
            ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;