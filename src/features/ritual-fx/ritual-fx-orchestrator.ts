import { SequencerAdapter } from "../../adapters/sequencer/sequencer-adapter";
import type { NormalizedRitualFxContext } from "../../adapters/toolkit/toolkit-payloads";
import { logger } from "../../core/logger";
import {
  createPlacementSummary,
  createRitualAreaDiagnostics,
  resolveRitualFxPlacement,
} from "./ritual-area-resolver";
import { ritualFxRegistry } from "./ritual-fx-registry";

export class RitualFxOrchestrator {
  constructor(private readonly sequencerAdapter = new SequencerAdapter()) {}

  async handleRitualFinished(context: NormalizedRitualFxContext): Promise<void> {
    logger.debug("Handling ritual FX context", {
      castId: context.castId,
      toolkitPresetId: context.toolkitPresetId,
      form: context.form,
      areaType: context.areaType,
      fxEligible: context.fxEligible,
      targetCount: context.targets.length,
      area: createRitualAreaDiagnostics(context.area),
    });

    if (!context.fxEligible) {
      logger.debug("Ignoring ritual because payload is not FX eligible", context);
      return;
    }

    if (!context.toolkitPresetId) {
      logger.debug("Ignoring ritual without toolkit preset id", context);
      return;
    }

    const preset = ritualFxRegistry.findMatchingPreset(context);
    if (!preset) {
      logger.debug("No Ritual FX preset matched this ritual context", context);
      return;
    }

    logger.debug("Matched Ritual FX preset", {
      preset,
      area: createRitualAreaDiagnostics(context.area),
    });

    const placement = resolveRitualFxPlacement(preset, context);
    if (!placement) {
      logger.debug("No Ritual FX placement could be resolved", {
        preset,
        area: createRitualAreaDiagnostics(context.area),
        context,
      });
      return;
    }

    logger.debug("Resolved ritual FX placement", {
      preset: preset.id,
      placement: createPlacementSummary(placement),
      rawPlacement: placement,
    });
    await this.sequencerAdapter.playRitualPreset(preset, placement);
  }
}
