import { MODULE_TITLE } from "../config/module-constants";
import { isDebugEnabled } from "./settings";

function prefix(message: string): string {
  return `${MODULE_TITLE} | ${message}`;
}

export const logger = {
  debug(message: string, ...data: unknown[]): void {
    if (!isDebugEnabled()) return;
    console.debug(prefix(message), ...data);
  },

  info(message: string, ...data: unknown[]): void {
    console.info(prefix(message), ...data);
  },

  warn(message: string, ...data: unknown[]): void {
    console.warn(prefix(message), ...data);
  },

  error(message: string, ...data: unknown[]): void {
    console.error(prefix(message), ...data);
  },
};
