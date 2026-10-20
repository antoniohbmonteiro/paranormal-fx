import { afterEach, describe, expect, it, vi } from "vitest";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";
import { SequencerAdapter } from "../../adapters/sequencer/sequencer-adapter";
import { normalizeRitualPayload } from "../../adapters/toolkit/toolkit-payloads";
import { getDefaultRitualFxPresets } from "./presets/default-presets";
import { ritualFxRegistry } from "./ritual-fx-registry";
import { RitualFxOrchestrator } from "./ritual-fx-orchestrator";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Eletrocussão orchestration regression", () => {
  it.each(["standard", "student", "true"] as const)("resolves the existing %s preset and placement", async form => {
    const h = weaponFixture();
    const second = { ...h.target, center: { x: 100, y: 500 } };
    h.tokens.set("second", second);
    vi.stubGlobal("canvas", h.view);
    vi.stubGlobal("game", { settings: { get: () => false } });
    ritualFxRegistry.registerMany(getDefaultRitualFxPresets());
    const play = vi.spyOn(SequencerAdapter.prototype, "playRitualPreset").mockResolvedValue();
    const context = normalizeRitualPayload({
      castId: "cast", automation: { presetId: "ritual.eletrocussao", fxEligible: true }, ritual: { form },
      caster: { token: { tokenId: "source", sceneId: "scene" } },
      targets: [{ tokenId: "target", sceneId: "scene" }, { tokenId: "second", sceneId: "scene" }],
      area: form === "student" ? { type: "rectangleRay", ray: { start: { x: 100, y: 100 }, end: { x: 500, y: 100 } } } : undefined,
    });
    await new RitualFxOrchestrator().handleRitualFinished(context);
    expect(play).toHaveBeenCalledOnce();
    const [preset, placement] = play.mock.calls[0];
    expect(preset.match.form).toBe(form);
    expect(preset.effectPath).toBe("jb2a.chain_lightning.primary.blue.60ft");
    if (form === "true") {
      expect(placement).toMatchObject({ type: "lineGroup", staggerMs: 500, lines: [
        { start: { x: 150, y: 100 }, end: { x: 500, y: 100 } },
        { start: { x: 100, y: 150 }, end: { x: 100, y: 500 } },
      ] });
    } else {
      expect(placement).toMatchObject({ type: "line", start: { x: form === "student" ? 100 : 150, y: 100 }, end: { x: 500, y: 100 } });
    }
  });
});
