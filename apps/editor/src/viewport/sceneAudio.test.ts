import { afterEach, describe, expect, it, vi } from "vitest";
import { MUTE_FADE_SECONDS, SceneAudio, type AudioContextLike } from "./sceneAudio";

// A fake Web Audio context recording what's made and done.
class FakeParam {
  value = 1;
  events: Array<[string, number, number]> = [];
  cancelScheduledValues = (time: number) => void this.events.push(["cancel", 0, time]);
  setValueAtTime = (value: number, time: number) => void this.events.push(["set", value, time]);
  linearRampToValueAtTime = (value: number, time: number) => void this.events.push(["ramp", value, time]);
}
class FakeNode {
  connected: unknown[] = [];
  disconnected = false;
  connect = (to: unknown) => void this.connected.push(to);
  disconnect = () => void (this.disconnected = true);
}
class FakeGain extends FakeNode {
  gain = new FakeParam();
}
class FakeSource extends FakeNode {
  buffer: unknown = null;
  loop = false;
  started = 0;
  stopped = 0;
  onended: (() => void) | null = null;
  start = () => void (this.started += 1);
  stop = () => void (this.stopped += 1);
}
class FakeContext {
  state: AudioContextState = "suspended";
  currentTime = 2;
  destination = { name: "speakers" };
  gains: FakeGain[] = [];
  sources: FakeSource[] = [];
  closed = false;
  resumed = 0;
  decodeFails = false;
  createGain = () => {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  };
  createBufferSource = () => {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  };
  decodeAudioData = async (bytes: ArrayBuffer) => {
    if (this.decodeFails) throw new Error("bad data");
    return { duration: bytes.byteLength } as unknown as AudioBuffer;
  };
  resume = async () => {
    this.resumed += 1;
    this.state = "running";
  };
  close = async () => {
    this.closed = true;
  };
}

const setUp = ({ missing = [] as string[], muted }: { missing?: string[]; muted?: boolean } = {}) => {
  const contexts: FakeContext[] = [];
  const loadAudio = vi.fn(async (assetId: string) => (missing.includes(assetId) ? null : new ArrayBuffer(8)));
  const audio = new SceneAudio({
    loadAudio,
    muted,
    createContext: () => {
      const context = new FakeContext();
      contexts.push(context);
      return context as unknown as AudioContextLike;
    },
  });
  const context = () => contexts[0];
  const master = () => context().gains[0];
  return { audio, contexts, context, master, loadAudio };
};

afterEach(() => vi.restoreAllMocks());

describe("SceneAudio", () => {
  it("makes no context until a sound plays or the visitor unmutes", () => {
    const { audio, contexts } = setUp();
    audio.setMuted(true);
    expect(contexts).toHaveLength(0);
    expect(audio.hasContext).toBe(false);
    audio.setMuted(false);
    expect(contexts).toHaveLength(1);
  });

  it("starts muted, with the master gain at 0, and still starts a sound played while muted", async () => {
    const { audio, context, master } = setUp();
    expect(audio.isMuted).toBe(true);

    await audio.play("chime", { volume: 0.5, loop: false });

    expect(master().gain.value).toBe(0);
    expect(master().connected).toEqual([context().destination]);
    const [source] = context().sources;
    expect(source.started).toBe(1);
    // Through its own volume, then the master.
    const volume = context().gains[1];
    expect(volume.gain.value).toBe(0.5);
    expect(source.connected).toEqual([volume]);
    expect(volume.connected).toEqual([master()]);
  });

  it("unmutes by resuming the context and fading the master gain up, and mutes by fading down", async () => {
    const { audio, context, master } = setUp();
    await audio.play("loop", { volume: 1, loop: true });

    audio.setMuted(false);
    expect(context().resumed).toBe(1);
    expect(master().gain.events).toEqual([
      ["cancel", 0, 2],
      ["set", 0, 2],
      ["ramp", 1, 2 + MUTE_FADE_SECONDS],
    ]);

    master().gain.value = 1;
    audio.setMuted(true);
    expect(master().gain.events.slice(3)).toEqual([
      ["cancel", 0, 2],
      ["set", 1, 2],
      ["ramp", 0, 2 + MUTE_FADE_SECONDS],
    ]);
    expect(audio.isMuted).toBe(true);
  });

  it("starts unmuted when the session left it so", async () => {
    const { audio, master } = setUp({ muted: false });
    await audio.play("chime", { volume: 1, loop: false });
    expect(master().gain.value).toBe(1);
  });

  it("sets the loop flag, restarts a sound played again, and stops only the sound asked", async () => {
    const { audio, context } = setUp();
    await audio.play("loop", { volume: 1, loop: true });
    await audio.play("chime", { volume: 1, loop: false });
    const [loop, chime] = context().sources;
    expect(loop.loop).toBe(true);
    expect(chime.loop).toBe(false);

    await audio.play("loop", { volume: 1, loop: true });
    expect(loop.stopped).toBe(1);
    expect(context().sources[2].started).toBe(1);

    audio.stop("loop");
    expect(context().sources[2].stopped).toBe(1);
    expect(chime.stopped).toBe(0);
  });

  it("decodes each sound once", async () => {
    const { audio, loadAudio } = setUp();
    await audio.play("chime", { volume: 1, loop: false });
    await audio.play("chime", { volume: 1, loop: false });
    expect(loadAudio).toHaveBeenCalledTimes(1);
  });

  it("drops a play that a stop overtook while it loaded", async () => {
    const { audio, context } = setUp();
    const playing = audio.play("loop", { volume: 1, loop: true });
    audio.stop("loop");
    await playing;
    expect(context().sources).toHaveLength(0);
  });

  it("reports a missing or undecodable sound without throwing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { audio, context } = setUp({ missing: ["gone"] });

    await expect(audio.play("gone", { volume: 1, loop: false })).resolves.toBeUndefined();
    context().decodeFails = true;
    await expect(audio.play("broken", { volume: 1, loop: false })).resolves.toBeUndefined();

    expect(context().sources).toHaveLength(0);
    expect(error).toHaveBeenCalledTimes(2);
  });

  it("stops every sound and closes the context on dispose, and plays nothing after", async () => {
    const { audio, context } = setUp();
    await audio.play("loop", { volume: 1, loop: true });
    await audio.play("chime", { volume: 1, loop: false });

    audio.dispose();

    expect(context().sources.map((source) => source.stopped)).toEqual([1, 1]);
    expect(context().closed).toBe(true);
    await audio.play("chime", { volume: 1, loop: false });
    expect(context().sources).toHaveLength(2);
  });
});
