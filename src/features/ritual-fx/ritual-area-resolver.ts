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

export interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RitualFxPlacementDiagnostics {
  strategy: "explicitRay" | "rectangleShape" | "centerAndShape" | "bounds" | "sourceToTarget" | "sourceToTargets" | "firstTarget";
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
    sourceTokenId?: string | null;
    targetTokenId?: string | null;
    sourceTokenName?: string | null;
    targetTokenName?: string | null;
    sourceCenter?: CanvasPoint;
    targetCenter?: CanvasPoint;
    sourceBounds?: CanvasBounds;
    targetBounds?: CanvasBounds;
    startOffset?: number;
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
      type: "lineGroup";
      lines: {
        start: CanvasPoint;
        end: CanvasPoint;
        targetTokenId?: string | null;
        targetTokenName?: string | null;
      }[];
      staggerMs?: number;
      diagnostics?: RitualFxPlacementDiagnostics;
    }
  | {
      type: "point";
      location: unknown;
      diagnostics?: RitualFxPlacementDiagnostics;
    };

type TokenReference = {
  tokenId: string | null;
  actorId: string | null;
  sceneId: string | null;
  name: string | null;
};

type TokenGeometry = {
  tokenId: string | null;
  name: string | null;
  center: CanvasPoint;
  bounds: CanvasBounds;
};

