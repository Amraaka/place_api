/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiRequest } from '../lib/api';

export const AuthContext = createContext();

const EMPTY_AUTH_STATE = {
  isLoggedIn: false,
  userId: null,
  userName: null,
  userAvatarUrl: '',
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) return EMPTY_AUTH_STATE;
    try {
      const parsed = JSON.parse(stored);
      return { ...EMPTY_AUTH_STATE, ...parsed, userAvatarUrl: parsed?.userAvatarUrl || '' };
    } catch {
      return EMPTY_AUTH_STATE;
    }
  });

  const [authChecked, setAuthChecked] = useState(false);

  const applyAuthUser = useCallback((user) => {
    setAuthState({
      isLoggedIn: true,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.imageUrl || '',
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(authState));
  }, [authState]);

  const syncMe = useCallback(async () => {
    try {
      const data = await apiRequest('/api/users/me');
      applyAuthUser(data.user);
      return true;
    } catch {
      setAuthState(EMPTY_AUTH_STATE);
      return false;
    } finally {
      setAuthChecked(true);
    }
  }, [applyAuthUser]);

  useEffect(() => {
    syncMe();
  }, [syncMe]);

  const login = (userId, userName, userAvatarUrl = '') => {
    applyAuthUser({ id: userId, name: userName, imageUrl: userAvatarUrl });
    setAuthChecked(true);
  };

  const logout = async () => {
    try {
      await apiRequest('/api/users/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    setAuthState(EMPTY_AUTH_STATE);
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        authChecked,
        login,
        logout,
        syncMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
