import { afterEach, describe, expect, it, vi } from "vitest";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";
import { WeaponFxService } from "./weapon-fx-service";
import { resolveWeaponFxContext } from "./weapon-fx-context-resolver";

afterEach(() => vi.restoreAllMocks());
function fixture() {
  const h = weaponFixture();
  const player = { playWeaponEffect: vi.fn().mockResolvedValue(undefined) };
  const database = { hasEffect: vi.fn(() => true), invalidate: vi.fn() };
  const runtime = { enabled: vi.fn(() => true), userId: vi.fn(() => "player"), context: vi.fn(event => resolveWeaponFxContext(event, h.view)) };
  return { ...h, player, database, runtime, service: new WeaponFxService(player, database, runtime) };
}

describe("WeaponFxService", () => {
  it("reserves the action synchronously before animation completion and ignores subsequent messages", async () => {
    const h = fixture();
    let finish!: () => void;
    h.player.playWeaponEffect.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    const first = h.service.handleAttackPublished(h.event);
    await h.service.handleAttackPublished({ ...h.event, messageId: "next" });
    expect(h.player.playWeaponEffect).toHaveBeenCalledOnce();
    finish(); await first;
    h.player.playWeaponEffect.mockResolvedValue(undefined);
    await h.service.handleAttackPublished({ ...h.event, actionId: "another" });
    expect(h.player.playWeaponEffect).toHaveBeenCalledTimes(2);
  });

  it("uses the first valid target after an untargeted event", async () => {
    const h = fixture();
    await h.service.handleAttackPublished({ ...h.event, target: null });
    await h.service.handleAttackPublished({ ...h.event, messageId: "second" });
    expect(h.player.playWeaponEffect).toHaveBeenCalledOnce();
  });

  it("only starts on the executing client for players and GMs", async () => {
    const h = fixture();
    h.runtime.userId.mockReturnValue("gm");
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).not.toHaveBeenCalled();
    await h.service.handleAttackPublished({ ...h.event, userId: "gm" });
    expect(h.player.playWeaponEffect).toHaveBeenCalledOnce();
  });

  it("checks the world setting on every event without consuming disabled actions", async () => {
    const h = fixture();
    h.runtime.enabled.mockReturnValue(false);
    await h.service.handleAttackPublished(h.event);
    h.runtime.enabled.mockReturnValue(true);
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).toHaveBeenCalledOnce();
  });

  it("does not resolve private messages or animate hidden tokens", async () => {
    const h = fixture();
    await h.service.handleAttackPublished({ ...h.event, visibility: "private" });
    expect(h.runtime.context).not.toHaveBeenCalled();
    h.target.document.hidden = true;
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).not.toHaveBeenCalled();
  });

  it("ignores unmapped weapons and malformed payloads silently", async () => {
    const h = fixture();
    await h.service.handleAttackPublished({ ...h.event, item: { ...h.event.item, name: "Picareta" } });
    await h.service.handleAttackPublished({ version: 2 });
    expect(h.player.playWeaponEffect).not.toHaveBeenCalled();
    expect(h.database.hasEffect).not.toHaveBeenCalled();
  });

  it("never retries an unavailable asset or a failed animation within the action", async () => {
    const h = fixture();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    h.database.hasEffect.mockReturnValue(false);
    await h.service.handleAttackPublished(h.event);
    h.database.hasEffect.mockReturnValue(true);
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).not.toHaveBeenCalled();
    h.player.playWeaponEffect.mockRejectedValue(new Error("missing file"));
    await h.service.handleAttackPublished({ ...h.event, actionId: "second" });
    await h.service.handleAttackPublished({ ...h.event, actionId: "second", messageId: "retry" });
    expect(h.player.playWeaponEffect).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("does not use outcomes to choose or play the animation", async () => {
    const h = fixture();
    for (const [index, result] of [{ hit: true }, { hit: false }, { isCritical: true }, { revealed: false }].entries()) {
      await h.service.handleAttackPublished({ ...h.event, actionId: String(index), ...result });
    }
    expect(h.player.playWeaponEffect).toHaveBeenCalledTimes(4);
    for (const [definition, context] of h.player.playWeaponEffect.mock.calls) {
      expect(definition).toMatchObject({ effectPath: "jb2a.bullet.02.orange", mode: "projectile" });
      expect(context).toEqual(h.context);
    }
  });
});
