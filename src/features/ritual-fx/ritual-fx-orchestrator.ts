import { SequencerAdapter } from "../../adapters/sequencer/sequencer-adapter";
import type { NormalizedRitualFxContext } from "../../adapters/toolkit/toolkit-payloads";
import { logger } from "../../core/logger";
import { ritualFxRegistry } from "./ritual-fx-registry";

export class RitualFxOrchestrator {
  constructor(private readonly sequencerAdapter = new SequencerAdapter()) {}

  async handleRitualFinished(context: NormalizedRitualFxContext): Promise<void> {
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

    await this.sequencerAdapter.playRitualPreset(preset, context);
  }
}
