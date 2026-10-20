import { SequencerAdapter } from "../../adapters/sequencer/sequencer-adapter";
import { SequencerDatabaseAdapter } from "../../adapters/sequencer/sequencer-database-adapter";
import { normalizeAttackPayload } from "../../adapters/toolkit/toolkit-attack-payloads";
import { logger } from "../../core/logger";
import { isWeaponAnimationsEnabled } from "../../core/settings";
import { resolveWeaponFxContext } from "./weapon-fx-context-resolver";
import { resolveWeaponFx } from "./weapon-fx-resolver";

export class WeaponFxService {
  private readonly consumed = new Set<string>();

  constructor(
    private readonly sequencer: Pick<SequencerAdapter, "playWeaponEffect"> = new SequencerAdapter(),
    readonly database: Pick<SequencerDatabaseAdapter, "hasEffect" | "invalidate"> = new SequencerDatabaseAdapter(),
    private readonly runtime = {
      enabled: isWeaponAnimationsEnabled,
      userId: () => game.user?.id,
      context: resolveWeaponFxContext,
    },
  ) {}

  async handleAttackPublished(payload: unknown): Promise<void> {
    try {
      const event = normalizeAttackPayload(payload);
      if (!event || !this.runtime.enabled() || event.userId !== this.runtime.userId() || event.visibility !== "public"
        || this.consumed.has(event.actionId)) return;
      const definition = resolveWeaponFx(event.item);
      if (!definition) return;
      const context = this.runtime.context(event);
      if (!context) return;
      this.consumed.add(event.actionId);
      if (!this.database.hasEffect(definition.effectPath)) return;
      await this.sequencer.playWeaponEffect(definition, context);
    } catch {
      logger.warn("Could not play weapon animation.");
    }
  }
}
