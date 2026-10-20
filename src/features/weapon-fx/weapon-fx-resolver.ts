import { WEAPON_FX_CATALOG, type WeaponFxDefinition } from "./weapon-fx-catalog";

export function normalizeWeaponName(name: string): string {
  return name.trim().normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");
}

const definitions = new Map(WEAPON_FX_CATALOG.map(entry => [normalizeWeaponName(entry.name), entry]));

export function resolveWeaponFx(item: { name: string; type: string }): WeaponFxDefinition | null {
  return item.type === "armament" ? definitions.get(normalizeWeaponName(item.name)) ?? null : null;
}
