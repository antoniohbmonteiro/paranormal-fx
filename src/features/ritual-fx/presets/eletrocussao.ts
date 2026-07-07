import type { RitualFxPreset } from "../ritual-fx-preset";

export const ELETROCUSSAO_STUDENT_RECTANGLE_RAY_EFFECT_PATH = "jb2a.chain_lightning.primary.blue.60ft";

export function createEletrocussaoStudentRectangleRayPreset(
  effectPath = ELETROCUSSAO_STUDENT_RECTANGLE_RAY_EFFECT_PATH,
): RitualFxPreset {
  return {
    id: "ritual.eletrocussao.student.rectangleRay",
    label: "Eletrocussão Discente - Linha",
    match: {
      toolkitPresetId: "ritual.eletrocussao",
      form: "student",
      areaType: "rectangleRay",
    },
    effectPath,
    placementMode: "rectangleRayLine",
  };
}
