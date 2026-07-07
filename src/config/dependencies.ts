import { MODULE_TITLE, REQUIRED_MODULE_IDS, TARGET_SYSTEM_ID } from "./module-constants";
import { logger } from "../core/logger";

const MODULE_LABELS: Record<string, string> = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A",
};

export function validateRuntimeDependencies(): boolean {
  const missingModules = REQUIRED_MODULE_IDS.filter((moduleId) => !game.modules.get(moduleId)?.active);

  if (missingModules.length > 0) {
    const labels = missingModules.map((moduleId) => MODULE_LABELS[moduleId] ?? moduleId).join(", ");
    ui.notifications.error(`${MODULE_TITLE} requer os módulos ativos: ${labels}.`);
    logger.error("Missing required modules", missingModules);
    return false;
  }

  if (game.system.id !== TARGET_SYSTEM_ID) {
    ui.notifications.warn(`${MODULE_TITLE} foi feito para o sistema Ordem Paranormal.`);
    logger.warn("Unexpected system", { current: game.system.id, expected: TARGET_SYSTEM_ID });
  }

  return true;
}
