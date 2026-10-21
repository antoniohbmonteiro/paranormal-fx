import { logger } from "../../core/logger";

export interface SequencerDatabaseLike {
  getEntry(path: string, options: { softFail: boolean }): unknown;
}

export class SequencerDatabaseAdapter {
  private readonly available = new Map<string, boolean>();
  private readonly warned = new Set<string>();

  constructor(private readonly database = (): SequencerDatabaseLike | undefined => globalThis.Sequencer?.Database) {}

  invalidate(namespace: string): void {
    if (namespace !== "jb2a" && namespace !== "psfx") return;
    for (const path of this.available.keys()) {
      if (path.startsWith(`${namespace}.`)) this.available.delete(path);
    }
  }

  hasEffect(path: string): boolean {
    return this.hasEntry(path, true);
  }

  hasSound(path: string): boolean {
    return this.hasEntry(path, false);
  }

  getSoundFiles(path: string): readonly string[] {
    try {
      const entry = this.database()?.getEntry(path, { softFail: true });
      return [...new Set(collectSoundFiles(entry))];
    } catch {
      return [];
    }
  }

  private hasEntry(path: string, warnIfMissing: boolean): boolean {
    const database = this.database();
    if (!database) return false;
    if (this.available.has(path)) return this.available.get(path)!;
    try {
      const entry = database.getEntry(path, { softFail: true });
      const exists = Array.isArray(entry) ? entry.length > 0 : !!entry;
      this.available.set(path, exists);
      if (!exists && warnIfMissing && !this.warned.has(path)) {
        this.warned.add(path);
        logger.warn("Weapon animation is unavailable in the Sequencer database", path);
      }
      return exists;
    } catch {
      return false;
    }
  }
}

function collectSoundFiles(entry: unknown): string[] {
  if (typeof entry === "string") return entry.trim() ? [entry] : [];
  if (Array.isArray(entry)) return entry.flatMap(collectSoundFiles);
  if (entry && typeof entry === "object" && "getAllFiles" in entry && typeof entry.getAllFiles === "function") {
    try {
      return collectSoundFiles(entry.getAllFiles());
    } catch {
      return [];
    }
  }
  return [];
}
