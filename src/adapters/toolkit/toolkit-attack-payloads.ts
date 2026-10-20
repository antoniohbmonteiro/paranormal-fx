export interface AttackTokenReference {
  sceneId: string;
  tokenId: string;
  tokenUuid: string;
  actorUuid: string | null;
}

export interface AttackPublishedEvent {
  version: 1;
  actionId: string;
  messageId: string;
  userId: string;
  item: { uuid: string; name: string; type: "armament" };
  source: AttackTokenReference | null;
  target: AttackTokenReference | null;
  visibility: "public" | "private";
}

export function normalizeAttackPayload(value: unknown): AttackPublishedEvent | null {
  const raw = object(value), item = object(raw?.item);
  if (!raw || raw.version !== 1 || !text(raw.actionId) || !text(raw.messageId) || !text(raw.userId)
    || !item || item.type !== "armament" || !text(item.uuid) || !text(item.name)
    || !["public", "private"].includes(String(raw.visibility))) return null;
  const source = tokenReference(raw.source), target = tokenReference(raw.target);
  if (source === undefined || target === undefined) return null;
  return {
    version: 1, actionId: raw.actionId, messageId: raw.messageId, userId: raw.userId,
    item: { uuid: item.uuid, name: item.name, type: "armament" }, source, target,
    visibility: raw.visibility as "public" | "private",
  };
}

function tokenReference(value: unknown): AttackTokenReference | null | undefined {
  if (value === null) return null;
  const raw = object(value);
  if (!raw || !text(raw.sceneId) || !text(raw.tokenId) || !text(raw.tokenUuid)
    || raw.tokenUuid !== `Scene.${raw.sceneId}.Token.${raw.tokenId}`
    || raw.actorUuid !== null && !text(raw.actorUuid)) return undefined;
  return { sceneId: raw.sceneId, tokenId: raw.tokenId, tokenUuid: raw.tokenUuid, actorUuid: raw.actorUuid as string | null };
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
