/*********************************************************
 * props-harness — reusable runtime prop-exercise harness
 *
 * @description
 * Mission context: a grid of 217 components × 8 inspection criteria has
 * 101 cells marked "non testable". The maintainer's ruling is that
 * nothing is actually non-testable — the grid must be filled with real
 * verdicts. This harness is the reusable instrument for the "does this
 * prop actually do anything" criterion, built after two false starts:
 *
 * 1. Reading a component's OWN `I{Name}Props` interface file undercounts
 *    its real surface — inheritance hides most of it. `ICarouselItemProps
 *    extends IImgProps, IWindowItemProps` shows one prop (`transition`) in
 *    its own file; `OrigamCarouselItem.props` at runtime lists 64. The
 *    prop list MUST come from `Comp.props` (`getRuntimeProps` below),
 *    never from a hand-read interface.
 * 2. Comparing a single element's class list undercounts too — a prop can
 *    act on a CHILD element (`origam-carousel-item`'s `rounded` forwards
 *    into the nested `<origam-img>`) or emit no class at all (custom
 *    values go through inline `style` or the per-instance stylesheet
 *    `useStyle()` injects into `<head>`). The diff MUST cover the whole
 *    rendered subtree (`VueWrapper#html()`) AND the generated stylesheet,
 *    not one element's `classList`.
 *
 * @description
 * ⛔ LIMITATION MEASURED, NOT ASSUMED (read before trusting a DEAD verdict)
 * Vitest's default `test.css` setting means a mounted SFC's OWN
 * `<style scoped lang="scss">` block is NEVER injected into jsdom's
 * `document.head` — verified empirically: after mounting `OrigamBtn`,
 * `document.head` contains exactly 4 `<style>` tags (`origam-theme`,
 * `origam-theme-dark`, and two `useStyleTag`-generated per-instance
 * rules) and NONE of them is the component's own compiled SCSS. Two
 * direct consequences:
 *
 *   - `getComputedStyle()` cannot be trusted as ground truth here: even a
 *     TRIVIAL single matching CSS rule using `var(--x)` resolves to
 *     jsdom's fabricated UA default instead of the real value (proven:
 *     `border-top-width` reads "16px" for a *completely unstyled* bare
 *     `<div>`, and STAYS "16px" when a real, uncontested `<style>` rule
 *     sets `border-width: var(--tok)` — jsdom does not implement CSS
 *     Custom Property resolution in `getComputedStyle` at all). Plain
 *     literal declarations (`border-width: 3px`, no `var()`) DO resolve
 *     correctly, including specificity. Since ~100% of this DS's CSS
 *     goes through `var(--origam-...)`, `getComputedStyle` is USELESS
 *     here for anything token-driven — this harness does not use it.
 *   - A prop whose only effect is adding a CSS class is therefore
 *     ALIVE-IN-MARKUP but UNVERIFIED-VISUALLY: this instrument can prove
 *     the class landed, never that it paints anything. A class that
 *     lands but is neutralised by a competing, more specific, scoped SCSS
 *     rule elsewhere in the SAME component (`OrigamBtn`'s `border` prop,
 *     issue #391) is INDISTINGUISHABLE, by markup diffing alone, from a
 *     class that lands and works (`variant`). See `findOrphanCustomProperty`
 *     for the one case this harness CAN still catch statically, and see
 *     the harness's module doc / delivery notes for what remains genuinely
 *     out of reach (needs Playwright against a real browser).
 ********************************************************/

