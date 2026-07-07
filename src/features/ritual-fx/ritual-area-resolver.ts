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

export type RitualFxPlacement =
  | {
      type: "line";
      start: CanvasPoint;
      end: CanvasPoint;
    }
  | {
      type: "point";
      location: unknown;
    };

export function getAreaType(area: ToolkitAreaPayload | null): ToolkitAreaType | null {
  return area?.type ?? area?.areaType ?? null;
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

  return { type: "line", start, end };
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

  return {
    type: "line",
    start,
    end: {
      x: start.x + lengthVector.x * length,
      y: start.y + lengthVector.y * length,
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

  return {
    type: "line",
    start: {
      x: center.x - dx,
      y: center.y - dy,
    },
    end: {
      x: center.x + dx,
      y: center.y + dy,
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
    return {
      type: "line",
      start: { x, y: centerY },
      end: { x: x + width, y: centerY },
    };
  }

  const centerX = x + width / 2;
  return {
    type: "line",
    start: { x: centerX, y },
    end: { x: centerX, y: y + height },
  };
}

function resolveFirstTargetPlacement(context: NormalizedRitualFxContext): RitualFxPlacement | null {
  const target = context.targets[0];
  if (!target) return null;

  return {
    type: "point",
    location: target,
  };
}

function normalizePoint(value: ToolkitPointPayload | null | undefined): CanvasPoint | null {
  const x = getFiniteNumber(value?.x);
  const y = getFiniteNumber(value?.y);

  if (x === null || y === null) return null;

  return { x, y };
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

function pointsAreEqual(a: CanvasPoint, b: CanvasPoint): boolean {
  return a.x === b.x && a.y === b.y;
}
