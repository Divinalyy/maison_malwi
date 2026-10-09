/**
 * Audio processing utilities for Gemini 3.8 Live API
 * - Input: 16kHz PCM 16-bit Little Endian
 * - Output: 24kHz PCM 16-bit Little Endian
 */

/**
 * Converts Float32Array audio samples (range [-1.0, 1.0]) to base64-encoded 16-bit PCM
 */
export function pcmToBase64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const uint8 = new Uint8Array(int16.buffer);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Decodes base64 16-bit PCM into Float32Array for AudioBuffer playback
 */
export function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

/**
 * Gapless streaming AudioPlayer for Gemini 3.8 Live API at 24000 Hz
 */
export class LiveAudioPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private analyser: AnalyserNode | null = null;
  public onPlayStateChange?: (isPlaying: boolean) => void;

  constructor() {
    // Lazily initialized on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass({ sampleRate: 24000 });
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChunk(base64Audio: string) {
    this.init();
    if (!this.ctx || !this.analyser) return;

    try {
      const float32 = base64ToFloat32(base64Audio);
      if (float32.length === 0) return;

      const buffer = this.ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.analyser);

      const currentTime = this.ctx.currentTime;
      // Schedule gapless playback: start immediately if in past, otherwise queue smoothly
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.push(source);
      this.onPlayStateChange?.(true);

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0) {
          this.onPlayStateChange?.(false);
        }
      };
    } catch (e) {
      console.error('[AudioPlayer] Error playing chunk:', e);
    }
  }

  public interrupt() {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // Source might have already stopped
      }
    }
    this.activeSources = [];
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
    this.onPlayStateChange?.(false);
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public isSpeaking(): boolean {
    return this.activeSources.length > 0;
  }

  public close() {
    this.interrupt();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
