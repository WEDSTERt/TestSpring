import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { REGISTER } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import { validateFullName, validatePassword } from '../utils/validation';

const RegisterForm = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [validationError, setValidationError] = useState('');
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
        setValidationError('');
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.isValid) {
            setValidationError(nameValidation.error);
            return;
        }
        const passValidation = validatePassword(password);
        if (!passValidation.isValid) {
            setValidationError(passValidation.error);
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError('Введите корректный email');
            return;
        }
        setLocalError('');
        registerMutation({ variables: { fullName: fullName.trim(), email, password } });
    };

    return (
        <div className="card" style={{ maxWidth: 460, margin: '40px auto' }}>
            <h2>📝 Создать аккаунт</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Имя и фамилия (введите корректно)</label>
                    <input className="form-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иван Иванов" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={email} placeholder="name@example.com" onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Пароль (латиница, цифры, спецсимволы)</label>
                    <input className="form-input" type="password" value={password} placeholder="******" onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {validationError && <div className="message-error">{validationError}</div>}
                {localError && <div className="message-error">{localError}</div>}
                <div className="flex-row">
                    <button type="submit" className="btn" disabled={loading}>Зарегистрироваться</button>
                    <Link to="/login"><button type="button" className="btn btn--secondary">Отмена</button></Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;