import { logger } from "../../core/logger";
import type { NormalizedRitualFxContext } from "../toolkit/toolkit-payloads";
import type { RitualFxPreset } from "../../features/ritual-fx/ritual-fx-preset";

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
  async playRitualPreset(preset: RitualFxPreset, context: NormalizedRitualFxContext): Promise<void> {
    const Sequence = getSequenceConstructor();
    if (!Sequence) {
      logger.warn("Sequencer API is not available at runtime.");
      return;
    }

    if (!preset.effectPath) {
      logger.warn("Ritual FX preset has no effect path configured yet.", preset.id);
      return;
    }

    const sequence = new Sequence({ moduleName: "paranormal-fx" });
    const effect = sequence.effect().name(preset.id).file(preset.effectPath);

    // First pass: keep playback conservative. Real area placement is implemented per preset
    // after we pick the exact JB2A asset and understand its orientation requirements.
    const location = resolveFallbackLocation(context);
    if (location) effect.atLocation(location);

    if (preset.scale) effect.scale(preset.scale);

    await sequence.play();
    logger.debug("Played ritual FX preset", { preset: preset.id, context });
  }
}

function resolveFallbackLocation(context: NormalizedRitualFxContext): unknown | null {
  const targets = context.sourcePayload.event?.targets;
  return Array.isArray(targets) && targets.length > 0 ? targets[0] : null;
}
