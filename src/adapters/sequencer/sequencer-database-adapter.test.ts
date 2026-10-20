import { afterEach, describe, expect, it, vi } from "vitest";
import { SequencerDatabaseAdapter } from "./sequencer-database-adapter";

afterEach(() => vi.restoreAllMocks());
describe("Sequencer database availability", () => {
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
