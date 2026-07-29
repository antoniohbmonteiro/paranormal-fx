import { isResourceFeedbackEnabled } from "../../core/settings";
import { FloatingResourceTextRenderer } from "./floating-resource-text-renderer";
import { canRenderResourceFeedback } from "./resource-feedback-policy";
import { ResourceSnapshotStore } from "./resource-snapshot-store";
import {
  actorFromTokenDocument,
  resolveSnapshotKey,
  resolveTokensForActor,
} from "./resource-token-resolver";
import type {
  ResourceActorLike,
  ResourceSceneLike,
  ResourceTokenDocumentLike,
  ResourceUserLike,
} from "./resource-feedback-types";
import { resolveResourceValue } from "./resource-value-resolver";

export interface ResourceFeedbackRenderer {
  render: FloatingResourceTextRenderer["render"];
}

export interface ResourceFeedbackEnvironment {
  scene(): ResourceSceneLike | null;
  user(): ResourceUserLike;
  enabled(): boolean;
}

export class ResourceFeedbackService {
  constructor(
    private readonly store = new ResourceSnapshotStore(),
    private readonly renderer: ResourceFeedbackRenderer = new FloatingResourceTextRenderer(),
    private readonly environment: ResourceFeedbackEnvironment = foundryEnvironment,
  ) {}

  hydrate(scene: ResourceSceneLike | null): void {
    this.store.clear();
    if (!scene) return;
    for (const document of scene.tokens.contents) this.hydrateToken(document);
  }

  hydrateToken(document: ResourceTokenDocumentLike): void {
    const actor = actorFromTokenDocument(document);
    if (!actor) return;
    const key = resolveSnapshotKey(actor);
    const value = resolveResourceValue(actor);
    if (key && value !== null) this.store.hydrate(key, value);
  }

  removeToken(document: ResourceTokenDocumentLike): void {
    const actor = actorFromTokenDocument(document);
    if (!actor?.isToken) return;
    const key = resolveSnapshotKey(actor);
    if (key) this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  handleActorUpdate(actor: ResourceActorLike): void {
    const key = resolveSnapshotKey(actor);
    const value = resolveResourceValue(actor);
    if (!key || value === null) return;

    const transition = this.store.transition(key, value);
    if (!transition) return;

    const scene = this.environment.scene();
    if (!scene || !this.environment.enabled()) return;
    const user = this.environment.user();
    for (const token of resolveTokensForActor(actor, scene)) {
      if (!canRenderResourceFeedback(user, token)) continue;
      void this.renderer.render(token, transition);
    }
  }
}

const foundryEnvironment: ResourceFeedbackEnvironment = {
  scene: () => canvas.scene,
  user: () => game.user,
  enabled: isResourceFeedbackEnabled,
};
