import { describe, expect, it } from "vitest";
import { WEAPON_FX_CATALOG } from "./weapon-fx-catalog";
import { normalizeWeaponName, resolveWeaponFx } from "./weapon-fx-resolver";

const groups = [
  [["Pistola", "Revólver", "Pistola Pesada", "Revólver Compacto"], "bullet.02.orange", "projectile"],
  [["Fuzil de Assalto", "Submetralhadora", "Metralhadora"], "volley_of_projectiles_Line.bullet.001.002.orangeyellow", "projectile"],
  [["Espingarda", "Espingarda de Cano Duplo"], "volley_of_projectiles_Line.bullet.001.001.orangeyellow", "projectile"],
  [["Fuzil de Caça", "Fuzil de Precisão"], "bullet.Snipe.blue", "projectile"],
  [["Bazuca"], "throwable.launch.missile.01.blue", "projectile"],
  [["Lança-chamas"], "breath_weapons02.burst.line.fire.orange.01", "line"],
  [["Arco", "Arco Composto"], "arrow.physical.white.01", "projectile"],
  [["Besta", "Balestra"], "bolt.physical.orange", "projectile"],
  [["Faca", "Faca Tática", "Baioneta"], "dagger.melee.02.white", "melee"],
  [["Punhal"], "melee_attack.01.butterflysword.01", "melee"],
  [["Corrente"], "melee_attack.01.flail.01", "melee"],
  [["Machado"], "melee_attack.03.greataxe.01", "melee"],
  [["Machadinha"], "melee_attack.02.handaxe.01", "melee"],
  [["Acha"], "halberd.melee.01.white", "melee"],
  [["Martelo"], "melee_attack.02.hammer.01", "melee"],
  [["Marreta"], "melee_attack.02.warhammer.01", "melee"],
  [["Maça"], "melee_attack.02.mace.01", "melee"],
  [["Bastão", "Bastão Policial"], "melee_attack.02.club.01", "melee"],
  [["Cajado"], "quarterstaff.melee.01.white", "melee"],
  [["Katana"], "melee_attack.04.katana.01", "melee"],
  [["Machete"], "melee_attack.04.falchion.01", "melee"],
  [["Espada"], "melee_attack.01.shortsword.01", "melee"],
  [["Montante"], "melee_attack.03.greatsword.01", "melee"],
  [["Gadanho"], "melee_attack.05.scythe.01", "melee"],
  [["Lança"], "spear.melee.01.white", "melee"],
  [["Florete"], "rapier.melee.01.white", "melee"],
] as const;

describe("weapon FX catalog", () => {
  it("has exactly 38 unique canonical names and 26 effect paths", () => {
    expect(WEAPON_FX_CATALOG).toHaveLength(38);
    expect(new Set(WEAPON_FX_CATALOG.map(entry => normalizeWeaponName(entry.name))).size).toBe(38);
    expect(new Set(WEAPON_FX_CATALOG.map(entry => entry.effectPath)).size).toBe(26);
  });
  for (const [names, path, mode] of groups) {
    it.each(names)("resolves %s to its approved animation", name => {
      const normalized = " " + name.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "") + " ";
      expect(resolveWeaponFx({ type: "armament", name: normalized })).toEqual({ name, effectPath: `jb2a.${path}`, mode });
    });
  }
  it.each(["Picareta", "Gancho de Carne", "Nunchaku", "Motoserra", "Pregador Pneumático", "Estilingue", "Shuriken",
    "Pistola +1", "Pistola Pesada modificada", "Pistol", "Lança chamas", "Fuzil  de Assalto"])("has no fallback for %s", name => {
    expect(resolveWeaponFx({ type: "armament", name })).toBeNull();
  });
  it("requires an armament even when another item has the same name", () => {
    expect(resolveWeaponFx({ type: "ability", name: "Pistola" })).toBeNull();
  });
});
