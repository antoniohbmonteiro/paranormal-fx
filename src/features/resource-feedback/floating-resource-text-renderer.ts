import type { ResourceTokenLike, ResourceTransition } from "./resource-feedback-types";

const VISUALS = {
  damage: "#ff3333",
  healing: "#33dd77",
  duration: 1500,
  distance: 60,
  fontWeight: "bold",
  strokeColor: "#111111",
  strokeWidth: 5,
} as const;

export interface ScrollingTextPort {
  create(
    position: { x: number; y: number },
    text: string,
    options: ScrollingTextOptions,
  ): Promise<void>;
}

export interface ScrollingTextOptions {
  anchor: number;
  direction: number;
  distance: number;
  duration: number;
  jitter?: number;
  textStyle: {
    fill: string;
    fontSize: number;
    fontWeight: "bold";
    stroke: {
      color: string;
      width: number;
    };
  };
}

export class FloatingResourceTextRenderer {
  constructor(private readonly port: ScrollingTextPort = new FoundryScrollingTextPort()) {}

  render(token: ResourceTokenLike, transition: ResourceTransition): Promise<void> {
    const prefix = transition.kind === "damage" ? "-" : "+";
    const fontSize = Math.max(24, Math.min(36, Math.round(Math.min(token.w, token.h) * 0.32)));
    return this.port.create(token.center, `${prefix}${transition.amount}`, {
      anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
      direction: CONST.TEXT_ANCHOR_POINTS.TOP,
      distance: VISUALS.distance,
      duration: VISUALS.duration,
      textStyle: {
        fill: VISUALS[transition.kind],
        fontSize,
        fontWeight: VISUALS.fontWeight,
        stroke: {
          color: VISUALS.strokeColor,
          width: VISUALS.strokeWidth,
        },
      },
    });
  }
}

class FoundryScrollingTextPort implements ScrollingTextPort {
  async create(
    position: { x: number; y: number },
    text: string,
    options: ScrollingTextOptions,
  ): Promise<void> {
    await canvas.interface.createScrollingText(position, text, options);
  }
}
