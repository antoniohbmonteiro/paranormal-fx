import type { ToolkitAreaPayload, ToolkitAreaType } from "../../adapters/toolkit/toolkit-payloads";

export function getAreaType(area: ToolkitAreaPayload | null): ToolkitAreaType | null {
  return area?.type ?? area?.areaType ?? null;
}
