import { useCallback, useEffect, useRef, useState } from 'react';

// Executa uma função assíncrona ao montar (e quando `deps` mudar), expondo loading/erro/dados.
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latestCall = useRef(0);

  const run = useCallback(async () => {
    const call = ++latestCall.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loader();
      if (call === latestCall.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (call === latestCall.current) setState({ data: null, error, loading: false });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run();
  }, [run]);

  const setData = useCallback((data) => setState((current) => ({ ...current, data })), []);

  return { ...state, reload: run, setData };
}
