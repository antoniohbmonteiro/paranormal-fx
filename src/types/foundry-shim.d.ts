export {};

declare global {
  namespace PIXI {
    class Text {
      constructor(
        content: string,
        style: import("../features/resource-feedback/floating-resource-text-renderer").PixiTextStyleOptions,
      );
      alpha: number;
      y: number;
      zIndex: number;
      anchor: { set(value: number): void };
      position: { set(x: number, y: number): void };
      destroy(): void;
    }
  }

  namespace foundry.canvas.animation {
    const CanvasAnimation: {
      animate(
        attributes: Array<{ parent: PIXI.Text; attribute: "y" | "alpha"; to: number }>,
        options: { duration: number },
      ): Promise<unknown>;
    };
  }

  const game: {
    system: {
      id: string;
    };
    modules: Map<string, { active: boolean }>;
    user: import("../features/resource-feedback/resource-feedback-types").ResourceUserLike;
    settings: {
      register(moduleId: string, key: string, data: Record<string, unknown>): void;
      get(moduleId: string, key: string): unknown;
    };
  };

  const Hooks: {
    once(hook: string, callback: (...args: any[]) => void): void;
    on(hook: string, callback: (...args: any[]) => void): number;
  };

  const canvas: {
    ready: boolean;
    scene: import("../features/resource-feedback/resource-feedback-types").ResourceSceneLike | null;
    interface: {
      children: ReadonlyArray<{ zIndex: number }>;
      sortableChildren: boolean;
      addChild(text: PIXI.Text): unknown;
      removeChild(text: PIXI.Text): unknown;
      sortChildren(): void;
    } | null;
  };

  const ui: {
    notifications: {
      error(message: string): void;
      warn(message: string): void;
    };
  };

  var Sequence: unknown | undefined;
}
