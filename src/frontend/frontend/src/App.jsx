import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import StartPage from './components/StartPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProjectsList from './components/ProjectsList';
import AccountSettings from './components/AccountSettings';
import ProjectSettings from './components/ProjectSettings';
import KanbanBoard from './components/KanbanBoard';

// Защищённый маршрут – доступ только для авторизованных пользователей
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Загрузка...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

// Публичный маршрут – доступ только для неавторизованных (редирект на главную)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Загрузка...</div>;
    return !user ? children : <Navigate to="/" />;
};

// Корневой маршрут: если пользователь авторизован – показываем проекты,
// иначе – стартовую страницу с выбором входа/регистрации
const RootRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Загрузка...</div>;
    if (user) {
        return (
            <Layout>
                <ProjectsList />
            </Layout>
        );
    }
    return <StartPage />;
};

function App() {
    return (
        <Routes>
            {/* Корневой маршрут – динамический */}
            <Route path="/" element={<RootRoute />} />

            {/* Страницы входа и регистрации (только для неавторизованных) */}
            <Route path="/login" element={
                <PublicRoute>
                    <LoginForm />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <RegisterForm />
                </PublicRoute>
            } />

            {/* Защищённые маршруты (требуют авторизации) */}
            <Route path="/account" element={
                <PrivateRoute>
                    <Layout>
                        <AccountSettings />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/project/:projectId/settings" element={
                <PrivateRoute>
                    <Layout>
                        <ProjectSettings />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/project/:projectId/board" element={
                <PrivateRoute>
                    <Layout>
                        <KanbanBoard />
                    </Layout>
                </PrivateRoute>
            } />

            {/* Все несуществующие маршруты – редирект на корень */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;