import { validateRuntimeDependencies } from "./config/dependencies";
import { MODULE_TITLE } from "./config/module-constants";
import { logger } from "./core/logger";
import { registerSettings } from "./core/settings";
import { registerRitualFxListeners } from "./features/ritual-fx/ritual-fx-listener";
import { registerResourceFeedbackListeners } from "./features/resource-feedback/resource-feedback-listener";
import { ritualFxRegistry } from "./features/ritual-fx/ritual-fx-registry";
import { getDefaultRitualFxPresets } from "./features/ritual-fx/presets/default-presets";

Hooks.once("init", () => {
  registerSettings();
  ritualFxRegistry.registerMany(getDefaultRitualFxPresets());
  logger.info("Initialized.");
});

Hooks.once("ready", () => {
  registerResourceFeedbackListeners();
  if (!validateRuntimeDependencies()) return;

  registerRitualFxListeners();
  logger.info(`${MODULE_TITLE} ready.`);
});
