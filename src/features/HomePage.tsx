import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import HeaderAnimation from '../components/HeaderAnimation';
import LottiePlayer from '../components/LottiePlayer';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import EditIcon from '../components/icons/EditIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import { APP_NAME } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

const FeatureHighlightCard: React.FC<{ icon: React.ElementType; title: string; description: string; linkTo: string; learnMoreText: string }> = ({ icon: Icon, title, description, linkTo, learnMoreText }) => (
  <Card className="text-center h-full group flex flex-col items-center p-6 glass-card transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"> 
    <div className="flex justify-center items-center mb-5 rounded-full p-3 bg-primary/10 dark:bg-dark-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-dark-primary/30 transition-colors duration-300 animate-float">
      <Icon className="h-12 w-12 text-primary dark:text-dark-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-card-foreground dark:text-dark-card-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-6 flex-grow min-h-24">{description}</p>
    <ReactRouterDOM.Link to={linkTo} className="mt-auto">
      <Button variant="secondary" size="md" className="dark:bg-dark-secondary dark:text-dark-secondary-foreground dark:hover:bg-dark-secondary/90 transform hover:scale-105 transition-transform duration-200">
        {learnMoreText}
      </Button>
    </ReactRouterDOM.Link>
  </Card>
);

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [animMode, setAnimMode] = useState<'blobs' | 'lottie'>('blobs');
  const [lottiePath, setLottiePath] = useState<string>('/lottie/sample.json');
  const [lottieLoop, setLottieLoop] = useState<boolean>(true);

  // read persisted anim mode from localStorage (set by Navbar toggle)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('header.animMode');
      if (raw) {
        const parsed = JSON.parse(raw) as 'blobs' | 'lottie';
        if (parsed) setAnimMode(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Prefer a designer-provided animation if the file exists at /lottie/designer.json
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch('/lottie/designer.json', { method: 'HEAD' });
        if (!mounted) return;
        if (resp.ok) setLottiePath('/lottie/designer.json');
      } catch (e) {
        // ignore and keep sample
      }
    })();
    return () => { mounted = false; };
  }, []);

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
        {/* Enhanced Hero Section */}
        <section className="relative text-center py-20 md:py-32 px-4 bg-gradient-to-br from-background/90 via-primary/5 to-secondary/10 dark:from-dark-background/90 dark:via-dark-primary/10 dark:to-dark-secondary/15 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/20 to-transparent dark:from-primary/30 rounded-full blur-3xl animate-blobFloat1"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[55rem] bg-gradient-radial from-secondary/20 to-transparent dark:from-secondary/30 rounded-full blur-3xl animate-blobFloat2 animation-delay-4000"></div>
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-radial from-accent/15 to-transparent dark:from-accent/25 rounded-full blur-3xl animate-blobFloat3 animation-delay-2000"></div>
          </div>
          <div className="container mx-auto relative z-10">
            <div className="mx-auto mb-8 animate-slide-up">
              {animMode === 'lottie' ? (
                <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto transform hover:scale-110 transition-transform duration-500">
                  <LottiePlayer path={lottiePath} loop={lottieLoop} autoplay className="w-full h-full" />
                </div>
              ) : (
                <HeaderAnimation className="w-48 h-36 md:w-56 md:h-40 mx-auto transform hover:scale-110 transition-transform duration-500" />
              )}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-primary dark:from-dark-foreground dark:to-dark-primary bg-clip-text text-transparent animate-fadeInContent">
              {t('homePage.title')}{' '}
              <span className="text-primary dark:text-dark-primary drop-shadow-2xl animate-pulse-glow">{APP_NAME}</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground dark:text-dark-muted-foreground leading-relaxed font-light">
              {t('homePage.subtitle', { appName: APP_NAME })}
            </p>
            <ReactRouterDOM.Link to="/dashboard">
              <Button size="lg" className="mt-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-5 px-10 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-slide-up">
                {t('homePage.exploreButton')} <SparklesIcon className="ml-3 h-7 w-7" />
              </Button>
            </ReactRouterDOM.Link>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text dark:gradient-text-dark">{t('homePage.featuresSectionTitle')}</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground dark:text-dark-muted-foreground mb-12 leading-relaxed">
              {t('homePage.featuresSectionSubtitle', { appName: APP_NAME })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureHighlights.map(feature => (
                <FeatureHighlightCard key={feature.title} {...feature} learnMoreText={t('homePage.featureLearnMoreButton')} />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-20 md:py-28 px-4 bg-muted/40 dark:bg-dark-muted/30">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground dark:text-dark-foreground gradient-text dark:gradient-text-dark">
              What Students Are Saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <Card className="p-8 text-left glass-card transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    JD
                  </div>
                  <div className="ml-5">
                    <h4 className="font-semibold text-lg">John Doe</h4>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">PhD Candidate</p>
                  </div>
                </div>
                <p className="text-muted-foreground dark:text-dark-muted-foreground italic text-base leading-relaxed">
                  "SHARON revolutionized my research process. The literature synthesis tools saved me countless hours!"
                </p>
              </Card>
              
              <Card className="p-8 text-left glass-card transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    AS
                  </div>
                  <div className="ml-5">
                    <h4 className="font-semibold text-lg">Aisha Smith</h4>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">Masters Student</p>
                  </div>
                </div>
                <p className="text-muted-foreground dark:text-dark-muted-foreground italic text-base leading-relaxed">
                  "The Idea Spark feature helped me discover research topics I never would have considered on my own."
                </p>
              </Card>
              
              <Card className="p-8 text-left glass-card transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    MK
                  </div>
                  <div className="ml-5">
                    <h4 className="font-semibold text-lg">Michael Kim</h4>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">Undergraduate</p>
                  </div>
                </div>
                <p className="text-muted-foreground dark:text-dark-muted-foreground italic text-base leading-relaxed">
                  "Professor AI gave me feedback that was just as good as my actual professor's. Incredible tool!"
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Interactive Quiz Section */}
        <section className="py-20 md:py-28 px-4 bg-gradient-to-r from-primary/10 via-secondary/8 to-accent/12 dark:from-dark-primary/15 dark:via-dark-secondary/12 dark:to-dark-accent/18">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground dark:text-dark-foreground gradient-text dark:gradient-text-dark">
              Quick Academic Challenge
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-muted-foreground dark:text-dark-muted-foreground mb-12 leading-relaxed">
              Test your knowledge with this quick quiz! See how SHARON can help you with similar challenges.
            </p>
            <Card className="max-w-2xl mx-auto p-8 glass-card transform hover:scale-102 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-6 text-center">What's the first step in conducting academic research?</h3>
              <div className="space-y-4">
                <button className="w-full p-4 text-left rounded-xl border-2 border-border dark:border-dark-border hover:border-primary/30 dark:hover:border-dark-primary/30 hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-all duration-200 transform hover:scale-101">
                  A) Writing the conclusion
                </button>
                <button className="w-full p-4 text-left rounded-xl border-2 border-border dark:border-dark-border hover:border-secondary/30 dark:hover:border-dark-secondary/30 hover:bg-secondary/5 dark:hover:bg-dark-secondary/5 transition-all duration-200 transform hover:scale-101">
                  B) Conducting literature review
                </button>
                <button className="w-full p-4 text-left rounded-xl border-2 border-border dark:border-dark-border hover:border-accent/30 dark:hover:border-dark-accent/30 hover:bg-accent/5 dark:hover:bg-dark-accent/5 transition-all duration-200 transform hover:scale-101">
                  C) Defining research questions
                </button>
                <button className="w-full p-4 text-left rounded-xl border-2 border-border dark:border-dark-border hover:border-primary/30 dark:hover:border-dark-primary/30 hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-all duration-200 transform hover:scale-101">
                  D) Collecting data
                </button>
              </div>
              <p className="mt-6 text-lg text-muted-foreground dark:text-dark-muted-foreground text-center">
                Hint: Use SHARON's Idea Spark to help define your research questions!
              </p>
            </Card>
          </div>
        </section>

        {/* Enhanced Why Sharon Section */}
        <section className="py-20 md:py-28 px-4 bg-card dark:bg-dark-card">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground dark:text-dark-foreground gradient-text dark:gradient-text-dark">
              {t('homePage.whySharonSectionTitle')}
            </h2>
            <p className="max-w-4xl mx-auto text-xl text-muted-foreground dark:text-dark-muted-foreground leading-relaxed mb-16">
              {t('homePage.whySharonSectionSubtitle', { appName: APP_NAME })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center glass-card p-8 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 dark:bg-dark-primary/20 rounded-full flex items-center justify-center animate-float">
                  <SparklesIcon className="h-10 w-10 text-primary dark:text-dark-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground dark:text-dark-muted-foreground text-lg leading-relaxed">
                  Cutting-edge AI technology that understands academic context and provides relevant, accurate assistance
                </p>
              </div>
              <div className="text-center glass-card p-8 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 bg-secondary/10 dark:bg-dark-secondary/20 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                  <AcademicCapIcon className="h-10 w-10 text-secondary dark:text-dark-secondary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Academic Integrity</h3>
                <p className="text-muted-foreground dark:text-dark-muted-foreground text-lg leading-relaxed">
                  Tools designed to enhance your work while maintaining academic honesty and proper citation practices
                </p>
              </div>
              <div className="text-center glass-card p-8 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 dark:bg-dark-accent/20 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                  <LightbulbIcon className="h-10 w-10 text-accent dark:text-dark-accent" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Global Relevance</h3>
                <p className="text-muted-foreground dark:text-dark-muted-foreground text-lg leading-relaxed">
                  Context-aware assistance that understands diverse academic systems and research methodologies worldwide
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-background dark:bg-dark-background border-t border-border dark:border-dark-border">
        <div className="container mx-auto text-center text-lg text-muted-foreground dark:text-dark-muted-foreground">
          {t('homePage.footerText', { year: String(currentYear), appName: APP_NAME })}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
