import { TOOLKIT_HOOKS } from "../../adapters/toolkit/toolkit-hooks";
import {
  normalizeRitualPayload,
  type ToolkitAreaPayload,
  type ToolkitRitualLifecyclePayload,
} from "../../adapters/toolkit/toolkit-payloads";
import { logger } from "../../core/logger";
import { createRitualAreaDiagnostics } from "./ritual-area-resolver";
import { RitualFxOrchestrator } from "./ritual-fx-orchestrator";

const areaByCastId = new Map<string, ToolkitAreaPayload>();

export function registerRitualFxListeners(orchestrator = new RitualFxOrchestrator()): void {
  Hooks.on(TOOLKIT_HOOKS.ritualCastStarted, (payload: ToolkitRitualLifecyclePayload) => {
    if (payload.castId) areaByCastId.delete(payload.castId);
    logger.debug("Ritual cast started", createLifecycleDiagnostics(payload));
  });

  Hooks.on(TOOLKIT_HOOKS.ritualAreaResolved, (payload: ToolkitRitualLifecyclePayload) => {
    const area = payload.area ?? payload.event?.area;
    if (payload.castId && area) {
      areaByCastId.set(payload.castId, area);
    }

    logger.debug("Ritual area resolved", {
      lifecycle: createLifecycleDiagnostics(payload),
      area: createRitualAreaDiagnostics(area ?? null),
      rawArea: area ?? null,
      rawPayload: payload,
    });
  });

  Hooks.on(TOOLKIT_HOOKS.ritualCastFinished, (payload: ToolkitRitualLifecyclePayload) => {
    const cachedArea = payload.castId ? areaByCastId.get(payload.castId) ?? null : null;
    const context = normalizeRitualPayload(payload, cachedArea);

    logger.debug("Ritual cast finished", {
      lifecycle: createLifecycleDiagnostics(payload),
      cachedArea: createRitualAreaDiagnostics(cachedArea),
      normalizedArea: createRitualAreaDiagnostics(context.area),
      normalizedContext: {
        castId: context.castId,
        toolkitPresetId: context.toolkitPresetId,
        form: context.form,
        areaType: context.areaType,
        targetCount: context.targets.length,
        fxEligible: context.fxEligible,
      },
      rawPayload: payload,
    });

    orchestrator.handleRitualFinished(context).catch((error: unknown) => {
      logger.error("Failed to play ritual FX", error, context);
    });

    if (payload.castId) areaByCastId.delete(payload.castId);
  });

  logger.info("Ritual FX listeners registered.");
}

function createLifecycleDiagnostics(payload: ToolkitRitualLifecyclePayload): Record<string, unknown> {
  return {
    version: payload.version ?? null,
    type: payload.type ?? null,
    castId: payload.castId ?? null,
    sceneId: payload.sceneId ?? null,
    automationType: payload.automation?.type ?? null,
    presetId: payload.automation?.presetId ?? null,
    presetVersion: payload.automation?.presetVersion ?? null,
    fxEligible: payload.automation?.fxEligible ?? null,
    ritualForm: payload.ritual?.form ?? null,
    targetCount: Array.isArray(payload.targets)
      ? payload.targets.length
      : Array.isArray(payload.event?.targets)
        ? payload.event.targets.length
        : null,
  };
}
