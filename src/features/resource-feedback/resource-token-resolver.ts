import type {
  ResourceActorLike,
  ResourceSceneLike,
  ResourceSnapshotKey,
  ResourceTokenDocumentLike,
  ResourceTokenLike,
} from "./resource-feedback-types";

export function resolveSnapshotKey(actor: ResourceActorLike): ResourceSnapshotKey | null {
  if (actor.isToken) {
    return actor.token?.uuid ? { kind: "token", uuid: actor.token.uuid } : null;
  }
  return actor.uuid ? { kind: "actor", uuid: actor.uuid } : null;
}

export function resolveTokensForActor(
  actor: ResourceActorLike,
  scene: ResourceSceneLike | null,
): ResourceTokenLike[] {
  if (!scene) return [];

  if (actor.isToken) {
    const source = actor.token;
    if (!source || source.parent?.id !== scene.id) return [];
    const document = scene.tokens.contents.find((candidate) => candidate.uuid === source.uuid);
    return document?.object ? [document.object] : [];
  }

  return scene.tokens.contents
    .filter((document) => document.actorLink && document.actor?.uuid === actor.uuid)
    .map((document) => document.object)
    .filter((token): token is ResourceTokenLike => token !== null);
}

export function actorFromTokenDocument(document: ResourceTokenDocumentLike): ResourceActorLike | null {
  return document.actor;
}
