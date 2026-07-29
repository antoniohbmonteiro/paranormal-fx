import { describe, expect, it } from "vitest";
import { canRenderResourceFeedback } from "./resource-feedback-policy";
import type { ResourceActorLike, ResourceTokenLike } from "./resource-feedback-types";

function token(permission: boolean, hidden = false, isVisible = true): ResourceTokenLike {
  const actor = { testUserPermission: () => permission } as unknown as ResourceActorLike;
  return { actor, isVisible, document: { hidden } } as ResourceTokenLike;
}

describe("canRenderResourceFeedback", () => {
  it("allows a GM", () => expect(canRenderResourceFeedback({ isGM: true }, token(false))).toBe(true));
  it("allows OBSERVER and OWNER-like permission results", () => {
    expect(canRenderResourceFeedback({ isGM: false }, token(true))).toBe(true);
  });
  it("blocks a player without OBSERVER", () => expect(canRenderResourceFeedback({ isGM: false }, token(false))).toBe(false));
  it("blocks hidden and visually unavailable tokens for players", () => {
    expect(canRenderResourceFeedback({ isGM: false }, token(true, true))).toBe(false);
    expect(canRenderResourceFeedback({ isGM: false }, token(true, false, false))).toBe(false);
  });
  it("allows a GM despite hidden and normal visibility", () => {
    expect(canRenderResourceFeedback({ isGM: true }, token(false, true, false))).toBe(true);
  });
});
