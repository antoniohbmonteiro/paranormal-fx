const F = "paranormal-fx", I = "Paranormal FX", w = "ordemparanormal", _ = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], M = {
  debug: "debug"
};
function X() {
  game.settings.register(F, M.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  });
}
function C() {
  try {
    return !!game.settings.get(F, M.debug);
  } catch {
    return !1;
  }
}
function b(e) {
  return `${I} | ${e}`;
}
const s = {
  debug(e, ...t) {
    C() && console.debug(b(e), ...t);
  },
  info(e, ...t) {
    console.info(b(e), ...t);
  },
  warn(e, ...t) {
    console.warn(b(e), ...t);
  },
  error(e, ...t) {
    console.error(b(e), ...t);
  }
}, O = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A"
};
function N() {
  const e = _.filter((t) => !game.modules.get(t)?.active);
  if (e.length > 0) {
    const t = e.map((n) => O[n] ?? n).join(", ");
    return ui.notifications.error(`${I} requer os módulos ativos: ${t}.`), s.error("Missing required modules", e), !1;
  }
  return game.system.id !== w && (ui.notifications.warn(`${I} foi feito para o sistema Ordem Paranormal.`), s.warn("Unexpected system", { current: game.system.id, expected: w })), !0;
}
const T = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function H(e, t = null) {
  const n = e.area ?? e.event?.area ?? t, r = n?.type ?? n?.areaType ?? null, i = e.targets ?? e.event?.targets ?? n?.targets ?? [];
  return {
    castId: e.castId ?? null,
    toolkitPresetId: e.automation?.presetId ?? null,
    form: e.ritual?.form ?? null,
    areaType: r,
    area: n ?? null,
    targets: Array.isArray(i) ? i : [],
    fxEligible: e.automation?.fxEligible === !0,
    sourcePayload: e
  };
}
function L(e) {
  return e?.type ?? e?.areaType ?? null;
}
function u(e) {
  return e ? {
    type: L(e),
    sceneId: v(e.sceneId),
    regionId: v(e.regionId),
    gridSize: o(e.gridSize),
    bounds: e.bounds ?? null,
    shape: e.shape ?? null,
    center: e.center ?? null,
    ray: e.ray ?? null,
    areaRotation: e.rotation ?? null,
    areaLength: e.length ?? null,
    areaWidth: e.width ?? null,
    shapeDirection: e.shape?.direction ?? null,
    shapeWidth: e.shape?.width ?? null,
    shapeHeight: e.shape?.height ?? null,
    shapeX: e.shape?.x ?? null,
    shapeY: e.shape?.y ?? null
  } : null;
}
function m(e) {
  if (!e) return null;
  if (e.type === "point")
    return {
      type: e.type,
      location: e.location,
      diagnostics: e.diagnostics ?? null
    };
  const t = f(e.start, e.end);
  return {
    type: e.type,
    start: e.start,
    end: e.end,
    delta: t,
    distance: x(t),
    angleDegrees: A(t),
    diagnostics: e.diagnostics ?? null
  };
}
function z(e, t) {
  return e.placementMode === "rectangleRayLine" ? B(t.area) : G(t);
}
function B(e) {
  if (!e || L(e) !== "rectangleRay") return null;
  const t = U(e);
  if (t) return t;
  const n = $(e);
  if (n) return n;
  const r = V(e);
  return r || Y(e);
}
function U(e) {
  const t = E(e.ray?.start), n = E(e.ray?.end);
  return !t || !n || W(t, n) ? null : p("explicitRay", e, t, n);
}
function $(e) {
  const t = e.shape;
  if (!t) return null;
  const n = o(t.x), r = o(t.y), i = R(t.width ?? e.length), a = o(t.height ?? e.width) ?? 0, g = o(t.direction ?? e.rotation) ?? 0;
  if (n === null || r === null || i === null) return null;
  const l = k(g), c = {
    x: Math.cos(l),
    y: Math.sin(l)
  }, d = {
    x: -Math.sin(l),
    y: Math.cos(l)
  }, D = a / 2, h = {
    x: n + d.x * D,
    y: r + d.y * D
  }, y = {
    x: h.x + c.x * i,
    y: h.y + c.y * i
  };
  return {
    ...p("rectangleShape", e, h, y),
    diagnostics: {
      strategy: "rectangleShape",
      area: u(e),
      resolved: {
        start: h,
        end: y,
        delta: f(h, y),
        distance: x(f(h, y)),
        angleDegrees: A(f(h, y)),
        length: i,
        width: a,
        directionDegrees: g,
        directionRadians: l,
        lengthVector: c,
        perpendicularVector: d
      }
    }
  };
}
function V(e) {
  const t = E(e.center), n = R(e.shape?.width ?? e.length), r = o(e.shape?.direction ?? e.rotation) ?? 0;
  if (!t || n === null) return null;
  const i = k(r), a = n / 2, g = Math.cos(i) * a, l = Math.sin(i) * a, c = {
    x: t.x - g,
    y: t.y - l
  }, d = {
    x: t.x + g,
    y: t.y + l
  };
  return {
    ...p("centerAndShape", e, c, d),
    diagnostics: {
      strategy: "centerAndShape",
      area: u(e),
      resolved: {
        start: c,
        end: d,
        delta: f(c, d),
        distance: x(f(c, d)),
        angleDegrees: A(f(c, d)),
        length: n,
        directionDegrees: r,
        directionRadians: i
      }
    }
  };
}
function Y(e) {
  const t = e.bounds;
  if (!t) return null;
  const n = o(t.x), r = o(t.y), i = R(t.width), a = R(t.height);
  if (n === null || r === null || i === null || a === null) return null;
  if (i >= a) {
    const l = r + a / 2;
    return p("bounds", e, { x: n, y: l }, { x: n + i, y: l });
  }
  const g = n + i / 2;
  return p("bounds", e, { x: g, y: r }, { x: g, y: r + a });
}
function G(e) {
  const t = e.targets[0];
  return t ? {
    type: "point",
    location: t,
    diagnostics: {
      strategy: "firstTarget",
      area: u(e.area)
    }
  } : null;
}
function p(e, t, n, r) {
  const i = f(n, r);
  return {
    type: "line",
    start: n,
    end: r,
    diagnostics: {
      strategy: e,
      area: u(t),
      resolved: {
        start: n,
        end: r,
        delta: i,
        distance: x(i),
        angleDegrees: A(i)
      }
    }
  };
}
function E(e) {
  const t = o(e?.x), n = o(e?.y);
  return t === null || n === null ? null : { x: t, y: n };
}
function v(e) {
  if (typeof e != "string") return null;
  const t = e.trim();
  return t.length > 0 ? t : null;
}
function f(e, t) {
  return {
    x: t.x - e.x,
    y: t.y - e.y
  };
}
function x(e) {
  return Math.hypot(e.x, e.y);
}
function A(e) {
  return J(Math.atan2(e.y, e.x));
}
function o(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function R(e) {
  const t = o(e);
  return t !== null && t > 0 ? t : null;
}
function k(e) {
  return e * Math.PI / 180;
}
function J(e) {
  return e * 180 / Math.PI;
}
function W(e, t) {
  return e.x === t.x && e.y === t.y;
}
function j() {
  const e = globalThis.Sequence;
  return typeof e == "function" ? e : null;
}
class K {
  async playRitualPreset(t, n) {
    const r = j();
    if (!r) {
      s.warn("Sequencer API is not available at runtime.");
      return;
    }
    if (!t.effectPath) {
      s.warn("Ritual FX preset has no effect path configured yet.", t.id);
      return;
    }
    s.debug("Preparing Sequencer ritual FX", {
      preset: t.id,
      effectPath: t.effectPath,
      placement: m(n)
    });
    const i = new r({ moduleName: F }), a = i.effect().name(t.id).file(t.effectPath);
    Q(a, n), t.scale && a.scale(t.scale), await i.play(), s.debug("Played ritual FX preset", {
      preset: t.id,
      effectPath: t.effectPath,
      placement: m(n)
    });
  }
}
function Q(e, t) {
  if (t.type === "line") {
    s.debug("Applying Sequencer line placement", m(t)), e.atLocation(t.start).stretchTo(t.end);
    return;
  }
  s.debug("Applying Sequencer point placement", m(t)), e.atLocation(t.location);
}
class Z {
  #e = /* @__PURE__ */ new Map();
  register(t) {
    this.#e.set(t.id, t);
  }
  registerMany(t) {
    for (const n of t) this.register(n);
  }
  findMatchingPreset(t) {
    for (const n of this.#e.values())
      if (ee(n, t))
        return n;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function ee(e, t) {
  return !(e.match.toolkitPresetId !== t.toolkitPresetId || e.match.form && e.match.form !== t.form || e.match.areaType && e.match.areaType !== t.areaType);
}
const q = new Z();
class te {
  constructor(t = new K()) {
    this.sequencerAdapter = t;
  }
  sequencerAdapter;
  async handleRitualFinished(t) {
    if (s.debug("Handling ritual FX context", {
      castId: t.castId,
      toolkitPresetId: t.toolkitPresetId,
      form: t.form,
      areaType: t.areaType,
      fxEligible: t.fxEligible,
      targetCount: t.targets.length,
      area: u(t.area)
    }), !t.fxEligible) {
      s.debug("Ignoring ritual because payload is not FX eligible", t);
      return;
    }
    if (!t.toolkitPresetId) {
      s.debug("Ignoring ritual without toolkit preset id", t);
      return;
    }
    const n = q.findMatchingPreset(t);
    if (!n) {
      s.debug("No Ritual FX preset matched this ritual context", t);
      return;
    }
    s.debug("Matched Ritual FX preset", {
      preset: n,
      area: u(t.area)
    });
    const r = z(n, t);
    if (!r) {
      s.debug("No Ritual FX placement could be resolved", {
        preset: n,
        area: u(t.area),
        context: t
      });
      return;
    }
    s.debug("Resolved ritual FX placement", {
      preset: n.id,
      placement: m(r),
      rawPlacement: r
    }), await this.sequencerAdapter.playRitualPreset(n, r);
  }
}
const P = /* @__PURE__ */ new Map();
function ne(e = new te()) {
  Hooks.on(T.ritualCastStarted, (t) => {
    t.castId && P.delete(t.castId), s.debug("Ritual cast started", S(t));
  }), Hooks.on(T.ritualAreaResolved, (t) => {
    const n = t.area ?? t.event?.area;
    t.castId && n && P.set(t.castId, n), s.debug("Ritual area resolved", {
      lifecycle: S(t),
      area: u(n ?? null),
      rawArea: n ?? null,
      rawPayload: t
    });
  }), Hooks.on(T.ritualCastFinished, (t) => {
    const n = t.castId ? P.get(t.castId) ?? null : null, r = H(t, n);
    s.debug("Ritual cast finished", {
      lifecycle: S(t),
      cachedArea: u(n),
      normalizedArea: u(r.area),
      normalizedContext: {
        castId: r.castId,
        toolkitPresetId: r.toolkitPresetId,
        form: r.form,
        areaType: r.areaType,
        targetCount: r.targets.length,
        fxEligible: r.fxEligible
      },
      rawPayload: t
    }), e.handleRitualFinished(r).catch((i) => {
      s.error("Failed to play ritual FX", i, r);
    }), t.castId && P.delete(t.castId);
  }), s.info("Ritual FX listeners registered.");
}
function S(e) {
  return {
    version: e.version ?? null,
    type: e.type ?? null,
    castId: e.castId ?? null,
    sceneId: e.sceneId ?? null,
    automationType: e.automation?.type ?? null,
    presetId: e.automation?.presetId ?? null,
    presetVersion: e.automation?.presetVersion ?? null,
    fxEligible: e.automation?.fxEligible ?? null,
    ritualForm: e.ritual?.form ?? null,
    targetCount: Array.isArray(e.targets) ? e.targets.length : Array.isArray(e.event?.targets) ? e.event.targets.length : null
  };
}
const re = "jb2a.chain_lightning.primary.blue.60ft";
function ie(e = re) {
  return {
    id: "ritual.eletrocussao.student.rectangleRay",
    label: "Eletrocussão Discente - Linha",
    match: {
      toolkitPresetId: "ritual.eletrocussao",
      form: "student",
      areaType: "rectangleRay"
    },
    effectPath: e,
    placementMode: "rectangleRayLine"
  };
}
function se() {
  return [ie()];
}
Hooks.once("init", () => {
  X(), q.registerMany(se()), s.info("Initialized.");
});
Hooks.once("ready", () => {
  N() && (ne(), s.info(`${I} ready.`));
});
//# sourceMappingURL=main.js.map
