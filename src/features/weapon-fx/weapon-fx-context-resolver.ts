import type { AttackPublishedEvent, AttackTokenReference } from "../../adapters/toolkit/toolkit-attack-payloads";
import type { ResourceTokenLike } from "../resource-feedback/resource-feedback-types";

export interface WeaponFxCanvas {
  ready: boolean;
  scene: { id: string } | null;
  grid?: { size: number };
  tokens?: { get(id: string): ResourceTokenLike | undefined };
}

export interface WeaponFxContext {
  source: ResourceTokenLike;
  target: ResourceTokenLike;
  gridSize: number;
}

export function resolveWeaponFxContext(event: AttackPublishedEvent,
  view: WeaponFxCanvas | null = typeof canvas === "undefined" ? null : canvas): WeaponFxContext | null {
  const gridSize = view?.grid?.size;
  if (!view?.ready || !view.scene || !gridSize || !Number.isFinite(gridSize) || gridSize <= 0) return null;
  const resolve = (ref: AttackTokenReference | null): ResourceTokenLike | null => {
    if (!ref || ref.sceneId !== view.scene!.id) return null;
    const token = view.tokens?.get(ref.tokenId);
    if (!token || token.document.uuid !== ref.tokenUuid || token.document.parent?.id !== ref.sceneId
      || !token.actor || ref.actorUuid !== null && token.actor.uuid !== ref.actorUuid
      || token.document.hidden || !token.isVisible
      || ![token.center.x, token.center.y, token.w, token.h].every(Number.isFinite) || token.w <= 0 || token.h <= 0) return null;
    return token;
  };
  const source = resolve(event.source), target = resolve(event.target);
  if (!source || !target || source.center.x === target.center.x && source.center.y === target.center.y) return null;
  return { source, target, gridSize };
}
