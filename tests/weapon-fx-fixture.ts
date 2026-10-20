import type { AttackPublishedEvent } from "../src/adapters/toolkit/toolkit-attack-payloads";
import type { ResourceActorLike, ResourceSceneLike, ResourceTokenLike } from "../src/features/resource-feedback/resource-feedback-types";
import type { WeaponFxCanvas } from "../src/features/weapon-fx/weapon-fx-context-resolver";

export function weaponFixture() {
  const scene = { id: "scene", tokens: { contents: [] } } as ResourceSceneLike;
  const token = (id: string, x: number): ResourceTokenLike => {
    const actor = { uuid: `Actor.${id}` } as ResourceActorLike;
    const result = {
      actor, center: { x, y: 100 }, w: 100, h: 100, isVisible: true,
      document: { uuid: `Scene.scene.Token.${id}`, parent: scene, actor, hidden: false, actorLink: true, object: null },
    } as ResourceTokenLike;
    result.document.object = result;
    scene.tokens.contents.push(result.document);
    return result;
  };
  const source = token("source", 100), target = token("target", 500);
  const tokens = new Map([["source", source], ["target", target]]);
  const view: WeaponFxCanvas = { ready: true, scene, grid: { size: 100 }, tokens };
  const event: AttackPublishedEvent = {
    version: 1, actionId: "action", messageId: "message", userId: "player", visibility: "public",
    item: { uuid: "Actor.source.Item.weapon", name: "Pistola", type: "armament" },
    source: { sceneId: "scene", tokenId: "source", tokenUuid: source.document.uuid, actorUuid: source.actor!.uuid },
    target: { sceneId: "scene", tokenId: "target", tokenUuid: target.document.uuid, actorUuid: target.actor!.uuid },
  };
  return { source, target, event, view, tokens, context: { source, target, gridSize: 100 } };
}
