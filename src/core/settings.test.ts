import { afterEach, describe, expect, it, vi } from "vitest";
import { isWeaponAnimationsEnabled, registerSettings, SETTINGS } from "./settings";

afterEach(() => vi.unstubAllGlobals());
describe("weapon animation setting", () => {
  it("registers a world setting enabled by default", () => {
    const register = vi.fn();
    vi.stubGlobal("game", { settings: { register } });
    registerSettings();
    expect(register).toHaveBeenCalledWith("paranormal-fx", SETTINGS.weaponAnimations, expect.objectContaining({
      scope: "world", default: true, config: true, type: Boolean, name: "Animações automáticas de armas",
    }));
  });
  it("reads current configuration and fails closed if registration is unavailable", () => {
    const get = vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false).mockImplementationOnce(() => { throw new Error(); });
    vi.stubGlobal("game", { settings: { get } });
    expect(isWeaponAnimationsEnabled()).toBe(true);
    expect(isWeaponAnimationsEnabled()).toBe(false);
    expect(isWeaponAnimationsEnabled()).toBe(false);
  });
});
