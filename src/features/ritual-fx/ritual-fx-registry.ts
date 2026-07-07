import type { NormalizedRitualFxContext } from "../../adapters/toolkit/toolkit-payloads";
import type { RitualFxPreset } from "./ritual-fx-preset";

export class RitualFxRegistry {
  readonly #presets = new Map<string, RitualFxPreset>();

  register(preset: RitualFxPreset): void {
    this.#presets.set(preset.id, preset);
  }

  registerMany(presets: RitualFxPreset[]): void {
    for (const preset of presets) this.register(preset);
  }

  findMatchingPreset(context: NormalizedRitualFxContext): RitualFxPreset | null {
    for (const preset of this.#presets.values()) {
      if (!matchesPreset(preset, context)) continue;
      return preset;
    }

    return null;
  }

  get all(): RitualFxPreset[] {
    return [...this.#presets.values()];
  }
}

function matchesPreset(preset: RitualFxPreset, context: NormalizedRitualFxContext): boolean {
  if (preset.match.toolkitPresetId !== context.toolkitPresetId) return false;
  if (preset.match.form && preset.match.form !== context.form) return false;
  if (preset.match.areaType && preset.match.areaType !== context.areaType) return false;
  return true;
}

export const ritualFxRegistry = new RitualFxRegistry();
