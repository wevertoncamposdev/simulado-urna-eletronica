import { useCallback, useEffect, useState } from 'react';

// Tela cheia nativa do navegador (tira a barra de endereço etc.), útil pra
// votação ficar mais visível. Sincroniza com o Esc (o navegador sai de tela
// cheia sem passar pelo nosso botão, então escutamos o evento do document).
// Aceita um ref opcional: pede tela cheia só daquele elemento (o navegador
// isola a subárvore dele, escondendo sidebar/cabeçalho) em vez da página
// inteira — útil pra focar um bloco específico, como o organograma.
export function useFullscreen(targetRef) {
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
      (targetRef?.current ?? document.documentElement).requestFullscreen?.().catch(() => {});
    }
  }, [targetRef]);

  return { isFullscreen, toggle };
}
