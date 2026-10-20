import { TOOLKIT_HOOKS } from "../../adapters/toolkit/toolkit-hooks";
import { WeaponFxService } from "./weapon-fx-service";

let registered = false;

export function registerWeaponFxListeners(service = new WeaponFxService()): void {
  if (registered) return;
  registered = true;
  Hooks.on(TOOLKIT_HOOKS.attackPublished, (payload: unknown) => { void service.handleAttackPublished(payload); });
  Hooks.on("registerSequencerDatabaseEntries", (namespace: string) => { service.database.invalidate(namespace); });
}
