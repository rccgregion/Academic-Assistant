import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './contexts/ToastContext';
import { GoogleDriveSaveProvider } from './contexts/GoogleDriveSaveContext';
import { FeatureStateProvider } from './contexts/FeatureStateContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <SettingsProvider>
            <GoogleDriveSaveProvider>
              <FeatureStateProvider>
                <App /> 
              </FeatureStateProvider>
            </GoogleDriveSaveProvider>
          </SettingsProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
// Trailing comment