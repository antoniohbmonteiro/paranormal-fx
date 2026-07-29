const x = "paranormal-fx", w = "Paranormal FX", q = "ordemparanormal", Z = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], A = {
  debug: "debug",
  resourceFeedback: "resourceFeedback"
};
function ee() {
  game.settings.register(x, A.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  }), game.settings.register(x, A.resourceFeedback, {
    name: "Texto flutuante de dano e cura",
    hint: "Exibe números flutuantes sobre Tokens quando seus Pontos de Vida diminuem ou aumentam.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !0
  });
}
function te() {
  try {
    return !!game.settings.get(x, A.resourceFeedback);
  } catch {
    return !0;
  }
}
function ne() {
  try {
    return !!game.settings.get(x, A.debug);
  } catch {
    return !1;
  }
}
function S(e) {
  return `${w} | ${e}`;
}
const u = {
  debug(e, ...t) {
    ne() && console.debug(S(e), ...t);
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
}, re = {
  "paranormal-toolkit": "Paranormal Toolkit",
  sequencer: "Sequencer",
  JB2A_DnD5e: "JB2A"
};
function se() {
  const e = Z.filter((t) => !game.modules.get(t)?.active);
  if (e.length > 0) {
    const t = e.map((n) => re[n] ?? n).join(", ");
    return ui.notifications.error(`${w} requer os módulos ativos: ${t}.`), u.error("Missing required modules", e), !1;
  }
  return game.system.id !== q && (ui.notifications.warn(`${w} foi feito para o sistema Ordem Paranormal.`), u.warn("Unexpected system", { current: game.system.id, expected: q })), !0;
}
const N = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function ie(e, t = null) {
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
function W(e) {
  return e?.type ?? e?.areaType ?? null;
}
function h(e) {
  return e ? {
    type: W(e),
    sceneId: y(e.sceneId),
    regionId: y(e.regionId),
    gridSize: l(e.gridSize),
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
function oe(e) {
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
          distance: b(r),
          angleDegrees: P(r),
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
    distance: b(t),
    angleDegrees: P(t),
    diagnostics: e.diagnostics ?? null
  };
}
function ae(e, t) {
  return e.placementMode === "rectangleRayLine" ? ue(t.area) : e.placementMode === "sourceToTargetLine" ? ge(t) : e.placementMode === "sourceToEachTargetLine" ? he(t, e.staggerMs ?? 500) : me(t);
}
function ue(e) {
  if (!e || W(e) !== "rectangleRay") return null;
  const t = ce(e);
  if (t) return t;
  const n = le(e);
  if (n) return n;
  const r = de(e);
  return r || fe(e);
}
function ce(e) {
  const t = H(e.ray?.start), n = H(e.ray?.end);
  return !t || !n || U(t, n) ? null : v("explicitRay", e, t, n);
}
function le(e) {
  const t = e.shape;
  if (!t) return null;
  const n = l(t.x), r = l(t.y), s = g(t.width ?? e.length), i = l(t.height ?? e.width) ?? 0, o = l(t.direction ?? e.rotation) ?? 0;
  if (n === null || r === null || s === null) return null;
  const a = K(o), d = {
    x: Math.cos(a),
    y: Math.sin(a)
  }, f = {
    x: -Math.sin(a),
    y: Math.cos(a)
  }, T = i / 2, k = {
    x: n + f.x * T,
    y: r + f.y * T
  }, R = {
    x: k.x + d.x * s,
    y: k.y + d.y * s
  };
  return {
    ...v("rectangleShape", e, k, R),
    diagnostics: {
      strategy: "rectangleShape",
      area: h(e),
      resolved: {
        start: k,
        end: R,
        delta: m(k, R),
        distance: b(m(k, R)),
        angleDegrees: P(m(k, R)),
        length: s,
        width: i,
        directionDegrees: o,
        directionRadians: a,
        lengthVector: d,
        perpendicularVector: f
      }
    }
  };
}
function de(e) {
  const t = H(e.center), n = g(e.shape?.width ?? e.length), r = l(e.shape?.direction ?? e.rotation) ?? 0;
  if (!t || n === null) return null;
  const s = K(r), i = n / 2, o = Math.cos(s) * i, a = Math.sin(s) * i, d = {
    x: t.x - o,
    y: t.y - a
  }, f = {
    x: t.x + o,
    y: t.y + a
  };
  return {
    ...v("centerAndShape", e, d, f),
    diagnostics: {
      strategy: "centerAndShape",
      area: h(e),
      resolved: {
        start: d,
        end: f,
        delta: m(d, f),
        distance: b(m(d, f)),
        angleDegrees: P(m(d, f)),
        length: n,
        directionDegrees: r,
        directionRadians: s
      }
    }
  };
}
function fe(e) {
  const t = e.bounds;
  if (!t) return null;
  const n = l(t.x), r = l(t.y), s = g(t.width), i = g(t.height);
  if (n === null || r === null || s === null || i === null) return null;
  if (s >= i) {
    const a = r + i / 2;
    return v("bounds", e, { x: n, y: a }, { x: n + s, y: a });
  }
  const o = n + s / 2;
  return v("bounds", e, { x: o, y: r }, { x: o, y: r + i });
}
function ge(e) {
  const t = D(c(e.sourcePayload, "caster.token")), n = D(e.targets[0]);
  if (!t?.tokenId || !n?.tokenId) return null;
  const r = L(t), s = L(n);
  if (!r || !s) return null;
  const i = Y(r, s.center), o = s.center;
  if (U(i, o)) return null;
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
        distance: b(a),
        angleDegrees: P(a),
        sourceTokenId: r.tokenId,
        targetTokenId: s.tokenId,
        sourceTokenName: r.name,
        targetTokenName: s.name,
        sourceCenter: r.center,
        targetCenter: s.center,
        sourceBounds: r.bounds,
        targetBounds: s.bounds,
        startOffset: b(m(r.center, i))
      }
    }
  };
}
function he(e, t) {
  const n = D(c(e.sourcePayload, "caster.token"));
  if (!n?.tokenId) return null;
  const r = L(n);
  if (!r) return null;
  const s = /* @__PURE__ */ new Set(), i = [];
  for (const o of e.targets) {
    const a = D(o);
    if (!a?.tokenId || s.has(a.tokenId)) continue;
    const d = L(a);
    if (!d) continue;
    const f = Y(r, d.center), T = d.center;
    U(f, T) || (s.add(a.tokenId), i.push({
      start: f,
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
function me(e) {
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
function v(e, t, n, r) {
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
        distance: b(s),
        angleDegrees: P(s)
      }
    }
  };
}
function L(e) {
  const t = ye(e);
  if (!t) return null;
  const n = X(t, "center") ?? X(t, "document.center"), r = Te(t, n), s = n ?? (r ? ke(r) : null);
  return !s || !r ? null : {
    tokenId: e.tokenId,
    name: e.name ?? _(t, "name") ?? _(t, "document.name"),
    center: s,
    bounds: r
  };
}
function ye(e) {
  const t = J(), n = e.tokenId;
  if (!t || !n) return null;
  const r = y(t.scene?.id);
  if (e.sceneId && r && e.sceneId !== r) return null;
  const s = t.tokens?.get?.(n);
  return s || (t.tokens?.placeables?.find((i) => _(i, "id") === n || _(i, "document.id") === n) ?? null);
}
function Te(e, t) {
  const n = be(c(e, "bounds"));
  if (n) return n;
  const r = g(J()?.grid?.size) ?? 100, s = g(c(e, "w")) ?? g(c(e, "width")) ?? z(c(e, "document.width"), r) ?? r, i = g(c(e, "h")) ?? g(c(e, "height")) ?? z(c(e, "document.height"), r) ?? r, o = l(c(e, "x")) ?? l(c(e, "document.x")), a = l(c(e, "y")) ?? l(c(e, "document.y"));
  return o !== null && a !== null ? { x: o, y: a, width: s, height: i } : t ? {
    x: t.x - s / 2,
    y: t.y - i / 2,
    width: s,
    height: i
  } : null;
}
function Y(e, t) {
  const n = m(e.center, t), r = b(n);
  if (r <= 0) return e.center;
  const s = {
    x: n.x / r,
    y: n.y / r
  }, i = Math.max(0, e.bounds.width / 2), o = Math.max(0, e.bounds.height / 2), a = Math.abs(s.x) > 1e-4 ? i / Math.abs(s.x) : Number.POSITIVE_INFINITY, d = Math.abs(s.y) > 1e-4 ? o / Math.abs(s.y) : Number.POSITIVE_INFINITY, f = Math.min(a, d), T = Number.isFinite(f) ? f : Math.max(i, o, 0);
  return {
    x: e.center.x + s.x * T,
    y: e.center.y + s.y * T
  };
}
function D(e) {
  if (!C(e)) return null;
  const t = y(e.tokenId) ?? y(e.id);
  return t ? {
    tokenId: t,
    actorId: y(e.actorId),
    sceneId: y(e.sceneId),
    name: y(e.name)
  } : null;
}
function H(e) {
  const t = l(e?.x), n = l(e?.y);
  return t === null || n === null ? null : { x: t, y: n };
}
function X(e, t) {
  const n = c(e, t), r = l(c(n, "x")), s = l(c(n, "y"));
  return r === null || s === null ? null : { x: r, y: s };
}
function be(e) {
  const t = l(c(e, "x")), n = l(c(e, "y")), r = g(c(e, "width")), s = g(c(e, "height"));
  return t === null || n === null || r === null || s === null ? null : { x: t, y: n, width: r, height: s };
}
function ke(e) {
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
function P(e) {
  return pe(Math.atan2(e.y, e.x));
}
function l(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function g(e) {
  const t = l(e);
  return t !== null && t > 0 ? t : null;
}
function z(e, t) {
  const n = g(e);
  return n !== null ? n * t : null;
}
function K(e) {
  return e * Math.PI / 180;
}
function pe(e) {
  return e * 180 / Math.PI;
}
function U(e, t) {
  return e.x === t.x && e.y === t.y;
}
function _(e, t) {
  return y(c(e, t));
}
function c(e, t) {
  if (!C(e)) return;
  let n = e;
  for (const r of t.split(".")) {
    if (!C(n)) return;
    n = n[r];
  }
  return n;
}
function J() {
  const e = globalThis.canvas;
  return C(e) ? e : null;
}
function C(e) {
  return !!(e && typeof e == "object");
}
function Ie() {
  const e = globalThis.Sequence;
  return typeof e == "function" ? e : null;
}
class Pe {
  async playRitualPreset(t, n) {
    const r = Ie();
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
      this.playSinglePreset(t, n, a, `${n.id}.${i}`), i < r.lines.length - 1 && s > 0 && await xe(s);
    }
  }
  async playSinglePreset(t, n, r, s = n.id) {
    const i = new t({ moduleName: x }), o = i.effect().name(s).file(n.effectPath);
    Re(o, r), n.scale && o.scale(n.scale), await i.play();
  }
}
function Re(e, t) {
  if (t.type === "line") {
    e.atLocation(t.start).stretchTo(t.end);
    return;
  }
  e.atLocation(t.location);
}
function xe(e) {
  return new Promise((t) => setTimeout(t, e));
}
class ve {
  #e = /* @__PURE__ */ new Map();
  register(t) {
    this.#e.set(t.id, t);
  }
  registerMany(t) {
    for (const n of t) this.register(n);
  }
  findMatchingPreset(t) {
    for (const n of this.#e.values())
      if (Se(n, t))
        return n;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function Se(e, t) {
  return !(e.match.toolkitPresetId !== t.toolkitPresetId || e.match.form && e.match.form !== t.form || e.match.areaType && e.match.areaType !== t.areaType);
}
const Q = new ve();
class Ee {
  constructor(t = new Pe()) {
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
    const n = Q.findMatchingPreset(t);
    if (!n) {
      u.debug("No Ritual FX preset matched this ritual context", t);
      return;
    }
    u.debug("Matched Ritual FX preset", {
      preset: n,
      area: h(t.area)
    });
    const r = ae(n, t);
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
      placement: oe(r),
      rawPlacement: r
    }), await this.sequencerAdapter.playRitualPreset(n, r);
  }
}
const E = /* @__PURE__ */ new Map();
function Fe(e = new Ee()) {
  Hooks.on(N.ritualCastStarted, (t) => {
    t.castId && E.delete(t.castId), u.debug("Ritual cast started", O(t));
  }), Hooks.on(N.ritualAreaResolved, (t) => {
    const n = t.area ?? t.event?.area;
    t.castId && n && E.set(t.castId, n), u.debug("Ritual area resolved", {
      lifecycle: O(t),
      area: h(n ?? null),
      rawArea: n ?? null,
      rawPayload: t
    });
  }), Hooks.on(N.ritualCastFinished, (t) => {
    const n = t.castId ? E.get(t.castId) ?? null : null, r = ie(t, n);
    u.debug("Ritual cast finished", {
      lifecycle: O(t),
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
    }), t.castId && E.delete(t.castId);
  }), u.info("Ritual FX listeners registered.");
}
function O(e) {
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
const p = {
  damage: "#ff3333",
  healing: "#33dd77",
  duration: 1500,
  distance: 60,
  fontWeight: "bold",
  stroke: "#111111",
  strokeThickness: 5
};
class Me {
  constructor(t = new we()) {
    this.port = t;
  }
  port;
  render(t, n) {
    const r = n.kind === "damage" ? "-" : "+", s = Math.max(24, Math.min(36, Math.round(Math.min(t.w, t.h) * 0.32)));
    return this.port.create(t.center, `${r}${n.amount}`, {
      distance: p.distance,
      duration: p.duration,
      textStyle: {
        fill: p[n.kind],
        fontSize: s,
        fontWeight: p.fontWeight,
        stroke: p.stroke,
        strokeThickness: p.strokeThickness
      }
    });
  }
}
class we {
  constructor(t = Ae) {
    this.dependencies = t;
  }
  dependencies;
  async create(t, n, r) {
    const s = this.dependencies.container();
    if (!s) throw new Error("Canvas interface is unavailable.");
    const i = this.dependencies.textFactory.create(n, r.textStyle);
    let o = !1;
    try {
      i.anchor.set(0.5), i.position.set(t.x, t.y), s.addChild(i), o = !0, await this.dependencies.animation.animate(
        [
          { parent: i, attribute: "y", to: t.y - r.distance },
          { parent: i, attribute: "alpha", to: 0 }
        ],
        { duration: r.duration }
      );
    } finally {
      try {
        o && s.removeChild(i);
      } finally {
        i.destroy();
      }
    }
  }
}
const Ae = {
  textFactory: {
    create: (e, t) => new PIXI.Text(e, t)
  },
  container: () => canvas.interface,
  animation: {
    animate: (e, t) => foundry.canvas.animation.CanvasAnimation.animate(e, t)
  }
};
function Le(e, t) {
  return e.isGM ? !0 : !t.actor?.testUserPermission(e, "OBSERVER") || t.document.hidden ? !1 : t.isVisible;
}
function F(e) {
  return `${e.kind}:${e.uuid}`;
}
class De {
  #e = /* @__PURE__ */ new Map();
  hydrate(t, n) {
    this.#e.set(F(t), n);
  }
  transition(t, n) {
    const r = F(t), s = this.#e.get(r);
    if (this.#e.set(r, n), s === void 0) return null;
    const i = n - s;
    return i === 0 ? null : {
      kind: i < 0 ? "damage" : "healing",
      amount: Math.abs(i),
      delta: i
    };
  }
  delete(t) {
    this.#e.delete(F(t));
  }
  clear() {
    this.#e.clear();
  }
  get(t) {
    return this.#e.get(F(t));
  }
}
function B(e) {
  return e.isToken ? e.token?.uuid ? { kind: "token", uuid: e.token.uuid } : null : e.uuid ? { kind: "actor", uuid: e.uuid } : null;
}
function _e(e, t) {
  if (!t) return [];
  if (e.isToken) {
    const n = e.token;
    if (!n || n.parent?.id !== t.id) return [];
    const r = t.tokens.contents.find((s) => s.uuid === n.uuid);
    return r?.object ? [r.object] : [];
  }
  return t.tokens.contents.filter((n) => n.actorLink && n.actor?.uuid === e.uuid).map((n) => n.object).filter((n) => n !== null);
}
function V(e) {
  return e.actor;
}
function M(e) {
  return typeof e == "object" && e !== null ? e : null;
}
function G(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function $(e) {
  const t = M(e.system);
  return t ? e.type === "agent" ? G(M(t.PV)?.value) : e.type === "threat" ? G(M(M(t.attributes)?.hp)?.value) : null : null;
}
class Ce {
  constructor(t = new De(), n = new Me(), r = Ne) {
    this.store = t, this.renderer = n, this.environment = r;
  }
  store;
  renderer;
  environment;
  hydrate(t) {
    if (this.store.clear(), !!t)
      for (const n of t.tokens.contents) this.hydrateToken(n);
  }
  hydrateToken(t) {
    const n = V(t);
    if (!n) return;
    const r = B(n), s = $(n);
    r && s !== null && this.store.hydrate(r, s);
  }
  removeToken(t) {
    const n = V(t);
    if (!n?.isToken) return;
    const r = B(n);
    r && this.store.delete(r);
  }
  clear() {
    this.store.clear();
  }
  handleActorUpdate(t) {
    const n = B(t), r = $(t);
    if (!n || r === null) return;
    const s = this.store.transition(n, r);
    if (!s) return;
    const i = this.environment.scene();
    if (!i || !this.environment.enabled()) return;
    const o = this.environment.user();
    for (const a of _e(t, i))
      Le(o, a) && this.renderer.render(a, s).catch(() => {
        u.warn("Failed to render floating resource text.");
      });
  }
}
const Ne = {
  scene: () => canvas.scene,
  user: () => game.user,
  enabled: te
}, I = new Ce(), j = /* @__PURE__ */ Symbol.for("paranormal-fx.resource-feedback.registered");
function Oe() {
  return globalThis;
}
function Be() {
  const e = Oe();
  e[j] || game.system.id !== q || (e[j] = !0, Hooks.on("updateActor", (t) => I.handleActorUpdate(t)), Hooks.on("canvasReady", () => I.hydrate(canvas.scene)), Hooks.on("canvasTearDown", () => I.clear()), Hooks.on("createToken", (t) => {
    t.parent?.id === canvas.scene?.id && I.hydrateToken(t);
  }), Hooks.on("deleteToken", (t) => I.removeToken(t)), canvas.ready && I.hydrate(canvas.scene), u.info("Resource feedback listeners registered."));
}
const qe = "jb2a.chain_lightning.primary.blue.60ft", He = "jb2a.chain_lightning.primary.blue.60ft", Ue = "jb2a.chain_lightning.primary.blue.60ft";
function Xe(e = qe) {
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
function ze(e = He) {
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
function Ve(e = Ue) {
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
function Ge() {
  return [
    Xe(),
    ze(),
    Ve()
  ];
}
Hooks.once("init", () => {
  ee(), Q.registerMany(Ge()), u.info("Initialized.");
});
Hooks.once("ready", () => {
  Be(), se() && (Fe(), u.info(`${w} ready.`));
});
//# sourceMappingURL=main.js.map
