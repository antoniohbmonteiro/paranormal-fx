import { describe, expect, it, vi } from "vitest";
import {
  FloatingResourceTextRenderer,
  PixiFloatingTextPort,
  type FloatingTextOptions,
  type FloatingTextPort,
  type PixiFloatingTextDependencies,
  type PixiTextStyleOptions,
} from "./floating-resource-text-renderer";
import type { ResourceTokenLike } from "./resource-feedback-types";

const token = {
  center: { x: 120, y: 80 },
  w: 100,
  h: 100,
} as ResourceTokenLike;

describe("FloatingResourceTextRenderer", () => {
  it.each([
    ["damage", 10, "-10", "#ff3333"],
    ["healing", 7, "+7", "#33dd77"],
  ] as const)("configures %s PIXI text", async (kind, amount, content, fill) => {
    const create = vi.fn<FloatingTextPort["create"]>().mockResolvedValue(undefined);
    const renderer = new FloatingResourceTextRenderer({ create });
    await renderer.render(token, { kind, amount, delta: kind === "damage" ? -amount : amount });

    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(token.center, content, {
      distance: 60,
      duration: 1500,
      textStyle: {
        fill,
        fontSize: 32,
        fontWeight: "bold",
        stroke: "#111111",
        strokeThickness: 5,
      },
    } satisfies FloatingTextOptions);
  });
});

function createPixiFixture(
  animationResult: "resolve" | "reject" = "resolve",
  children: ReadonlyArray<{ zIndex: number }> = [{ zIndex: 0 }, { zIndex: 100 }, { zIndex: 700 }],
  sortableChildren = true,
) {
  const anchorSet = vi.fn();
  const positionSet = vi.fn();
  const destroy = vi.fn();
  const text = { alpha: 1, y: 80, zIndex: 0, anchor: { set: anchorSet }, position: { set: positionSet }, destroy };
  const addChild = vi.fn((addedText: typeof text) => {
    expect(addedText.zIndex).toBe(children.length === 0 ? 1 : 701);
  });
  const removeChild = vi.fn();
  const sortChildren = vi.fn();
  const animate = animationResult === "resolve"
    ? vi.fn().mockResolvedValue(true)
    : vi.fn().mockRejectedValue(new Error("teardown"));
  const style: PixiTextStyleOptions = {
    fill: "#ff3333",
    fontSize: 32,
    fontWeight: "bold",
    stroke: "#111111",
    strokeThickness: 5,
  };
  const textFactory = { create: vi.fn(() => text) };
  const container = { children, sortableChildren, addChild, removeChild, sortChildren };
  const dependencies = {
    textFactory,
    container: () => container,
    animation: { animate },
  } satisfies PixiFloatingTextDependencies;
  return {
    dependencies,
    text,
    style,
    anchorSet,
    positionSet,
    addChild,
    removeChild,
    sortChildren,
    destroy,
    animate,
    textFactory,
    container,
  };
}

describe("PixiFloatingTextPort", () => {
  it("adds, animates, removes, and destroys PIXI text", async () => {
    const fixture = createPixiFixture();
    const port = new PixiFloatingTextPort(fixture.dependencies);
    await port.create({ x: 120, y: 80 }, "-10", {
      distance: 60,
      duration: 1500,
      textStyle: fixture.style,
    });

    expect(fixture.textFactory.create).toHaveBeenCalledWith("-10", fixture.style);
    expect(fixture.anchorSet).toHaveBeenCalledWith(0.5);
    expect(fixture.positionSet).toHaveBeenCalledWith(120, 80);
    expect(fixture.text.zIndex).toBe(701);
    expect(fixture.addChild).toHaveBeenCalledWith(fixture.text);
    expect(fixture.sortChildren).toHaveBeenCalledOnce();
    expect(fixture.container.sortableChildren).toBe(true);
    expect(fixture.animate).toHaveBeenCalledWith([
      { parent: fixture.text, attribute: "y", to: 20 },
      { parent: fixture.text, attribute: "alpha", to: 0 },
    ], { duration: 1500 });
    expect(fixture.removeChild).toHaveBeenCalledWith(fixture.text);
    expect(fixture.destroy).toHaveBeenCalledOnce();
  });

  it("uses zIndex 1 for an empty non-sortable container", async () => {
    const fixture = createPixiFixture("resolve", [], false);
    const port = new PixiFloatingTextPort(fixture.dependencies);
    await port.create({ x: 120, y: 80 }, "-10", {
      distance: 60,
      duration: 1500,
      textStyle: fixture.style,
    });

    expect(fixture.text.zIndex).toBe(1);
    expect(fixture.addChild).toHaveBeenCalledWith(fixture.text);
    expect(fixture.sortChildren).not.toHaveBeenCalled();
    expect(fixture.container.sortableChildren).toBe(false);
  });

  it("removes and destroys PIXI text when animation rejects", async () => {
    const fixture = createPixiFixture("reject");
    const port = new PixiFloatingTextPort(fixture.dependencies);
    await expect(port.create({ x: 120, y: 80 }, "+7", {
      distance: 60,
      duration: 1500,
      textStyle: fixture.style,
    })).rejects.toThrow("teardown");

    expect(fixture.removeChild).toHaveBeenCalledWith(fixture.text);
    expect(fixture.destroy).toHaveBeenCalledOnce();
  });

  it("does not create an orphan when the canvas interface is unavailable", async () => {
    const fixture = createPixiFixture();
    fixture.dependencies.container = () => null;
    const port = new PixiFloatingTextPort(fixture.dependencies);
    await expect(port.create({ x: 0, y: 0 }, "-1", {
      distance: 60,
      duration: 1500,
      textStyle: fixture.style,
    })).rejects.toThrow("Canvas interface is unavailable.");
    expect(fixture.textFactory.create).not.toHaveBeenCalled();
  });
});
