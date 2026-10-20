import { describe, expect, it } from "vitest";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";
import { resolveWeaponFxContext } from "./weapon-fx-context-resolver";

describe("weapon canvas context", () => {
  it("rehydrates the exact original tokens instead of current targets", () => {
    const h = weaponFixture();
    expect(resolveWeaponFxContext(h.event, h.view)).toEqual(h.context);
  });
  it("accepts matching synthetic actor identities", () => {
    const h = weaponFixture();
    h.target.actor!.uuid = "Scene.scene.Token.target.Actor.synthetic";
    h.event.target!.actorUuid = h.target.actor!.uuid;
    expect(resolveWeaponFxContext(h.event, h.view)?.target).toBe(h.target);
  });
  it.each(["source", "target"] as const)("rejects hidden or invisible %s tokens", key => {
    const h = weaponFixture();
    h[key].document.hidden = true;
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h[key].document.hidden = false; h[key].isVisible = false;
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
  });
  it("rejects stale actor identities, deleted tokens and another scene", () => {
    const h = weaponFixture();
    h.event.target!.actorUuid = "Actor.wrong";
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h.event.target!.actorUuid = h.target.actor!.uuid;
    h.tokens.delete("target");
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h.tokens.set("target", h.target); h.view.scene = { id: "other" };
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
  });
  it("rejects a replaced token UUID or document scene", () => {
    const h = weaponFixture();
    h.target.document.uuid = "Scene.scene.Token.replacement";
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h.target.document.uuid = h.event.target!.tokenUuid; h.target.document.parent = { id: "other", tokens: { contents: [] } };
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
  });
  it("rejects missing references, unavailable canvas and invalid geometry", () => {
    const h = weaponFixture();
    expect(resolveWeaponFxContext(h.event, null)).toBeNull();
    expect(resolveWeaponFxContext({ ...h.event, target: null }, h.view)).toBeNull();
    h.view.ready = false;
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h.view.ready = true; h.view.grid!.size = 0;
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h.view.grid!.size = 100; h.target.center.x = NaN;
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
    h.target.center.x = h.source.center.x;
    expect(resolveWeaponFxContext(h.event, h.view)).toBeNull();
  });
});
