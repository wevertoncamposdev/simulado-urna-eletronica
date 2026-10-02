import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';

const STORAGE_KEY = 'urna:currentSessionId';
const CurrentSessionContext = createContext(null);

// Guarda a "sessão atual" exibida no header. Só o id vai para o localStorage.
export function CurrentSessionProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return;
    api.sessions.get(savedId).then(setSession).catch(() => localStorage.removeItem(STORAGE_KEY));
  }, []);

  const select = useCallback((next) => {
    setSession(next);
    if (next) localStorage.setItem(STORAGE_KEY, next.id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ session, select }), [session, select]);
  return <CurrentSessionContext.Provider value={value}>{children}</CurrentSessionContext.Provider>;
}

export function useCurrentSession() {
  const context = useContext(CurrentSessionContext);
  if (!context) throw new Error('useCurrentSession precisa estar dentro de CurrentSessionProvider');
  return context;
}
