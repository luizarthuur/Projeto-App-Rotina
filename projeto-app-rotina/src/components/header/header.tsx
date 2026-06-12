// src/components/header/header.tsx
import './header.css';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="header-container">
      <div className="header-content-1">
        <img className="header-logo" src="/src/assets/routin-app-logo.png" alt="Logo da RoutinApp" />
        <p className="header-title">
          <strong className="header-title-routin">RoutiN</strong>
          <strong className="header-title-app">App</strong> o seu app de rotina
        </p>
      </div>

      <div className="header-content-2">
        <a href="#" onClick={(e) => e.preventDefault()}>Login</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Cadastro</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Dashboard</a>
        <a
          href="/"
          className={currentPath === '/' ? 'active' : ''}
          onClick={(e) => handleLinkClick(e, '/')}
        >
          Minha Agenda
        </a>
        <a
          href="/template"
          className={currentPath === '/template' ? 'active' : ''}
          onClick={(e) => handleLinkClick(e, '/template')}
        >
          Editar Templates
        </a>
      </div>
    </div>
  );
}