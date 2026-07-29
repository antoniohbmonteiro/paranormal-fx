import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  FloatingResourceTextRenderer,
  type ScrollingTextOptions,
  type ScrollingTextPort,
} from "./floating-resource-text-renderer";
import type { ResourceTokenLike } from "./resource-feedback-types";

const create = vi.fn<ScrollingTextPort["create"]>().mockResolvedValue(undefined);
const token = {
  center: { x: 120, y: 80 },
  w: 100,
  h: 100,
} as ResourceTokenLike;

beforeAll(() => {
  vi.stubGlobal("CONST", { TEXT_ANCHOR_POINTS: { CENTER: 0, TOP: 1 } });
});

describe("FloatingResourceTextRenderer", () => {
  it.each([
    ["damage", 10, "-10", "#ff3333"],
    ["healing", 7, "+7", "#33dd77"],
  ] as const)("renders %s with Foundry v14 scrolling-text options", async (kind, amount, text, fill) => {
    create.mockClear();
    const renderer = new FloatingResourceTextRenderer({ create });
    await renderer.render(token, { kind, amount, delta: kind === "damage" ? -amount : amount });

    expect(create).toHaveBeenCalledOnce();
    const [origin, content, options] = create.mock.calls[0] as [
      { x: number; y: number },
      string,
      ScrollingTextOptions,
    ];
    expect(origin).toEqual(token.center);
    expect(content).toBe(text);
    expect(options).toMatchObject({
      anchor: 0,
      direction: 1,
      duration: 1500,
      distance: 60,
      textStyle: {
        fill,
        fontSize: 32,
        fontWeight: "bold",
        stroke: { color: "#111111", width: 5 },
      },
    });
    expect(options).not.toHaveProperty("fill");
    expect(options).not.toHaveProperty("fontSize");
    expect(options).not.toHaveProperty("stroke");
    expect(options).not.toHaveProperty("strokeThickness");
  });
});
