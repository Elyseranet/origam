<template>
	<component
			:is="tag"
			:class="textMaskClasses"
			:style="textMaskStyles"
			data-cy="origam-text-mask"
	>
		<slot v-if="hasSlot"/>
		<template v-else>{{ text }}</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		type StyleValue,
		useSlots
	} from 'vue'

	import { resolveGradient } from '../../utils/Commons/gradient.util'
	import { useTypography } from '../../composables'

	import type { ITextMaskProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamTextMask>`. The component paints any
	 * gradient / image / video poster through the rendered glyphs via
	 * `background-clip: text` and a transparent text fill. The DOM
	 * text stays intact, so screen readers and search engines read it
	 * unchanged — the transform is purely visual.
	 *
	 * Defaults are inlined here (not pulled from a shared TEXT_MASK_DEFAULTS
	 * const) because the Vue SFC compiler analyses `withDefaults` statically
	 * and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const props = withDefaults(defineProps<ITextMaskProps>(), {
		tag: 'span',
		animated: false,
		animationDuration: '3s',
		animationType: 'pan',
		align: 'left'
	})

	const slots = useSlots()

	/*********************************************************
	 * Background resolution
	 *
	 * @description
	 * The `background` prop accepts three shapes (structured IGradient,
	 * raw CSS gradient string OR preset name, and `url(...)` for images
	 * / video posters / data-URLs). `resolveGradient()` handles the first
	 * two; anything else falls through as a raw `background-image`
	 * value so consumers can pass `url(/hero.jpg)` without ceremony.
	 ********************************************************/
	const resolvedBackground = computed(() => {
		const fromGradient = resolveGradient(props.background as any)
		if (fromGradient) return fromGradient
		return typeof props.background === 'string' ? props.background : ''
	})

	/*********************************************************
	 * Typography
	 *
	 * @description
	 * Delegates the five font props (fontFamily / fontSize / fontWeight /
	 * lineHeight / letterSpacing) to the shared `useTypography` surface.
	 * Each set prop emits an inline custom property pointing at the matching
	 * primitive token; when unset, the SCSS fallback
	 * (`--origam-text-mask---font-size-default`, …) stays in control.
	 ********************************************************/
	const { typographyStyles } = useTypography(props, 'text-mask')

	const hasSlot = computed(() => Boolean(slots.default))

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes drive the keyframe selection (`--animated`
	 * + `--{animationType}`). Inline styles only carry per-instance
	 * values that cannot be expressed as static classes.
	 ********************************************************/
	const textMaskClasses = computed(() => {
		return [
			'origam-text-mask',
			`origam-text-mask--align-${props.align}`,
			`origam-text-mask--${props.animationType}`,
			{
				'origam-text-mask--animated': props.animated
			},
			props.class
		]
	})

	const textMaskStyles = computed<StyleValue>(() => {
		return [
			{
				'--origam-text-mask---bg': resolvedBackground.value,
				'--origam-text-mask---duration': props.animationDuration
			},
			typographyStyles.value,
			props.style
		] as StyleValue
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		resolvedBackground,
		hasSlot
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-text-mask {
		display: inline-block;
		background-image: var(--origam-text-mask---bg);
		background-repeat: no-repeat;
		background-position: 0% 50%;
		background-size: cover;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		font-size:      var(--origam-text-mask---font-size, var(--origam-text-mask---font-size-default));
		font-weight:    var(--origam-text-mask---font-weight, var(--origam-text-mask---font-weight-default));
		font-family:    var(--origam-text-mask---font-family, inherit);
		line-height:    var(--origam-text-mask---line-height, var(--origam-text-mask---line-height-default));
		letter-spacing: var(--origam-text-mask---letter-spacing, normal);
	}

	.origam-text-mask--align-left {
		text-align: left;
	}

	.origam-text-mask--align-center {
		text-align: center;
	}

	.origam-text-mask--align-right {
		text-align: right;
	}

	.origam-text-mask--animated.origam-text-mask--pan {
		background-size: 200% 100%;
		animation: origam-text-mask-pan var(--origam-text-mask---duration) linear infinite;
	}

	.origam-text-mask--animated.origam-text-mask--rotate {
		animation: origam-text-mask-rotate var(--origam-text-mask---duration) linear infinite;
	}

	.origam-text-mask--animated.origam-text-mask--pulse {
		animation: origam-text-mask-pulse var(--origam-text-mask---duration) ease-in-out infinite;
	}

	.origam-text-mask--animated.origam-text-mask--zoom {
		background-size: 200% 200%;
		animation: origam-text-mask-zoom var(--origam-text-mask---duration) ease-in-out infinite alternate;
	}

	@keyframes origam-text-mask-pan {
		0%   { background-position: 0% 50%; }
		100% { background-position: 100% 50%; }
	}

	@keyframes origam-text-mask-rotate {
		0%   { filter: hue-rotate(0deg); }
		100% { filter: hue-rotate(360deg); }
	}

	@keyframes origam-text-mask-pulse {
		0%, 100% { background-size: 100% 100%; }
		50%      { background-size: 140% 140%; }
	}

	@keyframes origam-text-mask-zoom {
		0%   { background-size: 100% 100%; }
		100% { background-size: 220% 220%; }
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-text-mask--animated {
			animation: none !important;
			background-size: cover;
			filter: none;
		}
	}
</style>
