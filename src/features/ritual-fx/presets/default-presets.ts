import type { RitualFxPreset } from "../ritual-fx-preset";
import {
  createEletrocussaoStandardSingleTargetPreset,
  createEletrocussaoStudentRectangleRayPreset,
} from "./eletrocussao";

export function getDefaultRitualFxPresets(): RitualFxPreset[] {
  return [
    createEletrocussaoStandardSingleTargetPreset(),
    createEletrocussaoStudentRectangleRayPreset(),
  ];
}
