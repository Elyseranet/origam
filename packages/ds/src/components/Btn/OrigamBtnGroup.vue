<template>
	<component
			:is="props.tag"
			:id="id"
			role="group"
			:class="btnGroupClasses"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot name="default">
				<template v-if="hasItems">
					<template
							v-for="(item, index) in items"
							:key="index"
					>
						<slot
								name="item"
								v-bind="{item, index}"
						>
							<origam-btn v-bind="item"/>
						</slot>
					</template>
				</template>
			</slot>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamBtn, OrigamDefaultsProvider } from '../../components'
	import {
		useDensity,
		usePassedProps,
		useProps,
		useSize,
		useStateEffect,
		useStyle,
		useVariant
	} from '../../composables'

	import { DENSITY } from '../../enums'

	import type { IBtnGroupProps, IBtnGroupSlots, IBtnProps } from '../../interfaces'
	import { omitUndefined } from '../../utils'

	import { computed, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and slot defaults propagation to child buttons
	 * via OrigamDefaultsProvider.
	 ********************************************************/
	const props = withDefaults(defineProps<IBtnGroupProps>(), {tag: 'div', density: DENSITY.DEFAULT, items: () => []})

	const {filterProps} = useProps<IBtnGroupProps>(props)

	defineSlots<IBtnGroupSlots>()

	// Push the visual-token props down to every descendant `<origam-btn>`
	// as DEFAULTS — children that pass their own `density` / `color` /
	// `bgColor` / etc. still win (that's the contract: parent provides
	// defaults, child overrides). Children consume this map via
	// `useDefaults(props)` inside `OrigamBtn.vue`.
	//
	// A prop the CONSUMER never passed to `<origam-btn-group>` must NOT be
	// forwarded — else `mergeDeep` (used by `provideDefaults`/`useDefaults`
	// to combine this map with an ancestor/theme `'origam-btn'` defaults
	// entry) copies it unconditionally and silently overwrites the theme
	// default (e.g. `origam-btn: { density: 'comfortable' }`) — see #263,
	// the same bug already fixed on `OrigamAvatarGroup`.
	//
	// A plain `omitUndefined` is NOT enough for `hover` / `active`: both are
	// typed `boolean | IHoverState / IActiveState`, so Vue resolves an UNSET
	// prop to the concrete value `false` (its boolean-prop coercion), never
	// to `undefined` — there is no `undefined` left to filter. `usePassedProps`
	// reads `vnode.props` directly, so it tells the truth regardless of
	// Vue's coercion.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-btn': omitUndefined({
			// `variant` is the ONE deliberate exception, kept unconditional:
			// `--variant-text` (the group's own root default, and every
			// child's own component default) has NO active-state background
			// rule at all — only `outlined`/`tonal` paint a filled surface
			// on the selected segment (see OrigamBtn.vue's
			// `&--variant-outlined { &--active { background-color: ... } }`).
			// The group's OWN resolved `variant` (whether explicitly passed,
			// or resolved from a theme's `'origam-btn-group'` defaults) must
			// always reach the children — else a themed
			// `<origam-btn-toggle variant="outlined">` gets the right root
			// chrome but every child silently stays on 'text', so the active
			// segment never fills — no visible selection at all.
			variant: props.variant,
			density: wasPropPassed('density') ? props.density : undefined,
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
			size: wasPropPassed('size') ? props.size : undefined,
			// New API: `hover` / `active` accept boolean | IHoverState |
			// IActiveState; pass-through propagates the parent's intent
			// override to each child OrigamBtn — only when the consumer
			// actually set it.
			hover: wasPropPassed('hover') ? props.hover : undefined,
			active: wasPropPassed('active') ? props.active : undefined
		})
	}))

	// The `items` array path used to manually merge with `props.x ?? item.x`,
	// which made the parent OVERRIDE the item (the inverse of the documented
	// "parent default, item override" contract). The merge is no longer
	// needed — `useDefaults` inside each child enforces the correct
	// resolution order and respects per-item overrides automatically.
	const items = computed(() => (props.items ?? []) as Array<IBtnProps>)

	const slots = useSlots()
	const hasItems = computed(() => {
		return slots.default || !!items.value
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes border, color, elevation, rounding and spacing
	 * classes/styles onto the group root element.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)

	// A themed `<origam-btn-toggle size="small">` must resolve to the SAME
	// height as a standalone `size="small"` Btn (e.g. the Split button
	// sitting next to it) — otherwise the group is visibly taller than
	// every real themed button around it, and at a fixed radius a taller
	// control also just reads as "less rounded" (same curve, bigger box).
	// `--origam-btn---height` is set LOCALLY on each Btn instance by its
	// OWN `--size-*` modifier class — it is NOT a theme-global custom
	// property, so the group (a SIBLING of Split, not its descendant)
	// cannot simply inherit it via CSS cascade. The group needs its OWN
	// `size` prop and its OWN matching `--size-*` rules (below) to
	// resolve independently to the same height. Mirrors `OrigamBtn.vue`'s
	// exact `useSize` usage.
	const {sizeClasses} = useSize(props)

	// The group's OWN surface must read as "the theme's btn, uncut" — a
	// themed `origam-btn: { variant: 'tonal' }` (e.g. glass) should paint
	// the SAME translucent surface on the group that a standalone Btn
	// would get, not fall back to a plain/transparent default that then
	// gets patched over by each child's own background (which is exactly
	// what produced the "flat white toggle" bug: children individually
	// painting their own tonal bg, unevenly, instead of one shared
	// surface). `variantClasses` below reuses the SAME CSS custom
	// properties `OrigamBtn` itself reads (they're theme-global tokens,
	// not scoped to the Btn instance) via matching `--variant-*` SCSS
	// rules further down.
	const {variantClasses} = useVariant(props)

	/*********************************************************
	 * Color
	 ********************************************************/

	const {
		colorStyles,
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props)
	const btnGroupStyles = computed(() => {
		return [
			borderStyles.value,
			roundedStyles.value,
			colorStyles.value,
			marginStyles.value,
			paddingStyles.value,
			elevationStyles.value,
			props.style
		] as StyleValue
	})
	const btnGroupClasses = computed(() => {
		return [
			'origam-btn-group',
			{
				'origam-btn-group--divided': props.divided
			},
			borderClasses.value,
			densityClasses.value,
			elevationClasses.value,
			roundedClasses.value,
			marginClasses.value,
			paddingClasses.value,
			variantClasses.value,
			sizeClasses.value,
			props.class
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(btnGroupStyles)

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps, style utilities.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-btn-group {
		display: inline-flex;
		flex-wrap: nowrap;
		align-items: stretch;
		// `overflow: hidden` does the whole job of shaping the children:
		// per CSS, the clip follows the PADDING-BOX curvature — the outer
		// radius minus the border width — so square-cornered children are
		// clipped flush against the inside of the border ring, on any
		// border thickness, with the browser computing the inner radius.
		overflow: hidden;
		vertical-align: middle;

		max-width: 100%;
		min-width: 0;
		// `--origam-btn-group---height` (own custom property, set by the
		// `&--size-*` rules below) — NOT `--origam-btn---height` directly:
		// that token is scoped LOCALLY to each Btn instance by its own
		// size modifier class, it does not cascade from a sibling Split
		// button down to the group. `box-sizing: border-box` makes this a
		// TOTAL height (border included) — matching how Btn's own `height`
		// already works — so the group's border-box height equals a themed
		// btn's border-box height by construction, never taller by the
		// border's own width. Children are `height: auto` + `align-items:
		// stretch` (see :deep below): they fill the content box inside the
		// border, exactly like a btn's own content sits inside its own
		// border.
		box-sizing: border-box;
		height: calc(var(--origam-btn-group---height, 36px) + var(--origam-btn-group---density, 0px));

		border-width: var(--origam-btn-group---border-width);
		border-style: var(--origam-btn-group---border-style);
		border-color: var(--origam-btn-group---border-color);
		border-radius: var(--origam-btn-group---border-radius, 4px);

		background-color: var(--origam-btn-group---background-color);
		color: var(--origam-btn-group---color);

		&--border {
			--origam-btn-group---border-width: thin;
		}

		&--rounded {
			--origam-btn-group---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			--origam-btn-group---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-btn-group---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-btn-group---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-btn-group---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-btn-group---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-btn-group---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--density-comfortable {
			--origam-btn-group---density: 8px;
		}

		&--density-default {
			--origam-btn-group---density: 0px;
		}

		&--density-compact {
			--origam-btn-group---density: -8px;
		}

		// Same height values as `OrigamBtn`'s own `&--size-*` rules, one for
		// one — a themed `<origam-btn-toggle size="small">` must resolve to
		// the exact height a standalone `size="small"` Btn does.
		&--size-x-small {
			--origam-btn-group---height: 20px;
		}

		&--size-small {
			--origam-btn-group---height: 28px;
		}

		&--size-default {
			--origam-btn-group---height: 36px;
		}

		&--size-large {
			--origam-btn-group---height: 44px;
		}

		&--size-x-large {
			--origam-btn-group---height: 52px;
		}

		// Full parity with `OrigamBtn`'s own variant rules — same CSS
		// custom properties, same literal values, one-for-one. A themed
		// `origam-btn: { variant: 'outlined' }` (cartoon/geek/editorial)
		// must produce the SAME border-width/border-color/background/
		// box-shadow on the group as it does on a standalone Btn; the
		// group is not allowed to fall back to a subset. Earlier passes
		// only ported the `background-color` half of each rule (border/
		// shadow were silently dropped), which is exactly what made the
		// toggle read as "thin border, no shadow" next to a themed Btn's
		// thick border + hard shadow under cartoon.
		&--variant-flat {
			box-shadow: none;
		}

		&--variant-text,
		&--variant-plain {
			background-color: transparent !important;
			box-shadow: none;
		}

		&--variant-elevated {
			box-shadow: var(--origam-btn---box-shadow-elevated, var(--origam-shadow---md));
		}

		&--variant-tonal {
			background-color: var(
				--origam-btn---background-color-tonal,
				var(--origam-color__surface---overlay)
			) !important;
			box-shadow: none;
		}

		&--variant-outlined {
			background-color: transparent !important;
			// Mirror the literal border-width into the SAME custom property
			// `--origam-btn-group---inner-border-radius` calc()s against
			// (see the base rule above) — that calc reads the CUSTOM
			// PROPERTY, which this rule would otherwise never touch (it
			// only ever set the literal `border-width` property directly),
			// leaving the calc's border-width input silently at its
			// pre-variant fallback of 0 regardless of the REAL rendered
			// border. `calc(20px - 0px)` still LOOKS plausible, so this
			// class of bug doesn't throw or visibly break — it just quietly
			// gives the child's fill the wrong inset curve.
			--origam-btn-group---border-width: var(--origam-btn---border-width-outlined, var(--origam-border__width---thin));
			border-width: var(--origam-btn-group---border-width);
			border-style: solid;
			border-color: var(--origam-btn---border-color, currentColor);
			box-shadow: none;
		}

		&--variant-ghost {
			background-color: var(
				--origam-btn---background-color-ghost,
				color-mix(in srgb, currentColor 12%, transparent)
			) !important;
			// See the matching comment in `&--variant-outlined` above.
			--origam-btn-group---border-width: var(--origam-btn---border-width-ghost, var(--origam-border__width---thin));
			border-width: var(--origam-btn-group---border-width);
			border-style: solid;
			border-color: var(
				--origam-btn---border-color-ghost,
				color-mix(in srgb, currentColor 24%, transparent)
			);
			box-shadow: var(
				--origam-btn---box-shadow-ghost,
				0 0 0 1px color-mix(in srgb, currentColor 18%, transparent),
				0 4px 18px 0 color-mix(in srgb, currentColor 28%, transparent),
				0 1px 0 0 color-mix(in srgb, white 35%, transparent) inset
			);

			@supports (backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px)) {
				backdrop-filter: var(--origam-btn---backdrop-filter-ghost, blur(8px));
				-webkit-backdrop-filter: var(--origam-btn---backdrop-filter-ghost, blur(8px));
			}
		}

		// A btnGroup/btnToggle reads as ONE button with internal
		// separators — not N bordered buttons glued together. The GROUP
		// owns the ONE visible border, the ONE outer radius and the ONE
		// elevation; every child button is rendered "naked" (zero border
		// of its own, zero radius, zero shadow) regardless of what the
		// theme's OWN `origam-btn` config would normally paint on a
		// standalone button — a themed `origam-btn: { border: true }`
		// would otherwise stack a second border directly on top of the
		// group's, reading as a visibly doubled/thicker line. `!important`
		// is intentional: the group's design wins over the child's own
		// resolved theme props.
		//
		// `overflow: hidden` alone clips the group to its own rounded
		// shape but does NOT round the first/last child's own corners —
		// a fully square button sitting inside a rounded clip leaves a
		// visible gap at each of the 4 corners (the group's background
		// showing through a "square peg in a round hole"). The first and
		// last child must adopt the group's INNER radius — the outer
		// radius minus the border's own width, i.e. the curve of the
		// surface the border ring encloses, not the outer edge of the
		// border itself. Using the outer radius here (as a previous pass
		// did) is off by exactly `border-width`: on a thick border
		// (cartoon's 3px) the active segment's fill corner curved too
		// early, leaving a sliver of the group's own background visible
		// between the fill and the inside of the border ring.
		:deep(.origam-btn) {
			border-width: 0 !important;
			border-style: none !important;
			border-radius: 0 !important;
			box-shadow: none !important;
			// `auto` releases the child's own explicit height so
			// `align-items: stretch` fills the group's content box —
			// the child occupies the inside of the border ring exactly
			// like a standalone btn's content sits inside its own border.
			height: auto !important;
			min-height: 0 !important;

			// Resting (non-selected) segments stay fully naked — no
			// background of their own — so the group's ONE surface
			// (painted above via `variantClasses`) shows through evenly
			// across the whole strip instead of each child individually
			// re-painting its own themed variant background (that
			// per-child repaint, at varying opacity/tint per button, is
			// what produced the inconsistent/blank-looking group surface
			// bug). The SELECTED segment inside an `OrigamBtnToggle`
			// keeps its own active-state background — that fill is the
			// documented, intentional "reads as a real filled button"
			// affordance for the current selection (see `OrigamBtn`'s
			// `&--variant-outlined &--active` / `&--variant-tonal
			// &--active` rules) and is NOT the bug being fixed here.
			&:not(.origam-btn--active) {
				background-color: transparent !important;
			}

			// NO per-corner radius overrides: children stay square
			// (`border-radius: 0` above) and the group's `overflow: hidden`
			// clips them to its own inner curvature — the browser derives
			// the inner radius (outer − border-width) natively.
		}

		// `divided` adds back a THIN, intentional separator between
		// segments — NOT the child's own border reinstated (still zeroed
		// on every other side by the block above). Colour matches the
		// group's own resolved border color so it reads as part of the
		// same single surface, not a second competing border.
		&--divided {
			:deep(.origam-btn) {
				&:not(:last-child) {
					border-inline-end-width: thin !important;
					border-inline-end-style: solid !important;
					border-inline-end-color: var(--origam-btn-group---border-color, currentColor) !important;
				}
			}
		}
	}
</style>

<style>
	:root {
		--origam-btn-group---density: 0;

		--origam-btn-group---border-radius: var(--origam-btn---border-radius, 4px);
		--origam-btn-group---border-width: var(--origam-btn---border-width, 0);
		--origam-btn-group---border-style: var(--origam-btn---border-style, solid);
		--origam-btn-group---border-color: var(--origam-btn---border-color, currentColor);
		/* Base surface fallback for the `flat`/`elevated`/unset variants
		 * (the ones that DON'T override background via their own
		 * `--variant-*` rule above) — mirrors `OrigamBtn`'s own base
		 * `background-color: var(--origam-btn---background-color, …)`
		 * rule so the group's resting surface always matches the
		 * theme's btn, never a hardcoded/transparent default. */
		--origam-btn-group---background-color: var(--origam-btn---background-color, transparent);
		/* Same fallback chain as background-color/border-* above — without
		 * it the group's text/currentColor (used by outlined/ghost border
		 * fallbacks) drifted from Btn's own default instead of matching. */
		--origam-btn-group---color: var(--origam-btn---color, rgba(30, 30, 30, 0.87));

	}
</style>
