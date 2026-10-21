import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { runInNewContext } from "node:vm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { WEAPON_SOUND_PROFILES } from "../../src/features/weapon-fx/weapon-sound-profiles";
import { SequencerDatabaseAdapter } from "../../src/adapters/sequencer/sequencer-database-adapter";
import { SequencerAdapter } from "../../src/adapters/sequencer/sequencer-adapter";
import { resolveWeaponFx } from "../../src/features/weapon-fx/weapon-fx-resolver";
import { resolveWeaponSound } from "../../src/features/weapon-fx/weapon-sound-resolver";
import { weaponFixture } from "../weapon-fx-fixture";

const psfxRoot = process.env.PARANORMAL_FX_PSFX_REFERENCE;
const sequencerRoot = process.env.PARANORMAL_FX_SEQUENCER_REFERENCE;
const freePaths = [
  ["psfx.ranged-weapons.guns.single-fire.revolver", 5],
  ["psfx.weapon-attacks.sword.v1", 6], ["psfx.weapon-attacks.spear.v1", 6],
  ["psfx.weapon-swooshes.light.v1.group01", 4], ["psfx.weapon-swooshes.heavy.v1.group01", 4],
  ["psfx.ranged-weapons.longbow.v1", 5],
] as const;

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  return value && typeof value === "object" ? Object.values(value).flatMap(leaves) : [];
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe.skipIf(!psfxRoot)("installed PSFX Free references (no audio playback)", () => {
  let database: any;
  beforeAll(async () => {
    const source = readFileSync(join(psfxRoot!, "scripts/psfx_sequencer.js"), "utf8")
      .replace("export async function registerPSFXDatabase", "async function registerPSFXDatabase")
      .replace(/export\s*\{\s*psfxDatabase\s*\}/, "");
    const api = runInNewContext(source + "\n;({psfxDatabase, registerPSFXDatabase});", {}, { timeout: 2000 });
    await api.registerPSFXDatabase("modules/psfx");
    database = api.psfxDatabase;
  });

  it.each(freePaths)("resolves %s to %i installed audio files", (path, count) => {
    const entry = path.split(".").slice(1).reduce((value, key) => value?.[key], database);
    const files = leaves(entry);
    expect(files).toHaveLength(count);
    for (const file of files) {
      expect(file.endsWith(".ogg")).toBe(true);
      expect(existsSync(join(dirname(psfxRoot!), file.replace(/^modules\//, ""))), file).toBe(true);
    }
  });

  describe.skipIf(!sequencerRoot)("native Sequencer audio behavior with doubled Foundry runtime", () => {
    let api: any;
    beforeAll(() => {
      const map = JSON.parse(readFileSync(join(sequencerRoot!, "dist/sequencer.js.map"), "utf8"));
      const source = (suffix: string): string => {
        const index = map.sources.findIndex((path: string) => path.endsWith(suffix));
        if (index < 0) throw new Error("Sequencer reference source is unavailable: " + suffix);
        return map.sourcesContent[index];
      };
      const clean = (code: string) => code.replace(/^import .*;\r?\n/gm, "").replace(/export class /g, "class ");
      const library = source("/lib/lib.js"), start = library.indexOf("export function flatten_object");
      const flatten = library.slice(start, library.indexOf("\n/**", start)).replace("export ", "");
      api = runInNewContext(`
        Array.prototype.deepFlatten = function() { return this.flat(Infinity); };
        const foundry = {utils: {
          randomID: () => 'test-id', duplicate: value => JSON.parse(JSON.stringify(value)),
          getProperty: (value, path) => path.split('.').reduce((entry, key) => entry?.[key], value),
          mergeObject: function merge(a, b) { for (const [key, value] of Object.entries(b)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) merge(a[key] ??= {}, value);
            else a[key] = value;
          } return a; }
        }, canvas: {geometry: {Ray: class {
          constructor(a, b) { this.distance = Math.hypot(b.x - a.x, b.y - a.y); }
        }}}};
        ${flatten}
        let selection = 0;
        const is_real_number = value => typeof value === 'number' && Number.isFinite(value);
        const lib = {flatten_object, is_real_number, is_function: value => typeof value === 'function',
          make_array_unique: array => [...new Set(array)], debug() {}, custom_warning() {},
          custom_error: (_, message) => new Error(message), validate_document: value => value,
          random_float_between: min => min, random_int_between: min => min, createMersenneTwister: () => ({}),
          sequence_proxy_wrap: value => value, get_object_identifier: () => null,
          random_array_element: (array, options = {}) => options.index ? selection++ % array.length : array[selection++ % array.length]};
        const writable = value => ({value, set(next) { this.value = next; }, update(fn) { this.value = fn(this.value); }});
        const get = store => store.value;
        const CONSTANTS = {FEET_REGEX: /\\.[0-9]+ft\\.*/g,
          STATUS: {READY:'ready', RUNNING:'running', COMPLETE:'complete', ABORTED:'aborted', SKIPPED:'skipped'}};
        const CONST = {FILE_CATEGORIES: {IMAGE:{png:true}, VIDEO:{webm:true}, AUDIO:{ogg:true}}};
        const Hooks = {callAll() {}, call() { return true; }}, canvas = {grid: {size: 100}};
        const ui = {notifications: {error(message) { throw new Error(message); }}};
        const game = {user: {id:'executor', viewedScene:'scene'}, userId:'executor', settings: {get: () => true}};
        const canvaslib = {get_object_canvas_data: value => ({...value}), getPositionFromData: (data, key) => ({...data[key]})};
        const CrosshairsPlaceable = class {}, CrosshairsDocument = class {};
        const flagManager = {latestSoundFlagVersion: 1};
        const sequencerSocket = {executeForOthers() {}}, SOCKET_HANDLERS = {PLAY_SOUND:'playSound'};
        const SequenceManager = {RunningSequences: {add() {}}};
        ${clean(source("/modules/sequencer-file.js"))}
        ${clean(source("/modules/sequencer-database.js")).replace("export default SequencerDatabase;", "")}
        const Sequencer = {Database: SequencerDatabase};
        const files = ${clean(source("/sections/traits/files.js")).replace("export default", "")};
        const audio = ${clean(source("/sections/traits/audio.js")).replace("export default", "")};
        const location = ${clean(source("/sections/traits/location.js")).replace("export default", "")};
        const traits = {files, audio, location};
        ${clean(source("/sections/section.js")).replace("export default", "")}
        ${clean(source("/modules/sequencer-sound-manager.js")).replace("export default class", "class")}
        ${clean(source("/sections/sound.js")).replace("export default SoundSection;", "")}
        class EffectSection extends Section {
          file() { return this; } atLocation() { return this; } xray() { return this; }
          stretchTo() { return this; }
          async run() { visualStarts.push(Date.now()); }
        }
        const visualStarts = [];
        ${clean(source("/modules/sequencer.js")).replace("export default class", "class")}
        Sequence.prototype.effect = function() { const section = new EffectSection(this); this.sections.push(section); return section; };
        Sequence.prototype.sound = function() { const section = new SoundSection(this); this.sections.push(section); return section; };
        SequencerDatabase.registerEntries('psfx', foundry.utils.duplicate(input));
        ({database:SequencerDatabase, files, SoundSection, SequencerSound, SequencerSoundManager, game,
          sequencerSocket, Section, Sequence, visualStarts});
      `, { input: database, setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms), Date }, { timeout: 5000 });
    });

    it.each(freePaths.filter(([path]) => !path.includes("longbow")))(
      "selects every variant in %s without fixed indexes", (path, count) => {
        const variants = new Set(Array.from({ length: count }, () => api.files._determineDatabaseFile(path).file.dbPath));
        expect(variants).toEqual(new Set(Array.from({ length: count }, (_, index) => `${path}.${index}`)));
      },
    );

    it.each(freePaths)("enumerates %s into %i unique files for local preload", (path, count) => {
      const files = new SequencerDatabaseAdapter(() => api.database).getSoundFiles(path);
      expect(files).toHaveLength(count);
      expect(new Set(files).size).toBe(count);
      for (const file of files) expect(file.startsWith("modules/psfx/library/")).toBe(true);
    });

    it("uses the free fallback for paid-only candidates absent from PSFX Free", () => {
      const adapter = new SequencerDatabaseAdapter(() => api.database);
      for (const id of ["automatic", "shotgun", "huntingRifle"] as const) {
        expect(adapter.hasSound(WEAPON_SOUND_PROFILES[id].candidates[0])).toBe(false);
        expect(resolveWeaponSound(id, path => adapter.hasSound(path), 0.5)?.path)
          .toBe("psfx.ranged-weapons.guns.single-fire.revolver");
      }
    });

    it.each([[50, "05ft"], [250, "15ft"], [550, "30ft"], [950, "60ft"], [1600, "90ft"]])(
      "selects the actual Longbow sound for %i pixels with both audio positions", async (pixels, range) => {
        const sequence = new api.Sequence();
        const section = sequence.sound().file("psfx.ranged-weapons.longbow.v1")
          .atLocation({x:0,y:0}).toLocation({x:pixels,y:0}).globalSound(true);
        const data = await section._sanitizeSoundData();
        expect(data.global).toBe(true);
        expect(data.channel).toBe("interface");
        const entry = api.database.getEntry(data.file);
        const file = api.SequencerSound.prototype.getFile.call({
          file: entry, source: true, target: true, sourcePosition:data.source, targetPosition:data.target,
        });
        expect(file).toContain(`-${range}.ogg`);
      },
    );

    it.each([4, 6, 8])("schedules %i native sound repetitions at 200 ms with independent variants", async count => {
      vi.useFakeTimers();
      const play = vi.spyOn(api.SequencerSoundManager, "play").mockResolvedValue(0);
      const sequence = new api.Sequence();
      sequence.sound().file("psfx.ranged-weapons.guns.single-fire.revolver").volume(0.25).repeats(count, 200);
      const times: number[] = [];
      play.mockImplementation(async () => { times.push(Date.now()); return 0; });
      const start = Date.now(), playback = sequence.play();
      await vi.runAllTimersAsync();
      await playback;
      expect(times.map(time => time - start)).toEqual(Array.from({ length: count }, (_, i) => i * 200));
      expect(new Set(play.mock.calls.map(([data]: any[]) => data.file)).size).toBe(Math.min(count, 5));
      expect(play.mock.calls.every(([data, push]: any[]) => data.volume === 0.25 && push === true)).toBe(true);
      play.mockRestore();
    });

    it("starts the adapter visual once while native audio is still loading", async () => {
      vi.useFakeTimers();
      let finish!: (duration: number) => void;
      const play = vi.spyOn(api.SequencerSoundManager, "play").mockImplementation(() => new Promise(resolve => { finish = resolve; }));
      vi.stubGlobal("Sequence", api.Sequence);
      api.visualStarts.length = 0;
      const h = weaponFixture(), definition = resolveWeaponFx(h.event.item)!;
      const playback = new SequencerAdapter().playWeaponEffect(definition, h.context, resolveWeaponSound("handgun", () => true, 0.5));
      await vi.advanceTimersByTimeAsync(10);
      expect(api.visualStarts).toHaveLength(1);
      expect(play).toHaveBeenCalledOnce();
      finish(0);
      await vi.runAllTimersAsync(); await playback;
      expect(api.visualStarts).toHaveLength(1);
      play.mockRestore();
    });

    it("preserves the started visual when audio execution rejects in the native scheduler", async () => {
      vi.useFakeTimers();
      const execute = vi.spyOn(api.SoundSection.prototype, "_execute").mockRejectedValue(new Error("injected audio load failure"));
      vi.stubGlobal("Sequence", api.Sequence);
      api.visualStarts.length = 0;
      const h = weaponFixture();
      const playback = new SequencerAdapter().playWeaponEffect(resolveWeaponFx(h.event.item)!, h.context,
        resolveWeaponSound("handgun", () => true, 0.5));
      const rejected = expect(playback).rejects.toThrow("injected audio load failure");
      await vi.runAllTimersAsync(); await rejected;
      expect(api.visualStarts).toHaveLength(1);
      expect(execute).toHaveBeenCalledOnce();
      execute.mockRestore();
    });

    it("broadcasts before local playback even if the executor muted sounds or its file load fails", async () => {
      const send = vi.spyOn(api.sequencerSocket, "executeForOthers");
      const local = vi.fn().mockRejectedValue(new Error("local file load failed"));
      api.game.settings.get = () => false;
      const data = { _id: "sound", sceneId: "scene", loopOptions: false, creationTimestamp: Date.now() };
      expect(new api.SequencerSound(data).shouldPlaySound).toBe(false);
      await expect(api.SequencerSoundManager.play.call({ _playSound: local }, data, true)).rejects.toThrow("local file load failed");
      expect(send).toHaveBeenCalledExactlyOnceWith("playSound", data);
      api.game.settings.get = () => true;
      expect(new api.SequencerSound(data).shouldPlaySound).toBe(true);
      send.mockRestore();
    });
  });
});
