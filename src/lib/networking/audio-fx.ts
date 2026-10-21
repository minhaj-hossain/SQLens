/**
 * audio-fx.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-dependency Web Audio API sound synthesizer for networking interactions.
 * Generates tactile mechanical clicks, cable latches, and packet pulses.
 */

class NetworkingAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Tactile RJ-45 Cable Plug Snap:
   * Combines a crisp plastic retention-clip snap with a low metallic socket contact thud.
   */
  public playCablePlug() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Plastic clip click (high-frequency burst)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
    clickGain.gain.setValueAtTime(0.28, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // 2. Metallic socket seating thud (low-frequency resonance)
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(160, now + 0.01);
    thudOsc.frequency.exponentialRampToValueAtTime(55, now + 0.07);
    thudGain.gain.setValueAtTime(0.35, now + 0.01);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now + 0.01);
    thudOsc.stop(now + 0.09);

    // 3. Electronic link sync tone (cheerful 1Gbps link up)
    const linkOsc = ctx.createOscillator();
    const linkGain = ctx.createGain();
    linkOsc.type = 'sine';
    linkOsc.frequency.setValueAtTime(880, now + 0.06);
    linkOsc.frequency.setValueAtTime(1320, now + 0.1);
    linkGain.gain.setValueAtTime(0.12, now + 0.06);
    linkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    linkOsc.connect(linkGain);
    linkGain.connect(ctx.destination);
    linkOsc.start(now + 0.06);
    linkOsc.stop(now + 0.19);
  }

  /**
   * Tactile RJ-45 Cable Unplug Snap:
   * Release tab click followed by link disconnection tone.
   */
  public playCableUnplug() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);

    // Link down warning tone
    const downOsc = ctx.createOscillator();
    const downGain = ctx.createGain();
    downOsc.type = 'sine';
    downOsc.frequency.setValueAtTime(440, now + 0.03);
    downOsc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    downGain.gain.setValueAtTime(0.12, now + 0.03);
    downGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    downOsc.connect(downGain);
    downGain.connect(ctx.destination);
    downOsc.start(now + 0.03);
    downOsc.stop(now + 0.15);
  }

  /**
   * Subtle Packet Transmission Blip:
   * High-tech, microscopic chirp when a frame pulses through the wire.
   */
  public playPacketPulse() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(2800, now + 0.02);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Success / Milestone Completion Chime:
   * Glassmorphic harmonic triad (E5, G#5, B5).
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.14, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.45);
    });
  }
}

export const soundFx = new NetworkingAudioEngine();
