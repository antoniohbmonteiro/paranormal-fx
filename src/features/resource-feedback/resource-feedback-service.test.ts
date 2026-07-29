import { describe, expect, it, vi } from "vitest";
import { ResourceFeedbackService } from "./resource-feedback-service";
import type { ResourceActorLike, ResourceSceneLike, ResourceTokenDocumentLike, ResourceTokenLike } from "./resource-feedback-types";

function fixture(value = 30, count = 1) {
  const actor = {
    type: "agent", uuid: "Actor.a", system: { PV: { value } }, isToken: false, token: null,
    testUserPermission: () => true,
  } as ResourceActorLike;
  const scene = { id: "s", tokens: { contents: [] } } as ResourceSceneLike;
  for (let i = 0; i < count; i += 1) {
    const doc = { uuid: `Scene.s.Token.${i}`, actorLink: true, hidden: false, parent: scene, actor } as ResourceTokenDocumentLike;
    doc.object = { document: doc, actor, isVisible: true, center: { x: 0, y: 0 }, w: 100, h: 100 } as ResourceTokenLike;
    scene.tokens.contents.push(doc);
  }
  return { actor, scene };
}

describe("ResourceFeedbackService", () => {
  it("hydrates silently then detects the first real damage", () => {
    const { actor, scene } = fixture();
    const render = vi.fn().mockResolvedValue(undefined);
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => scene, user: () => ({ isGM: true }), enabled: () => true });
    service.hydrate(scene);
    expect(render).not.toHaveBeenCalled();
    actor.system = { PV: { value: 20 } };
    service.handleActorUpdate(actor);
    expect(render).toHaveBeenCalledOnce();
    expect(render.mock.calls[0][1]).toMatchObject({ kind: "damage", amount: 10 });
  });
  it("renders the same delta on multiple linked tokens", () => {
    const { actor, scene } = fixture(30, 2);
    const render = vi.fn().mockResolvedValue(undefined);
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => scene, user: () => ({ isGM: true }), enabled: () => true });
    service.hydrate(scene);
    actor.system = { PV: { value: 25 } };
    service.handleActorUpdate(actor);
    expect(render).toHaveBeenCalledTimes(2);
  });
  it("updates snapshots while disabled without accumulating a delta", () => {
    const { actor, scene } = fixture();
    const render = vi.fn().mockResolvedValue(undefined);
    let enabled = false;
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => scene, user: () => ({ isGM: true }), enabled: () => enabled });
    service.hydrate(scene);
    actor.system = { PV: { value: 20 } };
    service.handleActorUpdate(actor);
    enabled = true;
    service.handleActorUpdate(actor);
    expect(render).not.toHaveBeenCalled();
    actor.system = { PV: { value: 18 } };
    service.handleActorUpdate(actor);
    expect(render).toHaveBeenCalledOnce();
  });
  it("updates snapshots with no canvas and makes no render call", () => {
    const { actor } = fixture();
    const render = vi.fn().mockResolvedValue(undefined);
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => null, user: () => ({ isGM: true }), enabled: () => true });
    service.handleActorUpdate(actor);
    actor.system = { PV: { value: 20 } };
    service.handleActorUpdate(actor);
    expect(render).not.toHaveBeenCalled();
  });
  it("clears old scene snapshots on hydration without false feedback", () => {
    const { actor, scene } = fixture();
    const render = vi.fn().mockResolvedValue(undefined);
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => scene, user: () => ({ isGM: true }), enabled: () => true });
    service.hydrate(scene);
    service.hydrate(scene);
    expect(render).not.toHaveBeenCalled();
    actor.system = { PV: { value: 29 } };
    service.handleActorUpdate(actor);
    expect(render).toHaveBeenCalledOnce();
  });
  it("hydrates a newly created token without feedback", () => {
    const { scene } = fixture();
    const render = vi.fn().mockResolvedValue(undefined);
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => scene, user: () => ({ isGM: true }), enabled: () => true });
    service.hydrateToken(scene.tokens.contents[0]);
    expect(render).not.toHaveBeenCalled();
  });

  it("consumes renderer rejections without exposing resource or token details", async () => {
    const { actor, scene } = fixture();
    const render = vi.fn().mockRejectedValue(new Error("canvas unavailable"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const service = new ResourceFeedbackService(undefined, { render }, { scene: () => scene, user: () => ({ isGM: true }), enabled: () => true });
    service.hydrate(scene);
    actor.system = { PV: { value: 20 } };

    expect(() => service.handleActorUpdate(actor)).not.toThrow();
    await Promise.resolve();

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0].join(" ")).toBe("Paranormal FX | Failed to render floating resource text.");
    warn.mockRestore();
  });
});
