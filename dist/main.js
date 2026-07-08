const D = "paranormal-fx", k = "Paranormal FX", C = "ordemparanormal", U = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], q = {
  debug: "debug"
};
function V() {
  game.settings.register(D, q.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  });
}
function $() {
  try {
    return !!game.settings.get(D, q.debug);
  } catch {
    return !1;
  }
}
function E(e) {
  return `${k} | ${e}`;
}
const u = {
  debug(e, ...t) {
    $() && console.debug(E(e), ...t);
  },
  info(e, ...t) {
    console.info(E(e), ...t);
  },
  warn(e, ...t) {
    console.warn(E(e), ...t);
  },
  error(e, ...t) {
    console.error(E(e), ...t);
  }
}, Y = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A"
};
function j() {
  const e = U.filter((t) => !game.modules.get(t)?.active);
  if (e.length > 0) {
    const t = e.map((n) => Y[n] ?? n).join(", ");
    return ui.notifications.error(`${k} requer os módulos ativos: ${t}.`), u.error("Missing required modules", e), !1;
  }
  return game.system.id !== C && (ui.notifications.warn(`${k} foi feito para o sistema Ordem Paranormal.`), u.warn("Unexpected system", { current: game.system.id, expected: C })), !0;
}
const F = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function W(e, t = null) {
  const n = e.area ?? e.event?.area ?? t, r = n?.type ?? n?.areaType ?? null, s = e.targets ?? e.event?.targets ?? n?.targets ?? [];
  return {
    castId: e.castId ?? null,
    toolkitPresetId: e.automation?.presetId ?? null,
    form: e.ritual?.form ?? null,
    areaType: r,
    area: n ?? null,
    targets: Array.isArray(s) ? s : [],
    fxEligible: e.automation?.fxEligible === !0,
    sourcePayload: e
  };
}
function B(e) {
  return e?.type ?? e?.areaType ?? null;
}
function h(e) {
  return e ? {
    type: B(e),
    sceneId: y(e.sceneId),
    regionId: y(e.regionId),
    gridSize: c(e.gridSize),
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
function J(e) {
  if (!e) return null;
  if (e.type === "point")
    return {
      type: e.type,
      location: e.location,
      diagnostics: e.diagnostics ?? null
    };
  if (e.type === "lineGroup")
    return {
      type: e.type,
      staggerMs: e.staggerMs ?? 0,
      lines: e.lines.map((n) => {
        const r = m(n.start, n.end);
        return {
          start: n.start,
          end: n.end,
          delta: r,
          distance: I(r),
          angleDegrees: p(r),
          targetTokenId: n.targetTokenId ?? null,
          targetTokenName: n.targetTokenName ?? null
        };
      }),
      diagnostics: e.diagnostics ?? null
    };
  const t = m(e.start, e.end);
  return {
    type: e.type,
    start: e.start,
    end: e.end,
    delta: t,
    distance: I(t),
    angleDegrees: p(t),
    diagnostics: e.diagnostics ?? null
  };
}
function K(e, t) {
  return e.placementMode === "rectangleRayLine" ? Q(t.area) : e.placementMode === "sourceToTargetLine" ? re(t) : e.placementMode === "sourceToEachTargetLine" ? se(t, e.staggerMs ?? 500) : ie(t);
}
function Q(e) {
  if (!e || B(e) !== "rectangleRay") return null;
  const t = Z(e);
  if (t) return t;
  const n = ee(e);
  if (n) return n;
  const r = te(e);
  return r || ne(e);
}
function Z(e) {
  const t = v(e.ray?.start), n = v(e.ray?.end);
  return !t || !n || _(t, n) ? null : R("explicitRay", e, t, n);
}
function ee(e) {
  const t = e.shape;
  if (!t) return null;
  const n = c(t.x), r = c(t.y), s = f(t.width ?? e.length), i = c(t.height ?? e.width) ?? 0, o = c(t.direction ?? e.rotation) ?? 0;
  if (n === null || r === null || s === null) return null;
  const a = z(o), d = {
    x: Math.cos(a),
    y: Math.sin(a)
  }, g = {
    x: -Math.sin(a),
    y: Math.cos(a)
  }, T = i / 2, b = {
    x: n + g.x * T,
    y: r + g.y * T
  }, P = {
    x: b.x + d.x * s,
    y: b.y + d.y * s
  };
  return {
    ...R("rectangleShape", e, b, P),
    diagnostics: {
      strategy: "rectangleShape",
      area: h(e),
      resolved: {
        start: b,
        end: P,
        delta: m(b, P),
        distance: I(m(b, P)),
        angleDegrees: p(m(b, P)),
        length: s,
        width: i,
        directionDegrees: o,
        directionRadians: a,
        lengthVector: d,
        perpendicularVector: g
      }
    }
  };
}
function te(e) {
  const t = v(e.center), n = f(e.shape?.width ?? e.length), r = c(e.shape?.direction ?? e.rotation) ?? 0;
  if (!t || n === null) return null;
  const s = z(r), i = n / 2, o = Math.cos(s) * i, a = Math.sin(s) * i, d = {
    x: t.x - o,
    y: t.y - a
  }, g = {
    x: t.x + o,
    y: t.y + a
  };
  return {
    ...R("centerAndShape", e, d, g),
    diagnostics: {
      strategy: "centerAndShape",
      area: h(e),
      resolved: {
        start: d,
        end: g,
        delta: m(d, g),
        distance: I(m(d, g)),
        angleDegrees: p(m(d, g)),
        length: n,
        directionDegrees: r,
        directionRadians: s
      }
    }
  };
}
function ne(e) {
  const t = e.bounds;
  if (!t) return null;
  const n = c(t.x), r = c(t.y), s = f(t.width), i = f(t.height);
  if (n === null || r === null || s === null || i === null) return null;
  if (s >= i) {
    const a = r + i / 2;
    return R("bounds", e, { x: n, y: a }, { x: n + s, y: a });
  }
  const o = n + s / 2;
  return R("bounds", e, { x: o, y: r }, { x: o, y: r + i });
}
function re(e) {
  const t = M(l(e.sourcePayload, "caster.token")), n = M(e.targets[0]);
  if (!t?.tokenId || !n?.tokenId) return null;
  const r = S(t), s = S(n);
  if (!r || !s) return null;
  const i = X(r, s.center), o = s.center;
  if (_(i, o)) return null;
  const a = m(i, o);
  return {
    type: "line",
    start: i,
    end: o,
    diagnostics: {
      strategy: "sourceToTarget",
      area: h(e.area),
      resolved: {
        start: i,
        end: o,
        delta: a,
        distance: I(a),
        angleDegrees: p(a),
        sourceTokenId: r.tokenId,
        targetTokenId: s.tokenId,
        sourceTokenName: r.name,
        targetTokenName: s.name,
        sourceCenter: r.center,
        targetCenter: s.center,
        sourceBounds: r.bounds,
        targetBounds: s.bounds,
        startOffset: I(m(r.center, i))
      }
    }
  };
}
function se(e, t) {
  const n = M(l(e.sourcePayload, "caster.token"));
  if (!n?.tokenId) return null;
  const r = S(n);
  if (!r) return null;
  const s = /* @__PURE__ */ new Set(), i = [];
  for (const o of e.targets) {
    const a = M(o);
    if (!a?.tokenId || s.has(a.tokenId)) continue;
    const d = S(a);
    if (!d) continue;
    const g = X(r, d.center), T = d.center;
    _(g, T) || (s.add(a.tokenId), i.push({
      start: g,
      end: T,
      targetTokenId: d.tokenId,
      targetTokenName: d.name
    }));
  }
  return i.length === 0 ? null : {
    type: "lineGroup",
    lines: i,
    staggerMs: t,
    diagnostics: {
      strategy: "sourceToTargets",
      area: h(e.area),
      resolved: {
        sourceTokenId: r.tokenId,
        sourceTokenName: r.name,
        sourceCenter: r.center,
        sourceBounds: r.bounds
      }
    }
  };
}
function ie(e) {
  const t = e.targets[0];
  return t ? {
    type: "point",
    location: t,
    diagnostics: {
      strategy: "firstTarget",
      area: h(e.area)
    }
  } : null;
}
function R(e, t, n, r) {
  const s = m(n, r);
  return {
    type: "line",
    start: n,
    end: r,
    diagnostics: {
      strategy: e,
      area: h(t),
      resolved: {
        start: n,
        end: r,
        delta: s,
        distance: I(s),
        angleDegrees: p(s)
      }
    }
  };
}
function S(e) {
  const t = oe(e);
  if (!t) return null;
  const n = N(t, "center") ?? N(t, "document.center"), r = ae(t, n), s = n ?? (r ? ue(r) : null);
  return !s || !r ? null : {
    tokenId: e.tokenId,
    name: e.name ?? A(t, "name") ?? A(t, "document.name"),
    center: s,
    bounds: r
  };
}
function oe(e) {
  const t = G(), n = e.tokenId;
  if (!t || !n) return null;
  const r = y(t.scene?.id);
  if (e.sceneId && r && e.sceneId !== r) return null;
  const s = t.tokens?.get?.(n);
  return s || (t.tokens?.placeables?.find((i) => A(i, "id") === n || A(i, "document.id") === n) ?? null);
}
function ae(e, t) {
  const n = le(l(e, "bounds"));
  if (n) return n;
  const r = f(G()?.grid?.size) ?? 100, s = f(l(e, "w")) ?? f(l(e, "width")) ?? O(l(e, "document.width"), r) ?? r, i = f(l(e, "h")) ?? f(l(e, "height")) ?? O(l(e, "document.height"), r) ?? r, o = c(l(e, "x")) ?? c(l(e, "document.x")), a = c(l(e, "y")) ?? c(l(e, "document.y"));
  return o !== null && a !== null ? { x: o, y: a, width: s, height: i } : t ? {
    x: t.x - s / 2,
    y: t.y - i / 2,
    width: s,
    height: i
  } : null;
}
function X(e, t) {
  const n = m(e.center, t), r = I(n);
  if (r <= 0) return e.center;
  const s = {
    x: n.x / r,
    y: n.y / r
  }, i = Math.max(0, e.bounds.width / 2), o = Math.max(0, e.bounds.height / 2), a = Math.abs(s.x) > 1e-4 ? i / Math.abs(s.x) : Number.POSITIVE_INFINITY, d = Math.abs(s.y) > 1e-4 ? o / Math.abs(s.y) : Number.POSITIVE_INFINITY, g = Math.min(a, d), T = Number.isFinite(g) ? g : Math.max(i, o, 0);
  return {
    x: e.center.x + s.x * T,
    y: e.center.y + s.y * T
  };
}
function M(e) {
  if (!w(e)) return null;
  const t = y(e.tokenId) ?? y(e.id);
  return t ? {
    tokenId: t,
    actorId: y(e.actorId),
    sceneId: y(e.sceneId),
    name: y(e.name)
  } : null;
}
function v(e) {
  const t = c(e?.x), n = c(e?.y);
  return t === null || n === null ? null : { x: t, y: n };
}
function N(e, t) {
  const n = l(e, t), r = c(l(n, "x")), s = c(l(n, "y"));
  return r === null || s === null ? null : { x: r, y: s };
}
function le(e) {
  const t = c(l(e, "x")), n = c(l(e, "y")), r = f(l(e, "width")), s = f(l(e, "height"));
  return t === null || n === null || r === null || s === null ? null : { x: t, y: n, width: r, height: s };
}
function ue(e) {
  return {
    x: e.x + e.width / 2,
    y: e.y + e.height / 2
  };
}
function y(e) {
  if (typeof e != "string") return null;
  const t = e.trim();
  return t.length > 0 ? t : null;
}
function m(e, t) {
  return {
    x: t.x - e.x,
    y: t.y - e.y
  };
}
function I(e) {
  return Math.hypot(e.x, e.y);
}
function p(e) {
  return ce(Math.atan2(e.y, e.x));
}
function c(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function f(e) {
  const t = c(e);
  return t !== null && t > 0 ? t : null;
}
function O(e, t) {
  const n = f(e);
  return n !== null ? n * t : null;
}
function z(e) {
  return e * Math.PI / 180;
}
function ce(e) {
  return e * 180 / Math.PI;
}
function _(e, t) {
  return e.x === t.x && e.y === t.y;
}
function A(e, t) {
  return y(l(e, t));
}
function l(e, t) {
  if (!w(e)) return;
  let n = e;
  for (const r of t.split(".")) {
    if (!w(n)) return;
    n = n[r];
  }
  return n;
}
function G() {
  const e = globalThis.canvas;
  return w(e) ? e : null;
}
function w(e) {
  return !!(e && typeof e == "object");
}
function de() {
  const e = globalThis.Sequence;
  return typeof e == "function" ? e : null;
}
class ge {
  async playRitualPreset(t, n) {
    const r = de();
    if (!r) {
      u.warn("Sequencer API is not available at runtime.");
      return;
    }
    if (!t.effectPath) {
      u.warn("Ritual FX preset has no effect path configured yet.", t.id);
      return;
    }
    if (n.type === "lineGroup") {
      await this.playLineGroupPreset(r, t, n), u.debug("Played ritual FX preset", { preset: t.id, placement: n });
      return;
    }
    await this.playSinglePreset(r, t, n), u.debug("Played ritual FX preset", { preset: t.id, placement: n });
  }
  async playLineGroupPreset(t, n, r) {
    const s = Math.max(0, r.staggerMs ?? n.staggerMs ?? 0);
    for (const [i, o] of r.lines.entries()) {
      const a = {
        type: "line",
        start: o.start,
        end: o.end
      };
      this.playSinglePreset(t, n, a, `${n.id}.${i}`), i < r.lines.length - 1 && s > 0 && await he(s);
    }
  }
  async playSinglePreset(t, n, r, s = n.id) {
    const i = new t({ moduleName: D }), o = i.effect().name(s).file(n.effectPath);
    fe(o, r), n.scale && o.scale(n.scale), await i.play();
  }
}
function fe(e, t) {
  if (t.type === "line") {
    e.atLocation(t.start).stretchTo(t.end);
    return;
  }
  e.atLocation(t.location);
}
function he(e) {
  return new Promise((t) => setTimeout(t, e));
}
class me {
  #e = /* @__PURE__ */ new Map();
  register(t) {
    this.#e.set(t.id, t);
  }
  registerMany(t) {
    for (const n of t) this.register(n);
  }
  findMatchingPreset(t) {
    for (const n of this.#e.values())
      if (ye(n, t))
        return n;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function ye(e, t) {
  return !(e.match.toolkitPresetId !== t.toolkitPresetId || e.match.form && e.match.form !== t.form || e.match.areaType && e.match.areaType !== t.areaType);
}
const H = new me();
class Te {
  constructor(t = new ge()) {
    this.sequencerAdapter = t;
  }
  sequencerAdapter;
  async handleRitualFinished(t) {
    if (u.debug("Handling ritual FX context", {
      castId: t.castId,
      toolkitPresetId: t.toolkitPresetId,
      form: t.form,
      areaType: t.areaType,
      fxEligible: t.fxEligible,
      targetCount: t.targets.length,
      area: h(t.area)
    }), !t.fxEligible) {
      u.debug("Ignoring ritual because payload is not FX eligible", t);
      return;
    }
    if (!t.toolkitPresetId) {
      u.debug("Ignoring ritual without toolkit preset id", t);
      return;
    }
    const n = H.findMatchingPreset(t);
    if (!n) {
      u.debug("No Ritual FX preset matched this ritual context", t);
      return;
    }
    u.debug("Matched Ritual FX preset", {
      preset: n,
      area: h(t.area)
    });
    const r = K(n, t);
    if (!r) {
      u.debug("No Ritual FX placement could be resolved", {
        preset: n,
        area: h(t.area),
        context: t
      });
      return;
    }
    u.debug("Resolved ritual FX placement", {
      preset: n.id,
      placement: J(r),
      rawPlacement: r
    }), await this.sequencerAdapter.playRitualPreset(n, r);
  }
}
const x = /* @__PURE__ */ new Map();
function Ie(e = new Te()) {
  Hooks.on(F.ritualCastStarted, (t) => {
    t.castId && x.delete(t.castId), u.debug("Ritual cast started", L(t));
  }), Hooks.on(F.ritualAreaResolved, (t) => {
    const n = t.area ?? t.event?.area;
    t.castId && n && x.set(t.castId, n), u.debug("Ritual area resolved", {
      lifecycle: L(t),
      area: h(n ?? null),
      rawArea: n ?? null,
      rawPayload: t
    });
  }), Hooks.on(F.ritualCastFinished, (t) => {
    const n = t.castId ? x.get(t.castId) ?? null : null, r = W(t, n);
    u.debug("Ritual cast finished", {
      lifecycle: L(t),
      cachedArea: h(n),
      normalizedArea: h(r.area),
      normalizedContext: {
        castId: r.castId,
        toolkitPresetId: r.toolkitPresetId,
        form: r.form,
        areaType: r.areaType,
        targetCount: r.targets.length,
        fxEligible: r.fxEligible
      },
      rawPayload: t
    }), e.handleRitualFinished(r).catch((s) => {
      u.error("Failed to play ritual FX", s, r);
    }), t.castId && x.delete(t.castId);
  }), u.info("Ritual FX listeners registered.");
}
function L(e) {
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
const be = "jb2a.chain_lightning.primary.blue.60ft", pe = "jb2a.chain_lightning.primary.blue.60ft", Pe = "jb2a.chain_lightning.primary.blue.60ft";
function Re(e = be) {
  return {
    id: "ritual.eletrocussao.standard.singleTarget",
    label: "Eletrocussão Padrão - Alvo",
    match: {
      toolkitPresetId: "ritual.eletrocussao",
      form: "standard"
    },
    effectPath: e,
    placementMode: "sourceToTargetLine"
  };
}
function Ee(e = pe) {
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
function xe(e = Pe) {
  return {
    id: "ritual.eletrocussao.true.multiTarget",
    label: "Eletrocussão Verdadeira - Multi Alvo",
    match: {
      toolkitPresetId: "ritual.eletrocussao",
      form: "true"
    },
    effectPath: e,
    placementMode: "sourceToEachTargetLine",
    staggerMs: 500
  };
}
function ke() {
  return [
    Re(),
    Ee(),
    xe()
  ];
}
Hooks.once("init", () => {
  V(), H.registerMany(ke()), u.info("Initialized.");
});
Hooks.once("ready", () => {
  j() && (Ie(), u.info(`${k} ready.`));
});
//# sourceMappingURL=main.js.map
