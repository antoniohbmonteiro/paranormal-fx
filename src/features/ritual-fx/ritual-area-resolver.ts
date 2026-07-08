import type {
  ToolkitAreaPayload,
  ToolkitAreaType,
  ToolkitPointPayload,
} from "../../adapters/toolkit/toolkit-payloads";
import type { NormalizedRitualFxContext } from "../../adapters/toolkit/toolkit-payloads";
import type { RitualFxPreset } from "./ritual-fx-preset";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface RitualFxPlacementDiagnostics {
  strategy: "explicitRay" | "rectangleShape" | "centerAndShape" | "bounds" | "firstTarget";
  area: RitualAreaDiagnostics | null;
  resolved?: {
    start?: CanvasPoint;
    end?: CanvasPoint;
    delta?: CanvasPoint;
    distance?: number;
    angleDegrees?: number;
    length?: number;
    width?: number;
    directionDegrees?: number;
    directionRadians?: number;
    lengthVector?: CanvasPoint;
    perpendicularVector?: CanvasPoint;
  };
}

export interface RitualAreaDiagnostics {
  type: ToolkitAreaType | null;
  sceneId: string | null;
  regionId: string | null;
  gridSize: number | null;
  bounds: unknown;
  shape: unknown;
  center: unknown;
  ray: unknown;
  areaRotation: unknown;
  areaLength: unknown;
  areaWidth: unknown;
  shapeDirection: unknown;
  shapeWidth: unknown;
  shapeHeight: unknown;
  shapeX: unknown;
  shapeY: unknown;
}

export type RitualFxPlacement =
  | {
      type: "line";
      start: CanvasPoint;
      end: CanvasPoint;
      diagnostics?: RitualFxPlacementDiagnostics;
    }
  | {
      type: "point";
      location: unknown;
      diagnostics?: RitualFxPlacementDiagnostics;
    };

export function getAreaType(area: ToolkitAreaPayload | null): ToolkitAreaType | null {
  return area?.type ?? area?.areaType ?? null;
}

export function createRitualAreaDiagnostics(area: ToolkitAreaPayload | null): RitualAreaDiagnostics | null {
  if (!area) return null;

  return {
    type: getAreaType(area),
    sceneId: normalizeNullableString(area.sceneId),
    regionId: normalizeNullableString(area.regionId),
    gridSize: getFiniteNumber(area.gridSize),
    bounds: area.bounds ?? null,
    shape: area.shape ?? null,
    center: area.center ?? null,
    ray: area.ray ?? null,
    areaRotation: area.rotation ?? null,
    areaLength: area.length ?? null,
    areaWidth: area.width ?? null,
    shapeDirection: area.shape?.direction ?? null,
    shapeWidth: area.shape?.width ?? null,
    shapeHeight: area.shape?.height ?? null,
    shapeX: area.shape?.x ?? null,
    shapeY: area.shape?.y ?? null,
  };
}

export function createPlacementSummary(placement: RitualFxPlacement | null): unknown {
  if (!placement) return null;

  if (placement.type === "point") {
    return {
      type: placement.type,
      location: placement.location,
      diagnostics: placement.diagnostics ?? null,
    };
  }

  const delta = calculateDelta(placement.start, placement.end);

  return {
    type: placement.type,
    start: placement.start,
    end: placement.end,
    delta,
    distance: calculateDistance(delta),
    angleDegrees: calculateAngleDegrees(delta),
    diagnostics: placement.diagnostics ?? null,
  };
}

export function resolveRitualFxPlacement(
  preset: RitualFxPreset,
  context: NormalizedRitualFxContext,
): RitualFxPlacement | null {
  if (preset.placementMode === "rectangleRayLine") {
    return resolveRectangleRayLinePlacement(context.area);
  }

  return resolveFirstTargetPlacement(context);
}

function resolveRectangleRayLinePlacement(area: ToolkitAreaPayload | null): RitualFxPlacement | null {
  if (!area || getAreaType(area) !== "rectangleRay") return null;

  const rayPlacement = resolveExplicitRay(area);
  if (rayPlacement) return rayPlacement;

  const shapePlacement = resolveLineFromRectangleShape(area);
  if (shapePlacement) return shapePlacement;

  const centerPlacement = resolveLineFromCenterAndShape(area);
  if (centerPlacement) return centerPlacement;

  return resolveLineFromBounds(area);
}

function resolveExplicitRay(area: ToolkitAreaPayload): RitualFxPlacement | null {
  const start = normalizePoint(area.ray?.start);
  const end = normalizePoint(area.ray?.end);

  if (!start || !end) return null;
  if (pointsAreEqual(start, end)) return null;

  return createLinePlacement("explicitRay", area, start, end);
}

