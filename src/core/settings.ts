import { MODULE_ID } from "../config/module-constants";

export const SETTINGS = {
  debug: "debug",
  resourceFeedback: "resourceFeedback",
  weaponAnimations: "weaponAnimations",
} as const;

export function registerSettings(): void {
  game.settings.register(MODULE_ID, SETTINGS.weaponAnimations, {
    name: "Animações automáticas de armas",
    hint: "Reproduz animações JB2A para armas reconhecidas em ataques públicos com alvo válido.",
    scope: "world", config: true, type: Boolean, default: true,
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

export function isDebugEnabled(): boolean {
  try {
    return Boolean(game.settings.get(MODULE_ID, SETTINGS.debug));
  } catch {
    return false;
  }
}
