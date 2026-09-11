<template>
	<component
			:is="tag"
			:id="id"
			v-contrast
			:class="barClasses"
	>
		<slot name="default">
			<div class="origam-toolbar__wrapper">
				<div
						v-if="hasPrepend"
						class="origam-toolbar__prepend"
				>
					<slot name="prepend"/>
				</div>
				<div
						v-if="hasTitle"
						:style="typographyStyles"
						class="origam-toolbar__title"
				>
					<slot name="title">
						<origam-title :text="title"/>
					</slot>
				</div>
				<div class="origam-toolbar__content">
					<slot name="content"/>
				</div>
				<div
						v-if="hasAppend"
						class="origam-toolbar__append"
				>
					<slot name="append"/>
				</div>
			</div>
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, toRef, useSlots } from 'vue'
	import { OrigamTitle } from "../../components"
	import {
		useActive,
		useDensity,
		useDimension,
		useHover,
		usePosition,
		useProps,
		useRtl,
		useStateEffect,
		useStyle,
		useTypography
	} from '../../composables'

	import { vContrast } from '../../directives'

	import { DENSITY } from '../../enums'

	import type { IToolbarProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults, filterProps utility, and slot ref.
	 ********************************************************/
	const props = withDefaults(defineProps<IToolbarProps>(), {
		tag: 'header',
		density: DENSITY.DEFAULT,
		modelValue: true
	})

	const {filterProps} = useProps<IToolbarProps>(props)

	const slots = useSlots()

	/*********************************************************
	 * Slot helpers
	 *
	 * @description
	 * Computed flags for conditional prepend / title / append
	 * rendering in the default wrapper slot.
	 ********************************************************/
	const hasPrepend = computed(() => {
		return slots.prepend
	})
	const hasTitle = computed(() => {
		return !!(props.title || slots.title)
	})
	const hasAppend = computed(() => {
		return slots.append
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles, plus useStyle for
	 * injected CSS custom property sheet.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {rtlClasses} = useRtl()


	const {isHover, hoverState} = useHover(props)
	const {isActive, activeState} = useActive(props)
	// `colorClasses` / `colorStyles` MUST come from `useStateEffect` so the
	// surface follows `hover` / `active` — e.g. a transparent sticky AppBar
	// that paints a background once `active` engages on scroll. A plain
	// `useBothColor` here would resolve only the RESTING bgColor/color and
	// silently ignore the state overrides (the bug this replaced).
	const {
		colorClasses, colorStyles,
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive, hoverState, activeState, undefined, toRef(props, 'flat'))
	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const {positionStyles, positionClasses} = usePosition(props)

	// fontSize, fontWeight, letterSpacing, lineHeight are read by .origam-title
	// inside __title via --origam-toolbar__title---* vars. Binding typographyStyles
	// on the __title div makes the vars available to the descendant .origam-title.
	const {typographyStyles} = useTypography(props, 'toolbar__title')

	const barStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			positionStyles.value,
			dimensionStyles.value,
			elevationStyles.value,
			props.style
		]
	})
	const barClasses = computed(() => {
		return [
			'origam-toolbar',
			{
				'origam-toolbar--collapse': props.collapse,
				'origam-toolbar--flat': props.flat,
				'origam-toolbar--floating': props.floating
			},
			borderClasses.value,
			colorClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			elevationClasses.value,
			roundedClasses.value,
			rtlClasses.value,
			positionClasses.value,
			props.class
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(barStyles)

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
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
	.origam-toolbar {
		$this: &;

		// ── Top-level declarations FIRST (before any nested rule) ────
		// Modern Sass (and the future CSS spec) hoist nested rules
		// above bare declarations; keeping the order
		// "declarations → nested rules" prevents the `mixed-decls`
		// deprecation warnings that were spamming `npm run story:dev`.

		max-width: var(--origam-toolbar---max-width);
		width: var(--origam-toolbar---width);
		height: var(--origam-toolbar---height);
		box-sizing: var(--origam-toolbar---box-sizing);

		// Default inline gutter so content (prepend / title / append)
		// never sits flush against the bar's edges — applies to every
		// Toolbar usage (AppBar, standalone, footer, etc.). 16 px matches
		// Material / iOS bar spec; consumer can override per-instance
		// via the public CSS var.
		//
		// The toolbar ALSO respects the layout's reserved-space
		// (`--origam-layout---position-{left,right}`) so when a permanent
		// drawer is present, the toolbar's content area is pushed past
		// the drawer instead of being painted over it. \`calc()\` composes
		// the toolbar's own gutter (16 px) with whatever the layout
		// reserved on each side (defaults to 0 when no layout item is
		// present, so the standalone case still gets the 16 px gutter).
		padding-inline-start: calc(
			var(--origam-toolbar---padding-inline, 16px) +
			var(--origam-layout---position-left, 0px)
		);
		padding-inline-end: calc(
			var(--origam-toolbar---padding-inline, 16px) +
			var(--origam-layout---position-right, 0px)
		);

		// ── Btn surface / fg base (consumed by nested btn rules below) ─
		// Dedicated CSS vars (NOT the bar's own bg / fg) so the nested
		// btn defaults to a transparent fill on top of the bar's
		// surface, then derives hover / active via color-mix.
		--btn-bg-base: var(--origam-toolbar---btn-background-color, transparent);
		--btn-fg-base: var(--origam-toolbar---btn-color, currentColor);

		overflow: var(--origam-toolbar---overflow);

		position: var(--origam-toolbar---position);
		z-index: var(--origam-toolbar---zIndex);

		transform: var(--origam-toolbar---transform);
		transition-duration: var(--origam-toolbar---transition-duration);
		transition-property: var(--origam-toolbar---transition-property);
		transition-timing-function: var(--origam-toolbar---transition-timing-function);

		border-color: var(--origam-toolbar---border-color);
		border-style: var(--origam-toolbar---border-style);
		border-top-width: var(--origam-toolbar---border-top-width, 0);
		border-right-width: var(--origam-toolbar---border-right-width, 0);
		border-bottom-width: var(--origam-toolbar---border-bottom-width, 0);
		border-left-width: var(--origam-toolbar---border-left-width, 0);
		border-start-start-radius: var(--origam-toolbar---border-start-start-radius, 0);
		border-start-end-radius: var(--origam-toolbar---border-start-end-radius, 0);
		border-end-end-radius: var(--origam-toolbar---border-end-end-radius, 0);
		border-end-start-radius: var(--origam-toolbar---border-end-start-radius, 0);

		background: var(--origam-toolbar---background);
		backdrop-filter: var(--origam-appbar---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-appbar---backdrop-filter, none);
		box-shadow: var(--origam-toolbar---box-shadow);
		color: var(--origam-toolbar---color);

		&--border {
			--origam-toolbar---border-top-width: thin;
			--origam-toolbar---border-right-width: thin;
			--origam-toolbar---border-bottom-width: thin;
			--origam-toolbar---border-left-width: thin;
		}

		&--border-top {
			--origam-toolbar---border-top-width: thin;
			--origam-toolbar---border-right-width: 0;
			--origam-toolbar---border-bottom-width: 0;
			--origam-toolbar---border-left-width: 0;
		}

		&--border-right {
			--origam-toolbar---border-top-width: 0;
			--origam-toolbar---border-right-width: thin;
			--origam-toolbar---border-bottom-width: 0;
			--origam-toolbar---border-left-width: 0;
		}

		&--border-bottom {
			--origam-toolbar---border-top-width: 0;
			--origam-toolbar---border-right-width: 0;
			--origam-toolbar---border-bottom-width: thin;
			--origam-toolbar---border-left-width: 0;
		}

		&--border-left {
			--origam-toolbar---border-top-width: 0;
			--origam-toolbar---border-right-width: 0;
			--origam-toolbar---border-bottom-width: 0;
			--origam-toolbar---border-left-width: thin;
		}

		&--rounded {
			--origam-toolbar---border-start-start-radius: 4px;
			--origam-toolbar---border-start-end-radius: 4px;
			--origam-toolbar---border-end-end-radius: 4px;
			--origam-toolbar---border-end-start-radius: 4px;
		}

		&--absolute {
			--origam-toolbar---position: absolute;
		}

		&--fixed {
			--origam-toolbar---position: fixed;
		}

		&--sticky {
			--origam-toolbar---position: sticky;
		}

		&--collapse {
			--origam-toolbar---max-width: 112px;
			--origam-toolbar---overflow: hidden;
			--origam-toolbar---border-end-end-radius: 24px;

			#{$this}__title {
				--origam-toolbar__title---display: none;
			}
		}

		&--density-compact {
			--origam-toolbar---height: var(--origam-toolbar---height-compact);
		}

		&--density-default {
			--origam-toolbar---height: var(--origam-toolbar---height-default);
		}

		&--flat {
			--origam-toolbar---box-shadow: none;
		}

		&--floating {
			--origam-toolbar---display: inline-flex;
		}

		&__wrapper {
			align-items: var(--origam-toolbar__wrapper---align-items);
			display: var(--origam-toolbar__wrapper---display);
			flex: var(--origam-toolbar__wrapper---flex);
			flex-direction: var(--origam-toolbar__wrapper---flex-direction);
			justify-content: var(--origam-toolbar__wrapper---justify-content);
			height: var(--origam-toolbar__wrapper---height);
			flex-wrap: var(--origam-toolbar__wrapper---flex-wrap);
			// Gap between prepend / title / content / append flex children.
			// User reported the prepend btn was glued to the title — the
			// previous margin-based attempt on `__prepend` / `__append`
			// didn't compose with the `__title { margin-inline: auto }`
			// flex trick. `gap` on the flex wrapper is the canonical fix.
			gap: var(--origam-toolbar__wrapper---gap, 12px);
		}

		&__content,
		&__extension {
			align-items: var(--origam-toolbar__content---align-items);
			display: var(--origam-toolbar__content---display);
			position: var(--origam-toolbar__content---position);
			transition: var(--origam-toolbar__content---transition);
			flex-grow: var(--origam-toolbar__content---flex-grow);
			flex-basis: var(--origam-toolbar__content---flex-basis);
			max-width: var(--origam-toolbar__content---max-width);
		}

		&__content {
			height: var(--origam-toolbar__content---height);

			> .origam-btn:first-child {
				margin-inline-start: 10px;
			}

			> .origam-btn:last-child {
				margin-inline-end: 10px;
			}

			> #{$this}__title {
				--origam-toolbar__title---margin-inline-start: 16px;
			}
		}

		&__prepend {
			align-items: var(--origam-toolbar__prepend---align-items);
			align-self: var(--origam-toolbar__prepend---align-self);
			display: var(--origam-toolbar__prepend---display);
			margin-inline: var(--origam-toolbar__prepend---margin-inline);
			height: var(--origam-toolbar__prepend---height);
			flex-grow: var(--origam-toolbar__prepend---flex-grow);
			flex-shrink: var(--origam-toolbar__prepend---flex-shrink);
			flex-basis: var(--origam-toolbar__prepend---flex-basis);
		}

		&__append {
			align-items: var(--origam-toolbar__append---align-items);
			align-self: var(--origam-toolbar__append---align-self);
			display: var(--origam-toolbar__append---display);
			margin-inline: var(--origam-toolbar__append---margin-inline);
			height: var(--origam-toolbar__append---height);
			flex-grow: var(--origam-toolbar__append---flex-grow);
			flex-shrink: var(--origam-toolbar__append---flex-shrink);
			flex-basis: var(--origam-toolbar__append---flex-basis);
		}

		&__title {
			align-items: var(--origam-toolbar__title---align-items);
			height: var(--origam-toolbar__title---height);
			flex-grow: var(--origam-toolbar__title---flex-grow);
			flex-shrink: var(--origam-toolbar__title---flex-shrink);
			flex-basis: var(--origam-toolbar__title---flex-basis);
			align-self: var(--origam-toolbar__title---align-self);
			padding-block: var(--origam-toolbar__title---padding-block);
			padding-inline: var(--origam-toolbar__title---padding-inline);
			min-width: var(--origam-toolbar__title---min-width);
			margin-inline: var(--origam-toolbar__title---margin-inline);
			display: var(--origam-toolbar__title---display);

			.origam-title {
				font-size: var(--origam-toolbar__title---font-size);
				font-weight: var(--origam-toolbar__title---font-weight);
				letter-spacing: var(--origam-toolbar__title---letter-spacing);
				line-height: var(--origam-toolbar__title---line-height);
				text-transform: var(--origam-toolbar__title---text-transform);
				margin-block: 0;
			}
		}

		&__items {
			display: flex;
			height: inherit;
			align-self: stretch;

			> .origam-btn {
				border-radius: 0;
			}
		}

		// ── Nested-btn chrome contract (applies to every Toolbar usage) ─
		//
		// User reported AppBar btns rendering as gray circles when the
		// chrome should read as a uniform bar. Every toolbar consumer
		// (AppBar, Drawer top bar, footer, standalone, …) gets the same
		// chrome treatment via the `--btn-bg-base` / `--btn-fg-base`
		// declarations hoisted to the top of this block (cf. above):
		//
		//   normal  →  --btn-bg-base (transparent by default)
		//   hover   →  color-mix(--btn-bg-base, black 20 %)
		//   active  →  color-mix(--btn-bg-base, black 30 %)
		//
		// Shape: rounded SQUARE (8 px), overrides Btn's default
		// `&--icon { border-radius: 50% }`.
		:deep(.origam-btn:not(:hover):not(.origam-btn--active)) {
			--origam-btn---background-color: var(--btn-bg-base);
			--origam-btn---color: var(--btn-fg-base);
		}
		:deep(.origam-btn:hover:not(.origam-btn--active)) {
			--origam-btn---background-color: var(
				--origam-toolbar---btn-background-color-hover,
				color-mix(in srgb, var(--btn-bg-base), black 20%)
			);
		}
		:deep(.origam-btn.origam-btn--active) {
			--origam-btn---background-color: var(
				--origam-toolbar---btn-background-color-active,
				color-mix(in srgb, var(--btn-bg-base), black 30%)
			);
		}
		:deep(.origam-btn) {
			--origam-btn---border-radius: var(--origam-toolbar---btn-border-radius, 8px);
			--origam-btn---border-radius-icon: var(--origam-toolbar---btn-border-radius, 8px);
			border-radius: var(--origam-toolbar---btn-border-radius, 8px);
		}

		// Title color inheritance. OrigamTitle's text uses a fixed
		// `--origam-title---color` token that does NOT inherit
		// currentColor — so when the Toolbar is given an intent color
		// the title stayed neutral. Repoint to currentColor so it picks
		// up whatever the toolbar root resolved to.
		:deep(#{$this}__title .origam-title) {
			--origam-title---color: var(--origam-toolbar__title---color, currentColor);
		}
	}
</style>

