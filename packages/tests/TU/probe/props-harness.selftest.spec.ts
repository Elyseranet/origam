/*********************************************************
 * props-harness — self-test
 *
 * @description
 * Modelled on `packages/ds/scripts/guards/pnpm-tree-integrity.selftest.mjs`:
 * a MUST_FLAG list (things the harness must NOT miss) and a MUST_NOT_FLAG
 * list (things it must NOT cry wolf on), with precision weighted at least
 * as heavily as recall — a harness that flags everything "suspect" gets
 * ignored within a week, same reasoning as the tree-integrity guard.
 *
 * Unlike the `.mjs` guards, this one has to run through Vitest: it mounts
 * real Vue components (jsdom + `@vue/test-utils`), which a plain `node`
 * script cannot do. The MUST_FLAG/MUST_NOT_FLAG shape is kept, but each
 * case is its own `it()` so a regression points straight at the failing
 * criterion instead of a single pass/fail blob.
 *
 * Five criteria, each with at least one real-bug MUST_FLAG and one
 * healthy-prop MUST_NOT_FLAG:
 *
 *   1. RUNTIME PROP SOURCE — the harness must read `Comp.props`, not an
 *      `I*Props` interface file (mission lesson #1).
 *   2. SUBTREE DIFF — a prop that changes a CHILD element with no class
 *      change on the root must still be caught (mission lesson #2).
 *   3. INITIAL RENDER DIFF — an unconsumed prop is DEAD; a consumed one
 *      is ALIVE.
 *   4. REACTIVITY DIFF — a prop captured eagerly at `setup()` (ADR-005's
 *      exact failure mode, see `CLAUDE.md`) renders correctly on first
 *      mount but never updates after `setProps` — the harness must
 *      distinguish "alive at mount" from "alive reactively".
 *   5. ORPHAN CUSTOM PROPERTY (static) — the one class of "markup
 *      changed but it's still dead" bug reachable without a real
 *      browser (issue #391). Both a literal-SCSS unit check and the
 *      live end-to-end touchstone on `OrigamBtn` are included. #391 is
 *      now FIXED, so the live touchstone flipped from MUST_FLAG to
 *      MUST_NOT_FLAG — exactly the "correct, desired outcome" this
 *      comment used to predict — while the pinned literal cases (5a)
 *      keep the static analyser itself honest independently of
 *      `OrigamBtn.vue`'s current source.
 ********************************************************/

import {resolve} from 'node:path'
import {describe, expect, it} from 'vitest'
import {defineComponent} from 'vue'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import OrigamCarousel from '@origam/components/Carousel/OrigamCarousel.vue'
import OrigamCarouselItem from '@origam/components/Carousel/OrigamCarouselItem.vue'
// `ICarouselItemProps` (see `../../../ds/src/interfaces/Carousel/carousel-item.interface.ts`)
// is `interface ICarouselItemProps extends IImgProps, IWindowItemProps { transition?: boolean | string }`
// — its OWN declared members are just `transition`. Not imported here: it's
// a type-only interface, nothing to assert against at runtime — the point
// this test proves is exactly that reading it would undercount by ~40+ props.

import {
    componentKebabName,
    findOrphanCustomProperty,
    getRuntimeProps,
    parentSlotMount,
    probeComponentProps
} from './props-harness'

const BTN_SOURCE = resolve(__dirname, '../../../ds/src/components/Btn/OrigamBtn.vue')

/*********************************************************
 * Synthetic components — small, purpose-built, one failure mode each.
 * Real components are noisy (many props at once); these isolate a
 * single mechanism so a self-test failure points at ONE cause.
 ********************************************************/

const UnconsumedPropComp = defineComponent({
    __name: 'UnconsumedPropComp',
    props: {ghost: {type: Boolean, default: false}},
    template: `<div class="uc-root">static</div>`
})

const WorkingPropComp = defineComponent({
    __name: 'WorkingPropComp',
    props: {label: {type: String, default: ''}},
    template: `<div class="wp-root">{{ label }}</div>`
})

/**
 * Reproduces ADR-005's exact failure mode (see `CLAUDE.md`): a prop read
 * EAGERLY into a plain local at `setup()` time is a snapshot, not a
 * subscription — it renders correctly once (whatever was passed at
 * mount) but a later `setProps` never touches it again.
 */
