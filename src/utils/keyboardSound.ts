// Web Audio API realistic iOS keyboard sound synthesizer
// Produces authentic, crisp, audible iOS keyboard clicks with pitch variation for different key types

class KeyboardSoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private enabled = true;

  constructor() {
    this.setupUnlockListeners();
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
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
    if (!this.enabled) return;
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

      // Master gain for crisp volume
      const masterGain = ctx.createGain();
      const masterVol = type === 'action' ? 0.95 : type === 'delete' ? 0.90 : type === 'space' ? 0.88 : 0.85;
      masterGain.gain.setValueAtTime(masterVol, now);
      masterGain.connect(ctx.destination);

      // 1. High-pitch pop synthesizer (fast pitch sweep sine creating a satisfying bubble/pop sound)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      let startFreq = 2650; // High pitch start for 'char'
      let endFreq = 1200;
      let decay = 0.035;
      let popVolume = 0.85;

      if (type === 'delete') {
        startFreq = 2000;
        endFreq = 900;
        decay = 0.038;
        popVolume = 0.82;
      } else if (type === 'space') {
        startFreq = 2250;
        endFreq = 1000;
        decay = 0.038;
        popVolume = 0.82;
      } else if (type === 'action') {
        startFreq = 3000;
        endFreq = 1400;
        decay = 0.040;
        popVolume = 0.92;
      } else if (type === 'modifier') {
        startFreq = 2450;
        endFreq = 1150;
        decay = 0.030;
        popVolume = 0.78;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      // Rapid exponential drop gives the signature high-pitch pop / bloop
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + decay * 0.65);

      // Snappy attack and exponential decay
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(popVolume, now + 0.0015);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + decay);

      // 2. High frequency crisp transient click (~7ms)
      const clickSamples = Math.floor(ctx.sampleRate * 0.008);
      const clickBuffer = ctx.createBuffer(1, clickSamples, ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);
      for (let i = 0; i < clickSamples; i++) {
        clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickSamples * 0.22));
      }

      const clickSource = ctx.createBufferSource();
      clickSource.buffer = clickBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(startFreq * 1.15, now);
      clickFilter.Q.setValueAtTime(3.2, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.40, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(masterGain);
      clickSource.start(now);
    } catch {
      // Audio playback fails silently if unsupported
    }
  }
}

export const keyboardSound = new KeyboardSoundEngine();
