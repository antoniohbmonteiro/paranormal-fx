import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { runInNewContext } from "node:vm";
import { beforeAll, describe, expect, it } from "vitest";
import { WEAPON_FX_CATALOG } from "../../src/features/weapon-fx/weapon-fx-catalog";
import { resolveWeaponFx } from "../../src/features/weapon-fx/weapon-fx-resolver";

const jb2aRoot = process.env.PARANORMAL_FX_JB2A_REFERENCE;
const sequencerRoot = process.env.PARANORMAL_FX_SEQUENCER_REFERENCE;
const ordemRoot = process.env.PARANORMAL_FX_ORDEM_REFERENCE;
const paths = [...new Set(WEAPON_FX_CATALOG.map(entry => entry.effectPath))];

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.entries(value)
    .filter(([key]) => !key.startsWith("_")).flatMap(([, child]) => leaves(child));
  return [];
}

describe.skipIf(!jb2aRoot)("installed JB2A Free assets", () => {
  let database: any;
  beforeAll(async () => {
    const code = readFileSync(join(jb2aRoot!, "scripts/jb2a_sequencer.js"), "utf8")
      .replace("export async function jb2aFreeDatabase", "async function jb2aFreeDatabase")
      .replace(/export\s*\{\s*freeDatabase\s*\}/, "");
    const api = runInNewContext(code + "\n;({freeDatabase, jb2aFreeDatabase});", {}, { timeout: 2000 });
    await api.jb2aFreeDatabase("modules");
    database = api.freeDatabase;
  });

  it.each(paths)("resolves %s to installed assets", path => {
    const entry = path.split(".").slice(1).reduce((value, key) => value?.[key], database);
    const files = leaves(entry);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(existsSync(join(dirname(jb2aRoot!), file.replace(/^modules\//, ""))), file).toBe(true);
  });

  describe.skipIf(!sequencerRoot)("native Sequencer database behavior (runtime doubled)", () => {
    let api: any;
    beforeAll(() => {
      const map = JSON.parse(readFileSync(join(sequencerRoot!, "dist/sequencer.js.map"), "utf8"));
      const source = (suffix: string): string => {
        const index = map.sources.findIndex((path: string) => path.endsWith(suffix));
        if (index < 0) throw new Error("Sequencer reference source is unavailable: " + suffix);
        return map.sourcesContent[index];
      };
      const clean = (code: string) => code.replace(/^import .*;\r?\n/gm, "").replace(/export class /g, "class ");
      const library = source("/lib/lib.js");
      const start = library.indexOf("export function flatten_object");
      const flatten = library.slice(start, library.indexOf("\n/**", start)).replace("export ", "");
      const code = `
        Array.prototype.deepFlatten = function() { return this.flat(Infinity); };
        const foundry = {utils: {
          duplicate: value => JSON.parse(JSON.stringify(value)),
          getProperty: (value, path) => path.split('.').reduce((entry, key) => entry?.[key], value),
          mergeObject: function merge(a, b) { for (const [key, value] of Object.entries(b)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) merge(a[key] ??= {}, value);
            else a[key] = value;
          } return a; }
        }};
        ${flatten}
        let selection = 0;
        const lib = {flatten_object, make_array_unique: array => [...new Set(array)], debug() {}, custom_warning() {},
          is_real_number: value => typeof value === 'number' && Number.isFinite(value),
          random_array_element: (array, options = {}) => options.index ? selection++ % array.length : array[selection++ % array.length]};
        const writable = value => ({value, set(next) { this.value = next; }}), get = store => store.value;
        const CONSTANTS = {FEET_REGEX: /\\.[0-9]+ft\\.*/g};
        const CONST = {FILE_CATEGORIES: {IMAGE: {png: true, webp: true}, VIDEO: {webm: true}, AUDIO: {ogg: true}}};
        const Hooks = {callAll() {}}, canvas = {grid: {size: 100}};
        const ui = {notifications: {error(message) { throw new Error(message); }}};
        ${clean(source("/modules/sequencer-file.js"))}
        ${clean(source("/modules/sequencer-database.js")).replace("export default SequencerDatabase;", "")}
        const Sequencer = {Database: SequencerDatabase};
        const files = ${clean(source("/sections/traits/files.js")).replace("export default", "")};
        SequencerDatabase.registerEntries('jb2a', foundry.utils.duplicate(input));
        ({database: SequencerDatabase, files});
      `;
      api = runInNewContext(code, { input: database }, { timeout: 5000 });
    });

    it.each(paths)("registers %s without relying on a raw filepath", path => {
      expect(api.database.getEntry(path, { softFail: true })).toBeTruthy();
    });

    it("resolves all four Katana variants through the native file trait", () => {
      const variants = new Set(Array.from({ length: 4 }, () => api.files._determineDatabaseFile("jb2a.melee_attack.04.katana.01").file.dbPath));
      expect(variants).toEqual(new Set([0, 1, 2, 3].map(index => `jb2a.melee_attack.04.katana.01.${index}`)));
    });

    it("selects the Snipe distance files through SequencerFileRangeFind", () => {
      const entry = api.database.getEntry("jb2a.bullet.Snipe.blue");
      expect(entry.rangeFind).toBe(true);
      for (const [pixels, variant] of [[50, "05ft"], [250, "15ft"], [550, "30ft"], [950, "60ft"], [1600, "90ft"]]) {
        expect(entry.getFileForDistance(pixels)).toContain(`_${variant}_`);
      }
    });
  });
});

describe.skipIf(!ordemRoot)("real Armamentos compendium coverage", () => {
  it("recognizes exactly 38 of the 45 armaments without writing to the compendium", () => {
    const readItems = (directory: string): any[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readItems(path);
      return entry.name.endsWith(".json") && entry.name !== "_folder.json" ? [JSON.parse(readFileSync(path, "utf8"))] : [];
    });
    const items = readItems(join(ordemRoot!, "packs/_source/armaments"));
    expect(items).toHaveLength(45);
    expect(items.filter(item => resolveWeaponFx(item))).toHaveLength(38);
    expect(items.filter(item => !resolveWeaponFx(item)).map(item => item.name).sort()).toEqual([
      "Picareta", "Gancho de Carne", "Nunchaku", "Motoserra", "Pregador Pneumático", "Estilingue", "Shuriken",
    ].sort());
  });
});
