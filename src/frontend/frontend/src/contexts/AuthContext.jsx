import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [fetchUser, { data, error }] = useLazyQuery(GET_CURRENT_USER);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const userId = token.replace('demo-token-', '');
            fetchUser({ variables: { id: userId } });
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    useEffect(() => {
        if (data?.user) {
            setUser(data.user);
            setLoading(false);
        }
        if (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('authToken');
            setUser(null);
            setLoading(false);
        }
    }, [data, error]);

    const login = (userData) => {
        const token = 'demo-token-' + userData.id;
        localStorage.setItem('authToken', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);