type CanvasLike = {
  scene?: { id?: unknown } | null;
  grid?: { size?: unknown } | null;
  tokens?: {
    get?: (id: string) => unknown;
    placeables?: unknown[];
  } | null;
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

  if (placement.type === "lineGroup") {
    return {
      type: placement.type,
      staggerMs: placement.staggerMs ?? 0,
      lines: placement.lines.map((line) => {
        const delta = calculateDelta(line.start, line.end);
        return {
          start: line.start,
          end: line.end,
          delta,
          distance: calculateDistance(delta),
          angleDegrees: calculateAngleDegrees(delta),
          targetTokenId: line.targetTokenId ?? null,
          targetTokenName: line.targetTokenName ?? null,
        };
      }),
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

  if (preset.placementMode === "sourceToTargetLine") {
    return resolveSourceToTargetLinePlacement(context);
  }

  if (preset.placementMode === "sourceToEachTargetLine") {
    return resolveSourceToEachTargetLinePlacement(context, preset.staggerMs ?? 500);
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

function resolveSourceToTargetLinePlacement(context: NormalizedRitualFxContext): RitualFxPlacement | null {
  const casterReference = normalizeTokenReference(readPath(context.sourcePayload, "caster.token"));
  const targetReference = normalizeTokenReference(context.targets[0]);

  if (!casterReference?.tokenId || !targetReference?.tokenId) return null;

  const caster = resolveTokenGeometry(casterReference);
  const target = resolveTokenGeometry(targetReference);

  if (!caster || !target) return null;

  const start = resolveEdgePointTowardTarget(caster, target.center);
  const end = target.center;

  if (pointsAreEqual(start, end)) return null;

  const delta = calculateDelta(start, end);

  return {
    type: "line",
    start,
    end,
    diagnostics: {
      strategy: "sourceToTarget",
      area: createRitualAreaDiagnostics(context.area),
      resolved: {
        start,
        end,
        delta,
        distance: calculateDistance(delta),
        angleDegrees: calculateAngleDegrees(delta),
        sourceTokenId: caster.tokenId,
        targetTokenId: target.tokenId,
        sourceTokenName: caster.name,
        targetTokenName: target.name,
        sourceCenter: caster.center,
        targetCenter: target.center,
        sourceBounds: caster.bounds,
        targetBounds: target.bounds,
        startOffset: calculateDistance(calculateDelta(caster.center, start)),
      },
    },
  };
}

function resolveSourceToEachTargetLinePlacement(
  context: NormalizedRitualFxContext,
  staggerMs: number,
): RitualFxPlacement | null {
  const casterReference = normalizeTokenReference(readPath(context.sourcePayload, "caster.token"));
  if (!casterReference?.tokenId) return null;

  const caster = resolveTokenGeometry(casterReference);
  if (!caster) return null;

  const seen = new Set<string>();
  const lines = [];

  for (const rawTarget of context.targets) {
    const targetReference = normalizeTokenReference(rawTarget);
    if (!targetReference?.tokenId) continue;
    if (seen.has(targetReference.tokenId)) continue;

    const target = resolveTokenGeometry(targetReference);
    if (!target) continue;

    const start = resolveEdgePointTowardTarget(caster, target.center);
    const end = target.center;
    if (pointsAreEqual(start, end)) continue;

    seen.add(targetReference.tokenId);
    lines.push({
      start,
      end,
      targetTokenId: target.tokenId,
      targetTokenName: target.name,
    });
  }

  if (lines.length === 0) return null;

  return {
    type: "lineGroup",
    lines,
    staggerMs,
    diagnostics: {
      strategy: "sourceToTargets",
      area: createRitualAreaDiagnostics(context.area),
      resolved: {
        sourceTokenId: caster.tokenId,
        sourceTokenName: caster.name,
        sourceCenter: caster.center,
        sourceBounds: caster.bounds,
      },
    },
  };
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

function resolveTokenGeometry(reference: TokenReference): TokenGeometry | null {
  const token = resolveCanvasToken(reference);
  if (!token) return null;

  const center = readPointFromPath(token, "center") ?? readPointFromPath(token, "document.center");
  const bounds = readBoundsFromToken(token, center);
  const resolvedCenter = center ?? (bounds ? getBoundsCenter(bounds) : null);

  if (!resolvedCenter || !bounds) return null;

  return {
    tokenId: reference.tokenId,
    name: reference.name ?? readStringPath(token, "name") ?? readStringPath(token, "document.name"),
    center: resolvedCenter,
    bounds,
  };
}

function resolveCanvasToken(reference: TokenReference): unknown | null {
  const canvas = getCanvas();
  const tokenId = reference.tokenId;
  if (!canvas || !tokenId) return null;

  const currentSceneId = normalizeNullableString(canvas.scene?.id);
  if (reference.sceneId && currentSceneId && reference.sceneId !== currentSceneId) return null;

  const fromCollection = canvas.tokens?.get?.(tokenId);
  if (fromCollection) return fromCollection;

  return canvas.tokens?.placeables?.find((candidate) => {
    return readStringPath(candidate, "id") === tokenId || readStringPath(candidate, "document.id") === tokenId;
  }) ?? null;
}

function readBoundsFromToken(token: unknown, center: CanvasPoint | null): CanvasBounds | null {
  const bounds = normalizeBounds(readPath(token, "bounds"));
  if (bounds) return bounds;

  const gridSize = getPositiveNumber(getCanvas()?.grid?.size) ?? 100;
  const width = getPositiveNumber(readPath(token, "w"))
    ?? getPositiveNumber(readPath(token, "width"))
    ?? multiplyPositive(readPath(token, "document.width"), gridSize)
    ?? gridSize;
  const height = getPositiveNumber(readPath(token, "h"))
    ?? getPositiveNumber(readPath(token, "height"))
    ?? multiplyPositive(readPath(token, "document.height"), gridSize)
    ?? gridSize;
  const x = getFiniteNumber(readPath(token, "x")) ?? getFiniteNumber(readPath(token, "document.x"));
  const y = getFiniteNumber(readPath(token, "y")) ?? getFiniteNumber(readPath(token, "document.y"));

  if (x !== null && y !== null) {
    return { x, y, width, height };
  }

  if (center) {
    return {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    };
  }

  return null;
}

function resolveEdgePointTowardTarget(source: TokenGeometry, targetCenter: CanvasPoint): CanvasPoint {
  const delta = calculateDelta(source.center, targetCenter);
  const distance = calculateDistance(delta);

  if (distance <= 0) return source.center;

  const unit = {
    x: delta.x / distance,
    y: delta.y / distance,
  };
  const halfWidth = Math.max(0, source.bounds.width / 2);
  const halfHeight = Math.max(0, source.bounds.height / 2);
  const xOffset = Math.abs(unit.x) > 0.0001 ? halfWidth / Math.abs(unit.x) : Number.POSITIVE_INFINITY;
  const yOffset = Math.abs(unit.y) > 0.0001 ? halfHeight / Math.abs(unit.y) : Number.POSITIVE_INFINITY;
  const offset = Math.min(xOffset, yOffset);
  const safeOffset = Number.isFinite(offset) ? offset : Math.max(halfWidth, halfHeight, 0);

  return {
    x: source.center.x + unit.x * safeOffset,
    y: source.center.y + unit.y * safeOffset,
  };
}

function normalizeTokenReference(value: unknown): TokenReference | null {
  if (!isRecord(value)) return null;

  const tokenId = normalizeNullableString(value.tokenId) ?? normalizeNullableString(value.id);
  if (!tokenId) return null;

  return {
    tokenId,
    actorId: normalizeNullableString(value.actorId),
    sceneId: normalizeNullableString(value.sceneId),
    name: normalizeNullableString(value.name),
  };
}

function normalizePoint(value: ToolkitPointPayload | null | undefined): CanvasPoint | null {
  const x = getFiniteNumber(value?.x);
  const y = getFiniteNumber(value?.y);

  if (x === null || y === null) return null;

  return { x, y };
}

function readPointFromPath(value: unknown, path: string): CanvasPoint | null {
  const point = readPath(value, path);
  const x = getFiniteNumber(readPath(point, "x"));
  const y = getFiniteNumber(readPath(point, "y"));

  if (x === null || y === null) return null;

  return { x, y };
}

function normalizeBounds(value: unknown): CanvasBounds | null {
  const x = getFiniteNumber(readPath(value, "x"));
  const y = getFiniteNumber(readPath(value, "y"));
  const width = getPositiveNumber(readPath(value, "width"));
  const height = getPositiveNumber(readPath(value, "height"));

  if (x === null || y === null || width === null || height === null) return null;

  return { x, y, width, height };
}

function getBoundsCenter(bounds: CanvasBounds): CanvasPoint {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
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

function multiplyPositive(value: unknown, multiplier: number): number | null {
  const numberValue = getPositiveNumber(value);
  return numberValue !== null ? numberValue * multiplier : null;
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

function readStringPath(value: unknown, path: string): string | null {
  return normalizeNullableString(readPath(value, path));
}

function readPath(value: unknown, path: string): unknown {
  if (!isRecord(value)) return undefined;

  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }

  return current;
}

function getCanvas(): CanvasLike | null {
  const value = (globalThis as { canvas?: unknown }).canvas;
  return isRecord(value) ? (value as CanvasLike) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}
