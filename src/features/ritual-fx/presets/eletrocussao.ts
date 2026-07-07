import type { RitualFxPreset } from "../ritual-fx-preset";

export function createEletrocussaoStudentRectangleRayPreset(effectPath: string): RitualFxPreset {
  return {
    id: "ritual.eletrocussao.student.rectangleRay",
    label: "Eletrocussão Discente - Linha",
    match: {
      toolkitPresetId: "ritual.eletrocussao",
      form: "student",
      areaType: "rectangleRay",
    },
    effectPath,
  };
}
