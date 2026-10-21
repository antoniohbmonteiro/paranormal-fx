import { afterEach, describe, expect, it, vi } from "vitest";
import { WeaponFxService } from "./weapon-fx-service";
import { TOOLKIT_HOOKS } from "../../adapters/toolkit/toolkit-hooks";

afterEach(() => vi.unstubAllGlobals());
describe("weapon FX listeners", () => {
  it("registers once, preloads locally and keeps attack playback independent", async () => {
    vi.resetModules();
    const hooks = new Map<string, (...args: unknown[]) => void>();
    const on = vi.fn((name, callback) => hooks.set(name, callback));
    vi.stubGlobal("Hooks", { on });
    const service = new WeaponFxService();
    const handle = vi.spyOn(service, "handleAttackPublished").mockResolvedValue();
    const invalidate = vi.spyOn(service.database, "invalidate");
    const sounds = { preload: vi.fn() };
    const { registerWeaponFxListeners } = await import("./weapon-fx-listener");
    registerWeaponFxListeners(service, sounds); registerWeaponFxListeners(service, sounds);
    expect([...hooks.keys()]).toEqual([TOOLKIT_HOOKS.attackPublished, "registerSequencerDatabaseEntries",
      "sequencer.ready", "createSetting", "updateSetting"]);
    expect(on).toHaveBeenCalledTimes(5);
    expect(sounds.preload).toHaveBeenCalledOnce();
    hooks.get(TOOLKIT_HOOKS.attackPublished)!({ version: 1 });
    hooks.get("registerSequencerDatabaseEntries")!("jb2a");
    expect(handle).toHaveBeenCalledExactlyOnceWith({ version: 1 });
    expect(invalidate).toHaveBeenCalledWith("jb2a");
    expect(sounds.preload).toHaveBeenCalledOnce();
    hooks.get("registerSequencerDatabaseEntries")!("psfx");
    expect(invalidate).toHaveBeenLastCalledWith("psfx");
    expect(sounds.preload).toHaveBeenCalledTimes(2);
    hooks.get("sequencer.ready")!();
    expect(sounds.preload).toHaveBeenCalledTimes(3);
    for (const hook of ["createSetting", "updateSetting"]) {
      for (const key of ["weaponSounds", "weaponSoundVolume", "weaponAnimations"]) {
        hooks.get(hook)!({ key: `paranormal-fx.${key}` });
      }
    }
    expect(sounds.preload).toHaveBeenCalledTimes(9);
    hooks.get("updateSetting")!({ key: "other.setting" });
    expect(sounds.preload).toHaveBeenCalledTimes(9);
  });
});
