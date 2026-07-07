export const MODULE_ID = "paranormal-fx";
export const MODULE_TITLE = "Paranormal FX";
export const TARGET_SYSTEM_ID = "ordemparanormal";

export const REQUIRED_MODULE_IDS = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e",
] as const;

export type RequiredModuleId = (typeof REQUIRED_MODULE_IDS)[number];
