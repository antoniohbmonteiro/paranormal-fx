import { MODULE_ID } from "../config/module-constants";

export const SETTINGS = {
  debug: "debug",
} as const;

export function registerSettings(): void {
  game.settings.register(MODULE_ID, SETTINGS.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
  });
}

export function isDebugEnabled(): boolean {
  try {
    return Boolean(game.settings.get(MODULE_ID, SETTINGS.debug));
  } catch {
    return false;
  }
}
