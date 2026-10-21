# AGENTS.md

## Repository scope

This file applies to **Paranormal FX** (`antoniohbmonteiro/paranormal-fx`) only.

Unless the user explicitly requests otherwise, modify FX only. Treat sibling repositories `paranormal-toolkit` and `ordemparanormal_fvtt` as read-only references, and never include their changes in an FX commit. Confirm the repository owning each file before editing it.

## Project goal and current behavior

Paranormal FX is a visual and sound effects module for Foundry VTT, presenting actions, abilities, attacks, rituals, and events in the Ordem Paranormal universe. It must not implement or alter game rules.

Target Foundry VTT v14+ and the `ordemparanormal` system. Prioritize maintainable public-module quality and incremental, safe changes. Do not add legacy v13 compatibility without a demonstrated requirement.

Inspect `README.md`, `package.json`, `module.json`, `src/main.ts`, and relevant source before proposing changes. Current features include Eletrocussão ritual presets, automatic weapon animations with optional PSFX sounds, and native floating damage/healing text. Broader audiovisual coverage is a direction, not an implemented general-purpose effect system. Check `docs/ROADMAP.md` for planned work and `docs/releases/` for release notes.

The current manifest **requires** Paranormal Toolkit (minimum 0.48.0), Sequencer, and JB2A Free (`JB2A_DnD5e`). PSFX is optional. At runtime, `src/main.ts` registers resource feedback before validating those dependencies; ritual and weapon listeners are registered only after validation succeeds.

Resource feedback observes Foundry Actor updates without Toolkit events, but the current manifest still requires Toolkit for module activation. Preserve this distinction. Keep new independent functionality free of Toolkit coupling and integrations optional where practical; do not describe full standalone installation or optional manifest dependencies as already supported. Dependency-policy or manifest changes belong to an explicitly scoped implementation task.

## Technology and language

- Use strict TypeScript, ES Modules, Vite, and Vitest as configured in this repository. `tsconfig.json` targets ES2022; the release workflow uses Node.js 22.
- Prefer current Foundry v14 APIs and ApplicationV2 for new application UI where applicable.
- Internal filenames, types, functions, classes, variables, comments, and commit messages must use English.
- Text shown to players or GMs must use Brazilian Portuguese.
- Add comments only when they clarify non-obvious behavior.

## Code quality

Write professional, readable, maintainable code. Prefer simple, correct solutions and evolve the existing architecture before proposing rewrites.

- Keep functions and classes focused, with clear responsibilities, high cohesion, and low coupling.
- Prefer explicit domain types and narrow `unknown` at external boundaries. Do not use `any`, unsafe casts, or error suppressions to bypass typing problems.
- Reuse existing components, services, resolvers, presets, and adapters before introducing abstractions. Avoid duplication, God Objects, giant orchestrators, and unnecessary complexity.
- Handle failures explicitly. Distinguish absent optional integrations, unavailable assets, cancellation, and execution failures. Do not hide important failures or automatically replay uncertain execution.
- Keep state, dependencies, and side effects explicit. Avoid fragile DOM, template, and undocumented module dependencies.
- Add dependencies only when existing code and platform APIs are insufficient, and explain why.
- Keep changes within the task. Do not refactor unrelated code without a concrete justification.

## Architecture and existing responsibilities

Inspect existing abstractions before adding new ones. Keep event ingestion, normalization, effect selection, presets/catalogs, configuration, and audiovisual execution separate. Follow existing boundaries without imposing a new directory layout:

- `src/main.ts`: Foundry lifecycle registration.
- `src/config/` and `src/core/`: module constants, dependency checks, settings, and logging.
- `src/adapters/toolkit/`: public hook names and normalized ritual/attack contracts.
- `src/adapters/sequencer/`: sequence composition, playback, asset database access, and cache invalidation.
- `src/features/ritual-fx/`: lifecycle listeners, area resolution, preset registry, and orchestration; reusable preset data lives in `presets/`.
- `src/features/weapon-fx/`: catalog, context/effect/sound resolvers, execution service, and bounded sound preloading.
- `src/features/resource-feedback/`: resource value/token resolvers, snapshots, permission policy, service, listeners, and floating text renderer.

