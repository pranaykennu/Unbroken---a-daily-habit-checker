let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
};

const getAudioContext = (): AudioContext | null => {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playCheckSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    
    // Primary sound: oscillator 1 (high sine wave chime)
    const osc1 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    // Double beep: start at 587.33 (D5) and go to 880 (A5)
    osc1.frequency.setValueAtTime(587.33, t);
    osc1.frequency.exponentialRampToValueAtTime(880.00, t + 0.08);

    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.25);
  } catch (e) {
    console.warn('Failed to play check sound:', e);
  }
};

export const playUncheckSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Descending note: G4 (392Hz) down to C4 (261.63Hz)
    osc.frequency.setValueAtTime(392.00, t);
    osc.frequency.exponentialRampToValueAtTime(261.63, t + 0.12);

    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.06, t + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  } catch (e) {
    console.warn('Failed to play uncheck sound:', e);
  }
};

export const playCelebrationSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (C Major Arpeggio)
    const noteDuration = 0.08;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const noteTime = t + idx * noteDuration;

      gainNode.gain.setValueAtTime(0, noteTime);
      gainNode.gain.linearRampToValueAtTime(0.08, noteTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  } catch (e) {
    console.warn('Failed to play celebration sound:', e);
  }
};
