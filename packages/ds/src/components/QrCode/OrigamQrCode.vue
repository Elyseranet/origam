<template>
	<component
			:is="tag"
			class="origam-qr-code"
			:class="rootClasses"
			:style="rootStyles"
			role="img"
			:aria-label="resolvedAriaLabel"
			data-cy="origam-qr-code"
	>
		<h3
				v-if="title"
				class="origam-qr-code__title"
				data-cy="origam-qr-code-title"
		>{{ title }}</h3>
		<span
				ref="svgHost"
				class="origam-qr-code__svg-host"
				:class="sizeClasses"
				:style="svgHostStyles"
		/>
		<span
				v-if="hasCenter"
				class="origam-qr-code__center"
				aria-hidden="true"
		>
			<slot
					name="center"
					:size="centerSize"
			>
				<origam-avatar
						v-if="image"
						:image="image"
						class="origam-qr-code__center-avatar"
				/>
				<origam-icon
						v-if="icon"
						:icon="icon"
						class="origam-qr-code__center-icon"
				/>
			</slot>
		</span>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		ref,
		type StyleValue,
		useSlots,
		watchEffect
	} from 'vue'

	import { OrigamAvatar } from '../Avatar'
	import { OrigamIcon } from '../Icon'

	import {
		useBackgroundColor,
		useBorder,
		useElevation,
		useMargin,
		usePadding,
		useQrCode,
		useRounded,
		useSize,
		useTextColor
	} from '../../composables'

	import type {
		IQrCodeProps,
		IQrCodeSlots
	} from '../../interfaces/QrCode/qr-code.interface'

	import { resolveQrColor, resolveQrCornerRadius } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Pure SVG renderer — owns NO state, NO event, NO input. Two
	 * styling planes coexist on this component :
	 *
	 *  1. The **wrapper** — receives every canonical DS transverse
	 *     contract (color / bgColor / rounded / border / size /
	 *     padding / margin / elevation). The wrapper's `color:` is
	 *     inherited by the SVG modules through `fill="currentColor"`
	 *     unless `qrCodeProps.color` overrides.
	 *
	 *  2. The **SVG matrix** — driven by the optional `qrCodeProps`
	 *     object (`IQrCodeOptions` extends IColorProps + IBgColorProps
	 *     + IRoundedProps). When omitted, the SVG inherits from the
	 *     wrapper. DS-shape values are transformed by
	 *     `resolveQrColor` / `resolveQrCornerRadius` (see
	 *     `src/utils/QrCode/qr-code-adapters.util.ts`) so consumers
	 *     keep passing intents / named rungs as they would anywhere
	 *     else in the DS — the SVG-side translation stays internal.
	 *
	 * Defaults are inlined here (not pulled from a QR_CODE_DEFAULTS
	 * const) because the Vue SFC compiler analyses `withDefaults`
	 * statically and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const props = withDefaults(defineProps<IQrCodeProps>(), {
		tag: 'div',
		size: 240,
		errorCorrectionLevel: 'M',
		color: 'currentColor',
		bgColor: undefined,
		rounded: undefined,
		quietZone: 4,
		title: undefined,
		qrCodeProps: undefined,
		icon: undefined,
		image: undefined,
		ariaLabel: undefined
	})

	defineSlots<IQrCodeSlots>()

	/*********************************************************
	 * Slots — `center` slot wraps the default `icon` / `image`
	 * overlay so consumers can override the centre paint while keeping
	 * the matrix untouched.
	 ********************************************************/
	const slots = useSlots()

	const hasCenter = computed(
		() => !!slots.center || !!props.icon || !!props.image
	)

	/*********************************************************
	 * SVG-matrix paint resolution.
	 *
	 *   - `qrCodeProps.color`     → modules paint  (intent / hex / currentColor)
	 *   - fallback to `props.color`              (wrapper-level color)
	 *   - `qrCodeProps.bgColor`   → quiet-zone rect fill
	 *   - fallback to `'transparent'`            (let wrapper bg show through)
	 *   - `qrCodeProps.rounded`   → per-module corner radius (0..0.5)
	 *   - fallback to 0 (square modules)
	 *
	 * The DS-shape → SVG-string translation lives in the
	 * `resolveQrColor` / `resolveQrCornerRadius` adapters.
	 ********************************************************/
	const resolvedQrColor = computed(() =>
		resolveQrColor(
			props.qrCodeProps?.color ?? props.color,
			'foreground',
			'currentColor'
		)
	)

	const resolvedQrBgColor = computed(() =>
		resolveQrColor(
			props.qrCodeProps?.bgColor,
			'background',
			'transparent'
		)
	)

	const resolvedQrCornerRadius = computed(() =>
		resolveQrCornerRadius(props.qrCodeProps?.rounded)
	)

	/*********************************************************
	 * Composable input — maps the resolved values onto the
	 * lower-level `useQrCode` contract.
	 ********************************************************/
	const resolvedOptions = computed(() => ({
		errorCorrectionLevel: props.errorCorrectionLevel,
		foreground: resolvedQrColor.value,
		background: resolvedQrBgColor.value,
		margin: props.quietZone ?? 4,
		cornerRadius: resolvedQrCornerRadius.value
	}))

	const { svg, size: matrixSize } = useQrCode(() => props.value, resolvedOptions)

	const centerSize = computed(() => Math.round(matrixSize.value * 0.2))

	/*********************************************************
	 * SVG injection — innerHTML mirrors `<OrigamCode>` and bypasses
	 * the v-html lint warning. The SVG fragment is sanitised inside
	 * `useQrCode` (XML metacharacters in user-supplied values are
	 * escaped before they reach the DOM).
	 ********************************************************/
	const svgHost = ref<HTMLElement | null>(null)

	watchEffect(() => {
		const target = svgHost.value
		if (!target) return
		target.innerHTML = svg.value
	})

	/*********************************************************
	 * ARIA — falls back to a description of the encoded payload
	 * when no explicit label is provided.
	 ********************************************************/
	const resolvedAriaLabel = computed<string>(() => {
		if (props.ariaLabel) return props.ariaLabel
		if (props.title) return props.title
		return `QR code for ${ props.value }`
	})

	/*********************************************************
	 * Wrapper chrome — every canonical DS transverse composable.
	 * The SCSS host is intentionally lean; nearly all the visual
	 * surface is driven by these classes / styles.
	 ********************************************************/
	const { textColorClasses, textColorStyles } = useTextColor(props, 'color')
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { borderClasses, borderStyles } = useBorder(props)
	const { sizeClasses, sizeStyles } = useSize(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { elevationClasses, elevationStyles } = useElevation(props)

	/*********************************************************
	 * Class & Style — Strategy A: classes win for tokenised values,
	 * inline styles win for raw CSS, both bind in parallel for
	 * forward compatibility (v3.0 will retire the *Styles channel).
	 ********************************************************/
	const rootClasses = computed(() => [
		`origam-qr-code--ecc-${ props.errorCorrectionLevel.toLowerCase() }`,
		...textColorClasses.value,
		...backgroundColorClasses.value,
		...roundedClasses.value,
		...borderClasses.value,
		...paddingClasses.value,
		...marginClasses.value,
		...elevationClasses.value,
		props.class
	])

	const rootStyles = computed<StyleValue>(() => [
		textColorStyles.value,
		backgroundColorStyles.value,
		roundedStyles.value,
		borderStyles.value,
		paddingStyles.value,
		marginStyles.value,
		elevationStyles.value,
		props.style
	] as StyleValue)

	/*********************************************************
	 * Size styles are intentionally NOT applied to the wrapper:
	 * `useSize` forces both `width` AND `height`, which would crush
	 * the title row + push the SVG into a non-square area. We move
	 * the width/height contract onto the SVG host span so the SVG
	 * stays square at the requested size and the wrapper auto-sizes
	 * to fit the title + SVG stack.
	 ********************************************************/
	const svgHostStyles = computed<StyleValue>(() => sizeStyles.value as StyleValue)

	/*********************************************************
	 * Expose — handy for parents that want to read the rendered SVG
	 * string (e.g. download as `.svg` file).
	 ********************************************************/
	defineExpose({
		svg
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-qr-code {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		line-height: 0;
		position: relative;
		// Baseline inner spacing — matches the `gap` between title and
		// SVG so the wrapper has the same breathing room on every side
		// of the matrix. Overridden by the `padding` prop (via
		// `usePadding(props)` inline styles) when the consumer
		// provides one.
		padding: 8px;
	}

	.origam-qr-code__title {
		margin: 0;
		font: 600 0.875rem/1.2 inherit;
		text-align: center;
		color: inherit;
		line-height: 1.2;
		align-self: stretch;
	}

	.origam-qr-code__svg-host {
		display: block;
		aspect-ratio: 1;
		position: relative;

		:deep(svg) {
			display: block;
			width: 100%;
			height: 100%;
		}
	}

	.origam-qr-code__center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 20%;
		height: 20%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		pointer-events: none;
	}

	.origam-qr-code__center-avatar,
	.origam-qr-code__center-icon {
		width: 100%;
		height: 100%;
	}
</style>
