import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';

const AccountSettings = () => {
    const { user, login } = useAuth();
    const [fullName, setFullName] = useState(user.fullName);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const [updateUser, { data, error, loading }] = useMutation(UPDATE_USER);

    useEffect(() => {
        if (data?.updateUser) {
            login(data.updateUser);
            setMessage('Профиль обновлён');
            setIsError(false);
            setPassword('');
        }
        if (error) {
            setMessage(error.message);
            setIsError(true);
        }
    }, [data, error, login]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fullName.trim()) {
            setMessage('Имя не может быть пустым');
            setIsError(true);
            return;
        }
        const variables = { id: user.id, fullName };
        if (password) variables.password = password;
        updateUser({ variables });
    };

    return (
        <div className="card" style={{ maxWidth: 500 }}>
            <h2>⚙️ Настройки профиля</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Имя пользователя</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Новый пароль (оставьте пустым, чтобы не менять)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                {message && (
                    <div className={isError ? 'error' : 'success'}>{message}</div>
                )}
                <button type="submit" disabled={loading}>
                    Сохранить изменения
                </button>
            </form>
        </div>
    );
};

export default AccountSettings;