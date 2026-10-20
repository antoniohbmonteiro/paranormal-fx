import { describe, expect, it } from "vitest";
import { normalizeAttackPayload } from "./toolkit-attack-payloads";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";

describe("attack payload normalization", () => {
  it("returns a serializable contract without unrelated or hidden result fields", () => {
    const { event } = weaponFixture();
    expect(normalizeAttackPayload({ ...event, hit: true, defense: 30,
      item: { ...event.item, document: {} }, source: { ...event.source, document: {} } })).toEqual(event);
  });
  it("accepts explicit missing token references", () => {
    const { event } = weaponFixture();
    expect(normalizeAttackPayload({ ...event, source: null, target: null })).toMatchObject({ source: null, target: null });
  });
  it.each([
    null, [], {}, { version: 2 }, { userId: "" }, { actionId: " " }, { messageId: null },
    { item: { name: "Pistola", uuid: "i", type: "ability" } }, { visibility: "secret" },
    { source: undefined }, { target: { sceneId: "scene", tokenId: "target", tokenUuid: "Scene.other.Token.target", actorUuid: null } },
  ])("rejects malformed or incompatible data: %j", changes => {
    const { event } = weaponFixture();
    const payload = changes !== null && !Array.isArray(changes) ? { ...event, ...changes } : changes;
    if (changes && !Array.isArray(changes) && Object.keys(changes).length === 0) {
      expect(normalizeAttackPayload({})).toBeNull();
    } else expect(normalizeAttackPayload(payload)).toBeNull();
  });
});
