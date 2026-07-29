import type { ResourceTokenLike, ResourceUserLike } from "./resource-feedback-types";

export function canRenderResourceFeedback(
  user: ResourceUserLike,
  token: ResourceTokenLike,
): boolean {
  if (user.isGM) return true;
  const actor = token.actor;
  if (!actor?.testUserPermission(user, "OBSERVER")) return false;
  if (token.document.hidden) return false;
  return token.isVisible;
}
