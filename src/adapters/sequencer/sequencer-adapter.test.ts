import { afterEach, describe, expect, it, vi } from "vitest";
import { SequencerAdapter } from "./sequencer-adapter";
import { resolveWeaponFx } from "../../features/weapon-fx/weapon-fx-resolver";
import { resolveWeaponSound } from "../../features/weapon-fx/weapon-sound-resolver";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";
import { createEletrocussaoStandardSingleTargetPreset, createEletrocussaoStudentRectangleRayPreset,
  createEletrocussaoTrueMultiTargetPreset } from "../../features/ritual-fx/presets/eletrocussao";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

function sequenceFixture() {
  const effects: Record<string, ReturnType<typeof vi.fn>>[] = [];
  const sounds: Record<string, ReturnType<typeof vi.fn>>[] = [];
  const playedSections: string[][] = [];
  const soundFailure = { method: "" };
  const play = vi.fn().mockResolvedValue(undefined), construct = vi.fn();
  vi.stubGlobal("Sequence", class {
    sections: string[] = [];
    constructor(options: unknown) { construct(options); }
    effect() {
      this.sections.push("effect");
      const effect: Record<string, ReturnType<typeof vi.fn>> = {};
      for (const method of ["file", "name", "atLocation", "stretchTo", "rotateTowards", "anchor", "size", "scale", "xray"]) {
        effect[method] = vi.fn(() => effect);
      }
      effects.push(effect);
      return effect;
    }
    sound() {
      this.sections.push("sound");
      const sound: Record<string, ReturnType<typeof vi.fn>> = {};
      for (const method of ["file", "volume", "delay", "repeats", "atLocation", "toLocation", "globalSound"]) {
        sound[method] = vi.fn(() => {
          if (soundFailure.method === method) throw new Error("sound builder failed");
          return sound;
        });
      }
      sounds.push(sound);
      return sound;
    }
    play() { playedSections.push(this.sections); return play(); }
  });
  return { effects, sounds, playedSections, soundFailure, play, construct, adapter: new SequencerAdapter(), ...weaponFixture() };
}

describe("local sound preloading", () => {
  it("uses the native local cache without requesting a broadcast or a progress bar", async () => {
    const preload = vi.fn().mockResolvedValue(0), preloadForClients = vi.fn();
    vi.stubGlobal("Sequencer", { Preloader: { preload, preloadForClients } });
    expect(await new SequencerAdapter().preloadSound("modules/psfx/revolver-01.ogg")).toBe(true);
    expect(preload).toHaveBeenCalledExactlyOnceWith("modules/psfx/revolver-01.ogg", false);
    expect(preloadForClients).not.toHaveBeenCalled();
  });

  it("isolates unavailable APIs, failed files and rejected native preloads", async () => {
    const adapter = new SequencerAdapter();
    vi.stubGlobal("Sequencer", undefined);
    expect(await adapter.preloadSound("file.ogg")).toBe(false);
    const preload = vi.fn().mockResolvedValueOnce(1).mockRejectedValueOnce(new Error("load failed"));
    vi.stubGlobal("Sequencer", { Preloader: { preload } });
    expect(await adapter.preloadSound("file.ogg")).toBe(false);
    expect(await adapter.preloadSound("file.ogg")).toBe(false);
  });
});

describe("Sequencer weapon playback", () => {
  it.each(["Pistola", "Fuzil de Assalto", "Espingarda", "Fuzil de Precisão", "Bazuca", "Arco", "Besta"])("plays %s once using native ranged resolution", async name => {
    const h = sequenceFixture(), definition = resolveWeaponFx({ name, type: "armament" })!;
    await h.adapter.playWeaponEffect(definition, h.context);
    expect(h.construct).toHaveBeenCalledWith({ moduleName: "paranormal-fx" });
    expect(h.effects[0].file).toHaveBeenCalledWith(definition.effectPath);
    expect(h.effects[0].atLocation).toHaveBeenCalledWith(h.source);
    expect(h.effects[0].stretchTo).toHaveBeenCalledWith(h.target);
    expect(h.effects[0].xray).toHaveBeenCalledWith(false);
    expect(h.effects[0].rotateTowards).not.toHaveBeenCalled();
    expect(h.play).toHaveBeenCalledExactlyOnceWith();
  });
  it.each(["Katana", "Acha", "Faca", "Cajado"])("orients %s without stretching or fixing a random variant", async name => {
    const h = sequenceFixture(), definition = resolveWeaponFx({ name, type: "armament" })!;
    h.source.w = 200;
    await h.adapter.playWeaponEffect(definition, h.context);
    expect(h.effects[0].file).toHaveBeenCalledWith(definition.effectPath);
    expect(h.effects[0].rotateTowards).toHaveBeenCalledWith(h.target);
    expect(h.effects[0].anchor).toHaveBeenCalledWith({ x: 0.4, y: 0.5 });
    expect(h.effects[0].size).toHaveBeenCalledWith(10, { gridUnits: true });
    expect(h.effects[0].stretchTo).not.toHaveBeenCalled();
    expect(h.play).toHaveBeenCalledOnce();
  });
  it("preserves the transverse scale of the flamethrower", async () => {
    const h = sequenceFixture();
    await h.adapter.playWeaponEffect(resolveWeaponFx({ name: "Lança-chamas", type: "armament" })!, h.context);
    expect(h.effects[0].stretchTo).toHaveBeenCalledWith(h.target, { onlyX: true });
    expect(h.effects[0].size).not.toHaveBeenCalled();
  });
  it("fails silently without the Sequence constructor", async () => {
    vi.stubGlobal("Sequence", undefined);
    const h = weaponFixture();
    await expect(new SequencerAdapter().playWeaponEffect(resolveWeaponFx(h.event.item)!, h.context)).resolves.toBeUndefined();
  });
});

