import type { ResourceActorLike } from "./resource-feedback-types";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function resolveResourceValue(actor: Pick<ResourceActorLike, "type" | "system">): number | null {
  const system = record(actor.system);
  if (!system) return null;

  if (actor.type === "agent") {
    return finiteNumber(record(system.PV)?.value);
  }

  if (actor.type === "threat") {
    return finiteNumber(record(record(system.attributes)?.hp)?.value);
  }

  return null;
}
