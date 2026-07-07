export {};

declare global {
  const game: {
    system: {
      id: string;
    };
    modules: Map<string, { active: boolean }>;
    settings: {
      register(moduleId: string, key: string, data: Record<string, unknown>): void;
      get(moduleId: string, key: string): unknown;
    };
  };

  const Hooks: {
    once(hook: string, callback: (...args: any[]) => void): void;
    on(hook: string, callback: (...args: any[]) => void): void;
  };

  const ui: {
    notifications: {
      error(message: string): void;
      warn(message: string): void;
    };
  };

  var Sequence: unknown | undefined;
}
