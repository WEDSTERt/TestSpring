import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER, DELETE_USER } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { validateFullName, validatePassword } from '../utils/validation';

const AccountSettings = () => {
    const { user, loading, login, logout } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (user) setFullName(user.fullName || '');
    }, [user]);

    const [updateUser, { data, error, loading: updateLoading }] = useMutation(UPDATE_USER);
    const [deleteUser] = useMutation(DELETE_USER, {
        onCompleted: () => { logout(); navigate('/login'); },
        onError: (err) => { setMessage(err.message); setIsError(true); },
    });

    useEffect(() => {
        if (data?.updateUser) {
            login(data.updateUser);
            setMessage('Профиль обновлён');
            setIsError(false);
            setPassword('');
            setValidationError('');
        }
        if (error) {
            setMessage(error.message);
            setIsError(true);
        }
    }, [data, error, login]);

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError('');
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.isValid) {
            setValidationError(nameValidation.error);
            return;
        }
        if (password) {
            const passValidation = validatePassword(password);
            if (!passValidation.isValid) {
                setValidationError(passValidation.error);
                return;
            }
        }
        const variables = { id: user.id, fullName: fullName.trim() };
        if (password) variables.password = password;
        updateUser({ variables });
    };

    const handleDeleteAccount = () => deleteUser({ variables: { id: user.id } });

    return (
        <div className="account-settings-container">
            <div className="card account-settings-card">
                <button className="modal-close--settings" onClick={() => navigate('/')}>✕</button>
                <h2>⚙️ Настройки профиля</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Имя пользователя (Имя Фамилия)</label>
                        <input className="form-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иван Иванов" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Новый пароль (оставьте пустым, чтобы не менять)</label>
                        <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    {validationError && <div className="message-error">{validationError}</div>}
                    {message && <div className={isError ? 'message-error' : 'message-success'}>{message}</div>}
                    <div className="form-actions">
                        <button type="submit" className="btn" disabled={updateLoading}>Сохранить изменения</button>
                        <button type="button" className="btn btn--danger" onClick={() => setShowDeleteConfirm(true)}>Удалить аккаунт</button>
                    </div>
                </form>
            </div>
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Удаление аккаунта"
                message="Вы действительно хотите удалить свой аккаунт? Это действие необратимо. Все ваши проекты и задачи будут удалены."
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default AccountSettings;