import { MODULE_ID } from "../config/module-constants";

export const SETTINGS = {
  debug: "debug",
  resourceFeedback: "resourceFeedback",
  weaponAnimations: "weaponAnimations",
  weaponSounds: "weaponSounds",
  weaponSoundVolume: "weaponSoundVolume",
} as const;

export function registerSettings(): void {
  game.settings.register(MODULE_ID, SETTINGS.weaponAnimations, {
    name: "Animações automáticas de armas",
    hint: "Reproduz animações JB2A para armas reconhecidas em ataques públicos com alvo válido.",
    scope: "world", config: true, type: Boolean, default: true,
  });
  game.settings.register(MODULE_ID, SETTINGS.weaponSounds, {
    name: "Sons automáticos de armas",
    hint: "Adiciona sons do PSFX às animações de armas para toda a mesa, quando disponíveis.",
    scope: "world", config: true, type: Boolean, default: true,
  });
  game.settings.register(MODULE_ID, SETTINGS.weaponSoundVolume, {
    name: "Volume dos sons de armas",
    hint: "Volume dos sons automáticos para toda a mesa. Cada participante também pode ajustar o áudio de interface do Foundry.",
    scope: "world", config: true, type: Number, default: 0.5,
    range: { min: 0, max: 1, step: 0.05 },
  });
  game.settings.register(MODULE_ID, SETTINGS.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
  });
  game.settings.register(MODULE_ID, SETTINGS.resourceFeedback, {
    name: "Texto flutuante de dano e cura",
    hint: "Exibe números flutuantes sobre Tokens quando seus Pontos de Vida diminuem ou aumentam.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });
}

export function isWeaponAnimationsEnabled(): boolean {
  try {
    return Boolean(game.settings.get(MODULE_ID, SETTINGS.weaponAnimations));
  } catch {
    return false;
  }
}

export function isResourceFeedbackEnabled(): boolean {
  try {
    return Boolean(game.settings.get(MODULE_ID, SETTINGS.resourceFeedback));
  } catch {
    return true;
  }
}

export function getWeaponSoundVolume(): number {
  try {
    if (game.settings.get(MODULE_ID, SETTINGS.weaponSounds) !== true) return 0;
    const volume = game.settings.get(MODULE_ID, SETTINGS.weaponSoundVolume);
    return typeof volume === "number" && Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
  } catch {
    return 0;
  }
}

export function isDebugEnabled(): boolean {
  try {
    return Boolean(game.settings.get(MODULE_ID, SETTINGS.debug));
  } catch {
    return false;
  }
}
