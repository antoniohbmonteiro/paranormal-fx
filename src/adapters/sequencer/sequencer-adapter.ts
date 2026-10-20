import { MODULE_ID } from "../../config/module-constants";
import { logger } from "../../core/logger";
import type { RitualFxPreset } from "../../features/ritual-fx/ritual-fx-preset";
import type { RitualFxPlacement } from "../../features/ritual-fx/ritual-area-resolver";
import type { WeaponFxDefinition } from "../../features/weapon-fx/weapon-fx-catalog";
import type { WeaponFxContext } from "../../features/weapon-fx/weapon-fx-context-resolver";

type SequenceConstructor = new (options?: Record<string, unknown>) => SequenceLike;

interface SequenceLike {
  effect(): SequenceEffectLike;
  play(): Promise<void> | void;
}

interface SequenceEffectLike {
  file(path: string): SequenceEffectLike;
  name(name: string): SequenceEffectLike;
  atLocation(location: unknown): SequenceEffectLike;
  stretchTo(location: unknown, options?: { onlyX: boolean }): SequenceEffectLike;
  rotateTowards(location: unknown): SequenceEffectLike;
  scale(value: number): SequenceEffectLike;
  anchor(value: { x: number; y: number }): SequenceEffectLike;
  size(value: number, options: { gridUnits: boolean }): SequenceEffectLike;
  xray(enabled: boolean): SequenceEffectLike;
  waitUntilFinished(offset?: number): SequenceEffectLike;
}

function getSequenceConstructor(): SequenceConstructor | null {
  const maybeSequence = globalThis.Sequence;
  return typeof maybeSequence === "function" ? (maybeSequence as SequenceConstructor) : null;
}

export class SequencerAdapter {
  async playWeaponEffect(definition: WeaponFxDefinition, context: WeaponFxContext): Promise<void> {
    const Sequence = getSequenceConstructor();
    if (!Sequence) return;
    const sequence = new Sequence({ moduleName: MODULE_ID });
    const effect = sequence.effect().file(definition.effectPath).atLocation(context.source).xray(false);
    if (definition.mode === "melee") {
      effect.rotateTowards(context.target).anchor({ x: 0.4, y: 0.5 })
        .size(5 * context.source.w / context.gridSize, { gridUnits: true });
    } else if (definition.mode === "line") {
      effect.stretchTo(context.target, { onlyX: true });
    } else {
      effect.stretchTo(context.target);
    }
    await sequence.play();
  }

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

    if (placement.type === "lineGroup") {
      await this.playLineGroupPreset(Sequence, preset, placement);
      logger.debug("Played ritual FX preset", { preset: preset.id, placement });
      return;
    }

    await this.playSinglePreset(Sequence, preset, placement);
    logger.debug("Played ritual FX preset", { preset: preset.id, placement });
  }

  private async playLineGroupPreset(
    Sequence: SequenceConstructor,
    preset: RitualFxPreset,
    placement: Extract<RitualFxPlacement, { type: "lineGroup" }>,
  ): Promise<void> {
    const staggerMs = Math.max(0, placement.staggerMs ?? preset.staggerMs ?? 0);

    for (const [index, line] of placement.lines.entries()) {
      const singlePlacement: Extract<RitualFxPlacement, { type: "line" }> = {
        type: "line",
        start: line.start,
        end: line.end,
      };

      void this.playSinglePreset(Sequence, preset, singlePlacement, `${preset.id}.${index}`);

      if (index < placement.lines.length - 1 && staggerMs > 0) {
        await delay(staggerMs);
      }
    }
  }

  private async playSinglePreset(
    Sequence: SequenceConstructor,
    preset: RitualFxPreset,
    placement: Exclude<RitualFxPlacement, { type: "lineGroup" }>,
    effectName = preset.id,
  ): Promise<void> {
    const sequence = new Sequence({ moduleName: MODULE_ID });
    const effect = sequence.effect().name(effectName).file(preset.effectPath as string);

    applyPlacement(effect, placement);

    if (preset.scale) effect.scale(preset.scale);

    await sequence.play();
  }
}

function applyPlacement(
  effect: SequenceEffectLike,
  placement: Exclude<RitualFxPlacement, { type: "lineGroup" }>,
): void {
  if (placement.type === "line") {
    effect.atLocation(placement.start).stretchTo(placement.end);
    return;
  }

  effect.atLocation(placement.location);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
