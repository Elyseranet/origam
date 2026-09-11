<template>
	<div
			ref="rootEl"
			class="origam-media-scrubber"
			:class="rootClasses"
			:style="rootStyles"
			:role="resolvedRole"
			:tabindex="resolvedTabIndex"
			:aria-orientation="orientation"
			:aria-valuemin="resolvedMin"
			:aria-valuemax="resolvedMax"
			:aria-valuenow="resolvedValue"
			:aria-valuetext="ariaValueText || undefined"
			:aria-label="ariaLabel"
			:aria-disabled="disabled || undefined"
			data-cy="origam-media-scrubber"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerleave="onPointerLeave"
			@keydown="onKeyDown"
	>
		<div
				class="origam-media-scrubber__track"
				:class="[colorClasses, roundedClasses]"
				:style="colorStyles"
				aria-hidden="true"
		>
			<div
					v-if="hasBuffer"
					class="origam-media-scrubber__buffer"
					:style="bufferStyles"
					aria-hidden="true"
			/>
			<div
					class="origam-media-scrubber__progress"
					:style="progressStyles"
					aria-hidden="true"
			/>
			<div
					class="origam-media-scrubber__thumb"
					:style="thumbStyles"
					aria-hidden="true"
			/>
		</div>

		<div
				v-if="showTooltip"
				class="origam-media-scrubber__hover-tooltip"
				:style="tooltipStyles"
				aria-hidden="true"
		>
			<slot
					name="tooltip"
					v-bind="{ value: hoverValue ?? 0 }"
			>{{ tooltipLabel }}</slot>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		ref,
		type StyleValue,
		toRef
	} from 'vue'

	import {
		useBackgroundColor,
		useRounded
	} from '../../composables'

	import type {
		IMediaScrubberProps, IMediaScrubberSlots} from '../../interfaces'

	import type { IMediaScrubberEmits } from '../../interfaces/Media/media-scrubber.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamMediaScrubber>`. Headless / presentation-only —
	 * the parent owns the value, the component owns the drag pipeline,
	 * keyboard handlers and ARIA contract. Used internally by
	 * `<OrigamVideo>` for the timeline AND the (vertical) volume slider —
	 * a single pointer-events + keyboard pipeline used twice, instead of
	 * the native `<input type="range">` rotate(-90deg) hack.
	 *
	 * Defaults are inlined here (not pulled from a MEDIA_SCRUBBER_DEFAULTS
	 * const) because the Vue SFC compiler analyses `withDefaults`
	 * statically and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const props = withDefaults(defineProps<IMediaScrubberProps>(), {
		min: 0,
		step: 0,
		buffered: undefined,
		orientation: 'horizontal',
		disabled: false,
		showThumbOnHoverOnly: false,
		showHoverTooltip: false,
		formatHoverTooltip: (value: number) => String(value),
		ariaValueText: undefined
	})

	const emit = defineEmits<IMediaScrubberEmits>()
	defineSlots<IMediaScrubberSlots>()

	/*********************************************************
	 * Composables — class-first contract: token values map to a
	 * utility class, custom values fall through to inline style.
	 * `useBackgroundColor` paints the progress bar (the dominant
	 * surface — track + buffer stay neutral by design).
	 ********************************************************/
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'color'))
	const { roundedClasses } = useRounded(toRef(props, 'rounded'))

	const colorClasses = computed(() => backgroundColorClasses.value)
	const colorStyles = computed(() => backgroundColorStyles.value)

	/*********************************************************
	 * Range bookkeeping — clamps `modelValue` into `[min, max]` so
	 * a stale parent value never paints the thumb outside the track.
	 * `max` is forced to `> min` (we keep a tiny epsilon as a
	 * defensive sentinel) so `(value - min) / (max - min)` never
	 * divides by 0.
	 ********************************************************/
	const resolvedMin = computed(() => props.min)
	const resolvedMax = computed(() => Math.max(props.max, props.min + 0.0000001))
	const range = computed(() => resolvedMax.value - resolvedMin.value)

	const resolvedValue = computed(() => clamp(props.modelValue, resolvedMin.value, resolvedMax.value))

	const valuePct = computed(() => ((resolvedValue.value - resolvedMin.value) / range.value) * 100)
	const bufferPct = computed(() => {
		if (!hasBuffer.value) return 0
		const clamped = clamp(props.buffered as number, resolvedMin.value, resolvedMax.value)
		return ((clamped - resolvedMin.value) / range.value) * 100
	})

	const hasBuffer = computed(() => typeof props.buffered === 'number' && Number.isFinite(props.buffered))

	/*********************************************************
	 * ARIA & a11y — `role="slider"` only when not disabled, so AT users
	 * are not invited to interact with a frozen widget. Tabindex drops
	 * to `-1` when disabled (slider stays addressable for tests, but
	 * out of the user's tab order).
	 ********************************************************/
	const resolvedRole = computed(() => (props.disabled ? undefined : 'slider'))
	const resolvedTabIndex = computed(() => (props.disabled ? -1 : 0))

	/*********************************************************
	 * Hover / drag state — `hoverValue` powers the tooltip; `isScrubbing`
	 * disables pointerleave-driven hover clearing so the tooltip stays
	 * pinned during a drag (YouTube UX).
	 ********************************************************/
	const rootEl = ref<HTMLElement | null>(null)
	const isScrubbing = ref<boolean>(false)
	const hoverValue = ref<number | null>(null)
	const hoverPct = ref<number | null>(null)

	/*********************************************************
	 * Tooltip — only the horizontal variant exposes a hover tooltip
	 * (the vertical variant is too narrow to anchor one cleanly; if
	 * needed, consumers can build their own tooltip outside).
	 ********************************************************/
	const showTooltip = computed(() =>
		props.showHoverTooltip
		&& props.orientation === 'horizontal'
		&& hoverPct.value !== null
		&& !props.disabled
	)
	const tooltipLabel = computed(() => {
		const fn = props.formatHoverTooltip
		const value = hoverValue.value ?? 0
		return fn ? fn(value) : String(value)
	})

	/*********************************************************
	 * Pointer math — single source of truth for "client coords → pct".
	 * Horizontal: `x` relative to the LEFT edge of the track.
	 * Vertical:   `y` relative to the BOTTOM edge of the track (top = max).
	 * Clamped to [0, 100] to short-circuit out-of-bounds drags.
	 ********************************************************/
	function pctFromPointer (event: PointerEvent): number {
		const el = rootEl.value
		if (!el) return 0
		const rect = el.getBoundingClientRect()
		if (props.orientation === 'vertical') {
			const y = clamp(event.clientY, rect.top, rect.bottom)
			return ((rect.bottom - y) / Math.max(1, rect.height)) * 100
		}
		const x = clamp(event.clientX, rect.left, rect.right)
		return ((x - rect.left) / Math.max(1, rect.width)) * 100
	}

	function valueFromPct (pct: number): number {
		const raw = resolvedMin.value + (clamp(pct, 0, 100) / 100) * range.value
		if (props.step && props.step > 0) {
			const snapped = Math.round((raw - resolvedMin.value) / props.step) * props.step + resolvedMin.value
			return clamp(snapped, resolvedMin.value, resolvedMax.value)
		}
		return clamp(raw, resolvedMin.value, resolvedMax.value)
	}

	function commit (value: number, withChange = false): void {
		emit('update:modelValue', value)
		if (withChange) emit('change', value)
	}

	function onPointerDown (event: PointerEvent): void {
		if (props.disabled) return
		const el = rootEl.value
		if (!el) return

		isScrubbing.value = true
		el.setPointerCapture(event.pointerId)

		const pct = pctFromPointer(event)
		const next = valueFromPct(pct)
		hoverValue.value = next
		hoverPct.value = pct
		commit(next)
		emit('dragstart')

		const onMove = (e: PointerEvent) => {
			if (!isScrubbing.value) return
			const nextPct = pctFromPointer(e)
			const nextValue = valueFromPct(nextPct)
			hoverValue.value = nextValue
			hoverPct.value = nextPct
			commit(nextValue)
		}

		const onUp = (e: PointerEvent) => {
			if (!isScrubbing.value) return
			isScrubbing.value = false
			const lastPct = pctFromPointer(e)
			const last = valueFromPct(lastPct)
			commit(last, true)
			emit('dragend')
			el.removeEventListener('pointermove', onMove)
			el.removeEventListener('pointerup', onUp)
			el.removeEventListener('pointercancel', onUp)
		}

		el.addEventListener('pointermove', onMove)
		el.addEventListener('pointerup', onUp)
		el.addEventListener('pointercancel', onUp)
	}

	function onPointerMove (event: PointerEvent): void {
		if (props.disabled) return
		if (isScrubbing.value) return
		const pct = pctFromPointer(event)
		const value = valueFromPct(pct)
		hoverPct.value = pct
		hoverValue.value = value
		emit('hover', value)
	}

	function onPointerLeave (): void {
		if (isScrubbing.value) return
		hoverPct.value = null
		hoverValue.value = null
		emit('hover', null)
	}

	/*********************************************************
	 * Keyboard — same matrix as ARIA Authoring Practices for a slider:
	 *   - Arrow{Right|Up}   → +stepSize
	 *   - Arrow{Left|Down}  → -stepSize
	 *   - PageUp / PageDown → ±10 % of (max - min)
	 *   - Home / End        → min / max
	 * The "step" prop wins when > 0; otherwise we fall back to 5 % of
	 * the range — same default the WAI-ARIA pattern recommends.
	 ********************************************************/
	function keyStep (): number {
		if (props.step && props.step > 0) return props.step
		return range.value * 0.05
	}

	function onKeyDown (event: KeyboardEvent): void {
		if (props.disabled) return
		const isVertical = props.orientation === 'vertical'
		const step = keyStep()
		let next: number | null = null

		if (event.key === 'ArrowRight' && !isVertical) next = resolvedValue.value + step
		else if (event.key === 'ArrowLeft' && !isVertical) next = resolvedValue.value - step
		else if (event.key === 'ArrowUp' && isVertical) next = resolvedValue.value + step
		else if (event.key === 'ArrowDown' && isVertical) next = resolvedValue.value - step
		else if (event.key === 'PageUp') next = resolvedValue.value + range.value * 0.1
		else if (event.key === 'PageDown') next = resolvedValue.value - range.value * 0.1
		else if (event.key === 'Home') next = resolvedMin.value
		else if (event.key === 'End') next = resolvedMax.value
		else return

		event.preventDefault()
		const snapped = props.step && props.step > 0
			? clamp(Math.round((next - resolvedMin.value) / props.step) * props.step + resolvedMin.value, resolvedMin.value, resolvedMax.value)
			: clamp(next, resolvedMin.value, resolvedMax.value)
		commit(snapped, true)
	}

	/*********************************************************
	 * Inline style channels — translated from `valuePct` /
	 * `bufferPct` / `hoverPct` so the parent never has to know about
	 * the underlying track orientation.
	 ********************************************************/
	const progressStyles = computed<StyleValue>(() => {
		if (props.orientation === 'vertical') {
			return { height: `${valuePct.value}%` }
		}
		return { width: `${valuePct.value}%` }
	})

	const bufferStyles = computed<StyleValue>(() => {
		if (props.orientation === 'vertical') {
			return { height: `${bufferPct.value}%` }
		}
		return { width: `${bufferPct.value}%` }
	})

	const thumbStyles = computed<StyleValue>(() => {
		if (props.orientation === 'vertical') {
			return { bottom: `${valuePct.value}%` }
		}
		return { left: `${valuePct.value}%` }
	})

	const tooltipStyles = computed<StyleValue>(() => {
		if (hoverPct.value === null) return {}
		return { left: `${hoverPct.value}%` }
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-media-scrubber--horizontal': props.orientation === 'horizontal',
			'origam-media-scrubber--vertical': props.orientation === 'vertical',
			'origam-media-scrubber--disabled': props.disabled,
			'origam-media-scrubber--scrubbing': isScrubbing.value,
			'origam-media-scrubber--thumb-on-hover': props.showThumbOnHoverOnly
		},
		props.class
	])

	const rootStyles = computed<StyleValue>(() => [props.style] as StyleValue)

	/*********************************************************
	 * Utility
	 ********************************************************/
	function clamp (value: number, min: number, max: number): number {
		if (!Number.isFinite(value)) return min
		if (value < min) return min
		if (value > max) return max
		return value
	}

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		rootEl,
		isScrubbing,
		hoverValue
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-media-scrubber {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		touch-action: none;
		outline: none;
		user-select: none;
		--origam-media-scrubber---primary: var(
			--origam-media-scrubber---color,
			var(--origam-color__action--primary---bg, #ef4444)
		);
		--origam-media-scrubber---track-bg: var(
			--origam-media-scrubber---track-background-color,
			rgba(255, 255, 255, 0.3)
		);
		--origam-media-scrubber---buffer-bg: var(
			--origam-media-scrubber---buffer-background-color,
			rgba(255, 255, 255, 0.4)
		);
		--origam-media-scrubber---thumb-size: var(
			--origam-media-scrubber---thumb-diameter,
			13px
		);
		--origam-media-scrubber---track-thickness: var(
			--origam-media-scrubber---track-size,
			3px
		);
		--origam-media-scrubber---track-thickness-active: var(
			--origam-media-scrubber---track-size-active,
			5px
		);
	}

	.origam-media-scrubber--horizontal {
		width: 100%;
		min-width: 0;
		height: 14px;
	}

	.origam-media-scrubber--vertical {
		height: 100%;
		min-height: 0;
		width: 14px;
		flex-direction: column;
	}

	.origam-media-scrubber--disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.origam-media-scrubber__track {
		position: relative;
		background-color: var(--origam-media-scrubber---track-bg);
		border-radius: 2px;
		transition: height 140ms ease, width 140ms ease;
	}

	.origam-media-scrubber--horizontal .origam-media-scrubber__track {
		width: 100%;
		height: var(--origam-media-scrubber---track-thickness);
	}

	.origam-media-scrubber--vertical .origam-media-scrubber__track {
		height: 100%;
		width: var(--origam-media-scrubber---track-thickness);
	}

	.origam-media-scrubber:hover .origam-media-scrubber__track,
	.origam-media-scrubber:focus-visible .origam-media-scrubber__track,
	.origam-media-scrubber--scrubbing .origam-media-scrubber__track {
		--origam-media-scrubber---track-thickness: var(--origam-media-scrubber---track-thickness-active);
	}

	.origam-media-scrubber__buffer,
	.origam-media-scrubber__progress {
		position: absolute;
		border-radius: 2px;
		pointer-events: none;
	}

	.origam-media-scrubber--horizontal .origam-media-scrubber__buffer,
	.origam-media-scrubber--horizontal .origam-media-scrubber__progress {
		top: 0;
		left: 0;
		bottom: 0;
	}

	.origam-media-scrubber--vertical .origam-media-scrubber__buffer,
	.origam-media-scrubber--vertical .origam-media-scrubber__progress {
		left: 0;
		right: 0;
		bottom: 0;
	}

	.origam-media-scrubber__buffer {
		background: var(--origam-media-scrubber---buffer-bg);
		z-index: 1;
	}

	.origam-media-scrubber__progress {
		background: var(--origam-media-scrubber---primary);
		z-index: 2;
	}

	.origam-media-scrubber__thumb {
		position: absolute;
		width: var(--origam-media-scrubber---thumb-size);
		height: var(--origam-media-scrubber---thumb-size);
		border-radius: 50%;
		background: var(--origam-media-scrubber---primary);
		transition: transform 140ms ease;
		pointer-events: none;
		z-index: 3;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
	}

	.origam-media-scrubber--horizontal .origam-media-scrubber__thumb {
		top: 50%;
		transform: translate(-50%, -50%) scale(1);
	}

	.origam-media-scrubber--vertical .origam-media-scrubber__thumb {
		left: 50%;
		transform: translate(-50%, 50%) scale(1);
	}

	.origam-media-scrubber--thumb-on-hover .origam-media-scrubber__thumb {
		transform: scale(0);
	}

	.origam-media-scrubber--horizontal.origam-media-scrubber--thumb-on-hover .origam-media-scrubber__thumb {
		transform: translate(-50%, -50%) scale(0);
	}

	.origam-media-scrubber--vertical.origam-media-scrubber--thumb-on-hover .origam-media-scrubber__thumb {
		transform: translate(-50%, 50%) scale(0);
	}

	.origam-media-scrubber--thumb-on-hover:hover .origam-media-scrubber__thumb,
	.origam-media-scrubber--thumb-on-hover:focus-visible .origam-media-scrubber__thumb,
	.origam-media-scrubber--thumb-on-hover.origam-media-scrubber--scrubbing .origam-media-scrubber__thumb {
		transform: translate(-50%, -50%) scale(1);
	}

	.origam-media-scrubber--vertical.origam-media-scrubber--thumb-on-hover:hover .origam-media-scrubber__thumb,
	.origam-media-scrubber--vertical.origam-media-scrubber--thumb-on-hover:focus-visible .origam-media-scrubber__thumb,
	.origam-media-scrubber--vertical.origam-media-scrubber--thumb-on-hover.origam-media-scrubber--scrubbing .origam-media-scrubber__thumb {
		transform: translate(-50%, 50%) scale(1);
	}

	.origam-media-scrubber__hover-tooltip {
		position: absolute;
		bottom: calc(100% + 8px);
		transform: translateX(-50%);
		padding: 3px 6px;
		background: var(--origam-media-scrubber__tooltip---background-color, rgba(0, 0, 0, 0.85));
		color: var(--origam-media-scrubber__tooltip---color, #ffffff);
		font-size: 11px;
		font-weight: 600;
		font-family: var(--origam-font---family, system-ui, sans-serif);
		border-radius: 3px;
		white-space: nowrap;
		pointer-events: none;
		z-index: 4;
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-media-scrubber__track,
		.origam-media-scrubber__thumb {
			transition: none;
		}
	}
</style>
