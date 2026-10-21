export interface WeaponSoundProfile {
  readonly candidates: readonly string[];
  readonly gain: number;
  readonly repetitions: number;
  readonly intervalMs: number;
  readonly delayMs: number;
  readonly distanceBased: boolean;
}

const revolver = "psfx.ranged-weapons.guns.single-fire.revolver";

function profile(candidates: string[], options: Partial<Omit<WeaponSoundProfile, "candidates">> = {}): WeaponSoundProfile {
  return Object.freeze({
    candidates: Object.freeze(candidates), gain: 1, repetitions: 1, intervalMs: 0, delayMs: 0,
    distanceBased: false, ...options,
  });
}

export const WEAPON_SOUND_PROFILES = Object.freeze({
  handgun: profile([revolver]),
  automatic: profile(["psfx.ranged-weapons.guns.single-fire.rifle", revolver], {
    gain: 0.5, repetitions: 20, intervalMs: 100,
  }),
  shotgun: profile(["psfx.ranged-weapons.guns.single-fire.shotgun", revolver]),
  huntingRifle: profile(["psfx.ranged-weapons.guns.single-fire.musket", revolver]),
  sword: profile(["psfx.weapon-attacks.sword.v1"]),
  spear: profile(["psfx.weapon-attacks.spear.v1"]),
  lightSwoosh: profile(["psfx.weapon-swooshes.light.v1.group01"]),
  heavySwoosh: profile(["psfx.weapon-swooshes.heavy.v1.group01"]),
  longbow: profile(["psfx.ranged-weapons.longbow.v1"], { distanceBased: true }),
});

export type WeaponSoundProfileId = keyof typeof WEAPON_SOUND_PROFILES;

export interface WeaponSoundPlayback {
  readonly path: string;
  readonly volume: number;
  readonly repetitions: number;
  readonly intervalMs: number;
  readonly delayMs: number;
  readonly distanceBased: boolean;
}
