/**
 * PURPOSE: Plays a scene's sounds (Sound actions, C4) for the editor's Play and the share-link viewer:
 * one Web Audio context, one master gain every sound goes through, decoded sounds cached per asset.
 *
 * INPUT: How to get a sound's bytes (`SceneSource.loadAudio`); `play` / `stop` from Sound effects
 *        (playEffects.ts); `setMuted` from the mute button (components/ui/MuteButton.tsx).
 * OUTPUT: Sound, through the master gain: 0 while muted, faded to 1 over 150 ms on unmute.
 *
 * Scenes start muted (decided by Emily, decision tree C4). A sound started while muted plays
 * silently and is heard on unmute, like a muted video; unmuting is the click browsers want before
 * any audio, so it also resumes the context. The context is made on first use (a sound played, or
 * an unmute), never for a scene that plays none, and `dispose` closes it: browsers cap how many a
 * page may have open. Playing a sound that's already playing restarts it. The mute choice lasts the
 * page's session (`sessionMuted`), never saved. No store, no React, no DOM beyond Web Audio.
 */

/** The parts of Web Audio used here, so tests can pass a fake (Node has no AudioContext). */
export type AudioContextLike = Pick<
  AudioContext,
  "createGain" | "createBufferSource" | "decodeAudioData" | "resume" | "close" | "currentTime" | "destination" | "state"
>;

export interface SceneAudioOptions {
  /** A sound's bytes by asset ID (its content hash); null when it can't be had. */
  loadAudio: (assetId: string) => Promise<ArrayBuffer | null>;
  /** Starts muted unless told otherwise (the session's choice: `sessionMuted`). */
  muted?: boolean;
  createContext?: () => AudioContextLike;
}

export interface PlaySoundOptions {
  volume: number;
  loop: boolean;
}

/** How long muting and unmuting fade, so neither clicks. */
export const MUTE_FADE_SECONDS = 0.15;

let sessionIsMuted = true;
/** Whether the visitor muted sound this session: the next Play or scene starts as they left it. */
export const sessionMuted = {
  get: (): boolean => sessionIsMuted,
  set: (muted: boolean): void => {
    sessionIsMuted = muted;
  },
};

const defaultContext = (): AudioContextLike => new AudioContext();

interface Playing {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export class SceneAudio {
  private readonly loadAudio: SceneAudioOptions["loadAudio"];
  private readonly createContext: () => AudioContextLike;
  private context: AudioContextLike | null = null;
  private master: GainNode | null = null;
  private muted: boolean;
  private disposed = false;
  private readonly buffers = new Map<string, Promise<AudioBuffer | null>>();
  private readonly playing = new Map<string, Playing>();
  // The latest play or stop of each sound: a play still decoding is dropped if a newer one came.
  private readonly requests = new Map<string, number>();
  private nextRequest = 0;

  constructor({ loadAudio, muted = true, createContext = defaultContext }: SceneAudioOptions) {
    this.loadAudio = loadAudio;
    this.createContext = createContext;
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Whether the audio context exists yet (for tests and the no-sound check). */
  get hasContext(): boolean {
    return this.context !== null;
  }

  /** Plays a sound from its start, through the master gain, restarting it if it's playing. */
  async play(assetId: string, { volume, loop }: PlaySoundOptions): Promise<void> {
    if (this.disposed) return;
    const request = this.request(assetId);
    this.stopSource(assetId);
    const context = this.ensureContext();
    const buffer = await this.buffer(assetId);
    if (!buffer || this.disposed || this.requests.get(assetId) !== request) return;

    const gain = context.createGain();
    gain.gain.value = Math.min(1, Math.max(0, volume));
    gain.connect(this.master!);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(gain);
    const playing = { source, gain };
    source.onended = () => {
      if (this.playing.get(assetId) === playing) this.playing.delete(assetId);
      gain.disconnect();
    };
    this.playing.set(assetId, playing);
    source.start();
  }

  /** Stops a sound wherever it's playing (and one still loading). */
  stop(assetId: string): void {
    this.request(assetId);
    this.stopSource(assetId);
  }

  /** Mutes or unmutes every sound, fading the master gain; unmuting resumes the context (it's the click browsers need). */
  setMuted(muted: boolean): void {
    if (this.disposed) return;
    this.muted = muted;
    // Muting before any sound needs no context; unmuting makes one, so sounds can start audibly.
    if (!this.context && muted) return;
    const context = this.ensureContext();
    if (!muted && context.state !== "running") {
      context.resume().catch((error) => console.error("[Libre3D] Couldn't start the scene's sound.", error));
    }
    const gain = this.master!.gain;
    const now = context.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(muted ? 0 : 1, now + MUTE_FADE_SECONDS);
  }

  /** Stops every sound and closes the context. Nothing plays afterwards. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const assetId of [...this.playing.keys()]) this.stopSource(assetId);
    this.buffers.clear();
    this.context?.close().catch(() => {});
    this.context = null;
    this.master = null;
  }

  private request(assetId: string): number {
    this.nextRequest += 1;
    this.requests.set(assetId, this.nextRequest);
    return this.nextRequest;
  }

  private ensureContext(): AudioContextLike {
    if (this.context) return this.context;
    const context = this.createContext();
    const master = context.createGain();
    master.gain.value = this.muted ? 0 : 1;
    master.connect(context.destination);
    this.context = context;
    this.master = master;
    return context;
  }

  // A sound decoded once per scene; a missing or undecodable one is reported, and never retried.
  private buffer(assetId: string): Promise<AudioBuffer | null> {
    let buffer = this.buffers.get(assetId);
    if (!buffer) {
      const context = this.context!;
      buffer = this.loadAudio(assetId)
        .then((bytes) => {
          if (!bytes) {
            console.error(`[Libre3D] A sound this scene plays isn't available (${assetId}).`);
            return null;
          }
          // decodeAudioData takes the bytes over: give it a copy.
          return context.decodeAudioData(bytes.slice(0));
        })
        .catch((error) => {
          console.error(`[Libre3D] Couldn't play a sound (${assetId}).`, error);
          return null;
        });
      this.buffers.set(assetId, buffer);
    }
    return buffer;
  }

  private stopSource(assetId: string): void {
    const playing = this.playing.get(assetId);
    if (!playing) return;
    this.playing.delete(assetId);
    playing.source.onended = null;
    try {
      playing.source.stop();
    } catch {
      // Already stopped.
    }
    playing.gain.disconnect();
  }
}
