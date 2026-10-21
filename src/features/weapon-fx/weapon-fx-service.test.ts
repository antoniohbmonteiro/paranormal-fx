import { afterEach, describe, expect, it, vi } from "vitest";
import { weaponFixture } from "../../../tests/weapon-fx-fixture";
import { WeaponFxService } from "./weapon-fx-service";
import { resolveWeaponFxContext } from "./weapon-fx-context-resolver";

afterEach(() => vi.restoreAllMocks());
function fixture() {
  const h = weaponFixture();
  const player = { playWeaponEffect: vi.fn().mockResolvedValue(undefined) };
  const database = { hasEffect: vi.fn(() => true), hasSound: vi.fn(() => true), invalidate: vi.fn() };
  const runtime = { enabled: vi.fn(() => true), userId: vi.fn(() => "player"), context: vi.fn(event => resolveWeaponFxContext(event, h.view)),
    soundVolume: vi.fn(() => 0.5) };
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
    expect(h.database.hasSound).not.toHaveBeenCalled();
  });

  it("adds audio only after the visual is eligible and reserves the same action", async () => {
    const h = fixture();
    h.database.hasSound.mockImplementation(() => {
      void h.service.handleAttackPublished(h.event);
      return true;
    });
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).toHaveBeenCalledExactlyOnceWith(expect.anything(), h.context, expect.objectContaining({
      path: "psfx.ranged-weapons.guns.single-fire.revolver", volume: 0.5, repetitions: 1,
    }));
    expect(h.database.hasSound).toHaveBeenCalledOnce();
  });

  it("preserves visuals without PSFX and uses sounds after registration only on new actions", async () => {
    const h = fixture();
    h.database.hasSound.mockReturnValue(false);
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).toHaveBeenLastCalledWith(expect.anything(), h.context, null);
    h.database.hasSound.mockReturnValue(true);
    await h.service.handleAttackPublished(h.event);
    expect(h.player.playWeaponEffect).toHaveBeenCalledOnce();
    await h.service.handleAttackPublished({ ...h.event, actionId: "new" });
    expect(h.player.playWeaponEffect).toHaveBeenLastCalledWith(expect.anything(), h.context, expect.objectContaining({ volume: 0.5 }));
  });

  it("reads volume for every action without querying sounds when muted", async () => {
    const h = fixture();
    h.runtime.soundVolume.mockReturnValue(0);
    await h.service.handleAttackPublished(h.event);
    expect(h.database.hasSound).not.toHaveBeenCalled();
    expect(h.player.playWeaponEffect).toHaveBeenLastCalledWith(expect.anything(), h.context, null);
    h.runtime.soundVolume.mockReturnValue(0.7);
    await h.service.handleAttackPublished({ ...h.event, actionId: "new" });
    expect(h.player.playWeaponEffect).toHaveBeenLastCalledWith(expect.anything(), h.context, expect.objectContaining({ volume: 0.7 }));
  });

  it("isolates audio settings and database failures from visual playback", async () => {
    const h = fixture();
    h.runtime.soundVolume.mockImplementationOnce(() => { throw new Error("settings"); });
    await h.service.handleAttackPublished(h.event);
    h.database.hasSound.mockImplementation(() => { throw new Error("audio database"); });
    await h.service.handleAttackPublished({ ...h.event, actionId: "second" });
    expect(h.player.playWeaponEffect).toHaveBeenCalledTimes(2);
    expect(h.player.playWeaponEffect.mock.calls.every(([, , sound]) => sound === null)).toBe(true);
  });

  it.each(["Bazuca", "Lança-chamas"])("does not add unapproved audio to %s", async name => {
    const h = fixture();
    await h.service.handleAttackPublished({ ...h.event, item: { ...h.event.item, name } });
    expect(h.database.hasSound).not.toHaveBeenCalled();
    expect(h.player.playWeaponEffect).toHaveBeenCalledExactlyOnceWith(expect.anything(), h.context, null);
  });

  it.each(["Besta", "Balestra"])("adds one Longbow sound to %s", async name => {
    const h = fixture();
    await h.service.handleAttackPublished({ ...h.event, item: { ...h.event.item, name } });
    expect(h.player.playWeaponEffect).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      effectPath: "jb2a.bolt.physical.orange",
    }), h.context, expect.objectContaining({
      path: "psfx.ranged-weapons.longbow.v1", distanceBased: true, repetitions: 1, volume: 0.5,
    }));
  });

  it("never queries optional audio when the animation is unavailable", async () => {
    const h = fixture();
    h.database.hasEffect.mockReturnValue(false);
    await h.service.handleAttackPublished(h.event);
    expect(h.database.hasSound).not.toHaveBeenCalled();
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
