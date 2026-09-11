<template>
	<component
			:is="tag"
			class="origam-number-format"
			:class="rootClasses"
			:style="rootStyles"
			:aria-label="ariaLabel"
			data-cy="origam-number-format"
	>
		<slot
				:formatted="formatted"
				:parts="parts"
				:value="numericValue"
		>{{ formatted }}</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		type StyleValue
	} from 'vue'

	import { useNumberFormat } from '../../composables'

	import type {
		INumberFormatProps
	} from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamNumberFormat>`. The component is a
	 * pure-display wrapper around `Intl.NumberFormat` via the
	 * `useNumberFormat` composable — it owns no state, no event, no
	 * input. The rendered output goes inside a `<tag>` (default
	 * `<span>`) so it composes inside any inline / block context.
	 *
	 * Defaults are inlined here (not pulled from a NUMBER_FORMAT_DEFAULTS
	 * const) because the Vue SFC compiler analyses `withDefaults`
	 * statically and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const props = withDefaults(defineProps<INumberFormatProps>(), {
		tag: 'span',
		format: 'decimal',
		locale: 'auto',
		currency: undefined,
		currencyDisplay: 'symbol',
		unit: undefined,
		unitDisplay: 'short',
		notation: undefined,
		compactDisplay: 'short',
		minimumFractionDigits: undefined,
		maximumFractionDigits: undefined,
		minimumSignificantDigits: undefined,
		maximumSignificantDigits: undefined,
		useGrouping: true,
		signDisplay: 'auto'
	})

	/*********************************************************
	 * Resolved options snapshot — fed to the composable as a getter
	 * so reactive prop changes invalidate the cached Intl instance.
	 ********************************************************/
	const resolvedOptions = computed(() => ({
		format: props.format,
		locale: props.locale,
		currency: props.currency,
		currencyDisplay: props.currencyDisplay,
		unit: props.unit,
		unitDisplay: props.unitDisplay,
		notation: props.notation,
		compactDisplay: props.compactDisplay,
		minimumFractionDigits: props.minimumFractionDigits,
		maximumFractionDigits: props.maximumFractionDigits,
		minimumSignificantDigits: props.minimumSignificantDigits,
		maximumSignificantDigits: props.maximumSignificantDigits,
		useGrouping: props.useGrouping,
		signDisplay: props.signDisplay
	}))

	const { format, formatToParts } = useNumberFormat(resolvedOptions)

	/*********************************************************
	 * Numeric coercion — preserved for the slot binding so consumers
	 * can branch on the resolved value (sign, threshold, …) without
	 * re-parsing the prop themselves.
	 ********************************************************/
	const numericValue = computed(() => {
		if (typeof props.value === 'number') return props.value
		const parsed = Number(props.value)
		return Number.isFinite(parsed) ? parsed : 0
	})

	const formatted = computed(() => format(props.value))

	const parts = computed(() => formatToParts(props.value))

	/*********************************************************
	 * ARIA — compact notation collapses information density that a
	 * screen reader cannot infer (`1.2M` ≠ `1.2 million`). We expand
	 * the long form into `aria-label` so SR users hear the full
	 * value while sighted users still see the compact glyph.
	 *
	 * Only emitted in compact mode — for the other formats the
	 * visible text is already self-describing.
	 ********************************************************/
	const ariaLabel = computed<string | undefined>(() => {
		const useCompact = props.format === 'compact' || props.notation === 'compact'
		if (!useCompact) return undefined

		// Rebuild a long-form formatter on demand. The LRU cache will
		// promote it to a hot entry as soon as the same locale is reused.
		try {
			const longIntl = new Intl.NumberFormat(
				props.locale === 'auto' || !props.locale
					? (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
					: (props.locale as string | string[]),
				{ notation: 'compact', compactDisplay: 'long' }
			)
			return longIntl.format(numericValue.value)
		} catch {
			return undefined
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		`origam-number-format--${props.format}`,
		props.class
	])

	const rootStyles = computed<StyleValue>(() => [props.style] as StyleValue)

	/*********************************************************
	 * Expose — handy for parents that want to read the formatted
	 * string without rendering through the default slot.
	 ********************************************************/
	defineExpose({
		formatted,
		parts,
		value: numericValue
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-number-format {
		font-variant-numeric: tabular-nums;
	}
</style>
