import type { RitualFxPreset } from "../ritual-fx-preset";
import {
  createEletrocussaoStandardSingleTargetPreset,
  createEletrocussaoStudentRectangleRayPreset,
  createEletrocussaoTrueMultiTargetPreset,
} from "./eletrocussao";

export function getDefaultRitualFxPresets(): RitualFxPreset[] {
  return [
    createEletrocussaoStandardSingleTargetPreset(),
    createEletrocussaoStudentRectangleRayPreset(),
    createEletrocussaoTrueMultiTargetPreset(),
  ];
}
