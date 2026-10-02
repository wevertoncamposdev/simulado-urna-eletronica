// Sintetiza os bipes no próprio navegador (Web Audio API), sem depender de
// nenhum arquivo de áudio. O AudioContext só é criado na primeira chamada,
// dentro de um gesto do usuário (clique/Enter) — por isso nunca esbarra nas
// políticas de autoplay dos navegadores.
let audioContext;

function getContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(ctx, frequency, startTime, duration) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

// O "pili-pim" clássico da urna eletrônica ao fim da votação: dois tons curtos
// e ascendentes (G5 -> C6).
export function playBallotConfirmedSound() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    playTone(ctx, 784, now, 0.18);
    playTone(ctx, 1047, now + 0.16, 0.32);
  } catch {
    // Sem suporte a Web Audio ou áudio bloqueado pelo navegador: segue sem som.
  }
}
