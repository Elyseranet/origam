/*********************************************************
 * IAccessibleClickableProps
 *
 * @description
 * ⛔ issue #653 — compile-time half of the "no ARIA is better than bad
 * ARIA" contract already enforced at runtime (dev-only) by
 * `useIconAccessibility()` (`composables/Icon/iconAccessibility.composable.ts`).
 * A control that is `clickable` MUST carry a real accessible name —
 * `ariaLabel` or `ariaLabelledby` — never a fabricated one (see #622,
 * where an auto-generated label overwrote a visible `<label for>` and
 * every affected control announced the same wrong string).
 *
 * @description
 * Discriminated union on `clickable`:
 * - `clickable: true` requires AT LEAST one of `ariaLabel` /
 *   `ariaLabelledby` (both may be supplied; only one is mandatory).
 *   `vue-tsc` refuses a consumer that sets `clickable` and supplies
 *   neither.
 * - `clickable` false or omitted leaves both optional — a decorative
 *   glyph never needs a name, but nothing stops a consumer from setting
 *   one anyway (e.g. a non-clickable icon inside a labelled group).
 *
 * @description
 * ⛔ Named `ariaLabel` / `ariaLabelledby` (camelCase), NOT the literal
 * hyphenated `'aria-label'` / `'aria-labelledby'` HTML attribute names —
 * measured on this exact shape (issue #653): `@vue/compiler-sfc`
 * CAMELIZES every prop key it extracts from a `defineProps<T>()` type
 * into the runtime props descriptor, regardless of how the TS type
 * spells the key. Typing the field as the literal string `'aria-label'`
 * still type-checks, but the actual runtime prop Vue creates is
 * `ariaLabel` either way — so `props['aria-label']` compiles fine and
 * reads `undefined` forever (confirmed: `Object.keys(props)` printed
 * `'ariaLabel'`, never `'aria-label'`, for a component declaring the
 * hyphenated key). Naming the field `ariaLabel` up front makes the type
 * match the runtime, and matches the existing convention already used
 * for `ariaLabel` elsewhere in this DS (`OrigamPagination`,
 * `OrigamTreeview`, `OrigamCalendar`'s charts, …). AT RUNTIME a consumer
 * may still write the kebab-case HTML attribute —
 * `<origam-icon clickable aria-label="Close" .../>` — Vue's own
 * camelize/hyphenate equivalence resolves that to this prop correctly,
 * exactly like it already does for `bgColor` / `bg-color` (unit-tested:
 * `packages/tests/TU/components/Icon/icon-accessibility.spec.ts` mounts
 * with the literal `'aria-label'` key and it reaches the DOM). See the
 * next paragraph for why the STATIC type-checker is a different story.
 *
 * @description
 * ⛔⛔ KNOWN TOOLING GAP (report before assuming a regression): `vue-tsc`
 * does NOT apply the kebab→camelCase attribute-name equivalence when
 * checking a template usage against a UNION-typed prop — only against a
 * plain (non-union) prop type. Measured (issue #653), isolated down to
 * the smallest repro:
 *
 *     type T = { clickable: true; ariaLabel: string }
 *            | { clickable?: false; ariaLabel?: string }
 *     defineProps<T>()
 *     // consumer: <X :clickable="true" aria-label="Close"/>
 *     // → still errors: "'aria-label' is not assignable to
 *     //   { ariaLabel: string } | { ariaLabel?: string }"
 *     // consumer: <X :clickable="true" :ariaLabel="'Close'"/>
 *     // → compiles clean (literal camelCase attribute name)
 *
 * A non-union prop of the same shape (`interface { ariaLabel?: string }`)
 * type-checks a kebab `aria-label="…"` attribute correctly — the bug is
 * specific to the union. This matches a family of open upstream issues
 * in `vuejs/language-tools`: #1909 ("Prop type checks don't work for
 * components using kebab-case"), #5112 (`withDefaults` + union props),
 * #8952 ("Conditional properties through discriminated unions and
 * intersections" — literally this feature request), #3715 (discriminated
 * unions not narrowed when the discriminant is a `Ref`).
 *
 * CONSEQUENCE for consumers of a `clickable` component: the REFUSAL half
 * of the contract (no name supplied at all) is unaffected — no branch of
 * the union matches regardless of attribute casing, so `vue-tsc` correctly
 * rejects it either way. The ACCEPTANCE half is casing-sensitive with
 * today's tooling: `aria-label="…"` (idiomatic kebab HTML attribute) is
 * VALID AT RUNTIME but currently still flagged by `vue-tsc` as if the name
 * were missing — even `:aria-label="'Close'"` (kebab, but bound with `:`)
 * still fails. Until `vuejs/language-tools` fixes this, a consumer whose
 * CI runs `vue-tsc --noEmit` and hits this false positive must spell the
 * binding in the prop's own camelCase casing instead — `:ariaLabel="…"` —
 * which DOES satisfy the checker. Document this explicitly wherever
 * `IAccessibleClickableProps` is used in a public API doc (see
 * `OrigamIcon.md` etc.).
 *
 * @description
 * ⛔ Extend this on a component's OWN props type via a `type` alias
 * intersection (`type IXxxProps = IXxxBaseProps & IAccessibleClickableProps`),
 * never via `interface … extends` — TypeScript interfaces cannot extend a
 * union type. See `IIconClickableComponentProps` in
 * `interfaces/Icon/icon.interface.ts` for the reference consumer.
 *
 * @description
 * ⛔ NEVER wrap the intersected type in `withDefaults()`. Measured on
 * this exact shape (issue #653): `withDefaults(defineProps<Base &
 * Union>(), {...})` silently defeats the whole contract for TEMPLATE
 * consumers — `vue-tsc` stops reporting the missing-name error entirely,
 * even though `defineProps<Base & Union>()` alone (no `withDefaults`)
 * enforces it correctly, and even though a plain `.ts` object-literal
 * assignment to the same type ALSO enforces it correctly either way.
 * Root cause: `withDefaults`'s type helper builds its result via
 * `Omit<T, keyof Defaults>`, and both `Omit` and the `Pick` it is built
 * from are NOT distributive over a union `T` — `keyof (A | B)` is only
 * the properties common to every branch, so mapping over it collapses
 * the whole union into one flat object whose properties are typed as
 * the union of their per-branch types (`ariaLabel: string | undefined`
 * in every branch), destroying the cross-field constraint. Give the
 * defaultable prop (e.g. `tag`) its default via a same-named `computed`
 * that shadows the prop in the template instead:
 * `const tag = computed(() => props.tag ?? 'i')`.
 *
 * @description
 * ⛔ Once declared here, `ariaLabel` / `ariaLabelledby` become real Vue
 * PROPS on the consuming component — Vue routes them out of `$attrs`
 * and stops forwarding them to the rendered root automatically. A
 * component using this type MUST explicitly bind
 * `:aria-label="ariaLabel" :aria-labelledby="ariaLabelledby"` on its own
 * template root (or forward them to a dispatched child, if any) — same
 * class of bug as any other declared-but-unwired prop (see ADR-005).
 * Do NOT add a pass-through `computed(() => props.ariaLabel)` purely to
 * expose the value under the same name — `defineProps()` already
 * exposes it to the template bare; a wrapping computed was measured
 * elsewhere in this DS at +42.6% mount cost for zero behavioural gain.
 ********************************************************/
export type IAccessibleClickableProps =
    | {
        clickable: true
        ariaLabel: string
        ariaLabelledby?: string
    }
    | {
        clickable: true
        ariaLabelledby: string
        ariaLabel?: string
    }
    | {
        clickable?: false
        ariaLabel?: string
        ariaLabelledby?: string
    }
