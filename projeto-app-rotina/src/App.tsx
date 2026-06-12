// src/App.tsx
import { useState, useEffect } from 'react';
import Table from './components/table/table';
import TemplateEditor from './components/TemplateEditor/TemplateEditor';
import Header from './components/header/header';
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case '/template':
        return <TemplateEditor />;
      default:
        return <Table />;
    }
  };

  return (
    <div className="app">
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;