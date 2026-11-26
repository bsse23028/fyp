// MAIN - starts the website: fonts/styles + the providers (Language > UI > Auth > Child > Router).

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { ChildProvider } from './context/ChildContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layouts.css';
import './styles/pages.css';
import './styles/entry.css';
import './styles/english.css';
import './styles/talk.css';
import { KEYS, loadData } from './utils/misc';

// The parent's "Animations" switch (Settings) applies to the whole site.
if (!loadData(KEYS.motion, true)) document.documentElement.classList.add('motion-off');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <UIProvider>
          <AuthProvider>
            <ChildProvider>
              <ScrollToTop />
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </ChildProvider>
          </AuthProvider>
        </UIProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
