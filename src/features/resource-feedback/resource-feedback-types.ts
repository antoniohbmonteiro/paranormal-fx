export type ResourceFeedbackKind = "damage" | "healing";

export interface ResourceTransition {
  kind: ResourceFeedbackKind;
  amount: number;
  delta: number;
}

export type ResourceSnapshotKey =
  | { kind: "actor"; uuid: string }
  | { kind: "token"; uuid: string };

export function serializeSnapshotKey(key: ResourceSnapshotKey): string {
  return `${key.kind}:${key.uuid}`;
}

export interface ResourceActorLike {
  type: string;
  uuid: string;
  system: unknown;
  isToken: boolean;
  token: ResourceTokenDocumentLike | null;
  testUserPermission(user: ResourceUserLike, level: "OBSERVER"): boolean;
}

export interface ResourceUserLike {
  isGM: boolean;
}

export interface ResourceTokenDocumentLike {
  uuid: string;
  actorLink: boolean;
  hidden: boolean;
  parent: ResourceSceneLike | null;
  actor: ResourceActorLike | null;
  object: ResourceTokenLike | null;
}

export interface ResourceTokenLike {
  document: ResourceTokenDocumentLike;
  actor: ResourceActorLike | null;
  isVisible: boolean;
  center: { x: number; y: number };
  w: number;
  h: number;
}

export interface ResourceSceneLike {
  id: string;
  tokens: { contents: ResourceTokenDocumentLike[] };
}
