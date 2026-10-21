import { SequencerAdapter } from "../../adapters/sequencer/sequencer-adapter";
import { SequencerDatabaseAdapter } from "../../adapters/sequencer/sequencer-database-adapter";
import { getWeaponSoundVolume, isWeaponAnimationsEnabled } from "../../core/settings";
import { WEAPON_SOUND_PROFILES } from "./weapon-sound-profiles";
import { WEAPON_FX_CATALOG } from "./weapon-fx-catalog";

const soundPaths = [...new Set(WEAPON_FX_CATALOG.flatMap(({ soundProfileId }) =>
  soundProfileId ? WEAPON_SOUND_PROFILES[soundProfileId].candidates : []))];
const maxConcurrentLoads = 2;

export class WeaponSoundPreloader {
  private readonly loaded = new Set<string>();
  private readonly pending = new Set<string>();
  private readonly queue: string[] = [];
  private active = 0;

  constructor(
    private readonly database: Pick<SequencerDatabaseAdapter, "getSoundFiles"> = new SequencerDatabaseAdapter(),
    private readonly sequencer: Pick<SequencerAdapter, "preloadSound"> = new SequencerAdapter(),
    private readonly enabled = () => isWeaponAnimationsEnabled() && getWeaponSoundVolume() > 0,
  ) {}

  preload(): void {
    if (!this.isEnabled()) return;
    for (const path of soundPaths) {
      try {
        for (const file of this.database.getSoundFiles(path)) {
          if (this.loaded.has(file) || this.pending.has(file)) continue;
          this.pending.add(file);
          this.queue.push(file);
        }
      } catch {
        // An optional profile must not prevent the remaining sounds from loading.
      }
    }
    this.drain();
  }

  private isEnabled(): boolean {
    try {
      return this.enabled();
    } catch {
      return false;
    }
  }

  private drain(): void {
    while (this.active < maxConcurrentLoads && this.queue.length > 0 && this.isEnabled()) {
      const file = this.queue.shift()!;
      this.active++;
      void this.load(file);
    }
  }

  private async load(file: string): Promise<void> {
    try {
      if (await this.sequencer.preloadSound(file)) this.loaded.add(file);
    } catch {
      // Retry failed files only on a later preload request, never in a tight loop.
    } finally {
      this.pending.delete(file);
      this.active--;
      this.drain();
    }
  }
}
