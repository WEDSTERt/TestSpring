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
        <div id="app">
            <header className="navbar">
                <div className="logo">📋 Kanban Docky</div>
                <div className="nav-links">
                    <Link to="/">📁 Проекты</Link>
                    <span className="user-info" onClick={() => navigate('/account')} style={{ cursor: 'pointer' }}>
            👤 {user?.fullName}
          </span>
                    <button className="secondary small" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </header>
            <main id="viewContainer">{children}</main>
        </div>
    );
};

export default Layout;