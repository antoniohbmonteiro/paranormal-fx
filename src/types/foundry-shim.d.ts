export {};

declare global {
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
      createScrollingText(
        position: { x: number; y: number },
        content: string,
        options: import("../features/resource-feedback/floating-resource-text-renderer").ScrollingTextOptions,
      ): Promise<unknown>;
    };
  };

  const CONST: {
    TEXT_ANCHOR_POINTS: {
      CENTER: number;
      TOP: number;
    };
  };

  const ui: {
    notifications: {
      error(message: string): void;
      warn(message: string): void;
    };
  };

  var Sequence: unknown | undefined;
}
