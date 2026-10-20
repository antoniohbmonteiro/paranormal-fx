import { afterEach, describe, expect, it, vi } from "vitest";
import { SequencerAdapter } from "./sequencer-adapter";
import { resolveWeaponFx } from "../../features/weapon-fx/weapon-fx-resolver";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";
import { createEletrocussaoStandardSingleTargetPreset, createEletrocussaoStudentRectangleRayPreset,
  createEletrocussaoTrueMultiTargetPreset } from "../../features/ritual-fx/presets/eletrocussao";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

function sequenceFixture() {
  const effects: Record<string, ReturnType<typeof vi.fn>>[] = [];
  const play = vi.fn().mockResolvedValue(undefined), construct = vi.fn();
  vi.stubGlobal("Sequence", class {
    constructor(options: unknown) { construct(options); }
    effect() {
      const effect: Record<string, ReturnType<typeof vi.fn>> = {};
      for (const method of ["file", "name", "atLocation", "stretchTo", "rotateTowards", "anchor", "size", "scale", "xray"]) {
        effect[method] = vi.fn(() => effect);
      }
      effects.push(effect);
      return effect;
    }
    play() { return play(); }
  });
  return { effects, play, construct, adapter: new SequencerAdapter(), ...weaponFixture() };
}

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
