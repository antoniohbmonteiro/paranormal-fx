import { describe, expect, it, vi } from "vitest";
import { WEAPON_FX_CATALOG } from "./weapon-fx-catalog";
import { resolveWeaponFx } from "./weapon-fx-resolver";
import { WEAPON_SOUND_PROFILES, type WeaponSoundProfileId } from "./weapon-sound-profiles";
import { resolveWeaponSound } from "./weapon-sound-resolver";

const revolver = "psfx.ranged-weapons.guns.single-fire.revolver";
const groups: [WeaponSoundProfileId | null, string[]][] = [
  ["handgun", ["Pistola", "Revólver", "Pistola Pesada", "Revólver Compacto"]],
  ["automatic", ["Fuzil de Assalto", "Submetralhadora", "Metralhadora"]],
  ["shotgun", ["Espingarda", "Espingarda de Cano Duplo"]],
  ["huntingRifle", ["Fuzil de Caça", "Fuzil de Precisão"]],
  ["sword", ["Espada", "Katana", "Machete", "Florete"]],
  ["spear", ["Lança"]],
  ["lightSwoosh", ["Faca", "Faca Tática", "Punhal", "Baioneta", "Machadinha", "Bastão Policial"]],
  ["heavySwoosh", ["Machado", "Acha", "Martelo", "Marreta", "Maça", "Gadanho", "Corrente", "Bastão", "Cajado", "Montante"]],
  ["longbow", ["Arco", "Arco Composto", "Besta", "Balestra"]],
  [null, ["Bazuca", "Lança-chamas"]],
];

describe("weapon sound associations", () => {
  it("covers the existing 38 weapons without expanding the visual catalog", () => {
    expect(groups.flatMap(([, names]) => names).sort()).toEqual(WEAPON_FX_CATALOG.map(entry => entry.name).sort());
  });

  for (const [profileId, names] of groups) {
    it.each(names)("resolves the sound profile for %s", name => {
      expect(resolveWeaponFx({ name: ` ${name.toUpperCase()} `, type: "armament" })?.soundProfileId).toBe(profileId);
    });
  }
});

describe("optional weapon sound resolution", () => {
  it.each([
    ["handgun", revolver], ["sword", "psfx.weapon-attacks.sword.v1"], ["spear", "psfx.weapon-attacks.spear.v1"],
    ["lightSwoosh", "psfx.weapon-swooshes.light.v1.group01"], ["heavySwoosh", "psfx.weapon-swooshes.heavy.v1.group01"],
    ["longbow", "psfx.ranged-weapons.longbow.v1"],
  ] as const)("uses the free collection for %s without fixing a variant index", (id, path) => {
    expect(resolveWeaponSound(id, () => true, 0.5)).toEqual({
      path, volume: 0.5, repetitions: 1, intervalMs: 0, delayMs: 0, distanceBased: id === "longbow",
    });
  });

  it.each([
    ["automatic", "rifle"], ["shotgun", "shotgun"], ["huntingRifle", "musket"],
  ] as const)("prefers the specific candidate for %s and stops before the fallback", (id, asset) => {
    const available = vi.fn(() => true);
    expect(resolveWeaponSound(id, available, 0.5)?.path).toBe(`psfx.ranged-weapons.guns.single-fire.${asset}`);
    expect(available).toHaveBeenCalledOnce();
  });

  it.each(["automatic", "shotgun", "huntingRifle"] as const)("falls back to Revolver for %s", id => {
    const available = vi.fn(path => path === revolver);
    expect(resolveWeaponSound(id, available, 0.5)?.path).toBe(revolver);
    expect(available.mock.calls.map(([path]) => path)).toEqual([...WEAPON_SOUND_PROFILES[id].candidates]);
  });

  it("describes a twenty-shot burst at 100 ms with half gain for either candidate", () => {
    for (const path of WEAPON_SOUND_PROFILES.automatic.candidates) {
      expect(resolveWeaponSound("automatic", candidate => candidate === path, 0.5)).toMatchObject({
        path, repetitions: 20, intervalMs: 100, volume: 0.25, delayMs: 0,
      });
    }
  });

  it("omits unavailable audio and continues past a failing candidate", () => {
    expect(resolveWeaponSound("automatic", () => false, 0.5)).toBeNull();
    expect(resolveWeaponSound("automatic", path => {
      if (path !== revolver) throw new Error("database unavailable");
      return true;
    }, 0.5)?.path).toBe(revolver);
    expect(resolveWeaponSound("handgun", () => { throw new Error(); }, 0.5)).toBeNull();
  });

  it.each([0, -1, NaN, Infinity, -Infinity])("does not query audio at invalid or muted volume %s", volume => {
    const available = vi.fn();
    expect(resolveWeaponSound("handgun", available, volume)).toBeNull();
    expect(available).not.toHaveBeenCalled();
  });

  it("clamps excessive volume and skips weapons without an approved profile", () => {
    expect(resolveWeaponSound("handgun", () => true, 2)?.volume).toBe(1);
    const available = vi.fn();
    expect(resolveWeaponSound(null, available, 0.5)).toBeNull();
    expect(available).not.toHaveBeenCalled();
  });
});