import { readFileSync } from 'node:fs'
import { defineComponent, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'

/*
 * Relative imports, not the `@origam/*` tsconfig alias: that alias only
 * resolves reliably when it's used directly inside a `*.spec.ts` file
 * picked up by vitest's own `include` glob. Verified by repro — a plain
 * `.ts` helper (this file) imported BY a spec fails to resolve
 * `@origam/origam` ("Failed to resolve import") even though the exact
 * same specifier resolves fine one file up, in the spec itself. Relative
 * paths sidestep whatever narrows `vite-tsconfig-paths`'s reach to
 * top-level test entries.
 */
import { createOrigam } from '../../../ds/src/origam'
import { toKebabCase } from '../../../ds/src/utils'
import {
    ALIGN, BORDER_STYLE, DENSITY, DIRECTION, INTENT,
    JUSTIFY, POSITION, ROUNDED, SIZES, STATUS, STATUS_POSITION, VARIANT, VARIANT_INPUT
} from '../../../ds/src/enums'

/*********************************************************
 * 1. Candidate value selection
 *
 * @description
 * "A wrong test value produces a false DEAD" — a boolean gets `true`,
 * a number gets a plausible non-zero number, and a string gets a REAL
 * member of the enum it actually accepts whenever the prop name is
 * recognised (sourced from `@origam/enums`, never invented). Unrecognised
 * string props fall back to a sentinel string, flagged with a caveat so
 * a DEAD verdict born from a bad guess is never silently trusted.
 *
 * ⛔ LIMITATION MEASURED ON `OrigamCarouselItem` — a prop NAME is not a
 * stable key across components, and a `boolean | string` union always
 * probing the boolean branch can miss the string branch's real effect.
 * Two false DEAD verdicts caught only by hand-testing type-correct
 * values after the fact:
 *   - `transition` is typed `boolean | string`; the picker takes the
 *     Boolean branch unconditionally when `Boolean` is in the type
 *     array (see below), so the candidate was literal `true`. The
 *     REAL, meaningful values are transition NAMES (`'fade-transition'`),
 *     which land on `<Transition name="…">` and DO change markup —
 *     confirmed live, divergence at a `name="fade-transition"`
 *     attribute the boolean candidate never produces.
 *   - `position` is hinted to `POSITION.ABSOLUTE` (CSS `position:
 *     static|relative|…`) globally in this dictionary — correct for
 *     most components, WRONG here: `OrigamCarouselItem`'s `position`
 *     is forwarded to `<OrigamImg>` as CSS `object-position` (`'top
 *     left'`, `'center'`, …), a same-named, differently-typed prop.
 *     `'absolute'` is not a valid `object-position` token, produced no
 *     visible change, and the harness reported DEAD — false.
 * No code fix applied: `PROP_VALUE_HINTS` is keyed by name and shared
 * across the whole catalogue, so a per-component override would need
 * component-scoped hints (out of scope here) — fixing `position`
 * globally risks breaking it for the (many) components where `position`
 * genuinely IS the CSS box property. Documented instead: treat a DEAD
 * verdict on a `boolean | string` union prop, or on any prop whose name
 * is a common English word with more than one plausible CSS meaning
 * (`position`, `align`, `size`, …), as lower-confidence until manually
 * re-tested with a type-correct, component-specific value.
 ********************************************************/

export const SENTINEL_STRING = 'origam-probe-zzz'

export const PROP_VALUE_HINTS: Readonly<Record<string, unknown>> = Object.freeze({
    variant: VARIANT.ELEVATED,
    variantInput: VARIANT_INPUT.FILLED,
    color: INTENT.PRIMARY,
    bgColor: INTENT.DANGER,
    textColor: INTENT.SUCCESS,
    borderColor: INTENT.WARNING,
    intent: INTENT.PRIMARY,
    size: SIZES.LARGE,
    density: DENSITY.COMPACT,
    rounded: ROUNDED.LARGE,
    roundedTopLeft: ROUNDED.LARGE,
    roundedTopRight: ROUNDED.LARGE,
    roundedBottomLeft: ROUNDED.LARGE,
    roundedBottomRight: ROUNDED.LARGE,
    position: POSITION.ABSOLUTE,
    justify: JUSTIFY.CENTER,
    align: ALIGN.CENTER,
    direction: DIRECTION.VERTICAL,
    status: STATUS.WARNING,
    statusPosition: STATUS_POSITION.BOTH,
    borderStyle: BORDER_STYLE.DASHED,
    elevation: 'lg',
    width: '240px',
    height: '180px',
    minWidth: '80px',
    minHeight: '60px',
    maxWidth: '480px',
    maxHeight: '360px',
    margin: '16px',
    marginTop: '8px',
    marginLeft: '8px',
    marginBottom: '8px',
    marginRight: '8px',
    marginBlock: '8px',
    marginInline: '8px',
    padding: '16px',
    paddingTop: '8px',
    paddingLeft: '8px',
    paddingBottom: '8px',
    paddingRight: '8px',
    paddingBlock: '8px',
    paddingInline: '8px',
    border: 'thick',
    borderTop: '4px solid red',
    borderLeft: '4px solid red',
    borderBottom: '4px solid red',
    borderRight: '4px solid red',
    borderBlock: '4px solid red',
    borderInline: '4px solid red',
    borderTopColor: INTENT.DANGER,
    borderRightColor: INTENT.DANGER,
    borderBottomColor: INTENT.DANGER,
    borderLeftColor: INTENT.DANGER,
    aspectRatio: '16 / 9',
    tag: 'section',
    src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7',
    lazySrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7',
    alt: SENTINEL_STRING
})

export interface ICandidateValue {
    value: unknown
    confidence: 'hinted' | 'boolean' | 'number' | 'sentinel' | 'unsupported'
}

/*********************************************************
 * pickCandidateValue
 *
 * @description
 * Order of precedence: a curated hint always wins (it is a real value the
 * prop is documented to accept), then the runtime-declared type. A prop
 * with no declared type at all (`def` null/undefined — common for
 * `unknown`/union-typed props the SFC compiler couldn't narrow) is treated
 * like a string, same as `useDefaults-removal-probe.spec.ts`'s existing
 * `candidateValues()` does for the same reason.
 *
 * ⛔ Boolean props pick the OPPOSITE of the prop's OWN resolved default,
 * not a hardcoded `true`. Bug found running this harness on the Chart
 * family: `showTooltip`/`animated` on `OrigamChartBoxPlot` both default
 * to `true` — testing candidate `true` against an unset baseline (which
 * ALSO resolves to `true` via `withDefaults`) compares a value against
 * itself and reports a false DEAD, even though both props are genuinely
 * consumed (`v-if="showTooltip"`, `--animated` class). `def.default` is
 * directly readable on Vue's normalized runtime props object for
 * primitive types (confirmed: `Comp.props.showTooltip.default === true`,
 * a plain boolean, not a factory — factories are reserved for
 * Object/Array defaults). Falls back to `true` only when no default is
 * declared at all.
 *
 * ⛔ `def.type === null` is NOT "no definition" — it means "a definition
 * exists, but the SFC macro couldn't reflect its TS type to a runtime
 * constructor". Bug found on `OrigamChartBoxPlot.legendPosition`
 * (`TChartLegendPosition = TDirectionBoth`, a plain string-literal union
 * with no `String` in sight): `Comp.props.legendPosition` is
 * `{ type: null, default: 'bottom' }`, a REAL, common Vue pattern for
 * aliased union types. The original check tested `def == null` (the
 * whole prop descriptor) instead of `def.type == null` — since `def`
 * itself is a truthy object here, every one of these landed in
 * `unsupported` and got skipped outright, never reaching a sentinel
 * string. Checking `rawType == null` directly (covers both a genuinely
 * absent descriptor and this reflection gap) routes it to the sentinel
 * path instead, where it belongs.
 ********************************************************/
export function pickCandidateValue (propName: string, def: any): ICandidateValue {
    if (Object.prototype.hasOwnProperty.call(PROP_VALUE_HINTS, propName))
        return {value: PROP_VALUE_HINTS[propName], confidence: 'hinted'}

    const rawType = def?.type
    const types = Array.isArray(rawType) ? rawType : [rawType]

    if (types.includes(Boolean)) {
        const hasBooleanDefault = typeof def?.default === 'boolean'
        return {value: hasBooleanDefault ? !def.default : true, confidence: 'boolean'}
    }
    if (types.includes(Number)) return {value: 42, confidence: 'number'}
    if (types.includes(String) || rawType == null) return {value: SENTINEL_STRING, confidence: 'sentinel'}

    return {value: undefined, confidence: 'unsupported'}
}

/*********************************************************
 * 2. Runtime introspection
 ********************************************************/

/**
 * Read a component's REAL prop surface — `Comp.props` at runtime, never
 * its `I{Name}Props` interface file. See module doc, lesson #1.
 */
export function getRuntimeProps (Comp: any): Record<string, any> {
    if (!Comp?.props) {
        throw new Error(
            '[props-harness] Component has no runtime `.props` — pass the ' +
            'resolved component object (e.g. `(await import(...)).default`), ' +
            'not a raw SFC source string or an `I*Props` interface.'
        )
    }
    return Comp.props
}

/** Derives the component's own BEM root class, e.g. `OrigamBtn` → `origam-btn`. */
export function componentKebabName (Comp: any): string {
    const raw = Comp?.__name ?? Comp?.name
    if (!raw) {
        throw new Error('[props-harness] Component has no `__name`/`name` — cannot derive its BEM root class.')
    }
    return toKebabCase(raw)
}

/*********************************************************
 * 3. Mount strategies
 *
 * @description
 * Two shapes, both producing an `IMountStrategy` so `probeComponentProps`
 * never needs to know which one it got:
 *
 *   - `directMount`: `mount(Comp, { props })` — the common case.
 *   - `parentSlotMount`: mounts `Comp` inside `Parent`'s default slot —
 *     for components that only make sense wired into a parent (group /
 *     context components: Bracket pieces need `OrigamBracket`, Checkbox
 *     pieces need `OrigamCheckboxGroup`, `OrigamCarouselItem` needs
 *     `OrigamCarousel`'s `provide()`). `parentProps` is fixed for the
 *     whole probe run; `childProps` is what varies per prop under test.
 *
 * `setChildProps` exists as its own strategy method, separate from
 * `mount`, because `@vue/test-utils` only allows `wrapper.setProps()` on
 * the WRAPPER'S OWN ROOT — never on a `findComponent()` result, even when
 * that result IS the root (measured: "You can only use setProps on your
 * mounted component" fires regardless). For `directMount` the root IS the
 * component under test, so `setChildProps` is a straight passthrough. For
 * `parentSlotMount` the root is the wrapper harness, whose own declared
 * prop is the `childProps` object — reassigning THAT object is what
 * reactively updates the grandchild, so `setChildProps` sets it there
 * instead.
 *
 * In BOTH cases, `probeComponentProps` locates the component under test
 * via `wrapper.findComponent(Comp)` for READING (`.html()`/`.classes()`)
 * — never the mount root — so a parent-wrapped mount is diffed on the
 * CHILD's own subtree, not the parent's.
 ********************************************************/

export interface IMountStrategy {
    mount: (childProps: Record<string, unknown>) => VueWrapper<any>
    setChildProps: (wrapper: VueWrapper<any>, childProps: Record<string, unknown>) => Promise<void>
}

export function directMount (Comp: any): IMountStrategy {
    return {
        mount: (childProps) => mount(Comp, {
            props: childProps as never,
            attachTo: document.body,
            global: {plugins: [createOrigam()]}
        }),
        setChildProps: (wrapper, childProps) => wrapper.setProps(childProps as never)
    }
}

export function parentSlotMount (Parent: any, Comp: any, parentProps: Record<string, unknown> = {}): IMountStrategy {
    const Harness = defineComponent({
        components: {OrigamProbeParent: Parent, OrigamProbeChild: Comp},
        props: {childProps: {type: Object, default: () => ({})}},
        template: `
            <origam-probe-parent v-bind="fixedParentProps">
                <origam-probe-child v-bind="childProps"/>
            </origam-probe-parent>
        `,
        setup () {
            return {fixedParentProps: parentProps}
        }
    })

    return {
        mount: (childProps) => mount(Harness, {
            props: {childProps} as never,
            attachTo: document.body,
            global: {plugins: [createOrigam()]}
        }),
        setChildProps: (wrapper, childProps) => wrapper.setProps({childProps} as never)
    }
}

/*********************************************************
 * 4. Render capture + diff
 ********************************************************/

async function settle (): Promise<void> {
    await nextTick()
    await nextTick()
}

function headStyleTagIds (): Set<string> {
    return new Set(
        Array.from(document.head.querySelectorAll('style[id^="origam_styletag_"]'))
            .map((el) => el.id)
    )
}

function styleTextFor (ids: Iterable<string>): string {
    return Array.from(ids).sort()
        .map((id) => document.getElementById(id)?.textContent ?? '')
        .join('\n')
}

interface ICaptured {
    wrapper: VueWrapper<any>
    target: VueWrapper<any>
    html: string
    styleText: string
    classes: string[]
}

/**
 * Mounts, settles two ticks (matches the rest of the repo's probes —
 * `useStyle()` loads on `onMounted`, and some composables need a second
 * tick to flush a chained computed), and captures the FULL rendered
 * subtree of the component under test (never the mount root when
 * parent-wrapped) plus any newly-injected per-instance stylesheet.
 */
async function captureMount (strategy: IMountStrategy, childProps: Record<string, unknown>, Comp: any): Promise<ICaptured> {
    const before = headStyleTagIds()
    const wrapper = strategy.mount(childProps)
    await settle()

    const target = wrapper.findComponent(Comp)
    if (!target.exists()) {
        wrapper.unmount()
        throw new Error('[props-harness] `wrapper.findComponent(Comp)` found nothing — the component under test never rendered (mount threw silently, or the parent wrapper never rendered its slot). Check the mount strategy.')
    }

    const html = target.html()
    const after = headStyleTagIds()
    const newIds = Array.from(after).filter((id) => !before.has(id))

    return {
        wrapper,
        target,
        html,
        styleText: styleTextFor(newIds),
        classes: target.classes()
    }
}

/*********************************************************
 * 5. Static orphan-custom-property check (best-effort)
 *
 * @description
 * The one class of "markup changed, but it's still dead" bug this
 * harness CAN prove without a real browser: issue #391 on `OrigamBtn`.
 * `border={true}` adds class `origam-btn--border`; that class's ENTIRE
 * declared body in the SFC's own `<style>` block is
 * `{ --origam-btn---border-width: thin; }` — a bare custom-property
 * assignment. If NOTHING else in the same `<style>` block ever reads
 * `var(--origam-btn---border-width`, the assignment is a dead end: no
 * real CSS property is ever set from it, regardless of what jsdom can or
 * can't compute. That is exactly issue #391's second, "even the patch is
 * dead" paragraph (the READING line uses a differently-named variable),
 * confirmed by grep on the live source, not inferred.
 *
 * This is intentionally narrow: it only fires for BEM modifier classes
 * of the component's OWN root (`{rootClass}--{suffix}`, the `&--suffix`
 * SCSS nesting convention used throughout this codebase) whose declared
 * body — up to the first nested rule — contains ONLY `--custom` property
 * assignments, none of them referenced anywhere else in the same
 * `<style>` block. A modifier that sets a real property directly
 * (`box-shadow: var(...)`, `OrigamBtn`'s `variant` prop) is not
 * orphan-checkable this way and is left alone — correctly, since setting
 * a real property IS itself the effect, cascade collisions aside (out of
 * this check's reach, see module doc).
 ********************************************************/
export function findOrphanCustomProperty (source: string, rootClass: string, addedClasses: string[]): string | null {
    const styleBlocks = Array.from(source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)).map((m) => m[1])

    for (const block of styleBlocks) {
        for (const cls of addedClasses) {
            if (!cls.startsWith(`${rootClass}--`)) continue

            const suffix = cls.slice(rootClass.length) // e.g. '--border'
            const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const selectorMatch = new RegExp(`&${escapedSuffix}(?![\\w-])`).exec(block)
            if (!selectorMatch) continue

            const braceStart = block.indexOf('{', selectorMatch.index)
            if (braceStart === -1) continue

            let depth = 0
            let bodyEnd = -1
            for (let i = braceStart; i < block.length; i++) {
                if (block[i] === '{') depth++
                else if (block[i] === '}') {
                    depth--
                    if (depth === 0) {
                        bodyEnd = i
                        break
                    }
                }
            }
            if (bodyEnd === -1) continue

            const fullBody = block.slice(braceStart + 1, bodyEnd)
            const firstNestedBrace = fullBody.indexOf('{')
            const directBody = firstNestedBrace === -1 ? fullBody : fullBody.slice(0, firstNestedBrace)

            const declarations = Array.from(directBody.matchAll(/(--[\w-]+|[\w-]+)\s*:\s*[^;]+;/g)).map((m) => m[1])
            if (!declarations.length) continue
            if (declarations.some((d) => !d.startsWith('--'))) continue // a real property is set directly — not this pattern

            const outside = block.slice(0, selectorMatch.index) + block.slice(bodyEnd + 1)

            for (const customProp of declarations) {
                const escapedName = customProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const usedElsewhere = new RegExp(`var\\(\\s*${escapedName}(?![\\w-])`).test(outside)
                if (!usedElsewhere) return customProp
            }
        }
    }

    return null
}

