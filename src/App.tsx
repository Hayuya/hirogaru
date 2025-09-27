import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopPage } from './pages/TopPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Disclaimer } from './pages/Disclaimer';
import { Footer, type FooterRoute } from './components/Footer';
import { Header } from './components/Header';
import { authManager } from './auth/authManager';
import type { AuthState } from './types/auth';
import './App.css';

type AppRoute = FooterRoute;

const resolveCurrentRoute = (): AppRoute => {
  const path = window.location.pathname as AppRoute;
  if (path === '/privacy-policy' || path === '/disclaimer') {
    return path;
  }
  return '/';
};

function App() {
  const [route, setRoute] = useState<AppRoute>(() => resolveCurrentRoute());
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false, isLoggedIn: false, user: null, lineUserId: null, isFriend: false, error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      const state = await authManager.initialize();
      setAuthState(state);
    };
    initAuth();
  }, []);

  const handleNavigate = useCallback((path: AppRoute) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(resolveCurrentRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (route === '/') {
      document.title = 'ジモトデ | 広島の優良企業と出会う就活サイト';
    }
  }, [route]);

  const content = useMemo(() => {
    switch (route) {
      case '/privacy-policy':
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case '/disclaimer':
        return <Disclaimer onNavigate={handleNavigate} />;
      default:
        return (
          <>
            <TopPage authState={authState} />
            <Footer onNavigate={handleNavigate} />
          </>
        );
    }
  }, [route, handleNavigate, authState]);

  return (
    <div className="App">
      <Header authState={authState} />
      {content}
    </div>
  );
}

export default App;