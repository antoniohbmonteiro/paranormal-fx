import type { RitualFxPreset } from "../ritual-fx-preset";
import { createEletrocussaoStudentRectangleRayPreset } from "./eletrocussao";

export function getDefaultRitualFxPresets(): RitualFxPreset[] {
  return [createEletrocussaoStudentRectangleRayPreset()];
}
