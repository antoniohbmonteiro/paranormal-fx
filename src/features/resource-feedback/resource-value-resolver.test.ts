import { describe, expect, it } from "vitest";
import { resolveResourceValue } from "./resource-value-resolver";

describe("resolveResourceValue", () => {
  it("reads agent PV", () => expect(resolveResourceValue({ type: "agent", system: { PV: { value: 30 } } })).toBe(30));
  it("reads threat HP", () => expect(resolveResourceValue({ type: "threat", system: { attributes: { hp: { value: 18 } } } })).toBe(18));
  it("ignores unknown actor types", () => expect(resolveResourceValue({ type: "other", system: { PV: { value: 1 } } })).toBeNull());
  it("ignores a missing resource", () => expect(resolveResourceValue({ type: "agent", system: {} })).toBeNull());
  it("ignores non-numeric and non-finite values", () => {
    expect(resolveResourceValue({ type: "agent", system: { PV: { value: "30" } } })).toBeNull();
    expect(resolveResourceValue({ type: "threat", system: { attributes: { hp: { value: Infinity } } } })).toBeNull();
  });
  it("does not treat PE, PD, or SAN as health", () => {
    expect(resolveResourceValue({ type: "agent", system: { PE: { value: 1 }, PD: 2, SAN: { value: 3 } } })).toBeNull();
  });
});
