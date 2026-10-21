import { describe, expect, it, vi } from "vitest";
import { WeaponSoundPreloader } from "./weapon-sound-preloader";

const revolver = "psfx.ranged-weapons.guns.single-fire.revolver";
const rifle = "psfx.ranged-weapons.guns.single-fire.rifle";

async function settle(): Promise<void> {
  for (let i = 0; i < 30; i++) await Promise.resolve();
}

describe("weapon sound preloading", () => {
  it("loads only the catalog candidates, including available paid sounds and all variants", async () => {
    const files = new Map([
      [revolver, ["revolver-01.ogg", "revolver-02.ogg"]],
      [rifle, ["rifle-01.ogg"]],
      ["psfx.ranged-weapons.guns.single-fire.shotgun", ["shotgun.ogg"]],
      ["psfx.ranged-weapons.guns.single-fire.musket", ["musket.ogg"]],
      ["psfx.ranged-weapons.longbow.v1", ["longbow-05ft.ogg", "longbow-90ft.ogg"]],
    ]);
    const database = { getSoundFiles: vi.fn(path => files.get(path) ?? []) };
    const sequencer = { preloadSound: vi.fn().mockResolvedValue(true) };
    const preloader = new WeaponSoundPreloader(database, sequencer, () => true);
    preloader.preload();
    await settle();
    expect(sequencer.preloadSound.mock.calls.map(([file]) => file)).toEqual([...files.values()].flat());
    expect(database.getSoundFiles.mock.calls.map(([path]) => path).sort()).toEqual([
      revolver, rifle, "psfx.ranged-weapons.guns.single-fire.shotgun", "psfx.ranged-weapons.guns.single-fire.musket",
      "psfx.weapon-attacks.sword.v1", "psfx.weapon-attacks.spear.v1", "psfx.weapon-swooshes.light.v1.group01",
      "psfx.weapon-swooshes.heavy.v1.group01", "psfx.ranged-weapons.longbow.v1",
    ].sort());
    preloader.preload();
    await settle();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(7);
  });

  it("limits concurrent loads to two and deduplicates repeated requests while loading", async () => {
    const files = ["a.ogg", "b.ogg", "c.ogg", "a.ogg"];
    const database = { getSoundFiles: () => files };
    const finish: Array<(success: boolean) => void> = [];
    const sequencer = { preloadSound: vi.fn(() => new Promise<boolean>(resolve => { finish.push(resolve); })) };
    const preloader = new WeaponSoundPreloader(database, sequencer, () => true);
    preloader.preload(); preloader.preload();
    expect(sequencer.preloadSound.mock.calls.map(([file]) => file)).toEqual(["a.ogg", "b.ogg"]);
    finish[0](true); await settle();
    expect(sequencer.preloadSound.mock.calls.map(([file]) => file)).toEqual(["a.ogg", "b.ogg", "c.ogg"]);
    finish[1](true); finish[2](true); await settle();
    preloader.preload();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(3);
  });

  it("handles absent PSFX and discovers newly registered candidates without reloading cached files", async () => {
    let registered = false, paid = false;
    const database = { getSoundFiles: path => registered && path === revolver ? ["revolver.ogg"]
      : paid && path === rifle ? ["rifle.ogg"] : [] };
    const sequencer = { preloadSound: vi.fn().mockResolvedValue(true) };
    const preloader = new WeaponSoundPreloader(database, sequencer, () => true);
    preloader.preload();
    expect(sequencer.preloadSound).not.toHaveBeenCalled();
    registered = true;
    preloader.preload(); await settle();
    paid = true;
    preloader.preload(); await settle();
    expect(sequencer.preloadSound.mock.calls.map(([file]) => file)).toEqual(["revolver.ogg", "rifle.ogg"]);
  });

  it("continues after failed entries and retries failed files only on later requests", async () => {
    const database = { getSoundFiles: path => {
      if (path === revolver) return ["broken.ogg", "good.ogg"];
      throw new Error("missing optional profile");
    } };
    const sequencer = { preloadSound: vi.fn().mockRejectedValueOnce(new Error("load failed")).mockResolvedValue(true) };
    const preloader = new WeaponSoundPreloader(database, sequencer, () => true);
    preloader.preload(); await settle();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(2);
    preloader.preload(); await settle();
    expect(sequencer.preloadSound.mock.calls.map(([file]) => file)).toEqual(["broken.ogg", "good.ogg", "broken.ogg"]);
  });

  it("does not cache reported load failures as successes", async () => {
    const database = { getSoundFiles: () => ["file.ogg"] };
    const sequencer = { preloadSound: vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true) };
    const preloader = new WeaponSoundPreloader(database, sequencer, () => true);
    preloader.preload(); await settle();
    expect(sequencer.preloadSound).toHaveBeenCalledOnce();
    preloader.preload(); await settle();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(2);
  });

  it("waits while disabled, pauses queued work and resumes without duplicate downloads", async () => {
    let enabled = false;
    const database = { getSoundFiles: vi.fn(() => ["a.ogg", "b.ogg", "c.ogg"]) };
    const finish: Array<(success: boolean) => void> = [];
    const sequencer = { preloadSound: vi.fn(() => new Promise<boolean>(resolve => { finish.push(resolve); })) };
    const preloader = new WeaponSoundPreloader(database, sequencer, () => enabled);
    preloader.preload();
    expect(database.getSoundFiles).not.toHaveBeenCalled();
    enabled = true;
    preloader.preload();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(2);
    enabled = false;
    finish[0](true); finish[1](true); await settle();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(2);
    enabled = true;
    preloader.preload();
    expect(sequencer.preloadSound).toHaveBeenCalledTimes(3);
    finish[2](true); await settle();
  });
});
