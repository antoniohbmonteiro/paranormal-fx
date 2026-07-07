const g = "paranormal-fx", l = "Paranormal FX", d = "ordemparanormal", b = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], m = {
  debug: "debug"
};
function I() {
  game.settings.register(g, m.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  });
}
function R() {
  try {
    return !!game.settings.get(g, m.debug);
  } catch {
    return !1;
  }
}
function s(t) {
  return `${l} | ${t}`;
}
const a = {
  debug(t, ...e) {
    R() && console.debug(s(t), ...e);
  },
  info(t, ...e) {
    console.info(s(t), ...e);
  },
  warn(t, ...e) {
    console.warn(s(t), ...e);
  },
  error(t, ...e) {
    console.error(s(t), ...e);
  }
}, P = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A"
};
function p() {
  const t = b.filter((e) => !game.modules.get(e)?.active);
  if (t.length > 0) {
    const e = t.map((r) => P[r] ?? r).join(", ");
    return ui.notifications.error(`${l} requer os módulos ativos: ${e}.`), a.error("Missing required modules", t), !1;
  }
  return game.system.id !== d && (ui.notifications.warn(`${l} foi feito para o sistema Ordem Paranormal.`), a.warn("Unexpected system", { current: game.system.id, expected: d })), !0;
}
const u = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function y(t, e = null) {
  const r = t.event?.area ?? e, n = r?.type ?? r?.areaType ?? null;
  return {
    castId: t.castId ?? null,
    toolkitPresetId: t.automation?.presetId ?? null,
    form: t.ritual?.form ?? null,
    areaType: n,
    area: r ?? null,
    fxEligible: t.automation?.fxEligible === !0,
    sourcePayload: t
  };
}
function F() {
  const t = globalThis.Sequence;
  return typeof t == "function" ? t : null;
}
class k {
  async playRitualPreset(e, r) {
    const n = F();
    if (!n) {
      a.warn("Sequencer API is not available at runtime.");
      return;
    }
    if (!e.effectPath) {
      a.warn("Ritual FX preset has no effect path configured yet.", e.id);
      return;
    }
    const i = new n({ moduleName: "paranormal-fx" }), c = i.effect().name(e.id).file(e.effectPath), f = S(r);
    f && c.atLocation(f), e.scale && c.scale(e.scale), await i.play(), a.debug("Played ritual FX preset", { preset: e.id, context: r });
  }
}
function S(t) {
  const e = t.sourcePayload.event?.targets;
  return Array.isArray(e) && e.length > 0 ? e[0] : null;
}
class D {
  #e = /* @__PURE__ */ new Map();
  register(e) {
    this.#e.set(e.id, e);
  }
  registerMany(e) {
    for (const r of e) this.register(r);
  }
  findMatchingPreset(e) {
    for (const r of this.#e.values())
      if (E(r, e))
        return r;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function E(t, e) {
  return !(t.match.toolkitPresetId !== e.toolkitPresetId || t.match.form && t.match.form !== e.form || t.match.areaType && t.match.areaType !== e.areaType);
}
const h = new D();
class T {
  constructor(e = new k()) {
    this.sequencerAdapter = e;
  }
  sequencerAdapter;
  async handleRitualFinished(e) {
    if (!e.fxEligible) {
      a.debug("Ignoring ritual because payload is not FX eligible", e);
      return;
    }
    if (!e.toolkitPresetId) {
      a.debug("Ignoring ritual without toolkit preset id", e);
      return;
    }
    const r = h.findMatchingPreset(e);
    if (!r) {
      a.debug("No Ritual FX preset matched this ritual context", e);
      return;
    }
    await this.sequencerAdapter.playRitualPreset(r, e);
  }
}
const o = /* @__PURE__ */ new Map();
function q(t = new T()) {
  Hooks.on(u.ritualCastStarted, (e) => {
    e.castId && o.delete(e.castId), a.debug("Ritual cast started", e);
  }), Hooks.on(u.ritualAreaResolved, (e) => {
    e.castId && e.event?.area && o.set(e.castId, e.event.area), a.debug("Ritual area resolved", e);
  }), Hooks.on(u.ritualCastFinished, (e) => {
    const r = e.castId ? o.get(e.castId) ?? null : null, n = y(e, r);
    t.handleRitualFinished(n).catch((i) => {
      a.error("Failed to play ritual FX", i, n);
    }), e.castId && o.delete(e.castId);
  }), a.info("Ritual FX listeners registered.");
}
function v() {
  return [];
}
Hooks.once("init", () => {
  I(), h.registerMany(v()), a.info("Initialized.");
});
Hooks.once("ready", () => {
  p() && (q(), a.info(`${l} ready.`));
});
//# sourceMappingURL=main.js.map
