

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/common/Card';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import EditIcon from '../components/icons/EditIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import SearchIcon from '../components/icons/SearchIcon';
import DocumentMagnifyingGlassIcon from '../components/icons/DocumentMagnifyingGlassIcon';
import StudyBotIcon from '../components/icons/StudyBotIcon';
import DocumentArrowUpIcon from '../components/icons/DocumentArrowUpIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon'; 
import QuotationMarkIcon from '../components/icons/QuotationMarkIcon'; 
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon'; 
import ChatBubbleQuestionIcon from '../components/icons/ChatBubbleQuestionIcon';
import PresentationChartBarIcon from '../components/icons/PresentationChartBarIcon';
import DiagramNodeIcon from '../components/icons/DiagramNodeIcon';
import ClipboardDocumentListIcon from '../components/icons/ClipboardDocumentListIcon';
import { APP_NAME } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface FeatureCardProps {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ to, icon: Icon, title, description }) => (
  <ReactRouterDOM.Link to={to} className="block hover:no-underline group">
    <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out h-full flex flex-col transform group-hover:-translate-y-1.5 group-hover:border-primary dark:group-hover:border-dark-primary">
      <div className="flex items-center p-2 mb-2">
        <div className="p-3 rounded-full bg-primary/10 dark:bg-dark-primary/20 mr-4 group-hover:bg-primary/20 dark:group-hover:bg-dark-primary/30 transition-colors duration-300">
          <Icon className="h-7 w-7 text-primary dark:text-dark-primary transform transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground dark:text-dark-card-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground flex-grow px-5 pb-5">{description}</p>
    </Card>
  </ReactRouterDOM.Link>
);

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    { to: '/idea-spark', icon: LightbulbIcon, title: t('dashboard.features.ideaSpark.title'), description: t('dashboard.features.ideaSpark.description') },
    { to: '/docu-craft', icon: BookOpenIcon, title: t('dashboard.features.docuCraft.title'), description: t('dashboard.features.docuCraft.description') },
    { to: '/insight-weaver', icon: BrainCircuitIcon, title: t('dashboard.features.insightWeaver.title'), description: t('dashboard.features.insightWeaver.description') }, 
    { to: '/litreview-snippets', icon: ClipboardDocumentListIcon, title: t('dashboard.features.litReviewSnippets.title'), description: t('dashboard.features.litReviewSnippets.description') },
    { to: '/diagram-drafter', icon: DiagramNodeIcon, title: t('dashboard.features.diagramDrafter.title'), description: t('dashboard.features.diagramDrafter.description') },
    { to: '/document-lab', icon: DocumentArrowUpIcon, title: t('dashboard.features.documentLab.title'), description: t('dashboard.features.documentLab.description') },
    { to: '/stealth-writer', icon: EditIcon, title: t('dashboard.features.stealthWriter.title'), description: t('dashboard.features.stealthWriter.description') },
    { to: '/integrity-guard', icon: ShieldCheckIcon, title: t('dashboard.features.integrityGuard.title'), description: t('dashboard.features.integrityGuard.description') }, 
    { to: '/cite-wise', icon: QuotationMarkIcon, title: t('dashboard.features.citeWise.title'), description: t('dashboard.features.citeWise.description') }, 
    { to: '/paper-analyzer', icon: DocumentMagnifyingGlassIcon, title: t('dashboard.features.paperAnalyzer.title'), description: t('dashboard.features.paperAnalyzer.description') },
    { to: '/study-buddy', icon: StudyBotIcon, title: t('dashboard.features.studyBuddyAI.title'), description: t('dashboard.features.studyBuddyAI.description') },
    { to: '/professor-ai', icon: AcademicCapIcon, title: t('dashboard.features.professorAI.title'), description: t('dashboard.features.professorAI.description') },
    { to: '/viva-voce-prep', icon: ChatBubbleQuestionIcon, title: t('dashboard.features.vivaVocePrep.title'), description: t('dashboard.features.vivaVocePrep.description') }, 
    { to: '/presentation-crafter', icon: PresentationChartBarIcon, title: t('dashboard.features.presentationCrafter.title'), description: t('dashboard.features.presentationCrafter.description') }, 
    { to: '/resource-rover', icon: SearchIcon, title: t('dashboard.features.resourceRover.title'), description: t('dashboard.features.resourceRover.description') },
    { to: '/prompt-lab', icon: SparklesIcon, title: t('dashboard.features.promptLab.title'), description: t('dashboard.features.promptLab.description') },
  ];

  const tips = [
    t('dashboard.tip1'), t('dashboard.tip2'), t('dashboard.tip3'), t('dashboard.tip4'),
    t('dashboard.tip5'), t('dashboard.tip6'), t('dashboard.tip7'), t('dashboard.tip8'),
    t('dashboard.tip9'), t('dashboard.tip10'), t('dashboard.tip11'), t('dashboard.tip12'),
    t('dashboard.tip13'), t('dashboard.tip14'),
  ];

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border/70 dark:border-dark-border/50">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground dark:text-dark-foreground">{t('dashboard.welcome', { appName: APP_NAME })}</h1>
        <p className="mt-2 text-md md:text-lg text-muted-foreground dark:text-dark-muted-foreground">{t('dashboard.description')}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
          <FeatureCard key={feature.to} {...feature} />
        ))}
      </div>

      <Card title={t('dashboard.quickTipsTitle')} titleClassName="text-lg md:text-xl">
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground dark:text-dark-muted-foreground">
          {tips.map((tip, index) => <li key={index}>{tip}</li>)}
        </ul>
      </Card>
    </div>
  );
};

export default DashboardPage;