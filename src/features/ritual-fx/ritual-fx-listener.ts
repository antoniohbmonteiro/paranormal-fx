import { TOOLKIT_HOOKS } from "../../adapters/toolkit/toolkit-hooks";
import {
  normalizeRitualPayload,
  type ToolkitAreaPayload,
  type ToolkitRitualLifecyclePayload,
} from "../../adapters/toolkit/toolkit-payloads";
import { logger } from "../../core/logger";
import { RitualFxOrchestrator } from "./ritual-fx-orchestrator";

const areaByCastId = new Map<string, ToolkitAreaPayload>();

export function registerRitualFxListeners(orchestrator = new RitualFxOrchestrator()): void {
  Hooks.on(TOOLKIT_HOOKS.ritualCastStarted, (payload: ToolkitRitualLifecyclePayload) => {
    if (payload.castId) areaByCastId.delete(payload.castId);
    logger.debug("Ritual cast started", payload);
  });

  Hooks.on(TOOLKIT_HOOKS.ritualAreaResolved, (payload: ToolkitRitualLifecyclePayload) => {
    if (payload.castId && payload.event?.area) {
      areaByCastId.set(payload.castId, payload.event.area);
    }

    logger.debug("Ritual area resolved", payload);
  });

  Hooks.on(TOOLKIT_HOOKS.ritualCastFinished, (payload: ToolkitRitualLifecyclePayload) => {
    const cachedArea = payload.castId ? areaByCastId.get(payload.castId) ?? null : null;
    const context = normalizeRitualPayload(payload, cachedArea);

    orchestrator.handleRitualFinished(context).catch((error: unknown) => {
      logger.error("Failed to play ritual FX", error, context);
    });

    if (payload.castId) areaByCastId.delete(payload.castId);
  });

  logger.info("Ritual FX listeners registered.");
}
