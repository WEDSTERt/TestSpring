import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm.jsx';
import ProjectsList from './components/ProjectsList';
import AccountSettings from './components/AccountSettings';
import ProjectSettings from './components/ProjectSettings.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Загрузка...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Загрузка...</div>;
  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
      <Routes>
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
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <ProjectsList />
            </Layout>
          </PrivateRoute>
        } />
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
      </Routes>
  );
}

export default App;