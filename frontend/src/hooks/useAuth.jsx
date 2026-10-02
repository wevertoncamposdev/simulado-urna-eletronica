import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuthToken, hasAuthToken, setAuthToken, setUnauthorizedHandler } from '@/services/api';

const AuthContext = createContext(null);

// 'loading' enquanto confere o token salvo; depois vira 'authenticated' ou 'anonymous'.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setStatus('anonymous');
  }, []);

  // Qualquer requisição que volte 401 (token ausente/expirado) desloga sozinho.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!hasAuthToken()) {
      setStatus('anonymous');
      return;
    }
    api.auth
      .me()
      .then((loadedUser) => {
        setUser(loadedUser);
        setStatus('authenticated');
      })
      .catch(() => setStatus('anonymous'));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedUser, token } = await api.auth.login({ email, password });
    setAuthToken(token);
    setUser(loggedUser);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user: newUser, token } = await api.auth.register({ name, email, password });
    setAuthToken(token);
    setUser(newUser);
    setStatus('authenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return context;
}
