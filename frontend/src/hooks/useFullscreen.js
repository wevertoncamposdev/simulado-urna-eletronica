import { useCallback, useEffect, useState } from 'react';

// Tela cheia nativa do navegador (tira a barra de endereço etc.), útil pra
// votação ficar mais visível. Sincroniza com o Esc (o navegador sai de tela
// cheia sem passar pelo nosso botão, então escutamos o evento do document).
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  return { isFullscreen, toggle };
}
