import { afterEach, describe, expect, it, vi } from "vitest";
import { getWeaponSoundVolume, isWeaponAnimationsEnabled, registerSettings, SETTINGS } from "./settings";

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

describe("world weapon audio settings", () => {
  it("registers enabled audio and a 50% world volume without requiring a reload", () => {
    const register = vi.fn();
    vi.stubGlobal("game", { settings: { register } });
    registerSettings();
    expect(register).toHaveBeenCalledWith("paranormal-fx", SETTINGS.weaponSounds, expect.objectContaining({
      scope: "world", config: true, type: Boolean, default: true, name: "Sons automáticos de armas",
    }));
    expect(register).toHaveBeenCalledWith("paranormal-fx", SETTINGS.weaponSoundVolume, expect.objectContaining({
      scope: "world", config: true, type: Number, default: 0.5, name: "Volume dos sons de armas",
      range: { min: 0, max: 1, step: 0.05 },
    }));
    for (const [, key, data] of register.mock.calls) {
      if ([SETTINGS.weaponSounds, SETTINGS.weaponSoundVolume].includes(key)) expect(data.requiresReload).not.toBe(true);
    }
  });

  it("reads current settings on each call and mutes without reading the volume when disabled", () => {
    const values = { weaponSounds: true, weaponSoundVolume: 0.5 };
    const get = vi.fn((_, key: keyof typeof values) => values[key]);
    vi.stubGlobal("game", { settings: { get } });
    expect(getWeaponSoundVolume()).toBe(0.5);
    values.weaponSoundVolume = 0.8;
    expect(getWeaponSoundVolume()).toBe(0.8);
    values.weaponSounds = false;
    get.mockClear();
    expect(getWeaponSoundVolume()).toBe(0);
    expect(get).toHaveBeenCalledExactlyOnceWith("paranormal-fx", SETTINGS.weaponSounds);
  });

  it.each([[2, 1], [-1, 0], [0, 0], [NaN, 0], [Infinity, 0], ["0.5", 0], [undefined, 0], [null, 0]])(
    "normalizes volume %s to %s", (volume, expected) => {
      vi.stubGlobal("game", { settings: { get: (_, key) => key === SETTINGS.weaponSounds ? true : volume } });
      expect(getWeaponSoundVolume()).toBe(expected);
    },
  );

  it("omits audio when either setting cannot be read", () => {
    for (const failingKey of [SETTINGS.weaponSounds, SETTINGS.weaponSoundVolume]) {
      vi.stubGlobal("game", { settings: { get: (_, key) => {
        if (key === failingKey) throw new Error("unavailable");
        return true;
      } } });
      expect(getWeaponSoundVolume()).toBe(0);
    }
  });
});
