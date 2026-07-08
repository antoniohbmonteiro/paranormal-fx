import type { ToolkitAreaType, ToolkitRitualForm } from "../../adapters/toolkit/toolkit-payloads";

export interface RitualFxPresetMatch {
  toolkitPresetId: string;
  form?: ToolkitRitualForm;
  areaType?: ToolkitAreaType;
}

export type RitualFxPlacementMode = "rectangleRayLine" | "sourceToTargetLine" | "sourceToEachTargetLine" | "firstTarget";

export interface RitualFxPreset {
  id: string;
  label: string;
  match: RitualFxPresetMatch;
  effectPath: string | null;
  placementMode: RitualFxPlacementMode;
  scale?: number;
  staggerMs?: number;
}
