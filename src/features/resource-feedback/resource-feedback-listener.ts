import { TARGET_SYSTEM_ID } from "../../config/module-constants";
import { logger } from "../../core/logger";
import { ResourceFeedbackService } from "./resource-feedback-service";
import type {
  ResourceActorLike,
  ResourceSceneLike,
  ResourceTokenDocumentLike,
} from "./resource-feedback-types";

const service = new ResourceFeedbackService();
const REGISTRATION_KEY = Symbol.for("paranormal-fx.resource-feedback.registered");

function registrationState(): Record<symbol, boolean | undefined> {
  return globalThis as unknown as Record<symbol, boolean | undefined>;
}

export function registerResourceFeedbackListeners(): void {
  const state = registrationState();
  if (state[REGISTRATION_KEY] || game.system.id !== TARGET_SYSTEM_ID) return;
  state[REGISTRATION_KEY] = true;

  Hooks.on("updateActor", (actor: ResourceActorLike) => service.handleActorUpdate(actor));
  Hooks.on("canvasReady", () => service.hydrate(canvas.scene));
  Hooks.on("canvasTearDown", () => service.clear());
  Hooks.on("createToken", (document: ResourceTokenDocumentLike) => {
    if (document.parent?.id === canvas.scene?.id) service.hydrateToken(document);
  });
  Hooks.on("deleteToken", (document: ResourceTokenDocumentLike) => service.removeToken(document));

  // ready can run after a canvas has already been drawn during defensive reloads.
  if (canvas.ready) service.hydrate(canvas.scene as ResourceSceneLike | null);
  logger.info("Resource feedback listeners registered.");
}