/*********************************************************
 * 6. Main entry point
 ********************************************************/

export interface IPropVerdict {
    prop: string
    testValue: unknown
    valueConfidence: ICandidateValue['confidence']
    initialRenderChanged: boolean
    reactiveRenderChanged: boolean
    addedClasses: string[]
    orphanCustomProperty: string | null
    verdict: 'ALIVE' | 'DEAD' | 'SKIPPED_UNSUPPORTED_TYPE'
    caveat: string | null
}

export interface IProbeOptions {
    /** Restrict the run to these prop names (default: every runtime prop). */
    only?: string[]
    /** Props applied to every mount, baseline included (e.g. required props). */
    baseProps?: Record<string, unknown>
    /** Absolute path to the component's own `.vue` file — enables `findOrphanCustomProperty`. */
    sourcePath?: string
    /** Defaults to `directMount(Comp)`. Pass `parentSlotMount(Parent, Comp, parentProps)` for context-dependent components. */
    mountStrategy?: IMountStrategy
}

/**
 * Probes every real prop of `Comp`, one baseline mount + N variant mounts
 * (initial-render diff) + N more mounts (post-mount `setProps` diff, for
 * the reactivity criterion). See module doc for exactly what "changed"
 * can and cannot mean in this jsdom environment before trusting a
 * DEAD verdict at face value.
 *
 * ⛔ `only` is intersected with `Comp.props`, never trusted blindly. Bug
 * found batch-probing the Chart family with a shared `only` list built
 * from `IChartBaseProps` (`title`, `rounded`, …): `OrigamChartRangeSelector`
 * declares NONE of them (`IChartRangeSelectorProps` doesn't extend
 * `IChartBaseProps` at all — its real surface is `buttons` /
 * `activeIndex` / `dataLength`). Vue's attrs-fallthrough silently turned
 * every one of those into a plain HTML attribute on the root element
 * (`<div title="…">`), which DOES change the markup — so the harness
 * reported eleven confident `ALIVE` verdicts for props the component
 * doesn't even have. That's worse than a false DEAD: it hides a total
 * prop-surface mismatch behind a wall of green. Requested names that
 * aren't in `Comp.props` are now dropped before probing: a TOTAL
 * mismatch (nothing in `only` is a real prop) throws — silently
 * returning an empty array here would read as "0 props, nothing to
 * see" instead of "this list doesn't apply to this component" — and a
 * PARTIAL mismatch logs a warning naming the dropped names, so a
 * shared `only` list reused across a family (exactly how this bug was
 * found) can't quietly test nothing on an odd one out.
 */
