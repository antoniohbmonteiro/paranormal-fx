import { afterEach, describe, expect, it, vi } from "vitest";
import { SequencerDatabaseAdapter } from "./sequencer-database-adapter";

afterEach(() => vi.restoreAllMocks());
describe("Sequencer database availability", () => {
  it("collects every registered audio variant and distance file without choosing an index", () => {
    const getEntry = vi.fn(() => [
      { getAllFiles: () => ["modules/psfx/revolver-01.ogg", "modules/psfx/revolver-02.ogg"] },
      { getAllFiles: () => [["modules/psfx/longbow-05ft.ogg"], ["modules/psfx/longbow-90ft.ogg", "modules/psfx/revolver-01.ogg"]] },
      { getAllFiles: () => { throw new Error("invalid variant"); } }, null, {},
    ]);
    const adapter = new SequencerDatabaseAdapter(() => ({ getEntry }));
    expect(adapter.getSoundFiles("psfx.test")).toEqual([
      "modules/psfx/revolver-01.ogg", "modules/psfx/revolver-02.ogg",
      "modules/psfx/longbow-05ft.ogg", "modules/psfx/longbow-90ft.ogg",
    ]);
    expect(getEntry).toHaveBeenCalledWith("psfx.test", { softFail: true });
  });

  it("silently skips missing audio entries and discovers newly registered files", () => {
    const getEntry = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce({ getAllFiles: () => ["modules/psfx/rifle.ogg"] })
      .mockImplementationOnce(() => { throw new Error(); });
    const adapter = new SequencerDatabaseAdapter(() => ({ getEntry }));
    expect(adapter.getSoundFiles("psfx.rifle")).toEqual([]);
    expect(adapter.getSoundFiles("psfx.rifle")).toEqual(["modules/psfx/rifle.ogg"]);
    expect(adapter.getSoundFiles("psfx.rifle")).toEqual([]);
    expect(new SequencerDatabaseAdapter(() => undefined).getSoundFiles("psfx.rifle")).toEqual([]);
  });

  it("keeps missing optional sounds silent and invalidates only their namespace", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    let soundsRegistered = false;
    const getEntry = vi.fn((path: string) => path.startsWith("psfx.") ? soundsRegistered && [{}, {}] : {});
    const adapter = new SequencerDatabaseAdapter(() => ({ getEntry }));
    expect(adapter.hasEffect("jb2a.present")).toBe(true);
    expect(adapter.hasSound("psfx.missing")).toBe(false);
    expect(adapter.hasSound("psfx.missing")).toBe(false);
    soundsRegistered = true;
    adapter.invalidate("other");
    expect(adapter.hasSound("psfx.missing")).toBe(false);
    adapter.invalidate("jb2a");
    expect(adapter.hasSound("psfx.missing")).toBe(false);
    adapter.invalidate("psfx");
    expect(adapter.hasSound("psfx.missing")).toBe(true);
    expect(adapter.hasEffect("jb2a.present")).toBe(true);
    expect(getEntry).toHaveBeenCalledTimes(4);
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not cache a missing sound API or exceptions and accepts ranged audio", () => {
    let database: { getEntry: ReturnType<typeof vi.fn> } | undefined;
    const adapter = new SequencerDatabaseAdapter(() => database);
    expect(adapter.hasSound("psfx.ranged")).toBe(false);
    database = { getEntry: vi.fn().mockImplementationOnce(() => { throw new Error(); }).mockReturnValue({ rangeFind: true }) };
    expect(adapter.hasSound("psfx.ranged")).toBe(false);
    expect(adapter.hasSound("psfx.ranged")).toBe(true);
    expect(database.getEntry).toHaveBeenCalledTimes(2);
    expect(database.getEntry).toHaveBeenCalledWith("psfx.ranged", { softFail: true });
  });

  it("does not cache a missing API before database registration", () => {
    let database: { getEntry: ReturnType<typeof vi.fn> } | undefined;
    const adapter = new SequencerDatabaseAdapter(() => database);
    expect(adapter.hasEffect("jb2a.bullet.02.orange")).toBe(false);
    database = { getEntry: vi.fn(() => ({})) };
    expect(adapter.hasEffect("jb2a.bullet.02.orange")).toBe(true);
    expect(database.getEntry).toHaveBeenCalledWith("jb2a.bullet.02.orange", { softFail: true });
  });
  it("accepts collections and ranged entries without choosing a file", () => {
    const getEntry = vi.fn().mockReturnValueOnce([{}, {}, {}, {}]).mockReturnValueOnce({ rangeFind: true });
    const adapter = new SequencerDatabaseAdapter(() => ({ getEntry }));
    expect(adapter.hasEffect("jb2a.melee_attack.04.katana.01")).toBe(true);
    expect(adapter.hasEffect("jb2a.bullet.Snipe.blue")).toBe(true);
  });
  it("warns once, isolates missing assets and refreshes on jb2a registration", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const getEntry = vi.fn((path: string) => path === "jb2a.missing" ? false : {});
    const adapter = new SequencerDatabaseAdapter(() => ({ getEntry }));
    expect(adapter.hasEffect("jb2a.missing")).toBe(false);
    expect(adapter.hasEffect("jb2a.missing")).toBe(false);
    expect(adapter.hasEffect("jb2a.present")).toBe(true);
    adapter.invalidate("other");
    expect(adapter.hasEffect("jb2a.missing")).toBe(false);
    expect(getEntry).toHaveBeenCalledTimes(2);
    adapter.invalidate("jb2a");
    expect(adapter.hasEffect("jb2a.missing")).toBe(false);
    expect(getEntry).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledOnce();
    getEntry.mockReturnValue({}); adapter.invalidate("jb2a");
    expect(adapter.hasEffect("jb2a.missing")).toBe(true);
  });
  it("silently handles empty collections and API exceptions", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const getEntry = vi.fn().mockReturnValueOnce([]).mockImplementationOnce(() => { throw new Error("not ready"); });
    const adapter = new SequencerDatabaseAdapter(() => ({ getEntry }));
    expect(adapter.hasEffect("empty")).toBe(false);
    expect(adapter.hasEffect("broken")).toBe(false);
  });
});
