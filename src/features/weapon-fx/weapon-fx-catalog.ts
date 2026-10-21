import type { WeaponSoundProfileId } from "./weapon-sound-profiles";

export type WeaponFxMode = "projectile" | "melee" | "line";
export interface WeaponFxDefinition {
  readonly name: string;
  readonly effectPath: string;
  readonly mode: WeaponFxMode;
  readonly soundProfileId: WeaponSoundProfileId | null;
}

function weapons(names: string[], effectPath: string, mode: WeaponFxMode, soundProfileId: WeaponSoundProfileId | null = null): WeaponFxDefinition[] {
  return names.map(name => Object.freeze({ name, effectPath: `jb2a.${effectPath}`, mode, soundProfileId }));
}

export const WEAPON_FX_CATALOG: readonly WeaponFxDefinition[] = Object.freeze([
  ...weapons(["Pistola", "Revólver", "Pistola Pesada", "Revólver Compacto"], "bullet.02.orange", "projectile", "handgun"),
  ...weapons(["Fuzil de Assalto", "Submetralhadora", "Metralhadora"], "volley_of_projectiles_Line.bullet.001.002.orangeyellow", "projectile", "automatic"),
  ...weapons(["Espingarda", "Espingarda de Cano Duplo"], "volley_of_projectiles_Line.bullet.001.001.orangeyellow", "projectile", "shotgun"),
  ...weapons(["Fuzil de Caça", "Fuzil de Precisão"], "bullet.Snipe.blue", "projectile", "huntingRifle"),
  ...weapons(["Bazuca"], "throwable.launch.missile.01.blue", "projectile"),
  ...weapons(["Lança-chamas"], "breath_weapons02.burst.line.fire.orange.01", "line"),
  ...weapons(["Arco", "Arco Composto"], "arrow.physical.white.01", "projectile", "longbow"),
  ...weapons(["Besta", "Balestra"], "bolt.physical.orange", "projectile", "longbow"),
  ...weapons(["Faca", "Faca Tática", "Baioneta"], "dagger.melee.02.white", "melee", "lightSwoosh"),
  ...weapons(["Punhal"], "melee_attack.01.butterflysword.01", "melee", "lightSwoosh"),
  ...weapons(["Corrente"], "melee_attack.01.flail.01", "melee", "heavySwoosh"),
  ...weapons(["Machado"], "melee_attack.03.greataxe.01", "melee", "heavySwoosh"),
  ...weapons(["Machadinha"], "melee_attack.02.handaxe.01", "melee", "lightSwoosh"),
  ...weapons(["Acha"], "halberd.melee.01.white", "melee", "heavySwoosh"),
  ...weapons(["Martelo"], "melee_attack.02.hammer.01", "melee", "heavySwoosh"),
  ...weapons(["Marreta"], "melee_attack.02.warhammer.01", "melee", "heavySwoosh"),
  ...weapons(["Maça"], "melee_attack.02.mace.01", "melee", "heavySwoosh"),
  ...weapons(["Bastão"], "melee_attack.02.club.01", "melee", "heavySwoosh"),
  ...weapons(["Bastão Policial"], "melee_attack.02.club.01", "melee", "lightSwoosh"),
  ...weapons(["Cajado"], "quarterstaff.melee.01.white", "melee", "heavySwoosh"),
  ...weapons(["Katana"], "melee_attack.04.katana.01", "melee", "sword"),
  ...weapons(["Machete"], "melee_attack.04.falchion.01", "melee", "sword"),
  ...weapons(["Espada"], "melee_attack.01.shortsword.01", "melee", "sword"),
  ...weapons(["Montante"], "melee_attack.03.greatsword.01", "melee", "heavySwoosh"),
  ...weapons(["Gadanho"], "melee_attack.05.scythe.01", "melee", "heavySwoosh"),
  ...weapons(["Lança"], "spear.melee.01.white", "melee", "spear"),
  ...weapons(["Florete"], "rapier.melee.01.white", "melee", "sword"),
]);
