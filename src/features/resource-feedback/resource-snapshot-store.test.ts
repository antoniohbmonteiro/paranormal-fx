import { describe, expect, it } from "vitest";
import { ResourceSnapshotStore } from "./resource-snapshot-store";

const actorKey = { kind: "actor", uuid: "Actor.a" } as const;

describe("ResourceSnapshotStore", () => {
  it("initializes a missing snapshot without a transition", () => {
    const store = new ResourceSnapshotStore();
    expect(store.transition(actorKey, 30)).toBeNull();
    expect(store.get(actorKey)).toBe(30);
  });
  it("creates damage and updates the snapshot", () => {
    const store = new ResourceSnapshotStore();
    store.hydrate(actorKey, 30);
    expect(store.transition(actorKey, 18)).toEqual({ kind: "damage", amount: 12, delta: -12 });
    expect(store.get(actorKey)).toBe(18);
  });
  it("creates healing", () => {
    const store = new ResourceSnapshotStore();
    store.hydrate(actorKey, 20);
    expect(store.transition(actorKey, 28)).toEqual({ kind: "healing", amount: 8, delta: 8 });
  });
  it("ignores zero and repeated transitions", () => {
    const store = new ResourceSnapshotStore();
    store.hydrate(actorKey, 20);
    expect(store.transition(actorKey, 20)).toBeNull();
    expect(store.transition(actorKey, 20)).toBeNull();
  });
  it("keeps synthetic token snapshots separate and clears them", () => {
    const store = new ResourceSnapshotStore();
    const first = { kind: "token", uuid: "Scene.s.Token.1" } as const;
    const second = { kind: "token", uuid: "Scene.s.Token.2" } as const;
    store.hydrate(first, 10);
    store.hydrate(second, 20);
    expect(store.transition(first, 8)?.amount).toBe(2);
    expect(store.get(second)).toBe(20);
    store.clear();
    expect(store.get(first)).toBeUndefined();
  });
});