Keep resolvers and selection rules pure where practical; inject runtime dependencies into services for testing. Renderers should receive resolved presentation data and perform only presentation work. They must not roll dice, mutate Actors or ChatMessages, resolve game rules, or own permission policy.

Keep system-specific reads isolated in dedicated resolvers/adapters, such as the existing resource value resolver. Keep Sequencer calls out of selection rules and Toolkit internals out of FX feature logic.

## Foundry, Ordem, and module integration

- When uncertain about Foundry behavior, verify the current v14 API or an existing working usage. Do not invent hooks, signatures, or methods; avoid deprecated alternatives when current APIs exist.
- Verify Actor/Item APIs, resource paths, and system hooks against the real Ordem implementation. Do not guess paths or spread direct system coupling across feature code. Do not modify the system repository without an explicit request.
- Integrate with Toolkit through public, versioned events and clear contracts. In the sibling checkout, read `../paranormal-toolkit/docs/PUBLIC_API.md` for ritual lifecycle events and `../paranormal-toolkit/docs/integration-with-ordem.md` for `paranormal-toolkit.attack.published`; verify both against their implementations. If that checkout is unavailable, consult the same documents in the Toolkit repository.
- Normalize external payloads defensively, preserve relevant public and internal contracts, and skip unsupported or malformed contexts safely. Do not scrape chat HTML or depend on another module's private templates.
- For preset-based rituals, preserve preset IDs, forms, area geometry, and FX eligibility. Do not substitute current target selection for the original event targets.
- Keep Sequencer, JB2A, PSFX, and other audiovisual libraries behind explicit integration boundaries. Check availability and supported APIs; missing optional audio must preserve visual playback. Required-dependency failures must disable dependent execution safely with useful diagnostics.
- Never add a Toolkit requirement to an independent feature merely for convenience. Keep future optional integrations from becoming unconditional initialization gates for unrelated features, while respecting the current manifest requirements.

## Mechanical boundaries, permissions, and persistence

Audiovisual logic must not spend resources, apply damage/healing or conditions, alter rolls, change weapon data, consume ammunition, or otherwise mutate mechanical state. Resource feedback observes actual changes; it does not cause them. Audio bursts must remain independent of mechanical attack counts or Toolkit's burst option.

Respect Foundry permissions and public APIs. Preserve resource feedback's local ownership/visibility policy, active-scene checks, and handling of linked and synthetic Actors. Preserve weapon FX privacy, hidden-token, scene, and unambiguous source/target checks. Never expose private action data through visual effects, sounds, or diagnostics.

Use FX-owned flags/settings for FX-owned state when needed. Preserve existing configuration semantics and normalize old persisted schemas defensively. Keep schema changes explicit; never serialize runtime Foundry Documents into flags. Store only necessary serializable references and resolve original Actors/Tokens safely. Malformed data must fail without destroying chat content or replaying an effect.

## Execution and lifecycle

- Preserve one weapon sequence per eligible action. The attack event is local to its executor; the existing service checks the event user and reserves `actionId` before asynchronous playback. Sequencer handles propagation. Do not add duplicate listeners, per-client replay, or a parallel socket mechanism without a demonstrated need.
- Rendering, reloading chat, opening/cancelling dialogs, rolling damage, and applying damage must not replay weapon effects. Reuse existing execution guards and add appropriate deduplication when extending other flows; do not assume all features already share one guard.
- Preserve visual/audio sequencing and safe fallback: an audio assembly failure may fall back before playback begins; never replay an already-started visual to recover audio.
- Keep preloading local, bounded, configurable, and separate from attack execution. Preserve database cache invalidation and avoid duplicate downloads or preloading entire third-party libraries.
- Consider listener registration, cancellation, scene changes, cache lifetime, transient state, and cleanup of effects/resources. Reuse existing teardown and snapshot cleanup; do not claim generalized cleanup infrastructure exists without verifying it.
- Keep presets and settings reusable and organized within existing feature boundaries. Do not duplicate configuration or hard-code third-party installation paths into feature rules.

## Testing and validation

For implementation changes, run the full validation defined in `package.json`:

```bash
npm run check
```

It runs TypeScript checking, Vitest, and the Vite build. Individual commands are available for focused investigation:

```bash
npm run typecheck
npm run test
npm run build
```

Use `npm run dev` or `npm run watch` for watch builds. Do not assume Toolkit-only scripts exist in FX.

