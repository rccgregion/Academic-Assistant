

import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { SharonLogo } from '../components/icons/SharonLogo'; 
import LightbulbIcon from '../components/icons/LightbulbIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import EditIcon from '../components/icons/EditIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import { APP_NAME } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

const FeatureHighlightCard: React.FC<{ icon: React.ElementType; title: string; description: string; linkTo: string; learnMoreText: string }> = ({ icon: Icon, title, description, linkTo, learnMoreText }) => (
  <Card className="text-center h-full group flex flex-col items-center p-6 transform hover:-translate-y-1.5 transition-transform duration-300"> 
    <div className="flex justify-center items-center mb-5 rounded-full p-3 bg-primary/10 dark:bg-dark-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-dark-primary/30 transition-colors duration-300">
      <Icon className="h-12 w-12 text-primary dark:text-dark-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-card-foreground dark:text-dark-card-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-6 flex-grow min-h-24">{description}</p>
    <ReactRouterDOM.Link to={linkTo} className="mt-auto">
      <Button variant="secondary" size="md" className="dark:bg-dark-secondary dark:text-dark-secondary-foreground dark:hover:bg-dark-secondary/90">{learnMoreText}</Button>
    </ReactRouterDOM.Link>
  </Card>
);

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const featureHighlights = [
    { icon: LightbulbIcon, title: t('homePage.featureIdeaSparkTitle'), description: t('homePage.featureIdeaSparkDescription'), linkTo: '/idea-spark' },
    { icon: BookOpenIcon, title: t('homePage.featureDocuCraftTitle'), description: t('homePage.featureDocuCraftDescription'), linkTo: '/docu-craft' },
    { icon: EditIcon, title: t('homePage.featureStealthWriterTitle'), description: t('homePage.featureStealthWriterDescription'), linkTo: '/stealth-writer' },
    { icon: AcademicCapIcon, title: t('homePage.featureProfessorAITitle'), description: t('homePage.featureProfessorAIDescription'), linkTo: '/professor-ai' },
  ];

  return (
    <div className="bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground min-h-screen overflow-x-hidden">
      <main>
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 px-4 bg-muted/20 dark:bg-dark-muted/20 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/10 to-transparent dark:from-primary/20 rounded-full blur-3xl animate-blobFloat1"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-gradient-radial from-secondary/10 to-transparent dark:from-secondary/20 rounded-full blur-3xl animate-blobFloat2 animation-delay-4000"></div>
           </div>
          <div className="container mx-auto relative z-10">
            <SharonLogo className="h-24 w-auto mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {t('homePage.title')}{' '}
              <span className="text-primary dark:text-dark-primary">{APP_NAME}</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground dark:text-dark-muted-foreground">
              {t('homePage.subtitle', { appName: APP_NAME })}
            </p>
            <ReactRouterDOM.Link to="/dashboard">
              <Button size="lg" className="mt-8">
                {t('homePage.exploreButton')} <SparklesIcon className="ml-2 h-5 w-5" />
              </Button>
            </ReactRouterDOM.Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('homePage.featuresSectionTitle')}</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground dark:text-dark-muted-foreground mb-12">
              {t('homePage.featuresSectionSubtitle', { appName: APP_NAME })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureHighlights.map(feature => (
                <FeatureHighlightCard key={feature.title} {...feature} learnMoreText={t('homePage.featureLearnMoreButton')} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Sharon Section */}
        <section className="py-16 md:py-20 px-4 bg-card dark:bg-dark-card">
           <div className="container mx-auto text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('homePage.whySharonSectionTitle')}</h2>
             <p className="max-w-3xl mx-auto text-muted-foreground dark:text-dark-muted-foreground">
                {t('homePage.whySharonSectionSubtitle', { appName: APP_NAME })}
            </p>
           </div>
        </section>
      </main>

      <footer className="py-8 bg-background dark:bg-dark-background border-t border-border dark:border-dark-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
          {t('homePage.footerText', { year: String(currentYear), appName: APP_NAME })}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;