/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const emptyAuthState = {
    isLoggedIn: false,
    userId: null,
    userName: null,
    userAvatarUrl: '',
  };

  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('auth');

    if (!stored) {
      return emptyAuthState;
    }

    try {
      const parsed = JSON.parse(stored);
      return {
        ...emptyAuthState,
        ...parsed,
        userAvatarUrl: parsed?.userAvatarUrl || '',
      };
    } catch {
      return emptyAuthState;
    }
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(authState));
  }, [authState]);

  const login = (userId, userName, userAvatarUrl = '') => {
    setAuthState({ isLoggedIn: true, userId, userName, userAvatarUrl });
  };

  const logout = () => {
    setAuthState(emptyAuthState);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