function resolveLineFromRectangleShape(area: ToolkitAreaPayload): RitualFxPlacement | null {
  const shape = area.shape;
  if (!shape) return null;

  const x = getFiniteNumber(shape.x);
  const y = getFiniteNumber(shape.y);
  const length = getPositiveNumber(shape.width ?? area.length);
  const width = getFiniteNumber(shape.height ?? area.width) ?? 0;
  const direction = getFiniteNumber(shape.direction ?? area.rotation) ?? 0;

  if (x === null || y === null || length === null) return null;

  const radians = degreesToRadians(direction);
  const lengthVector = {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
  const perpendicularVector = {
    x: -Math.sin(radians),
    y: Math.cos(radians),
  };
  const halfWidth = width / 2;
  const start = {
    x: x + perpendicularVector.x * halfWidth,
    y: y + perpendicularVector.y * halfWidth,
  };
  const end = {
    x: start.x + lengthVector.x * length,
    y: start.y + lengthVector.y * length,
  };

  return {
    ...createLinePlacement("rectangleShape", area, start, end),
    diagnostics: {
      strategy: "rectangleShape",
      area: createRitualAreaDiagnostics(area),
      resolved: {
        start,
        end,
        delta: calculateDelta(start, end),
        distance: calculateDistance(calculateDelta(start, end)),
        angleDegrees: calculateAngleDegrees(calculateDelta(start, end)),
        length,
        width,
        directionDegrees: direction,
        directionRadians: radians,
        lengthVector,
        perpendicularVector,
      },
    },
  };
}

function resolveLineFromCenterAndShape(area: ToolkitAreaPayload): RitualFxPlacement | null {
  const center = normalizePoint(area.center);
  const length = getPositiveNumber(area.shape?.width ?? area.length);
  const direction = getFiniteNumber(area.shape?.direction ?? area.rotation) ?? 0;

  if (!center || length === null) return null;

  const radians = degreesToRadians(direction);
  const halfLength = length / 2;
  const dx = Math.cos(radians) * halfLength;
  const dy = Math.sin(radians) * halfLength;
  const start = {
    x: center.x - dx,
    y: center.y - dy,
  };
  const end = {
    x: center.x + dx,
    y: center.y + dy,
  };

  return {
    ...createLinePlacement("centerAndShape", area, start, end),
    diagnostics: {
      strategy: "centerAndShape",
      area: createRitualAreaDiagnostics(area),
      resolved: {
        start,
        end,
        delta: calculateDelta(start, end),
        distance: calculateDistance(calculateDelta(start, end)),
        angleDegrees: calculateAngleDegrees(calculateDelta(start, end)),
        length,
        directionDegrees: direction,
        directionRadians: radians,
      },
    },
  };
}

function resolveLineFromBounds(area: ToolkitAreaPayload): RitualFxPlacement | null {
  const bounds = area.bounds;
  if (!bounds) return null;

  const x = getFiniteNumber(bounds.x);
  const y = getFiniteNumber(bounds.y);
  const width = getPositiveNumber(bounds.width);
  const height = getPositiveNumber(bounds.height);

  if (x === null || y === null || width === null || height === null) return null;

  if (width >= height) {
    const centerY = y + height / 2;
    return createLinePlacement("bounds", area, { x, y: centerY }, { x: x + width, y: centerY });
  }

  const centerX = x + width / 2;
  return createLinePlacement("bounds", area, { x: centerX, y }, { x: centerX, y: y + height });
}

function resolveFirstTargetPlacement(context: NormalizedRitualFxContext): RitualFxPlacement | null {
  const target = context.targets[0];
  if (!target) return null;

  return {
    type: "point",
    location: target,
    diagnostics: {
      strategy: "firstTarget",
      area: createRitualAreaDiagnostics(context.area),
    },
  };
}

function createLinePlacement(
  strategy: RitualFxPlacementDiagnostics["strategy"],
  area: ToolkitAreaPayload,
  start: CanvasPoint,
  end: CanvasPoint,
): RitualFxPlacement {
  const delta = calculateDelta(start, end);

  return {
    type: "line",
    start,
    end,
    diagnostics: {
      strategy,
      area: createRitualAreaDiagnostics(area),
      resolved: {
        start,
        end,
        delta,
        distance: calculateDistance(delta),
        angleDegrees: calculateAngleDegrees(delta),
      },
    },
  };
}

function normalizePoint(value: ToolkitPointPayload | null | undefined): CanvasPoint | null {
  const x = getFiniteNumber(value?.x);
  const y = getFiniteNumber(value?.y);

  if (x === null || y === null) return null;

  return { x, y };
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function calculateDelta(start: CanvasPoint, end: CanvasPoint): CanvasPoint {
  return {
    x: end.x - start.x,
    y: end.y - start.y,
  };
}

function calculateDistance(delta: CanvasPoint): number {
  return Math.hypot(delta.x, delta.y);
}

function calculateAngleDegrees(delta: CanvasPoint): number {
  return radiansToDegrees(Math.atan2(delta.y, delta.x));
}

function getFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getPositiveNumber(value: unknown): number | null {
  const numberValue = getFiniteNumber(value);
  return numberValue !== null && numberValue > 0 ? numberValue : null;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function pointsAreEqual(a: CanvasPoint, b: CanvasPoint): boolean {
  return a.x === b.x && a.y === b.y;
}