describe("optional weapon audio composition", () => {
  it("builds the visual before one global sound in the same sequence", async () => {
    const h = sequenceFixture(), definition = resolveWeaponFx(h.event.item)!;
    const sound = resolveWeaponSound(definition.soundProfileId, () => true, 0.5)!;
    await h.adapter.playWeaponEffect(definition, h.context, sound);
    expect(h.construct).toHaveBeenCalledOnce();
    expect(h.playedSections).toEqual([["effect", "sound"]]);
    expect(h.sounds[0].file).toHaveBeenCalledWith(sound.path);
    expect(h.sounds[0].volume).toHaveBeenCalledWith(0.5);
    expect(h.sounds[0].delay).toHaveBeenCalledWith(0);
    expect(h.sounds[0].repeats).not.toHaveBeenCalled();
    expect(h.sounds[0].atLocation).not.toHaveBeenCalled();
    expect(h.play).toHaveBeenCalledExactlyOnceWith();
  });

  it("repeats only the sound for automatic weapons", async () => {
    const h = sequenceFixture(), definition = resolveWeaponFx({ name: "Metralhadora", type: "armament" })!;
    await h.adapter.playWeaponEffect(definition, h.context, resolveWeaponSound(definition.soundProfileId, () => true, 0.5));
    expect(h.effects).toHaveLength(1);
    expect(h.sounds).toHaveLength(1);
    expect(h.sounds[0].repeats).toHaveBeenCalledWith(20, 100);
    expect(h.sounds[0].volume).toHaveBeenCalledWith(0.25);
    expect(h.play).toHaveBeenCalledOnce();
  });

  it.each(["Arco", "Besta", "Balestra"])("supplies both positions to Longbow for %s without introducing positional attenuation", async name => {
    const h = sequenceFixture(), definition = resolveWeaponFx({ name, type: "armament" })!;
    await h.adapter.playWeaponEffect(definition, h.context, resolveWeaponSound(definition.soundProfileId, () => true, 0.5));
    expect(h.sounds[0].atLocation).toHaveBeenCalledWith(h.source);
    expect(h.sounds[0].toLocation).toHaveBeenCalledWith(h.target);
    expect(h.sounds[0].globalSound).toHaveBeenCalledWith(true);
    expect(h.effects[0].stretchTo).toHaveBeenCalledWith(h.target);
  });

  it.each(["file", "volume", "delay", "repeats", "atLocation", "toLocation", "globalSound"])(
    "discards unstarted audio if %s throws, then starts exactly one visual-only sequence", async method => {
      const h = sequenceFixture(), definition = resolveWeaponFx({ name: "Arco", type: "armament" })!;
      h.soundFailure.method = method;
      const sound = { ...resolveWeaponSound("longbow", () => true, 0.5)!, repetitions: 8, intervalMs: 200 };
      await h.adapter.playWeaponEffect(definition, h.context, sound);
      expect(h.construct).toHaveBeenCalledTimes(2);
      expect(h.playedSections).toEqual([["effect"]]);
      expect(h.play).toHaveBeenCalledOnce();
    },
  );

  it("falls back visually when the runtime has no sound API", async () => {
    const h = sequenceFixture();
    delete (globalThis.Sequence as any).prototype.sound;
    await h.adapter.playWeaponEffect(resolveWeaponFx(h.event.item)!, h.context, resolveWeaponSound("handgun", () => true, 0.5));
    expect(h.playedSections).toEqual([["effect"]]);
  });

  it("never retries a sequence that fails after playback starts", async () => {
    const h = sequenceFixture();
    h.play.mockRejectedValue(new Error("audio load failed after visual start"));
    await expect(h.adapter.playWeaponEffect(resolveWeaponFx(h.event.item)!, h.context,
      resolveWeaponSound("handgun", () => true, 0.5))).rejects.toThrow();
    expect(h.construct).toHaveBeenCalledOnce();
    expect(h.playedSections).toEqual([["effect", "sound"]]);
  });
});

describe("existing ritual playback", () => {
  it.each([createEletrocussaoStandardSingleTargetPreset(), createEletrocussaoStudentRectangleRayPreset()])("preserves line playback for $id", async preset => {
    const h = sequenceFixture(), start = { x: 150, y: 100 }, end = { x: 500, y: 100 };
    await h.adapter.playRitualPreset(preset, { type: "line", start, end });
    expect(h.effects[0].file).toHaveBeenCalledWith("jb2a.chain_lightning.primary.blue.60ft");
    expect(h.effects[0].atLocation).toHaveBeenCalledWith(start);
    expect(h.effects[0].stretchTo).toHaveBeenCalledWith(end);
    expect(h.effects[0].xray).not.toHaveBeenCalled();
    expect(h.play).toHaveBeenCalledOnce();
  });
  it("preserves true-form line staggering at 500 ms", async () => {
    vi.useFakeTimers();
    const h = sequenceFixture(), preset = createEletrocussaoTrueMultiTargetPreset();
    const playback = h.adapter.playRitualPreset(preset, { type: "lineGroup", staggerMs: 500,
      lines: [{ start: { x: 0, y: 0 }, end: { x: 500, y: 0 } }, { start: { x: 0, y: 0 }, end: { x: 0, y: 500 } }] });
    expect(h.play).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(499);
    expect(h.play).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1); await playback;
    expect(h.play).toHaveBeenCalledTimes(2);
    expect(h.effects.map(effect => effect.name.mock.calls[0][0])).toEqual([`${preset.id}.0`, `${preset.id}.1`]);
  });
});
