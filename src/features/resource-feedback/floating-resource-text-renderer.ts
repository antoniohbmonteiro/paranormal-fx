import type { ResourceTokenLike, ResourceTransition } from "./resource-feedback-types";

const VISUALS = {
  damage: "#ff3333",
  healing: "#33dd77",
  duration: 1500,
  distance: 60,
  fontWeight: "bold",
  stroke: "#111111",
  strokeThickness: 5,
} as const;

export interface PixiTextStyleOptions {
  fill: string;
  fontSize: number;
  fontWeight: "bold";
  stroke: string;
  strokeThickness: number;
}

export interface FloatingTextOptions {
  distance: number;
  duration: number;
  textStyle: PixiTextStyleOptions;
}

export interface FloatingTextPort {
  create(
    position: { x: number; y: number },
    content: string,
    options: FloatingTextOptions,
  ): Promise<void>;
}

export class FloatingResourceTextRenderer {
  constructor(private readonly port: FloatingTextPort = new PixiFloatingTextPort()) {}

  render(token: ResourceTokenLike, transition: ResourceTransition): Promise<void> {
    const prefix = transition.kind === "damage" ? "-" : "+";
    const fontSize = Math.max(24, Math.min(36, Math.round(Math.min(token.w, token.h) * 0.32)));
    return this.port.create(token.center, `${prefix}${transition.amount}`, {
      distance: VISUALS.distance,
      duration: VISUALS.duration,
      textStyle: {
        fill: VISUALS[transition.kind],
        fontSize,
        fontWeight: VISUALS.fontWeight,
        stroke: VISUALS.stroke,
        strokeThickness: VISUALS.strokeThickness,
      },
    });
  }
}

interface PixiTextLike {
  alpha: number;
  y: number;
  zIndex: number;
  anchor: { set(value: number): void };
  position: { set(x: number, y: number): void };
  destroy(): void;
}

interface PixiTextFactory {
  create(content: string, style: PixiTextStyleOptions): PixiTextLike;
}

interface InterfaceContainer {
  children: ReadonlyArray<{ zIndex: number }>;
  sortableChildren: boolean;
  addChild(text: PixiTextLike): unknown;
  removeChild(text: PixiTextLike): unknown;
  sortChildren(): void;
}

interface AnimationRunner {
  animate(
    attributes: Array<{ parent: PixiTextLike; attribute: "y" | "alpha"; to: number }>,
    options: { duration: number },
  ): Promise<unknown>;
}

export interface PixiFloatingTextDependencies {
  textFactory: PixiTextFactory;
  container(): InterfaceContainer | null;
  animation: AnimationRunner;
}

export class PixiFloatingTextPort implements FloatingTextPort {
  constructor(private readonly dependencies: PixiFloatingTextDependencies = foundryPixiDependencies) {}

  async create(
    position: { x: number; y: number },
    content: string,
    options: FloatingTextOptions,
  ): Promise<void> {
    const container = this.dependencies.container();
    if (!container) throw new Error("Canvas interface is unavailable.");

    const text = this.dependencies.textFactory.create(content, options.textStyle);
    let added = false;
    try {
      text.anchor.set(0.5);
      text.position.set(position.x, position.y);
      const topZIndex = container.children.reduce(
        (highest, child) => Math.max(highest, child.zIndex),
        0,
      ) + 1;
      text.zIndex = topZIndex;
      container.addChild(text);
      added = true;
      if (container.sortableChildren) container.sortChildren();
      await this.dependencies.animation.animate(
        [
          { parent: text, attribute: "y", to: position.y - options.distance },
          { parent: text, attribute: "alpha", to: 0 },
        ],
        { duration: options.duration },
      );
    } finally {
      try {
        if (added) container.removeChild(text);
      } finally {
        text.destroy();
      }
    }
  }
}

const foundryPixiDependencies: PixiFloatingTextDependencies = {
  textFactory: {
    create: (content, style) => new PIXI.Text(content, style),
  },
  container: () => canvas.interface,
  animation: {
    animate: (attributes, options) =>
      foundry.canvas.animation.CanvasAnimation.animate(attributes, options),
  },
};
