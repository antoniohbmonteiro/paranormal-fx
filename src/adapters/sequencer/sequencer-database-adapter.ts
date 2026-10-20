import { logger } from "../../core/logger";

export interface SequencerDatabaseLike {
  getEntry(path: string, options: { softFail: boolean }): unknown;
}

export class SequencerDatabaseAdapter {
  private readonly available = new Map<string, boolean>();
  private readonly warned = new Set<string>();

  constructor(private readonly database = (): SequencerDatabaseLike | undefined => globalThis.Sequencer?.Database) {}

  invalidate(namespace: string): void {
    if (namespace === "jb2a") this.available.clear();
  }

  hasEffect(path: string): boolean {
    const database = this.database();
    if (!database) return false;
    if (this.available.has(path)) return this.available.get(path)!;
    try {
      const entry = database.getEntry(path, { softFail: true });
      const exists = Array.isArray(entry) ? entry.length > 0 : !!entry;
      this.available.set(path, exists);
      if (!exists && !this.warned.has(path)) {
        this.warned.add(path);
        logger.warn("Weapon animation is unavailable in the Sequencer database", path);
      }
      return exists;
    } catch {
      return false;
    }
  }
}
