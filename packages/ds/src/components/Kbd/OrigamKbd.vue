<template>
	<kbd
			v-contrast
			:class="kbdClasses"
			:style="kbdStyles"
	>
		<template v-if="$slots.default">
			<slot/>
		</template>

		<template v-else-if="isCombination">
			<template
					v-for="(key, index) in combination"
					:key="index"
			>
				<kbd
						class="origam-kbd__key"
						:class="surfaceClasses"
						:style="surfaceStyles"
				>{{ key }}</kbd>
				<span
						v-if="index < combination!.length - 1"
						class="origam-kbd__separator"
						aria-hidden="true"
				>{{ separator }}</span>
			</template>
		</template>

		<template v-else>{{ text }}</template>
	</kbd>
</template><script
		lang="ts"
		setup
>
	import { vContrast } from '../../directives'

	import {
		useBorder,
		useBothColor,
		useDefaults,
		useElevation,
		useProps,
		useRounded,
		useSize,
		useStyle,
		useTypography
} from '../../composables'

	import { KBD_VARIANT_PRESETS } from '../../consts'
	import type { IKbdProps } from '../../interfaces'

	import { computed, StyleValue, toRef } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const _props = withDefaults(defineProps<IKbdProps>(), {
		separator: '+',
		variant: 'outlined',
	})

	// ADR-005 pilot — `variant` is a PRESET (a named `Partial<IKbdProps>`),
	// not a CSS layer. `useDefaults` resolves EVERY prop (not just the ones a
	// preset touches) through the same chain a theme default already goes
	// through: call-site prop > theme default > variant preset > this
	// component's own `withDefaults()` value. Every read below MUST go
	// through this resolved `props`, never `_props` — the preset tier is a
	// pure extension of `useDefaults`, not a parallel mechanism.
	const props = useDefaults(_props, 'origam-kbd', KBD_VARIANT_PRESETS)

	const { filterProps } = useProps<IKbdProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const { sizeClasses, sizeStyles } = useSize(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { borderClasses, borderStyles } = useBorder(props)
	const { elevationClasses, elevationStyles } = useElevation(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	const { typographyStyles } = useTypography(props, 'kbd')

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles } = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 *
	 * `surfaceClasses` / `surfaceStyles` carry the resolved bg / border /
	 * elevation — i.e. everything the removed `&--variant-*` SCSS blocks
	 * used to set via a cascaded CSS custom property. That cascade is what
	 * let a SINGLE class on the root repaint every nested `__key` in a
	 * combination for free; props/inline-styles don't cascade to
	 * descendants, so the surface is computed ONCE here and applied
	 * explicitly to whichever element(s) actually need it: the root alone
	 * when it's a single key, or every `__key` (never the root — see
	 * `isCombination` below) when it's a combination.
	 ********************************************************/
	const isCombination = computed(() => !!(props.combination && props.combination.length > 0))

	const surfaceClasses = computed(() => [
		colorClasses.value,
		borderClasses.value,
		elevationClasses.value,
	])

	const surfaceStyles = computed(() => {
		return [
			colorStyles.value,
			borderStyles.value,
			elevationStyles.value,
		] as StyleValue
	})

	const kbdClasses = computed(() => {
		return [
			'origam-kbd',
			{
				[`origam-kbd--variant-${props.variant}`]: props.variant,
				'origam-kbd--combination': isCombination.value,
			},
			sizeClasses.value,
			roundedClasses.value,
			// Suppressed on the root during a combination — the surface
			// belongs to each `__key` instead (template). Binding it here
			// unconditionally would repaint a box around the WHOLE group;
			// `&--combination` has no DS rule left to neutralise it (D3).
			...(isCombination.value ? [] : [surfaceClasses.value]),
			props.class,
		]
	})

	const kbdStyles = computed(() => {
		return [
			sizeStyles.value,
			roundedStyles.value,
			typographyStyles.value,
			...(isCombination.value ? [] : [surfaceStyles.value]),
			props.style,
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(kbdStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
	 ********************************************************/
	defineExpose({ filterProps,
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
	@mixin key-surface {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		font-family: var(--origam-kbd---font-family, JetBrains Mono, Fira Code, monospace);
		font-size: inherit;
		font-weight: var(--origam-kbd---font-weight, 500);
		line-height: 1;
		white-space: nowrap;
		vertical-align: baseline;

		min-width: 1.6em;
		padding-block: var(--origam-kbd---padding-block, 0.2em);
		padding-inline: var(--origam-kbd---padding-inline, 0.5em);

		border-radius: var(--origam-kbd---border-radius, 4px);
		border-width: var(--origam-kbd---border-width, 1px);
		border-style: solid;
		border-color: var(--origam-kbd---border-color, var(--origam-color__border---subtle, #d4d4d4));

		background-color: var(--origam-kbd---background-color, var(--origam-color__surface---raised, #fff));
		color: var(--origam-kbd---color, var(--origam-color__text---primary, #171717));

		box-shadow: var(
			--origam-kbd---box-shadow,
			0 1px 0 0 color-mix(in srgb, currentColor 12%, transparent),
			inset 0 1px 0 0 color-mix(in srgb, white 50%, transparent)
		);
	}

	.origam-kbd {
		@include key-surface;

		font-size: var(--origam-kbd---font-size, 0.875em);

		gap: var(--origam-kbd---gap, 4px);

		&--combination {
			display: inline-flex;
			align-items: center;
			gap: var(--origam-kbd---gap, 4px);

			padding-block: 0;
			padding-inline: 0;
			border-width: 0;
			background-color: transparent;
			box-shadow: none;
			min-width: 0;
		}

		&__key {
			@include key-surface;
		}

		// ADR-005 — `variant` is a props preset (`KBD_VARIANT_PRESETS`,
		// resolved via `useDefaults`), not a CSS layer. The `origam-kbd
		// --variant-*` class still gets emitted (an override hook for
		// consumer CSS) but the DS ships ZERO rule matching it — the
		// `&--variant-*` blocks that used to live here, and the
		// `&--combination#{&}--variant-*` block that neutralised them on
		// the combination root, are gone. The component now resolves bg /
		// border / elevation to inline styles/classes applied directly to
		// whichever element needs the surface (see `surfaceStyles` /
		// `surfaceClasses` in the `<script>` block) — `&--combination`
		// below only has structural/layout responsibility left.

		&--size-x-small { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-xs, 0.625rem)); }
		&--size-small   { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-sm, 0.75rem)); }
		&--size-default { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-md, 0.875rem)); }
		&--size-large   { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-lg, 1rem)); }
		&--size-x-large { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-xl, 1.125rem)); }

		&--rounded         { --origam-kbd---border-radius: var(--origam-radius---sm, 4px); }
		&--rounded-x-small { --origam-kbd---border-radius: var(--origam-radius---xs, 2px); }
		&--rounded-small   { --origam-kbd---border-radius: var(--origam-radius---sm, 4px); }
		&--rounded-default { --origam-kbd---border-radius: var(--origam-radius---md, 8px); }
		&--rounded-medium  { --origam-kbd---border-radius: var(--origam-radius---lg, 12px); }
		&--rounded-large   { --origam-kbd---border-radius: var(--origam-radius---xl, 16px); }
		&--rounded-x-large { --origam-kbd---border-radius: var(--origam-radius---2xl, 24px); }

		&__separator {
			color: var(--origam-kbd__separator---color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
			font-family: inherit;
			font-size: inherit;
			user-select: none;
		}
	}
</style>
