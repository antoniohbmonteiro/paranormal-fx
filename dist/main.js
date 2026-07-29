const S = "paranormal-fx", A = "Paranormal FX", B = "ordemparanormal", Z = [
  "paranormal-toolkit",
  "sequencer",
  "JB2A_DnD5e"
], w = {
  debug: "debug",
  resourceFeedback: "resourceFeedback"
};
function ee() {
  game.settings.register(S, w.debug, {
    name: "Debug",
    hint: "Exibe logs detalhados do Paranormal FX no console.",
    scope: "client",
    config: !0,
    type: Boolean,
    default: !1
  }), game.settings.register(S, w.resourceFeedback, {
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
    return !!game.settings.get(S, w.resourceFeedback);
  } catch {
    return !0;
  }
}
function ne() {
  try {
    return !!game.settings.get(S, w.debug);
  } catch {
    return !1;
  }
}
function v(e) {
  return `${A} | ${e}`;
}
const c = {
  debug(e, ...t) {
    ne() && console.debug(v(e), ...t);
  },
  info(e, ...t) {
    console.info(v(e), ...t);
  },
  warn(e, ...t) {
    console.warn(v(e), ...t);
  },
  error(e, ...t) {
    console.error(v(e), ...t);
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
    return ui.notifications.error(`${A} requer os módulos ativos: ${t}.`), c.error("Missing required modules", e), !1;
  }
  return game.system.id !== B && (ui.notifications.warn(`${A} foi feito para o sistema Ordem Paranormal.`), c.warn("Unexpected system", { current: game.system.id, expected: B })), !0;
}
const C = {
  ritualCastStarted: "paranormal-toolkit.ritual.cast.started",
  ritualAreaResolved: "paranormal-toolkit.ritual.area.resolved",
  ritualCastFinished: "paranormal-toolkit.ritual.cast.finished"
};
function oe(e, t = null) {
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
function Y(e) {
  return e?.type ?? e?.areaType ?? null;
}
function h(e) {
  return e ? {
    type: Y(e),
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
function ie(e) {
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
    distance: b(t),
    angleDegrees: p(t),
    diagnostics: e.diagnostics ?? null
  };
}
function ae(e, t) {
  return e.placementMode === "rectangleRayLine" ? ue(t.area) : e.placementMode === "sourceToTargetLine" ? ge(t) : e.placementMode === "sourceToEachTargetLine" ? he(t, e.staggerMs ?? 500) : me(t);
}
function ue(e) {
  if (!e || Y(e) !== "rectangleRay") return null;
  const t = ce(e);
  if (t) return t;
  const n = le(e);
  if (n) return n;
  const r = de(e);
  return r || fe(e);
}
function ce(e) {
  const t = q(e.ray?.start), n = q(e.ray?.end);
  return !t || !n || X(t, n) ? null : E("explicitRay", e, t, n);
}
function le(e) {
  const t = e.shape;
  if (!t) return null;
  const n = l(t.x), r = l(t.y), s = g(t.width ?? e.length), o = l(t.height ?? e.width) ?? 0, a = l(t.direction ?? e.rotation) ?? 0;
  if (n === null || r === null || s === null) return null;
  const i = W(a), d = {
    x: Math.cos(i),
    y: Math.sin(i)
  }, f = {
    x: -Math.sin(i),
    y: Math.cos(i)
  }, T = o / 2, k = {
    x: n + f.x * T,
    y: r + f.y * T
  }, P = {
    x: k.x + d.x * s,
    y: k.y + d.y * s
  };
  return {
    ...E("rectangleShape", e, k, P),
    diagnostics: {
      strategy: "rectangleShape",
      area: h(e),
      resolved: {
        start: k,
        end: P,
        delta: m(k, P),
        distance: b(m(k, P)),
        angleDegrees: p(m(k, P)),
        length: s,
        width: o,
        directionDegrees: a,
        directionRadians: i,
        lengthVector: d,
        perpendicularVector: f
      }
    }
  };
}
function de(e) {
  const t = q(e.center), n = g(e.shape?.width ?? e.length), r = l(e.shape?.direction ?? e.rotation) ?? 0;
  if (!t || n === null) return null;
  const s = W(r), o = n / 2, a = Math.cos(s) * o, i = Math.sin(s) * o, d = {
    x: t.x - a,
    y: t.y - i
  }, f = {
    x: t.x + a,
    y: t.y + i
  };
  return {
    ...E("centerAndShape", e, d, f),
    diagnostics: {
      strategy: "centerAndShape",
      area: h(e),
      resolved: {
        start: d,
        end: f,
        delta: m(d, f),
        distance: b(m(d, f)),
        angleDegrees: p(m(d, f)),
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
  const n = l(t.x), r = l(t.y), s = g(t.width), o = g(t.height);
  if (n === null || r === null || s === null || o === null) return null;
  if (s >= o) {
    const i = r + o / 2;
    return E("bounds", e, { x: n, y: i }, { x: n + s, y: i });
  }
  const a = n + s / 2;
  return E("bounds", e, { x: a, y: r }, { x: a, y: r + o });
}
function ge(e) {
  const t = D(u(e.sourcePayload, "caster.token")), n = D(e.targets[0]);
  if (!t?.tokenId || !n?.tokenId) return null;
  const r = L(t), s = L(n);
  if (!r || !s) return null;
  const o = K(r, s.center), a = s.center;
  if (X(o, a)) return null;
  const i = m(o, a);
  return {
    type: "line",
    start: o,
    end: a,
    diagnostics: {
      strategy: "sourceToTarget",
      area: h(e.area),
      resolved: {
        start: o,
        end: a,
        delta: i,
        distance: b(i),
        angleDegrees: p(i),
        sourceTokenId: r.tokenId,
        targetTokenId: s.tokenId,
        sourceTokenName: r.name,
        targetTokenName: s.name,
        sourceCenter: r.center,
        targetCenter: s.center,
        sourceBounds: r.bounds,
        targetBounds: s.bounds,
        startOffset: b(m(r.center, o))
      }
    }
  };
}
function he(e, t) {
  const n = D(u(e.sourcePayload, "caster.token"));
  if (!n?.tokenId) return null;
  const r = L(n);
  if (!r) return null;
  const s = /* @__PURE__ */ new Set(), o = [];
  for (const a of e.targets) {
    const i = D(a);
    if (!i?.tokenId || s.has(i.tokenId)) continue;
    const d = L(i);
    if (!d) continue;
    const f = K(r, d.center), T = d.center;
    X(f, T) || (s.add(i.tokenId), o.push({
      start: f,
      end: T,
      targetTokenId: d.tokenId,
      targetTokenName: d.name
    }));
  }
  return o.length === 0 ? null : {
    type: "lineGroup",
    lines: o,
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
function E(e, t, n, r) {
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
        angleDegrees: p(s)
      }
    }
  };
}
function L(e) {
  const t = ye(e);
  if (!t) return null;
  const n = U(t, "center") ?? U(t, "document.center"), r = Te(t, n), s = n ?? (r ? ke(r) : null);
  return !s || !r ? null : {
    tokenId: e.tokenId,
    name: e.name ?? N(t, "name") ?? N(t, "document.name"),
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
  return s || (t.tokens?.placeables?.find((o) => N(o, "id") === n || N(o, "document.id") === n) ?? null);
}
function Te(e, t) {
  const n = be(u(e, "bounds"));
  if (n) return n;
  const r = g(J()?.grid?.size) ?? 100, s = g(u(e, "w")) ?? g(u(e, "width")) ?? z(u(e, "document.width"), r) ?? r, o = g(u(e, "h")) ?? g(u(e, "height")) ?? z(u(e, "document.height"), r) ?? r, a = l(u(e, "x")) ?? l(u(e, "document.x")), i = l(u(e, "y")) ?? l(u(e, "document.y"));
  return a !== null && i !== null ? { x: a, y: i, width: s, height: o } : t ? {
    x: t.x - s / 2,
    y: t.y - o / 2,
    width: s,
    height: o
  } : null;
}
function K(e, t) {
  const n = m(e.center, t), r = b(n);
  if (r <= 0) return e.center;
  const s = {
    x: n.x / r,
    y: n.y / r
  }, o = Math.max(0, e.bounds.width / 2), a = Math.max(0, e.bounds.height / 2), i = Math.abs(s.x) > 1e-4 ? o / Math.abs(s.x) : Number.POSITIVE_INFINITY, d = Math.abs(s.y) > 1e-4 ? a / Math.abs(s.y) : Number.POSITIVE_INFINITY, f = Math.min(i, d), T = Number.isFinite(f) ? f : Math.max(o, a, 0);
  return {
    x: e.center.x + s.x * T,
    y: e.center.y + s.y * T
  };
}
function D(e) {
  if (!_(e)) return null;
  const t = y(e.tokenId) ?? y(e.id);
  return t ? {
    tokenId: t,
    actorId: y(e.actorId),
    sceneId: y(e.sceneId),
    name: y(e.name)
  } : null;
}
function q(e) {
  const t = l(e?.x), n = l(e?.y);
  return t === null || n === null ? null : { x: t, y: n };
}
function U(e, t) {
  const n = u(e, t), r = l(u(n, "x")), s = l(u(n, "y"));
  return r === null || s === null ? null : { x: r, y: s };
}
function be(e) {
  const t = l(u(e, "x")), n = l(u(e, "y")), r = g(u(e, "width")), s = g(u(e, "height"));
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
function p(e) {
  return Ie(Math.atan2(e.y, e.x));
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
function W(e) {
  return e * Math.PI / 180;
}
function Ie(e) {
  return e * 180 / Math.PI;
}
function X(e, t) {
  return e.x === t.x && e.y === t.y;
}
function N(e, t) {
  return y(u(e, t));
}
function u(e, t) {
  if (!_(e)) return;
  let n = e;
  for (const r of t.split(".")) {
    if (!_(n)) return;
    n = n[r];
  }
  return n;
}
function J() {
  const e = globalThis.canvas;
  return _(e) ? e : null;
}
function _(e) {
  return !!(e && typeof e == "object");
}
function pe() {
  const e = globalThis.Sequence;
  return typeof e == "function" ? e : null;
}
class Pe {
  async playRitualPreset(t, n) {
    const r = pe();
    if (!r) {
      c.warn("Sequencer API is not available at runtime.");
      return;
    }
    if (!t.effectPath) {
      c.warn("Ritual FX preset has no effect path configured yet.", t.id);
      return;
    }
    if (n.type === "lineGroup") {
      await this.playLineGroupPreset(r, t, n), c.debug("Played ritual FX preset", { preset: t.id, placement: n });
      return;
    }
    await this.playSinglePreset(r, t, n), c.debug("Played ritual FX preset", { preset: t.id, placement: n });
  }
  async playLineGroupPreset(t, n, r) {
    const s = Math.max(0, r.staggerMs ?? n.staggerMs ?? 0);
    for (const [o, a] of r.lines.entries()) {
      const i = {
        type: "line",
        start: a.start,
        end: a.end
      };
      this.playSinglePreset(t, n, i, `${n.id}.${o}`), o < r.lines.length - 1 && s > 0 && await Se(s);
    }
  }
  async playSinglePreset(t, n, r, s = n.id) {
    const o = new t({ moduleName: S }), a = o.effect().name(s).file(n.effectPath);
    Re(a, r), n.scale && a.scale(n.scale), await o.play();
  }
}
function Re(e, t) {
  if (t.type === "line") {
    e.atLocation(t.start).stretchTo(t.end);
    return;
  }
  e.atLocation(t.location);
}
function Se(e) {
  return new Promise((t) => setTimeout(t, e));
}
class Ee {
  #e = /* @__PURE__ */ new Map();
  register(t) {
    this.#e.set(t.id, t);
  }
  registerMany(t) {
    for (const n of t) this.register(n);
  }
  findMatchingPreset(t) {
    for (const n of this.#e.values())
      if (ve(n, t))
        return n;
    return null;
  }
  get all() {
    return [...this.#e.values()];
  }
}
function ve(e, t) {
  return !(e.match.toolkitPresetId !== t.toolkitPresetId || e.match.form && e.match.form !== t.form || e.match.areaType && e.match.areaType !== t.areaType);
}
const Q = new Ee();
class xe {
  constructor(t = new Pe()) {
    this.sequencerAdapter = t;
  }
  sequencerAdapter;
  async handleRitualFinished(t) {
    if (c.debug("Handling ritual FX context", {
      castId: t.castId,
      toolkitPresetId: t.toolkitPresetId,
      form: t.form,
      areaType: t.areaType,
      fxEligible: t.fxEligible,
      targetCount: t.targets.length,
      area: h(t.area)
    }), !t.fxEligible) {
      c.debug("Ignoring ritual because payload is not FX eligible", t);
      return;
    }
    if (!t.toolkitPresetId) {
      c.debug("Ignoring ritual without toolkit preset id", t);
      return;
    }
    const n = Q.findMatchingPreset(t);
    if (!n) {
      c.debug("No Ritual FX preset matched this ritual context", t);
      return;
    }
    c.debug("Matched Ritual FX preset", {
      preset: n,
      area: h(t.area)
    });
    const r = ae(n, t);
    if (!r) {
      c.debug("No Ritual FX placement could be resolved", {
        preset: n,
        area: h(t.area),
        context: t
      });
      return;
    }
    c.debug("Resolved ritual FX placement", {
      preset: n.id,
      placement: ie(r),
      rawPlacement: r
    }), await this.sequencerAdapter.playRitualPreset(n, r);
  }
}
const x = /* @__PURE__ */ new Map();
function Me(e = new xe()) {
  Hooks.on(C.ritualCastStarted, (t) => {
    t.castId && x.delete(t.castId), c.debug("Ritual cast started", O(t));
  }), Hooks.on(C.ritualAreaResolved, (t) => {
    const n = t.area ?? t.event?.area;
    t.castId && n && x.set(t.castId, n), c.debug("Ritual area resolved", {
      lifecycle: O(t),
      area: h(n ?? null),
      rawArea: n ?? null,
      rawPayload: t
    });
  }), Hooks.on(C.ritualCastFinished, (t) => {
    const n = t.castId ? x.get(t.castId) ?? null : null, r = oe(t, n);
    c.debug("Ritual cast finished", {
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
      c.error("Failed to play ritual FX", s, r);
    }), t.castId && x.delete(t.castId);
  }), c.info("Ritual FX listeners registered.");
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
const R = {
  damage: 16724787,
  healing: 3399031,
  duration: 1500,
  distance: 60,
  stroke: 1118481,
  strokeThickness: 5
};
class Fe {
  constructor(t = new Ae()) {
    this.port = t;
  }
  port;
  render(t, n) {
    const r = n.kind === "damage" ? "-" : "+", s = Math.max(24, Math.min(36, Math.round(Math.min(t.w, t.h) * 0.32)));
    return this.port.create(t.center, `${r}${n.amount}`, {
      anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
      direction: CONST.TEXT_ANCHOR_POINTS.TOP,
      distance: R.distance,
      duration: R.duration,
      fill: R[n.kind],
      fontSize: s,
      stroke: R.stroke,
      strokeThickness: R.strokeThickness
    });
  }
}
class Ae {
  async create(t, n, r) {
    await canvas.interface.createScrollingText(t, n, r);
  }
}
function we(e, t) {
  return e.isGM ? !0 : !t.actor?.testUserPermission(e, "OBSERVER") || t.document.hidden ? !1 : t.visible;
}
function M(e) {
  return `${e.kind}:${e.uuid}`;
}
class Le {
  #e = /* @__PURE__ */ new Map();
  hydrate(t, n) {
    this.#e.set(M(t), n);
  }
  transition(t, n) {
    const r = M(t), s = this.#e.get(r);
    if (this.#e.set(r, n), s === void 0) return null;
    const o = n - s;
    return o === 0 ? null : {
      kind: o < 0 ? "damage" : "healing",
      amount: Math.abs(o),
      delta: o
    };
  }
  delete(t) {
    this.#e.delete(M(t));
  }
  clear() {
    this.#e.clear();
  }
  get(t) {
    return this.#e.get(M(t));
  }
}
function H(e) {
  return e.isToken ? e.token?.uuid ? { kind: "token", uuid: e.token.uuid } : null : e.uuid ? { kind: "actor", uuid: e.uuid } : null;
}
function De(e, t) {
  if (!t) return [];
  if (e.isToken) {
    const n = e.token;
    if (!n || n.parent?.id !== t.id) return [];
    const r = t.tokens.contents.find((s) => s.uuid === n.uuid);
    return r?.object ? [r.object] : [];
  }
  return t.tokens.contents.filter((n) => n.actorLink && n.actor?.uuid === e.uuid).map((n) => n.object).filter((n) => n !== null);
}
function G(e) {
  return e.actor;
}
function F(e) {
  return typeof e == "object" && e !== null ? e : null;
}
function V(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function $(e) {
  const t = F(e.system);
  return t ? e.type === "agent" ? V(F(t.PV)?.value) : e.type === "threat" ? V(F(F(t.attributes)?.hp)?.value) : null : null;
}
class Ne {
  constructor(t = new Le(), n = new Fe(), r = _e) {
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
    const n = G(t);
    if (!n) return;
    const r = H(n), s = $(n);
    r && s !== null && this.store.hydrate(r, s);
  }
  removeToken(t) {
    const n = G(t);
    if (!n?.isToken) return;
    const r = H(n);
    r && this.store.delete(r);
  }
  clear() {
    this.store.clear();
  }
  handleActorUpdate(t) {
    const n = H(t), r = $(t);
    if (!n || r === null) return;
    const s = this.store.transition(n, r);
    if (!s) return;
    const o = this.environment.scene();
    if (!o || !this.environment.enabled()) return;
    const a = this.environment.user();
    for (const i of De(t, o))
      we(a, i) && this.renderer.render(i, s);
  }
}
const _e = {
  scene: () => canvas.scene,
  user: () => game.user,
  enabled: te
}, I = new Ne(), j = /* @__PURE__ */ Symbol.for("paranormal-fx.resource-feedback.registered");
function Ce() {
  return globalThis;
}
function Oe() {
  const e = Ce();
  e[j] || game.system.id !== B || (e[j] = !0, Hooks.on("updateActor", (t) => I.handleActorUpdate(t)), Hooks.on("canvasReady", () => I.hydrate(canvas.scene)), Hooks.on("canvasTearDown", () => I.clear()), Hooks.on("createToken", (t) => {
    t.parent?.id === canvas.scene?.id && I.hydrateToken(t);
  }), Hooks.on("deleteToken", (t) => I.removeToken(t)), canvas.ready && I.hydrate(canvas.scene), c.info("Resource feedback listeners registered."));
}
const He = "jb2a.chain_lightning.primary.blue.60ft", Be = "jb2a.chain_lightning.primary.blue.60ft", qe = "jb2a.chain_lightning.primary.blue.60ft";
function Xe(e = He) {
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
function Ue(e = Be) {
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
function ze(e = qe) {
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
    Ue(),
    ze()
  ];
}
Hooks.once("init", () => {
  ee(), Q.registerMany(Ge()), c.info("Initialized.");
});
Hooks.once("ready", () => {
  Oe(), se() && (Me(), c.info(`${A} ready.`));
});
//# sourceMappingURL=main.js.map
