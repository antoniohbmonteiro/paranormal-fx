const p = "paranormal-fx", d = "Paranormal FX", x = "ordemparanormal", E = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], F = {
  debug: "debug"
};
function S() {
  game.settings.register(p, F.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  });
}
function A() {
  try {
    return !!game.settings.get(p, F.debug);
  } catch {
    return !1;
  }
}
function c(t) {
  return `${d} | ${t}`;
}
const s = {
  debug(t, ...e) {
    A() && console.debug(c(t), ...e);
  },
  info(t, ...e) {
    console.info(c(t), ...e);
  },
  warn(t, ...e) {
    console.warn(c(t), ...e);
  },
  error(t, ...e) {
    console.error(c(t), ...e);
  }
}, M = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A"
};
function w() {
  const t = E.filter((e) => !game.modules.get(e)?.active);
  if (t.length > 0) {
    const e = t.map((n) => M[n] ?? n).join(", ");
    return ui.notifications.error(`${d} requer os módulos ativos: ${e}.`), s.error("Missing required modules", t), !1;
  }
  return game.system.id !== x && (ui.notifications.warn(`${d} foi feito para o sistema Ordem Paranormal.`), s.warn("Unexpected system", { current: game.system.id, expected: x })), !0;
}
const m = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function L(t, e = null) {
  const n = t.area ?? t.event?.area ?? e, r = n?.type ?? n?.areaType ?? null, i = t.targets ?? t.event?.targets ?? n?.targets ?? [];
  return {
    castId: t.castId ?? null,
    toolkitPresetId: t.automation?.presetId ?? null,
    form: t.ritual?.form ?? null,
    areaType: r,
    area: n ?? null,
    targets: Array.isArray(i) ? i : [],
    fxEligible: t.automation?.fxEligible === !0,
    sourcePayload: t
  };
}
function v() {
  const t = globalThis.Sequence;
  return typeof t == "function" ? t : null;
}
class D {
  async playRitualPreset(e, n) {
    const r = v();
    if (!r) {
      s.warn("Sequencer API is not available at runtime.");
      return;
    }
    if (!e.effectPath) {
      s.warn("Ritual FX preset has no effect path configured yet.", e.id);
      return;
    }
    const i = new r({ moduleName: p }), a = i.effect().name(e.id).file(e.effectPath);
    k(a, n), e.scale && a.scale(e.scale), await i.play(), s.debug("Played ritual FX preset", { preset: e.id, placement: n });
  }
}
function k(t, e) {
  if (e.type === "line") {
    t.atLocation(e.start).stretchTo(e.end);
    return;
  }
  t.atLocation(e.location);
}
function q(t) {
  return t?.type ?? t?.areaType ?? null;
}
function _(t, e) {
  return t.placementMode === "rectangleRayLine" ? O(e.area) : U(e);
}
function O(t) {
  if (!t || q(t) !== "rectangleRay") return null;
  const e = X(t);
  if (e) return e;
  const n = C(t);
  if (n) return n;
  const r = N(t);
  return r || B(t);
}
function X(t) {
  const e = y(t.ray?.start), n = y(t.ray?.end);
  return !e || !n || H(e, n) ? null : { type: "line", start: e, end: n };
}
function C(t) {
  const e = t.shape;
  if (!e) return null;
  const n = l(e.x), r = l(e.y), i = g(e.width ?? t.length), a = l(e.height ?? t.width) ?? 0, u = l(e.direction ?? t.rotation) ?? 0;
  if (n === null || r === null || i === null) return null;
  const o = I(u), R = {
    x: Math.cos(o),
    y: Math.sin(o)
  }, b = {
    x: -Math.sin(o),
    y: Math.cos(o)
  }, P = a / 2, h = {
    x: n + b.x * P,
    y: r + b.y * P
  };
  return {
    type: "line",
    start: h,
    end: {
      x: h.x + R.x * i,
      y: h.y + R.y * i
    }
  };
}
function N(t) {
  const e = y(t.center), n = g(t.shape?.width ?? t.length), r = l(t.shape?.direction ?? t.rotation) ?? 0;
  if (!e || n === null) return null;
  const i = I(r), a = n / 2, u = Math.cos(i) * a, o = Math.sin(i) * a;
  return {
    type: "line",
    start: {
      x: e.x - u,
      y: e.y - o
    },
    end: {
      x: e.x + u,
      y: e.y + o
    }
  };
}
function B(t) {
  const e = t.bounds;
  if (!e) return null;
  const n = l(e.x), r = l(e.y), i = g(e.width), a = g(e.height);
  if (n === null || r === null || i === null || a === null) return null;
  if (i >= a) {
    const o = r + a / 2;
    return {
      type: "line",
      start: { x: n, y: o },
      end: { x: n + i, y: o }
    };
  }
  const u = n + i / 2;
  return {
    type: "line",
    start: { x: u, y: r },
    end: { x: u, y: r + a }
  };
}
function U(t) {
  const e = t.targets[0];
  return e ? {
    type: "point",
    location: e
  } : null;
}
function y(t) {
  const e = l(t?.x), n = l(t?.y);
  return e === null || n === null ? null : { x: e, y: n };
}
function l(t) {
  return typeof t == "number" && Number.isFinite(t) ? t : null;
}
function g(t) {
  const e = l(t);
  return e !== null && e > 0 ? e : null;
}
function I(t) {
  return t * Math.PI / 180;
}
function H(t, e) {
  return t.x === e.x && t.y === e.y;
}
class $ {
  #e = /* @__PURE__ */ new Map();
  register(e) {
    this.#e.set(e.id, e);
  }
  registerMany(e) {
    for (const n of e) this.register(n);
  }
  findMatchingPreset(e) {
    for (const n of this.#e.values())
      if (z(n, e))
        return n;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function z(t, e) {
  return !(t.match.toolkitPresetId !== e.toolkitPresetId || t.match.form && t.match.form !== e.form || t.match.areaType && t.match.areaType !== e.areaType);
}
const T = new $();
class G {
  constructor(e = new D()) {
    this.sequencerAdapter = e;
  }
  sequencerAdapter;
  async handleRitualFinished(e) {
    if (!e.fxEligible) {
      s.debug("Ignoring ritual because payload is not FX eligible", e);
      return;
    }
    if (!e.toolkitPresetId) {
      s.debug("Ignoring ritual without toolkit preset id", e);
      return;
    }
    const n = T.findMatchingPreset(e);
    if (!n) {
      s.debug("No Ritual FX preset matched this ritual context", e);
      return;
    }
    const r = _(n, e);
    if (!r) {
      s.debug("No Ritual FX placement could be resolved", { preset: n, context: e });
      return;
    }
    s.debug("Resolved ritual FX placement", { preset: n.id, placement: r, context: e }), await this.sequencerAdapter.playRitualPreset(n, r);
  }
}
const f = /* @__PURE__ */ new Map();
function J(t = new G()) {
  Hooks.on(m.ritualCastStarted, (e) => {
    e.castId && f.delete(e.castId), s.debug("Ritual cast started", e);
  }), Hooks.on(m.ritualAreaResolved, (e) => {
    const n = e.area ?? e.event?.area;
    e.castId && n && f.set(e.castId, n), s.debug("Ritual area resolved", e);
  }), Hooks.on(m.ritualCastFinished, (e) => {
    const n = e.castId ? f.get(e.castId) ?? null : null, r = L(e, n);
    t.handleRitualFinished(r).catch((i) => {
      s.error("Failed to play ritual FX", i, r);
    }), e.castId && f.delete(e.castId);
  }), s.info("Ritual FX listeners registered.");
}
const V = "jb2a.chain_lightning.primary.blue.60ft";
function Y(t = V) {
  return {
    id: "ritual.eletrocussao.student.rectangleRay",
    label: "Eletrocussão Discente - Linha",
    match: {
      toolkitPresetId: "ritual.eletrocussao",
      form: "student",
      areaType: "rectangleRay"
    },
    effectPath: t,
    placementMode: "rectangleRayLine"
  };
}
function j() {
  return [Y()];
}
Hooks.once("init", () => {
  S(), T.registerMany(j()), s.info("Initialized.");
});
Hooks.once("ready", () => {
  w() && (J(), s.info(`${d} ready.`));
});
//# sourceMappingURL=main.js.map
