import type { ResourceTokenLike, ResourceTransition } from "./resource-feedback-types";

const VISUALS = {
  damage: 0xff3333,
  healing: 0x33dd77,
  duration: 1500,
  distance: 60,
  stroke: 0x111111,
  strokeThickness: 5,
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
  fill: number;
  fontSize: number;
  stroke: number;
  strokeThickness: number;
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
      fill: VISUALS[transition.kind],
      fontSize,
      stroke: VISUALS.stroke,
      strokeThickness: VISUALS.strokeThickness,
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
