import './header.css';

export default function Header() {
    return (
        <div className="header-container">
            <div className="header-content-1">
                <img className="header-logo" src="/src/assets/routin-app-logo.png" alt="Logo da RoutinApp" />
                <p className="header-title"> <strong className="header-title-routin">RoutiN</strong><strong className="header-title-app">App</strong> o seu app de rotina</p>
            </div>

            <div className="header-content-2">
                <a href="#">Login</a>
                <a href="#">Cadastro</a>
                <a href="#">Dashboard</a>
            </div>
        </div>
    )
}