/**
 * Boolean prop defaulting to `true` (the Chart family's `showTooltip` /
 * `animated` shape). If the harness picked a hardcoded `true` as the
 * test candidate, it would compare `true` (variant) against `true`
 * (baseline's own default) and falsely report DEAD.
 */
const DefaultTrueBooleanComp = defineComponent({
    __name: 'DefaultTrueBooleanComp',
    props: {enabled: {type: Boolean, default: true}},
    template: `<div v-if="enabled" class="dtb-on">on</div><div v-else class="dtb-off">off</div>`
})

/**
 * `type: null` reproduction (the `legendPosition` shape on the Chart
 * family: a plain string-literal union type alias, which the SFC macro
 * cannot reflect to a runtime constructor). Vue itself accepts a raw
 * `null` type descriptor at runtime — this is not a contrived shape.
 */
const NullTypePropComp = defineComponent({
    __name: 'NullTypePropComp',
    props: {anchor: {type: null, default: 'bottom'}},
    template: `<div class="nt-root">{{ anchor }}</div>`
})

const ReactivityBrokenComp = defineComponent({
    __name: 'ReactivityBrokenComp',
    props: {label: {type: String, default: ''}},
    setup (props) {
        const frozen = props.label // eager read — the bug, on purpose
        return {frozen}
    },
    template: `<div class="rb-root">{{ frozen }}</div>`
})