Add or update tests proportional to changed behavior and risk. Give important regressions dedicated tests, especially payload normalization, missing dependencies/assets, permissions, duplicate events, lifecycle cleanup, settings, fallback behavior, and sequencing. Keep pure tests independent of browser/DOM dependencies unless there is a strong architectural reason.

Unit tests are colocated under `src/`; optional reference tests live under `tests/reference/`. Follow `README.md` for the read-only local installations selected by `PARANORMAL_FX_JB2A_REFERENCE`, `PARANORMAL_FX_PSFX_REFERENCE`, `PARANORMAL_FX_SEQUENCER_REFERENCE`, and `PARANORMAL_FX_ORDEM_REFERENCE`. Report unavailable references and skipped checks; simulated runtimes do not prove real asset playback, sockets, or paid-library availability.

Typecheck, tests, and build do not replace Foundry v14 validation of canvas rendering, permissions, audio, lifecycle, or multiplayer propagation. Report what was actually verified, remaining manual scenarios, known risks, and limitations. Compilation alone does not establish completion.

For documentation-only changes, review content, referenced paths/scripts, and the diff; do not run builds or full test suites unnecessarily.

## Documentation, licensing, and generated files

Inspect existing documentation before adding more. Update `README.md`, `docs/ROADMAP.md`, or relevant release documentation when public behavior, configuration, architecture decisions, or roadmap state changes. Distinguish implemented behavior from proposals and avoid duplicating extensive documentation.

Respect `LICENSE`, copyright notices, and third-party licenses. Do not redistribute JB2A, PSFX, or other audiovisual assets without appropriate rights. Refer to assets legitimately installed by the user; do not infer subscription or redistribution rights from a registered database path. Do not bypass licensing or access restrictions.

`dist/` is generated and ignored by Git. Follow the current tracking policy; do not commit generated bundles merely because a build produced them. The release workflow rebuilds and packages them.

## Versions and releases

Version updates, tag creation/push, and release publication require an explicit user request. Routine implementation, planning, and documentation tasks do not authorize a release.

Use semantic versioning based on actual scope: patch for fixes, minor for backward-compatible features, and major for intentional breaking releases. Read the actual current version before choosing the next one.

For an explicitly requested release, follow `docs/RELEASE.md` and inspect `.github/workflows/release.yml` before acting:

1. Synchronize `module.json`, `package.json`, and both root version entries in `package-lock.json`. Update relevant documentation/release notes under `docs/releases/` when appropriate.
2. Run `npm run check` and relevant Foundry validation before publication. Commit intended changes and ensure they are on the updated default branch (`main` currently).
3. Create and push the matching `vX.Y.Z` tag only when authorized. Do not create the GitHub Release manually beforehand.
4. The tag-triggered workflow uses Node.js 22, installs with `npm ci`, runs `npm run check`, and validates tag/metadata consistency. Packaging requires `dist/main.js` and excludes source maps and development files. It publishes `module.json` and `paranormal-fx.zip` to GitHub Releases, then calls the Foundry Package Release API in dry-run and publish modes using the repository secret `FOUNDRY_RELEASE_TOKEN`.
5. Verify the workflow result, downloadable artifacts, and Foundry publication. The Foundry API uses the version-specific manifest URL, while the module manifest uses the latest-release URL. GitHub publication alone does not confirm Foundry publication.

Never commit or expose release tokens. Keep this summary aligned with the real workflow rather than duplicating its implementation.

## Git and implementation discipline

Use focused Conventional Commits in English, such as `fix(weapon-fx): prevent duplicate playback`. Check status and the actual default branch before branch-sensitive work. Stage only task-related files, preserve pre-existing changes, and do not overwrite others' work or force-push.

Before implementing, inspect existing abstractions, contracts, configuration, persisted state, and dependent workflows. Prefer small safe increments over rewrites. Review the diff for scope, correctness, typing, failure handling, permissions, lifecycle, and compatibility before finalizing. Confirm that only intended files are included and report validation evidence and unresolved limitations.

For planning tasks, inspect real code without implementing. Identify reusable abstractions, likely modified files, genuinely necessary new files, migration/compatibility concerns, tests, and architectural risks. Explicitly identify assumptions contradicted by the repository; do not invent files or present planned functionality as implemented.
