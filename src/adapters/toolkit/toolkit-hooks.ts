export const TOOLKIT_HOOKS = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished",
} as const;

export type ToolkitHookName = (typeof TOOLKIT_HOOKS)[keyof typeof TOOLKIT_HOOKS];
