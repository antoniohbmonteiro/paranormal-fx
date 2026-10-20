export type WeaponFxMode = "projectile" | "melee" | "line";
export interface WeaponFxDefinition {
  readonly name: string;
  readonly effectPath: string;
  readonly mode: WeaponFxMode;
}

function weapons(names: string[], effectPath: string, mode: WeaponFxMode): WeaponFxDefinition[] {
  return names.map(name => Object.freeze({ name, effectPath: `jb2a.${effectPath}`, mode }));
}

export const WEAPON_FX_CATALOG: readonly WeaponFxDefinition[] = Object.freeze([
  ...weapons(["Pistola", "Revólver", "Pistola Pesada", "Revólver Compacto"], "bullet.02.orange", "projectile"),
  ...weapons(["Fuzil de Assalto", "Submetralhadora", "Metralhadora"], "volley_of_projectiles_Line.bullet.001.002.orangeyellow", "projectile"),
  ...weapons(["Espingarda", "Espingarda de Cano Duplo"], "volley_of_projectiles_Line.bullet.001.001.orangeyellow", "projectile"),
  ...weapons(["Fuzil de Caça", "Fuzil de Precisão"], "bullet.Snipe.blue", "projectile"),
  ...weapons(["Bazuca"], "throwable.launch.missile.01.blue", "projectile"),
  ...weapons(["Lança-chamas"], "breath_weapons02.burst.line.fire.orange.01", "line"),
  ...weapons(["Arco", "Arco Composto"], "arrow.physical.white.01", "projectile"),
  ...weapons(["Besta", "Balestra"], "bolt.physical.orange", "projectile"),
  ...weapons(["Faca", "Faca Tática", "Baioneta"], "dagger.melee.02.white", "melee"),
  ...weapons(["Punhal"], "melee_attack.01.butterflysword.01", "melee"),
  ...weapons(["Corrente"], "melee_attack.01.flail.01", "melee"),
  ...weapons(["Machado"], "melee_attack.03.greataxe.01", "melee"),
  ...weapons(["Machadinha"], "melee_attack.02.handaxe.01", "melee"),
  ...weapons(["Acha"], "halberd.melee.01.white", "melee"),
  ...weapons(["Martelo"], "melee_attack.02.hammer.01", "melee"),
  ...weapons(["Marreta"], "melee_attack.02.warhammer.01", "melee"),
  ...weapons(["Maça"], "melee_attack.02.mace.01", "melee"),
  ...weapons(["Bastão", "Bastão Policial"], "melee_attack.02.club.01", "melee"),
  ...weapons(["Cajado"], "quarterstaff.melee.01.white", "melee"),
  ...weapons(["Katana"], "melee_attack.04.katana.01", "melee"),
  ...weapons(["Machete"], "melee_attack.04.falchion.01", "melee"),
  ...weapons(["Espada"], "melee_attack.01.shortsword.01", "melee"),
  ...weapons(["Montante"], "melee_attack.03.greatsword.01", "melee"),
  ...weapons(["Gadanho"], "melee_attack.05.scythe.01", "melee"),
  ...weapons(["Lança"], "spear.melee.01.white", "melee"),
  ...weapons(["Florete"], "rapier.melee.01.white", "melee"),
]);
