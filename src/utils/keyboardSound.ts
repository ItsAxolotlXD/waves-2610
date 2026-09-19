// Web Audio API realistic iOS keyboard sound synthesizer
// Produces authentic, crisp, audible iOS keyboard clicks with pitch variation for different key types

class KeyboardSoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  constructor() {
    this.setupUnlockListeners();
  }

  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.unlockAudio();
    };

    window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    window.addEventListener('touchstart', unlock, { capture: true, passive: true });
    window.addEventListener('keydown', unlock, { capture: true, passive: true });
    window.addEventListener('click', unlock, { capture: true, passive: true });
  }

  public unlockAudio() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (!this.isUnlocked) {
        // Play an inaudible 1-sample buffer to unlock iOS Safari Web Audio
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      }
    } catch {}
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playKeyClick(type: 'char' | 'space' | 'delete' | 'action' | 'modifier' = 'char') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // If suspended, resume and play once resumed
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.doPlay(ctx, type);
        }).catch(() => {});
        return;
      }

      this.doPlay(ctx, type);
    } catch {
      // Audio playback fails silently if unsupported
    }
  }

  private doPlay(ctx: AudioContext, type: 'char' | 'space' | 'delete' | 'action' | 'modifier') {
    try {
      const now = Math.max(ctx.currentTime, 0.0001) + 0.002;

      // Master gain for this click
      const masterGain = ctx.createGain();
      const masterVol = type === 'action' ? 0.90 : type === 'delete' ? 0.85 : type === 'space' ? 0.82 : 0.80;
      masterGain.gain.setValueAtTime(masterVol, now);
      masterGain.connect(ctx.destination);

      // 1. High frequency mechanical impulse (crisp click transient - ~12ms)
      const impulseSamples = Math.floor(ctx.sampleRate * 0.015);
      const impulseBuffer = ctx.createBuffer(1, impulseSamples, ctx.sampleRate);
      const data = impulseBuffer.getChannelData(0);
      for (let i = 0; i < impulseSamples; i++) {
        // High passed burst noise decaying rapidly
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (impulseSamples * 0.28));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = impulseBuffer;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      const highpassFreq = type === 'delete' ? 1400 : type === 'space' ? 1600 : type === 'action' ? 2600 : 2200;
      highpass.frequency.setValueAtTime(highpassFreq, now);

      const noiseGain = ctx.createGain();
      const clickVolume = type === 'action' ? 0.80 : type === 'delete' ? 0.75 : 0.70;
      noiseGain.gain.setValueAtTime(clickVolume, now);
      noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.015);

      noiseSource.connect(highpass);
      highpass.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);

      // 2. Resonant body pop (wooden/plastic key resonance - ~35ms)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const bandpass = ctx.createBiquadFilter();

      bandpass.type = 'bandpass';
      let freq = 1450;
      let decay = 0.035;
      let bodyVolume = 0.75;

      if (type === 'delete') {
        freq = 900;
        decay = 0.040;
        bodyVolume = 0.78;
      } else if (type === 'space') {
        freq = 1100;
        decay = 0.038;
        bodyVolume = 0.74;
      } else if (type === 'action') {
        freq = 1750;
        decay = 0.042;
        bodyVolume = 0.85;
      } else if (type === 'modifier') {
        freq = 1200;
        decay = 0.030;
        bodyVolume = 0.65;
      }

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.35, 40), now + decay);

      bandpass.frequency.setValueAtTime(freq, now);
      bandpass.Q.setValueAtTime(2.6, now);

      oscGain.gain.setValueAtTime(bodyVolume, now);
      oscGain.gain.linearRampToValueAtTime(0.001, now + decay);

      osc.connect(bandpass);
      bandpass.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    } catch {
      // Audio playback fails silently if unsupported
    }
  }
}

export const keyboardSound = new KeyboardSoundEngine();