export async function probeComponentProps (Comp: any, options: IProbeOptions = {}): Promise<IPropVerdict[]> {
    const runtimeProps = getRuntimeProps(Comp)
    const requested = options.only ?? Object.keys(runtimeProps)
    const propNames = requested.filter((p) => p !== 'class' && p !== 'style' && Object.prototype.hasOwnProperty.call(runtimeProps, p))

    if (options.only) {
        const unknown = requested.filter((p) => !Object.prototype.hasOwnProperty.call(runtimeProps, p))
        if (propNames.length === 0) {
            throw new Error(`[props-harness] None of the requested props (${requested.join(', ')}) exist on this component's Comp.props — check you're not reusing an \`only\` list built for a different component's prop surface.`)
        }
        if (unknown.length > 0) {
            console.warn(`[props-harness] ${unknown.length} requested prop(s) skipped — not declared on this component: ${unknown.join(', ')}`)
        }
    }

    const rootClass = componentKebabName(Comp)
    const source = options.sourcePath ? readFileSync(options.sourcePath, 'utf-8') : null
    const baseProps = options.baseProps ?? {}
    const strategy = options.mountStrategy ?? directMount(Comp)

    const base = await captureMount(strategy, baseProps, Comp)
    const baseClassSet = new Set(base.classes)
    base.wrapper.unmount()

    const results: IPropVerdict[] = []

    for (const prop of propNames) {
        const candidate = pickCandidateValue(prop, runtimeProps[prop])

        if (candidate.confidence === 'unsupported') {
            results.push({
                prop,
                testValue: undefined,
                valueConfidence: candidate.confidence,
                initialRenderChanged: false,
                reactiveRenderChanged: false,
                addedClasses: [],
                orphanCustomProperty: null,
                verdict: 'SKIPPED_UNSUPPORTED_TYPE',
                caveat: 'Function/Object/Array prop with no curated PROP_VALUE_HINTS entry — extend the dictionary with a realistic value and re-run with `only: [prop]` rather than trust this row.'
            })
            continue
        }

        const variant = await captureMount(strategy, {...baseProps, [prop]: candidate.value}, Comp)
        const addedClasses = variant.classes.filter((c) => !baseClassSet.has(c))
        variant.wrapper.unmount()

        const initialRenderChanged = variant.html !== base.html || variant.styleText !== base.styleText

        const reactivity = await captureMount(strategy, baseProps, Comp)
        const beforeHtml = reactivity.target.html()
        const beforeIds = headStyleTagIds()
        await strategy.setChildProps(reactivity.wrapper, {...baseProps, [prop]: candidate.value})
        await settle()
        const afterHtml = reactivity.target.html()
        const afterIds = headStyleTagIds()
        const newReactiveIds = Array.from(afterIds).filter((id) => !beforeIds.has(id))
        const reactiveRenderChanged = afterHtml !== beforeHtml || newReactiveIds.length > 0
        reactivity.wrapper.unmount()

        const orphanCustomProperty = source ? findOrphanCustomProperty(source, rootClass, addedClasses) : null

        const verdict: IPropVerdict['verdict'] = initialRenderChanged ? 'ALIVE' : 'DEAD'
        const caveats: string[] = []

        if (candidate.confidence === 'sentinel') {
            caveats.push(`Aucune valeur curatee pour "${prop}" (PROP_VALUE_HINTS) — sentinel string utilisee ; un DEAD ici peut n'etre qu'un mauvais format de test, pas une preuve d'absence.`)
        }
        if (orphanCustomProperty) {
            caveats.push(`Static check : la classe ajoutee fixe UNIQUEMENT la custom property "${orphanCustomProperty}", jamais lue ailleurs dans le <style> du composant — pattern issue #391 (probable morte malgre le changement de markup). jsdom ne charge pas le <style scoped> du SFC : confirmation en navigateur reel (Playwright) necessaire avant cloture.`)
        }

        results.push({
            prop,
            testValue: candidate.value,
            valueConfidence: candidate.confidence,
            initialRenderChanged,
            reactiveRenderChanged,
            addedClasses,
            orphanCustomProperty,
            verdict,
            caveat: caveats.length ? caveats.join(' ') : null
        })
    }

    return results
}
