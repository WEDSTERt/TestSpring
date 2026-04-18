import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-root">
            <header className="app-navbar">
                <div className="app-logo">📋 Kanban Docky</div>
                <div className="app-nav-links">
                    <Link to="/">📁 Проекты</Link>
                    <span className="app-user-info" onClick={() => navigate('/account')} style={{ cursor: 'pointer' }}>
            👤 {user?.fullName}
          </span>
                    <button className="btn btn--secondary btn--small" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default Layout;