describe('props-harness self-test', () => {
    /*****************************************************
     * 1. RUNTIME PROP SOURCE
     *****************************************************/
    describe('1. runtime prop source (not the interface file)', () => {
        it('MUST_FLAG — ICarouselItemProps (the interface file) undercounts the real surface', () => {
            // The interface itself only re-exports inherited shapes — its
            // OWN declared members are a small fraction of what the SFC
            // compiler actually generates into `Comp.props`. This is the
            // exact trap the mission brief describes: reading the file
            // gives `transition` (± the handful declared directly on
            // ICarouselItemProps) and nothing about IImgProps/IWindowItemProps.
            const runtime = Object.keys(getRuntimeProps(OrigamCarouselItem))
            expect(runtime.length).toBeGreaterThan(40) // 62 measured live, vs. 1 (`transition`) in the interface file
        })

        it('MUST_NOT_FLAG — a component with a genuinely small prop surface is not padded or shrunk', () => {
            const runtime = Object.keys(getRuntimeProps(WorkingPropComp))
            expect(runtime).toEqual(['label'])
        })

        it('MUST_FLAG — getRuntimeProps throws on a value with no `.props` (misuse guard)', () => {
            expect(() => getRuntimeProps({})).toThrow()
            expect(() => getRuntimeProps(null)).toThrow()
        })

        it('MUST_FLAG — probeComponentProps throws when `only` shares ZERO names with the real prop surface (Chart-family reuse bug)', async () => {
            // Bug this pins: a shared `only` list built for one component's
            // prop surface (IChartBaseProps: title/rounded/…) was reused
            // across the whole Chart family, but OrigamChartRangeSelector's
            // real props are `buttons`/`activeIndex`/`dataLength` — NONE of
            // which overlap. Vue's attrs-fallthrough turned every requested
            // name into a plain HTML attribute (markup DID change), so the
            // harness reported confident ALIVE verdicts for props the
            // component doesn't even have. `WorkingPropComp` only declares
            // `label` — asking for an unrelated list reproduces exactly that.
            await expect(probeComponentProps(WorkingPropComp, {only: ['title', 'rounded', 'elevation']}))
                .rejects.toThrow(/none of the requested props/i)
        })

        it('MUST_NOT_FLAG — probeComponentProps still runs on the subset of `only` that DOES exist (partial overlap is legitimate)', async () => {
            const results = await probeComponentProps(WorkingPropComp, {only: ['label', 'notARealProp']})
            expect(results.map((r) => r.prop)).toEqual(['label'])
        })
    })

    /*****************************************************
     * 2. SUBTREE DIFF (child-forwarding, no root class change)
     *****************************************************/
    describe('2. full-subtree diff — a prop that only changes a CHILD element', () => {
        it('MUST_FLAG (as ALIVE) — OrigamCarouselItem.rounded forwards into the nested <origam-img>, no class lands on the item root', async () => {
            const strategy = parentSlotMount(OrigamCarousel, OrigamCarouselItem, {height: 300})
            const [result] = await probeComponentProps(OrigamCarouselItem, {
                only: ['rounded'],
                mountStrategy: strategy
            })
            expect(result.addedClasses).toEqual([]) // the trap: root classes alone say "nothing happened"
            expect(result.initialRenderChanged).toBe(true) // the full subtree says otherwise
            expect(result.verdict).toBe('ALIVE')
        }, 20000)
    })

    /*****************************************************
     * 3. INITIAL RENDER DIFF
     *****************************************************/
    describe('3. initial render diff — consumed vs unconsumed prop', () => {
        it('MUST_FLAG (as DEAD) — a prop the template never reads', async () => {
            const [result] = await probeComponentProps(UnconsumedPropComp, {only: ['ghost']})
            expect(result.verdict).toBe('DEAD')
        })

        it('MUST_NOT_FLAG — a prop the template reads directly', async () => {
            const [result] = await probeComponentProps(WorkingPropComp, {only: ['label']})
            expect(result.verdict).toBe('ALIVE')
        })

        it('MUST_FLAG (as ALIVE, not a false DEAD) — a boolean prop defaulting to true (Chart family shape: showTooltip/animated)', async () => {
            const [result] = await probeComponentProps(DefaultTrueBooleanComp, {only: ['enabled']})
            // Bug this pins: a hardcoded `true` candidate would compare
            // true (variant) against true (baseline's own default) and
            // report a false DEAD despite the prop being fully consumed.
            expect(result.testValue).toBe(false)
            expect(result.verdict).toBe('ALIVE')
        })

        it('MUST_FLAG (as ALIVE, not SKIPPED) — a `type: null` prop (Chart family shape: legendPosition) still gets a sentinel value', async () => {
            const [result] = await probeComponentProps(NullTypePropComp, {only: ['anchor']})
            // Bug this pins: `def == null` tested the whole descriptor
            // instead of `def.type == null`, so every `type: null` prop
            // (a real, common Vue pattern, not a contrived shape) was
            // routed to `unsupported` and skipped outright.
            expect(result.verdict).not.toBe('SKIPPED_UNSUPPORTED_TYPE')
            expect(result.verdict).toBe('ALIVE')
        })
    })

    /*****************************************************
     * 4. REACTIVITY DIFF
     *****************************************************/
    describe('4. reactivity diff — alive at mount vs alive reactively', () => {
        it('MUST_FLAG — a prop frozen into a local at setup() renders once but never updates (ADR-005 pattern)', async () => {
            const [result] = await probeComponentProps(ReactivityBrokenComp, {only: ['label']})
            expect(result.initialRenderChanged).toBe(true) // fresh mount DOES bake the value in
            expect(result.reactiveRenderChanged).toBe(false) // setProps after mount does nothing
        })

        it('MUST_NOT_FLAG — a prop bound directly in the template updates both at mount and reactively', async () => {
            const [result] = await probeComponentProps(WorkingPropComp, {only: ['label']})
            expect(result.initialRenderChanged).toBe(true)
            expect(result.reactiveRenderChanged).toBe(true)
        })
    })

    /*****************************************************
     * 5. ORPHAN CUSTOM PROPERTY (static, issue #391 pattern)
     *****************************************************/
    describe('5. orphan custom property — the touchstones (OrigamBtn.border FIXED #391, OrigamBtn.variant alive)', () => {
        // 5a. Pinned literal-SCSS unit checks — independent of the live
        // source file, so a refactor of OrigamBtn.vue can't silently
        // disable this analyser without a DIFFERENT test (5b) noticing.
        it('MUST_FLAG (literal) — a modifier class that ONLY sets a custom property never read elsewhere', () => {
            const source = `
                <style scoped lang="scss">
                .origam-zz {
                    &--border {
                        --origam-zz---border-width: thin;
                    }
                }
                </style>
            `
            const orphan = findOrphanCustomProperty(source, 'origam-zz', ['origam-zz--border'])
            expect(orphan, 'expected this case to be flagged, it was not').toBe('--origam-zz---border-width')
        })

        it('MUST_NOT_FLAG (literal) — a modifier class that sets a REAL property directly', () => {
            const source = `
                <style scoped lang="scss">
                .origam-zz {
                    &--variant-elevated {
                        box-shadow: var(--origam-zz---box-shadow-elevated, var(--origam-shadow---md));
                    }
                }
                </style>
            `
            const orphan = findOrphanCustomProperty(source, 'origam-zz', ['origam-zz--variant-elevated'])
            expect(orphan, 'expected this case NOT to be flagged, it was').toBeNull()
        })

        it('MUST_NOT_FLAG (literal) — a custom property that IS consumed elsewhere in the same <style> block', () => {
            const source = `
                <style scoped lang="scss">
                .origam-zz {
                    border-width: var(--origam-zz---border-width, 0);
                    &--border {
                        --origam-zz---border-width: thin;
                    }
                }
                </style>
            `
            const orphan = findOrphanCustomProperty(source, 'origam-zz', ['origam-zz--border'])
            expect(orphan, 'expected this case NOT to be flagged, it was').toBeNull()
        })

        // 5b. Live end-to-end touchstones — the actual mandate: prove the
        // harness distinguishes OrigamBtn's real `border` from its real
        // `variant` (both alive as of the #391 fix), sourced from the
        // SHIPPED component, not a fixture.
        //
        // #391 FIXED — this touchstone flipped from MUST_FLAG to
        // MUST_NOT_FLAG, exactly as the module doc above promised it
        // would ("the live case would then start failing MUST_FLAG,
        // which is the correct, desired outcome"). Root cause was two
        // DIFFERENT custom properties: the base `.origam-btn` rule read
        // `--origam-btn-group---border-width` while `&--border` wrote
        // `--origam-btn---border-width`. The base rule now reads the
        // BTN's own var directly (`border-{side}-width: var(--origam-btn
        // ---border-{side}-width, var(--origam-btn---border-width, 0))`),
        // so `&--border`'s write is consumed in the SAME <style> block —
        // no longer an orphan. See OrigamBtn.vue's `#391` comments for
        // the full analysis (incl. why the group-var fallback is a
        // documented no-op, not a live fallback path).
        it('MUST_NOT_FLAG — live OrigamBtn.border (issue #391, fixed): markup changes AND the custom property it sets is consumed', async () => {
            const [result] = await probeComponentProps(OrigamBtn, {
                only: ['border'],
                baseProps: {text: 'X'},
                sourcePath: BTN_SOURCE
            })
            // Honest reporting, not a forced verdict: jsdom cannot load the
            // component's own <style scoped> block (measured — see module
            // doc), so a class-driven effect's real visual outcome is out
            // of reach here (the actual paint is proven separately, in a
            // real browser, against a running Histoire instance — see the
            // #391 PR). What IS provable, and asserted below, is the
            // static signature: the class border={true} adds sets a
            // custom property (`--origam-btn---border-width`) that
            // OrigamBtn.vue's base rule now reads.
            expect(result.addedClasses).toContain('origam-btn--border')
            expect(result.orphanCustomProperty, 'expected this case NOT to be flagged, it was').toBeNull()
        }, 20000)

        it('MUST_NOT_FLAG — live OrigamBtn.variant: a real property, not an orphan', async () => {
            const [result] = await probeComponentProps(OrigamBtn, {
                only: ['variant'],
                baseProps: {text: 'X'},
                sourcePath: BTN_SOURCE
            })
            expect(result.verdict).toBe('ALIVE')
            expect(result.orphanCustomProperty, 'expected this case NOT to be flagged, it was').toBeNull()
        }, 20000)
    })
})

/**
 * Kebab-name derivation, exercised on its own since every other check
 * depends on it silently succeeding.
 */
describe('componentKebabName', () => {
    it('OrigamBtn -> origam-btn', () => {
        expect(componentKebabName(OrigamBtn)).toBe('origam-btn')
    })

    it('OrigamCarouselItem -> origam-carousel-item', () => {
        expect(componentKebabName(OrigamCarouselItem)).toBe('origam-carousel-item')
    })
})
