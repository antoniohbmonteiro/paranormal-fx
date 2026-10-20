import { afterEach, describe, expect, it, vi } from "vitest";
import { WeaponFxService } from "./weapon-fx-service";
import { TOOLKIT_HOOKS } from "../../adapters/toolkit/toolkit-hooks";

afterEach(() => vi.unstubAllGlobals());
describe("weapon FX listeners", () => {
  it("registers once and observes only publication and database registration", async () => {
    vi.resetModules();
    const hooks = new Map<string, (...args: unknown[]) => void>();
    const on = vi.fn((name, callback) => hooks.set(name, callback));
    vi.stubGlobal("Hooks", { on });
    const service = new WeaponFxService();
    const handle = vi.spyOn(service, "handleAttackPublished").mockResolvedValue();
    const invalidate = vi.spyOn(service.database, "invalidate");
    const { registerWeaponFxListeners } = await import("./weapon-fx-listener");
    registerWeaponFxListeners(service); registerWeaponFxListeners(service);
    expect([...hooks.keys()]).toEqual([TOOLKIT_HOOKS.attackPublished, "registerSequencerDatabaseEntries"]);
    expect(on).toHaveBeenCalledTimes(2);
    hooks.get(TOOLKIT_HOOKS.attackPublished)!({ version: 1 });
    hooks.get("registerSequencerDatabaseEntries")!("jb2a");
    expect(handle).toHaveBeenCalledExactlyOnceWith({ version: 1 });
    expect(invalidate).toHaveBeenCalledWith("jb2a");
  });
});
