import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('secret123');
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginMutation, { data, error, loading }] = useMutation(LOGIN);

    useEffect(() => {
        if (data?.login) {
            login(data.login);
            navigate('/');
        } else if (data && !data?.login) {
            setLocalError('Неверный email или пароль');
        }
        if (error) {
            setLocalError(error.message);
        }
    }, [data, error, login, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError('Введите корректный email');
            return;
        }
        setLocalError('');
        try {
            await loginMutation({ variables: { email, password } });
        } catch {
            // ошибка уже обработана в useEffect
        }
    };

    return (
        <div className="card" style={{ maxWidth: 460, margin: '40px auto' }}>
            <h2>🔐 Вход в Kanban Docky</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Пароль</label>
                    <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {localError && <div className="message-error">{localError}</div>}
                <div className="flex-row">
                    <button type="submit" className="btn" disabled={loading}>Войти</button>
                    <Link to="/register"><button type="button" className="btn btn--secondary">Регистрация</button></Link>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;