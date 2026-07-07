export type ToolkitRitualForm = "standard" | "student" | "true";
export type ToolkitAreaType = "rectangleRay" | string;

export interface ToolkitPointPayload {
  x: number;
  y: number;
}

export interface ToolkitBoundsPayload {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ToolkitRectangleRayShapePayload {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  direction?: number;
  elevation?: number | null;
}

export interface ToolkitRectangleRayPayload {
  start?: ToolkitPointPayload | null;
  end?: ToolkitPointPayload | null;
}

export interface ToolkitAreaPayload {
  type?: ToolkitAreaType;
  areaType?: ToolkitAreaType;
  sceneId?: string | null;
  regionId?: string | null;
  gridSize?: number | null;
  bounds?: ToolkitBoundsPayload;
  shape?: ToolkitRectangleRayShapePayload;
  center?: ToolkitPointPayload;
  ray?: ToolkitRectangleRayPayload;
  rotation?: number;
  length?: number;
  width?: number;
  targets?: unknown[];
}

export interface ToolkitRitualLifecyclePayload {
  version?: number;
  type?: string;
  castId?: string;
  sceneId?: string | null;
  automation?: {
    type?: string;
    presetId?: string | null;
    presetVersion?: string | null;
    label?: string | null;
    fxEligible?: boolean;
  };
  ritual?: {
    form?: ToolkitRitualForm;
  };
  targets?: unknown[];
  area?: ToolkitAreaPayload;
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
  targets: unknown[];
  fxEligible: boolean;
  sourcePayload: ToolkitRitualLifecyclePayload;
}

export function normalizeRitualPayload(
  payload: ToolkitRitualLifecyclePayload,
  cachedArea: ToolkitAreaPayload | null = null,
): NormalizedRitualFxContext {
  const area = payload.area ?? payload.event?.area ?? cachedArea;
  const areaType = area?.type ?? area?.areaType ?? null;
  const targets = payload.targets ?? payload.event?.targets ?? area?.targets ?? [];

  return {
    castId: payload.castId ?? null,
    toolkitPresetId: payload.automation?.presetId ?? null,
    form: payload.ritual?.form ?? null,
    areaType,
    area: area ?? null,
    targets: Array.isArray(targets) ? targets : [],
    fxEligible: payload.automation?.fxEligible === true,
    sourcePayload: payload,
  };
}
