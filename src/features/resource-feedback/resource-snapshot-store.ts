import {
  serializeSnapshotKey,
  type ResourceSnapshotKey,
  type ResourceTransition,
} from "./resource-feedback-types";

export class ResourceSnapshotStore {
  readonly #values = new Map<string, number>();

  hydrate(key: ResourceSnapshotKey, value: number): void {
    this.#values.set(serializeSnapshotKey(key), value);
  }

  transition(key: ResourceSnapshotKey, currentValue: number): ResourceTransition | null {
    const serialized = serializeSnapshotKey(key);
    const previousValue = this.#values.get(serialized);
    this.#values.set(serialized, currentValue);

    if (previousValue === undefined) return null;
    const delta = currentValue - previousValue;
    if (delta === 0) return null;

    return {
      kind: delta < 0 ? "damage" : "healing",
      amount: Math.abs(delta),
      delta,
    };
  }

  delete(key: ResourceSnapshotKey): void {
    this.#values.delete(serializeSnapshotKey(key));
  }

  clear(): void {
    this.#values.clear();
  }

  get(key: ResourceSnapshotKey): number | undefined {
    return this.#values.get(serializeSnapshotKey(key));
  }
}
