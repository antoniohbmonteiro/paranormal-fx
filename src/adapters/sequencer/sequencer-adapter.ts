import { MODULE_ID } from "../../config/module-constants";
import { logger } from "../../core/logger";
import type { RitualFxPreset } from "../../features/ritual-fx/ritual-fx-preset";
import { createPlacementSummary, type RitualFxPlacement } from "../../features/ritual-fx/ritual-area-resolver";

type SequenceConstructor = new (options?: Record<string, unknown>) => SequenceLike;

interface SequenceLike {
  effect(): SequenceEffectLike;
  play(): Promise<void> | void;
}

interface SequenceEffectLike {
  file(path: string): SequenceEffectLike;
  name(name: string): SequenceEffectLike;
  atLocation(location: unknown): SequenceEffectLike;
  stretchTo(location: unknown): SequenceEffectLike;
  rotateTowards(location: unknown): SequenceEffectLike;
  scale(value: number): SequenceEffectLike;
  waitUntilFinished(offset?: number): SequenceEffectLike;
}

function getSequenceConstructor(): SequenceConstructor | null {
  const maybeSequence = globalThis.Sequence;
  return typeof maybeSequence === "function" ? (maybeSequence as SequenceConstructor) : null;
}

export class SequencerAdapter {
  async playRitualPreset(preset: RitualFxPreset, placement: RitualFxPlacement): Promise<void> {
    const Sequence = getSequenceConstructor();
    if (!Sequence) {
      logger.warn("Sequencer API is not available at runtime.");
      return;
    }

    if (!preset.effectPath) {
      logger.warn("Ritual FX preset has no effect path configured yet.", preset.id);
      return;
    }

    logger.debug("Preparing Sequencer ritual FX", {
      preset: preset.id,
      effectPath: preset.effectPath,
      placement: createPlacementSummary(placement),
    });

    const sequence = new Sequence({ moduleName: MODULE_ID });
    const effect = sequence.effect().name(preset.id).file(preset.effectPath);

    applyPlacement(effect, placement);

    if (preset.scale) effect.scale(preset.scale);

    await sequence.play();
    logger.debug("Played ritual FX preset", {
      preset: preset.id,
      effectPath: preset.effectPath,
      placement: createPlacementSummary(placement),
    });
  }
}

function applyPlacement(effect: SequenceEffectLike, placement: RitualFxPlacement): void {
  if (placement.type === "line") {
    logger.debug("Applying Sequencer line placement", createPlacementSummary(placement));
    effect.atLocation(placement.start).stretchTo(placement.end);
    return;
  }

  logger.debug("Applying Sequencer point placement", createPlacementSummary(placement));
  effect.atLocation(placement.location);
}
