import { WEAPON_SOUND_PROFILES, type WeaponSoundPlayback, type WeaponSoundProfileId } from "./weapon-sound-profiles";

export function resolveWeaponSound(
  profileId: WeaponSoundProfileId | null,
  available: (path: string) => boolean,
  volume: number,
): WeaponSoundPlayback | null {
  if (!profileId || !Number.isFinite(volume) || volume <= 0) return null;
  const profile = WEAPON_SOUND_PROFILES[profileId];
  for (const path of profile.candidates) {
    try {
      if (available(path)) return {
        path, volume: Math.min(1, volume) * profile.gain,
        repetitions: profile.repetitions, intervalMs: profile.intervalMs,
        delayMs: profile.delayMs, distanceBased: profile.distanceBased,
      };
    } catch {
      // A failing optional candidate must not prevent the next fallback or the visual effect.
    }
  }
  return null;
}
