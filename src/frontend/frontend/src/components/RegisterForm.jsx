import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { REGISTER } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = () => {
    const [fullName, setFullName] = useState('Новый Пользователь');
    const [email, setEmail] = useState('new@example.com');
    const [password, setPassword] = useState('password123');
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [registerMutation, { data, error, loading }] = useMutation(REGISTER);

    useEffect(() => {
        if (data?.createUser) {
            login(data.createUser);
            navigate('/');
        }
        if (error) {
            setLocalError(error.message);
        }
    }, [data, error, login, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError('Введите корректный email');
            return;
        }
        setLocalError('');
        registerMutation({ variables: { fullName, email, password } });
    };

    return (
        <div className="card" style={{ maxWidth: 460, margin: '40px auto' }}>
            <h2>📝 Создать аккаунт</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Полное имя</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {localError && <div className="error">{localError}</div>}
                <div className="flex-row">
                    <button type="submit" disabled={loading}>
                        Зарегистрироваться
                    </button>
                    <Link to="/login">
                        <button type="button" className="secondary">
                            Отмена
                        </button>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;