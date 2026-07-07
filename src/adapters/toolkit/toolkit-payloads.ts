export type ToolkitRitualForm = "standard" | "student" | "true";
export type ToolkitAreaType = "rectangleRay" | string;

export interface ToolkitAreaPayload {
  type?: ToolkitAreaType;
  areaType?: ToolkitAreaType;
  sceneId?: string;
  regionId?: string;
  bounds?: unknown;
  rotation?: number;
  length?: number;
  width?: number;
  targets?: unknown[];
}

export interface ToolkitRitualLifecyclePayload {
  castId?: string;
  automation?: {
    type?: string;
    presetId?: string;
    presetVersion?: string;
    label?: string;
    fxEligible?: boolean;
  };
  ritual?: {
    form?: ToolkitRitualForm;
  };
  event?: {
    area?: ToolkitAreaPayload;
    targets?: unknown[];
  };
}

export interface NormalizedRitualFxContext {
  castId: string | null;
  toolkitPresetId: string | null;
  form: ToolkitRitualForm | null;
  areaType: ToolkitAreaType | null;
  area: ToolkitAreaPayload | null;
  fxEligible: boolean;
  sourcePayload: ToolkitRitualLifecyclePayload;
}

export function normalizeRitualPayload(
  payload: ToolkitRitualLifecyclePayload,
  cachedArea: ToolkitAreaPayload | null = null,
): NormalizedRitualFxContext {
  const area = payload.event?.area ?? cachedArea;
  const areaType = area?.type ?? area?.areaType ?? null;

  return {
    castId: payload.castId ?? null,
    toolkitPresetId: payload.automation?.presetId ?? null,
    form: payload.ritual?.form ?? null,
    areaType,
    area: area ?? null,
    fxEligible: payload.automation?.fxEligible === true,
    sourcePayload: payload,
  };
}
