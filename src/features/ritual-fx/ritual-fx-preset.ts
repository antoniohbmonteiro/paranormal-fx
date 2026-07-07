import type { ToolkitAreaType, ToolkitRitualForm } from "../../adapters/toolkit/toolkit-payloads";

export interface RitualFxPresetMatch {
  toolkitPresetId: string;
  form?: ToolkitRitualForm;
  areaType?: ToolkitAreaType;
}

export interface RitualFxPreset {
  id: string;
  label: string;
  match: RitualFxPresetMatch;
  effectPath: string | null;
  scale?: number;
}
