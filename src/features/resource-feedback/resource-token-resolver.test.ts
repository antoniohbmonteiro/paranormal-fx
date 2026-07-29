import { describe, expect, it } from "vitest";
import { resolveSnapshotKey, resolveTokensForActor } from "./resource-token-resolver";
import type { ResourceActorLike, ResourceSceneLike, ResourceTokenDocumentLike, ResourceTokenLike } from "./resource-feedback-types";

function linkedActor(uuid = "Actor.a"): ResourceActorLike {
  return { uuid, isToken: false } as ResourceActorLike;
}

function document(uuid: string, actor: ResourceActorLike, sceneId = "s", actorLink = true): ResourceTokenDocumentLike {
  const scene = { id: sceneId } as ResourceSceneLike;
  const doc = { uuid, actor, actorLink, parent: scene } as ResourceTokenDocumentLike;
  doc.object = { document: doc, actor } as ResourceTokenLike;
  return doc;
}

describe("resource token identity and resolution", () => {
  it("uses actor UUID for linked actors", () => expect(resolveSnapshotKey(linkedActor())).toEqual({ kind: "actor", uuid: "Actor.a" }));
  it("uses source TokenDocument UUID for synthetic actors", () => {
    const source = { uuid: "Scene.s.Token.1" } as ResourceTokenDocumentLike;
    const actor = { uuid: "Actor.base", isToken: true, token: source } as ResourceActorLike;
    expect(resolveSnapshotKey(actor)).toEqual({ kind: "token", uuid: source.uuid });
  });
  it("finds every linked token in the active scene", () => {
    const actor = linkedActor();
    const docs = [document("Token.1", actor), document("Token.2", actor), document("Token.x", linkedActor("Actor.x"))];
    const scene = { id: "s", tokens: { contents: docs } } as ResourceSceneLike;
    expect(resolveTokensForActor(actor, scene)).toEqual([docs[0].object, docs[1].object]);
  });
  it("finds only the source synthetic token", () => {
    const firstDoc = document("Scene.s.Token.1", linkedActor(), "s", false);
    const actor = { ...linkedActor("Actor.synthetic"), isToken: true, token: firstDoc } as ResourceActorLike;
    firstDoc.actor = actor;
    if (firstDoc.object) firstDoc.object.actor = actor;
    const secondDoc = document("Scene.s.Token.2", actor, "s", false);
    const scene = { id: "s", tokens: { contents: [firstDoc, secondDoc] } } as ResourceSceneLike;
    expect(resolveTokensForActor(actor, scene)).toEqual([firstDoc.object]);
  });
  it("ignores another scene and actors without tokens", () => {
    const source = document("Scene.other.Token.1", linkedActor(), "other", false);
    const actor = { ...linkedActor(), isToken: true, token: source } as ResourceActorLike;
    const scene = { id: "s", tokens: { contents: [] } } as ResourceSceneLike;
    expect(resolveTokensForActor(actor, scene)).toEqual([]);
    expect(resolveTokensForActor(linkedActor(), scene)).toEqual([]);
  });
});
