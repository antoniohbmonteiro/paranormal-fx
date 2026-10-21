import { TOOLKIT_HOOKS } from "../../adapters/toolkit/toolkit-hooks";
import { WeaponFxService } from "./weapon-fx-service";
import { WeaponSoundPreloader } from "./weapon-sound-preloader";
import { MODULE_ID } from "../../config/module-constants";
import { SETTINGS } from "../../core/settings";

let registered = false;

export function registerWeaponFxListeners(service = new WeaponFxService(), sounds: Pick<WeaponSoundPreloader, "preload"> = new WeaponSoundPreloader()): void {
  if (registered) return;
  registered = true;
  Hooks.on(TOOLKIT_HOOKS.attackPublished, (payload: unknown) => { void service.handleAttackPublished(payload); });
  Hooks.on("registerSequencerDatabaseEntries", (namespace: string) => {
    service.database.invalidate(namespace);
    if (namespace === "psfx") sounds.preload();
  });
  Hooks.on("sequencer.ready", () => { sounds.preload(); });
  const soundSettings = new Set([SETTINGS.weaponAnimations, SETTINGS.weaponSounds, SETTINGS.weaponSoundVolume]
    .map(key => `${MODULE_ID}.${key}`));
  const onSoundSettingChanged = (setting: { key: string }): void => {
    if (soundSettings.has(setting.key)) sounds.preload();
  };
  Hooks.on("createSetting", onSoundSettingChanged);
  Hooks.on("updateSetting", onSoundSettingChanged);
  sounds.preload();
}
