const v = "paranormal-fx", A = "Paranormal FX", L = "ordemparanormal", V = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], q = {
  debug: "debug"
};
function G() {
  game.settings.register(v, q.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  });
}
function Y() {
  try {
    return !!game.settings.get(v, q.debug);
  } catch {
    return !1;
  }
}
function S(e) {
  return `${A} | ${e}`;
}
const o = {
  debug(e, ...t) {
    Y() && console.debug(S(e), ...t);
  },
  info(e, ...t) {
    console.info(S(e), ...t);
  },
  warn(e, ...t) {
    console.warn(S(e), ...t);
  },
  error(e, ...t) {
    console.error(S(e), ...t);
  }
}, $ = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A"
};
function j() {
  const e = V.filter((t) => !game.modules.get(t)?.active);
  if (e.length > 0) {
    const t = e.map((n) => $[n] ?? n).join(", ");
    return ui.notifications.error(`${A} requer os módulos ativos: ${t}.`), o.error("Missing required modules", e), !1;
  }
  return game.system.id !== L && (ui.notifications.warn(`${A} foi feito para o sistema Ordem Paranormal.`), o.warn("Unexpected system", { current: game.system.id, expected: L })), !0;
}
const M = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function W(e, t = null) {
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
function X(e) {
  return e?.type ?? e?.areaType ?? null;
}
function h(e) {
  return e ? {
    type: X(e),
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
function P(e) {
  if (!e) return null;
  if (e.type === "point")
    return {
      type: e.type,
      location: e.location,
      diagnostics: e.diagnostics ?? null
    };
  const t = m(e.start, e.end);
  return {
    type: e.type,
    start: e.start,
    end: e.end,
    delta: t,
    distance: b(t),
    angleDegrees: R(t),
    diagnostics: e.diagnostics ?? null
  };
}
function J(e, t) {
  return e.placementMode === "rectangleRayLine" ? K(t.area) : e.placementMode === "sourceToTargetLine" ? ne(t) : re(t);
}
function K(e) {
  if (!e || X(e) !== "rectangleRay") return null;
  const t = Q(e);
  if (t) return t;
  const n = Z(e);
  if (n) return n;
  const r = ee(e);
  return r || te(e);
}
function Q(e) {
  const t = D(e.ray?.start), n = D(e.ray?.end);
  return !t || !n || z(t, n) ? null : x("explicitRay", e, t, n);
}
function Z(e) {
  const t = e.shape;
  if (!t) return null;
  const n = c(t.x), r = c(t.y), i = f(t.width ?? e.length), s = c(t.height ?? e.width) ?? 0, u = c(t.direction ?? e.rotation) ?? 0;
  if (n === null || r === null || i === null) return null;
  const a = B(u), g = {
    x: Math.cos(a),
    y: Math.sin(a)
  }, d = {
    x: -Math.sin(a),
    y: Math.cos(a)
  }, p = s / 2, I = {
    x: n + d.x * p,
    y: r + d.y * p
  }, T = {
    x: I.x + g.x * i,
    y: I.y + g.y * i
  };
  return {
    ...x("rectangleShape", e, I, T),
    diagnostics: {
      strategy: "rectangleShape",
      area: h(e),
      resolved: {
        start: I,
        end: T,
        delta: m(I, T),
        distance: b(m(I, T)),
        angleDegrees: R(m(I, T)),
        length: i,
        width: s,
        directionDegrees: u,
        directionRadians: a,
        lengthVector: g,
        perpendicularVector: d
      }
    }
  };
}
function ee(e) {
  const t = D(e.center), n = f(e.shape?.width ?? e.length), r = c(e.shape?.direction ?? e.rotation) ?? 0;
  if (!t || n === null) return null;
  const i = B(r), s = n / 2, u = Math.cos(i) * s, a = Math.sin(i) * s, g = {
    x: t.x - u,
    y: t.y - a
  }, d = {
    x: t.x + u,
    y: t.y + a
  };
  return {
    ...x("centerAndShape", e, g, d),
    diagnostics: {
      strategy: "centerAndShape",
      area: h(e),
      resolved: {
        start: g,
        end: d,
        delta: m(g, d),
        distance: b(m(g, d)),
        angleDegrees: R(m(g, d)),
        length: n,
        directionDegrees: r,
        directionRadians: i
      }
    }
  };
}
function te(e) {
  const t = e.bounds;
  if (!t) return null;
  const n = c(t.x), r = c(t.y), i = f(t.width), s = f(t.height);
  if (n === null || r === null || i === null || s === null) return null;
  if (i >= s) {
    const a = r + s / 2;
    return x("bounds", e, { x: n, y: a }, { x: n + i, y: a });
  }
  const u = n + i / 2;
  return x("bounds", e, { x: u, y: r }, { x: u, y: r + s });
}
function ne(e) {
  const t = C(l(e.sourcePayload, "caster.token")), n = C(e.targets[0]);
  if (!t?.tokenId || !n?.tokenId) return null;
  const r = _(t), i = _(n);
  if (!r || !i) return null;
  const s = oe(r, i.center), u = i.center;
  if (z(s, u)) return null;
  const a = m(s, u);
  return {
    type: "line",
    start: s,
    end: u,
    diagnostics: {
      strategy: "sourceToTarget",
      area: h(e.area),
      resolved: {
        start: s,
        end: u,
        delta: a,
        distance: b(a),
        angleDegrees: R(a),
        sourceTokenId: r.tokenId,
        targetTokenId: i.tokenId,
        sourceTokenName: r.name,
        targetTokenName: i.name,
        sourceCenter: r.center,
        targetCenter: i.center,
        sourceBounds: r.bounds,
        targetBounds: i.bounds,
        startOffset: b(m(r.center, s))
      }
    }
  };
}
function re(e) {
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
function x(e, t, n, r) {
  const i = m(n, r);
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
        delta: i,
        distance: b(i),
        angleDegrees: R(i)
      }
    }
  };
}
function _(e) {
  const t = ie(e);
  if (!t) return null;
  const n = N(t, "center") ?? N(t, "document.center"), r = se(t, n), i = n ?? (r ? le(r) : null);
  return !i || !r ? null : {
    tokenId: e.tokenId,
    name: e.name ?? F(t, "name") ?? F(t, "document.name"),
    center: i,
    bounds: r
  };
}
function ie(e) {
  const t = H(), n = e.tokenId;
  if (!t || !n) return null;
  const r = y(t.scene?.id);
  if (e.sceneId && r && e.sceneId !== r) return null;
  const i = t.tokens?.get?.(n);
  return i || (t.tokens?.placeables?.find((s) => F(s, "id") === n || F(s, "document.id") === n) ?? null);
}
function se(e, t) {
  const n = ae(l(e, "bounds"));
  if (n) return n;
  const r = f(H()?.grid?.size) ?? 100, i = f(l(e, "w")) ?? f(l(e, "width")) ?? O(l(e, "document.width"), r) ?? r, s = f(l(e, "h")) ?? f(l(e, "height")) ?? O(l(e, "document.height"), r) ?? r, u = c(l(e, "x")) ?? c(l(e, "document.x")), a = c(l(e, "y")) ?? c(l(e, "document.y"));
  return u !== null && a !== null ? { x: u, y: a, width: i, height: s } : t ? {
    x: t.x - i / 2,
    y: t.y - s / 2,
    width: i,
    height: s
  } : null;
}
function oe(e, t) {
  const n = m(e.center, t), r = b(n);
  if (r <= 0) return e.center;
  const i = {
    x: n.x / r,
    y: n.y / r
  }, s = Math.max(0, e.bounds.width / 2), u = Math.max(0, e.bounds.height / 2), a = Math.abs(i.x) > 1e-4 ? s / Math.abs(i.x) : Number.POSITIVE_INFINITY, g = Math.abs(i.y) > 1e-4 ? u / Math.abs(i.y) : Number.POSITIVE_INFINITY, d = Math.min(a, g), p = Number.isFinite(d) ? d : Math.max(s, u, 0);
  return {
    x: e.center.x + i.x * p,
    y: e.center.y + i.y * p
  };
}
function C(e) {
  if (!w(e)) return null;
  const t = y(e.tokenId) ?? y(e.id);
  return t ? {
    tokenId: t,
    actorId: y(e.actorId),
    sceneId: y(e.sceneId),
    name: y(e.name)
  } : null;
}
function D(e) {
  const t = c(e?.x), n = c(e?.y);
  return t === null || n === null ? null : { x: t, y: n };
}
function N(e, t) {
  const n = l(e, t), r = c(l(n, "x")), i = c(l(n, "y"));
  return r === null || i === null ? null : { x: r, y: i };
}
function ae(e) {
  const t = c(l(e, "x")), n = c(l(e, "y")), r = f(l(e, "width")), i = f(l(e, "height"));
  return t === null || n === null || r === null || i === null ? null : { x: t, y: n, width: r, height: i };
}
function le(e) {
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
function b(e) {
  return Math.hypot(e.x, e.y);
}
function R(e) {
  return ue(Math.atan2(e.y, e.x));
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
function B(e) {
  return e * Math.PI / 180;
}
function ue(e) {
  return e * 180 / Math.PI;
}
function z(e, t) {
  return e.x === t.x && e.y === t.y;
}
function F(e, t) {
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
function H() {
  const e = globalThis.canvas;
  return w(e) ? e : null;
}
function w(e) {
  return !!(e && typeof e == "object");
}
function ce() {
  const e = globalThis.Sequence;
  return typeof e == "function" ? e : null;
}
class de {
  async playRitualPreset(t, n) {
    const r = ce();
    if (!r) {
      o.warn("Sequencer API is not available at runtime.");
      return;
    }
    if (!t.effectPath) {
      o.warn("Ritual FX preset has no effect path configured yet.", t.id);
      return;
    }
    o.debug("Preparing Sequencer ritual FX", {
      preset: t.id,
      effectPath: t.effectPath,
      placement: P(n)
    });
    const i = new r({ moduleName: v }), s = i.effect().name(t.id).file(t.effectPath);
    fe(s, n), t.scale && s.scale(t.scale), await i.play(), o.debug("Played ritual FX preset", {
      preset: t.id,
      effectPath: t.effectPath,
      placement: P(n)
    });
  }
}
function fe(e, t) {
  if (t.type === "line") {
    o.debug("Applying Sequencer line placement", P(t)), e.atLocation(t.start).stretchTo(t.end);
    return;
  }
  o.debug("Applying Sequencer point placement", P(t)), e.atLocation(t.location);
}
class ge {
  #e = /* @__PURE__ */ new Map();
  register(t) {
    this.#e.set(t.id, t);
  }
  registerMany(t) {
    for (const n of t) this.register(n);
  }
  findMatchingPreset(t) {
    for (const n of this.#e.values())
      if (he(n, t))
        return n;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function he(e, t) {
  return !(e.match.toolkitPresetId !== t.toolkitPresetId || e.match.form && e.match.form !== t.form || e.match.areaType && e.match.areaType !== t.areaType);
}
const U = new ge();
class me {
  constructor(t = new de()) {
    this.sequencerAdapter = t;
  }
  sequencerAdapter;
  async handleRitualFinished(t) {
    if (o.debug("Handling ritual FX context", {
      castId: t.castId,
      toolkitPresetId: t.toolkitPresetId,
      form: t.form,
      areaType: t.areaType,
      fxEligible: t.fxEligible,
      targetCount: t.targets.length,
      area: h(t.area)
    }), !t.fxEligible) {
      o.debug("Ignoring ritual because payload is not FX eligible", t);
      return;
    }
    if (!t.toolkitPresetId) {
      o.debug("Ignoring ritual without toolkit preset id", t);
      return;
    }
    const n = U.findMatchingPreset(t);
    if (!n) {
      o.debug("No Ritual FX preset matched this ritual context", t);
      return;
    }
    o.debug("Matched Ritual FX preset", {
      preset: n,
      area: h(t.area)
    });
    const r = J(n, t);
    if (!r) {
      o.debug("No Ritual FX placement could be resolved", {
        preset: n,
        area: h(t.area),
        context: t
      });
      return;
    }
    o.debug("Resolved ritual FX placement", {
      preset: n.id,
      placement: P(r),
      rawPlacement: r
    }), await this.sequencerAdapter.playRitualPreset(n, r);
  }
}
const E = /* @__PURE__ */ new Map();
function ye(e = new me()) {
  Hooks.on(M.ritualCastStarted, (t) => {
    t.castId && E.delete(t.castId), o.debug("Ritual cast started", k(t));
  }), Hooks.on(M.ritualAreaResolved, (t) => {
    const n = t.area ?? t.event?.area;
    t.castId && n && E.set(t.castId, n), o.debug("Ritual area resolved", {
      lifecycle: k(t),
      area: h(n ?? null),
      rawArea: n ?? null,
      rawPayload: t
    });
  }), Hooks.on(M.ritualCastFinished, (t) => {
    const n = t.castId ? E.get(t.castId) ?? null : null, r = W(t, n);
    o.debug("Ritual cast finished", {
      lifecycle: k(t),
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
    }), e.handleRitualFinished(r).catch((i) => {
      o.error("Failed to play ritual FX", i, r);
    }), t.castId && E.delete(t.castId);
  }), o.info("Ritual FX listeners registered.");
}
function k(e) {
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
const Ie = "jb2a.chain_lightning.primary.blue.60ft", be = "jb2a.chain_lightning.primary.blue.60ft";
function pe(e = Ie) {
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
function Te(e = be) {
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
function Pe() {
  return [
    pe(),
    Te()
  ];
}
Hooks.once("init", () => {
  G(), U.registerMany(Pe()), o.info("Initialized.");
});
Hooks.once("ready", () => {
  j() && (ye(), o.info(`${A} ready.`));
});
//# sourceMappingURL=main.js.map
