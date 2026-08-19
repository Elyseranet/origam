<template>
	<origam-input
			v-if="isFieldVariant"
			ref="origamInputRef"
			:class="sliderFieldClasses"
			:focused="isFocused"
			:style="sliderFieldStyles"
			v-bind="{ ...inputProps}"
	>
		<template
				v-if="hasPrepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template #default="{id,messagesId,isDisabled,isReadonly,isValid}">
			<slot
					name="default"
					v-bind="{id,messagesId,isDisabled,isReadonly,isValid}"
			>
				<div class="origam-slider-field__label">
					<slot name="label">
						<origam-label
								:for="id"
								:required="required"
								:text="label"
						/>
					</slot>
				</div>

				<div
						class="origam-slider-field__container"
						@click="handleContainerClick"
						@pointermove="handleHoverPointerMove"
						@pointerleave="handleHoverPointerLeave"
				>
					<origam-slider-field-track
							:bg-color="bgColor"
							:color="color"
							:disabled="isDisabled"
							:error="error"
							:index-from-end="indexFromEnd"
							:is-vertical="isVertical"
							:max="resolvedMax"
							:min="resolvedMin"
							:rounded="resolvedRounded"
							:show-ticks="showTicks"
							:start="isRange ? trackRangeStart : 0"
							:stop="isRange ? trackRangeStop : trackStop"
							:tick-size="tickSize"
							:ticks="parsedTicks"
							class="origam-slider-field__track"
							v-bind="{...trackProps}"
					>
						<template
								v-if="$slots.item"
								#item="itemSlotProps"
						>
							<slot
									name="item"
									v-bind="itemSlotProps"
							/>
						</template>
					</origam-slider-field-track>

					<div
							v-if="hasBuffered"
							class="origam-slider-field__buffered"
							:style="bufferedStyles"
							aria-hidden="true"
					/>

					<template v-if="!isRange">
						<input
								:id="id"
								:aria-describedby="messagesId"
								:aria-label="label"
								:class="nativeInputClasses(false)"
								:disabled="isDisabled"
								:max="resolvedMax"
								:min="resolvedMin"
								:name="name || id"
								:orient="isVertical ? 'vertical' : undefined"
								:readonly="isReadonly"
								:step="resolvedStep || 'any'"
								:style="nativeInputStyles(modelPercentage)"
								:value="singleValue"
								class="origam-slider-field__input"
								type="range"
								@blur="handleBlur"
								@change="handleSingleChange"
								@focus="handleFocus"
								@input="handleSingleInput"
								@pointerdown="handleStart"
								@pointerup="handleEnd"
								@touchend="handleEnd"
								@touchstart="handleStart"
						/>

						<div
								:class="thumbClasses(isFocused)"
								:style="thumbStyles(modelPercentage)"
								aria-hidden="true"
						>
							<div
									:class="thumbSurfaceClasses"
									:style="thumbSurfaceStyles"
							/>
						</div>
					</template>
					<template v-else>
						<input
								:id="`${id}__start`"
								:aria-describedby="messagesId"
								:aria-label="label ? `${label} (start)` : undefined"
								:class="nativeInputClasses(false)"
								:disabled="isDisabled"
								:max="resolvedMax"
								:min="resolvedMin"
								:name="name || id"
								:orient="isVertical ? 'vertical' : undefined"
								:readonly="isReadonly"
								:step="resolvedStep || 'any'"
								:style="nativeInputStyles(rangeStartPercentage)"
								:value="rangeValue[0]"
								class="origam-slider-field__input origam-slider-field__input--start"
								type="range"
								@blur="handleBlur"
								@change="handleRangeStartChange"
								@focus="handleRangeFocusStart"
								@input="handleRangeStartInput"
								@pointerdown="handleStart"
								@pointerup="handleEnd"
								@touchend="handleEnd"
								@touchstart="handleStart"
						/>

						<input
								:id="`${id}__stop`"
								:aria-describedby="messagesId"
								:aria-label="label ? `${label} (end)` : undefined"
								:class="nativeInputClasses(true)"
								:disabled="isDisabled"
								:max="resolvedMax"
								:min="resolvedMin"
								:name="name || id"
								:orient="isVertical ? 'vertical' : undefined"
								:readonly="isReadonly"
								:step="resolvedStep || 'any'"
								:style="nativeInputStyles(rangeStopPercentage)"
								:value="rangeValue[1]"
								class="origam-slider-field__input origam-slider-field__input--stop"
								type="range"
								@blur="handleBlur"
								@change="handleRangeStopChange"
								@focus="handleRangeFocusStop"
								@input="handleRangeStopInput"
								@pointerdown="handleStart"
								@pointerup="handleEnd"
								@touchend="handleEnd"
								@touchstart="handleStart"
						/>

						<div
								:class="thumbClasses(isFocused && lastInteracted === 'start')"
								:style="thumbStyles(rangeStartPercentage)"
								aria-hidden="true"
								class="origam-slider-field__thumb--start"
						>
							<div
									:class="thumbSurfaceClasses"
									:style="thumbSurfaceStyles"
							/>
						</div>

						<div
								:class="thumbClasses(isFocused && lastInteracted === 'stop')"
								:style="thumbStyles(rangeStopPercentage)"
								aria-hidden="true"
								class="origam-slider-field__thumb--stop"
						>
							<div
									:class="thumbSurfaceClasses"
									:style="thumbSurfaceStyles"
							/>
						</div>
					</template>

					<output
							v-if="showHoverTooltip"
							class="origam-slider-field__hover-tooltip"
							aria-hidden="true"
					>{{ hoverTooltipLabel }}</output>
				</div>
			</slot>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>

		<template
				v-if="slots.details"
				#details="detailsSlotProps"
		>
			<slot
					name="details"
					v-bind="detailsSlotProps"
			/>
		</template>

		<template
				v-if="slots.messages"
				#messages="{hasMessages, messages}"
		>
			<slot
					name="messages"
					v-bind="{hasMessages, messages}"
			/>
		</template>

		<template
				v-if="slots.message"
				#message="{message}"
		>
			<slot
					name="message"
					v-bind="{message}"
			/>
		</template>
	</origam-input>

	<section
			v-else
			:class="bareWrapperClasses"
			:style="sliderFieldStyles"
			:aria-label="label"
			:data-variant="variant"
	>
		<div
				class="origam-slider-field__container"
				@click="handleContainerClick"
				@pointermove="handleHoverPointerMove"
				@pointerleave="handleHoverPointerLeave"
		>
			<svg
					v-if="hasPeaks"
					class="origam-slider-field__waveform"
					:viewBox="waveformViewBox"
					preserveAspectRatio="none"
					aria-hidden="true"
			>
				<rect
						v-for="(peak, index) in normalizedPeaks"
						:key="index"
						:x="(index / normalizedPeaks.length) * 100"
						:y="50 - (peak * 50)"
						:width="100 / normalizedPeaks.length"
						:height="peak * 100"
						:class="waveformBarClass(index)"
				/>
			</svg>

			<origam-slider-field-track
					:bg-color="bgColor"
					:color="color"
					:disabled="disabled"
					:error="error"
					:index-from-end="indexFromEnd"
					:is-vertical="isVertical"
					:max="resolvedMax"
					:min="resolvedMin"
					:rounded="resolvedRounded"
					:show-ticks="showTicks"
					:start="isRange ? trackRangeStart : 0"
					:stop="isRange ? trackRangeStop : trackStop"
					:tick-size="tickSize"
					:ticks="parsedTicks"
					class="origam-slider-field__track"
					v-bind="{...trackProps}"
			>
				<template
						v-if="$slots.item"
						#item="itemSlotProps"
				>
					<slot
							name="item"
							v-bind="itemSlotProps"
					/>
				</template>
			</origam-slider-field-track>

			<div
					v-if="hasBuffered"
					class="origam-slider-field__buffered"
					:style="bufferedStyles"
					aria-hidden="true"
			/>

			<template v-if="!isRange">
				<input
						:aria-label="label"
						:class="nativeInputClasses(false)"
						:disabled="disabled"
						:max="resolvedMax"
						:min="resolvedMin"
						:name="name"
						:orient="isVertical ? 'vertical' : undefined"
						:readonly="readonly"
						:step="resolvedStep || 'any'"
						:style="nativeInputStyles(modelPercentage)"
						:value="singleValue"
						class="origam-slider-field__input"
						type="range"
						@blur="handleBlur"
						@change="handleSingleChange"
						@focus="handleFocus"
						@input="handleSingleInput"
						@pointerdown="handleStart"
						@pointerup="handleEnd"
						@touchend="handleEnd"
						@touchstart="handleStart"
				/>

				<div
						:class="thumbClasses(isFocused)"
						:style="thumbStyles(modelPercentage)"
						aria-hidden="true"
				>
					<div
							:class="thumbSurfaceClasses"
							:style="thumbSurfaceStyles"
					/>
				</div>
			</template>
			<template v-else>
				<input
						:aria-label="label ? `${label} (start)` : undefined"
						:class="nativeInputClasses(false)"
						:disabled="disabled"
						:max="resolvedMax"
						:min="resolvedMin"
						:name="name ? `${name}__start` : undefined"
						:orient="isVertical ? 'vertical' : undefined"
						:readonly="readonly"
						:step="resolvedStep || 'any'"
						:style="nativeInputStyles(rangeStartPercentage)"
						:value="rangeValue[0]"
						class="origam-slider-field__input origam-slider-field__input--start"
						type="range"
						@blur="handleBlur"
						@change="handleRangeStartChange"
						@focus="handleRangeFocusStart"
						@input="handleRangeStartInput"
						@pointerdown="handleStart"
						@pointerup="handleEnd"
						@touchend="handleEnd"
						@touchstart="handleStart"
				/>

				<input
						:aria-label="label ? `${label} (end)` : undefined"
						:class="nativeInputClasses(true)"
						:disabled="disabled"
						:max="resolvedMax"
						:min="resolvedMin"
						:name="name ? `${name}__stop` : undefined"
						:orient="isVertical ? 'vertical' : undefined"
						:readonly="readonly"
						:step="resolvedStep || 'any'"
						:style="nativeInputStyles(rangeStopPercentage)"
						:value="rangeValue[1]"
						class="origam-slider-field__input origam-slider-field__input--stop"
						type="range"
						@blur="handleBlur"
						@change="handleRangeStopChange"
						@focus="handleRangeFocusStop"
						@input="handleRangeStopInput"
						@pointerdown="handleStart"
						@pointerup="handleEnd"
						@touchend="handleEnd"
						@touchstart="handleStart"
				/>

				<div
						:class="thumbClasses(isFocused && lastInteracted === 'start')"
						:style="thumbStyles(rangeStartPercentage)"
						aria-hidden="true"
						class="origam-slider-field__thumb--start"
				>
					<div
							:class="thumbSurfaceClasses"
							:style="thumbSurfaceStyles"
					/>
				</div>

				<div
						:class="thumbClasses(isFocused && lastInteracted === 'stop')"
						:style="thumbStyles(rangeStopPercentage)"
						aria-hidden="true"
						class="origam-slider-field__thumb--stop"
				>
					<div
							:class="thumbSurfaceClasses"
							:style="thumbSurfaceStyles"
					/>
				</div>
			</template>

			<output
					v-if="showHoverTooltip"
					class="origam-slider-field__hover-tooltip"
					aria-hidden="true"
			>{{ hoverTooltipLabel }}</output>
		</div>
	</section>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, useSlots, WritableComputedRef } from 'vue'
	import { OrigamInput, OrigamLabel, OrigamSliderFieldTrack } from '../../components'

	import {
		useBackgroundColor,
		useFocus,
		useProps,
		useRounded,
		useRtl,
		useSteps,
		useStyle,
		useTextColor,
		useVModel
	} from '../../composables'

	import { DENSITY, DIRECTION, SLIDER_FIELD_VARIANT } from '../../enums'

	import type { ISliderFieldProps } from "../../interfaces"

	import type { ISliderFieldEmits, ISliderFieldSlots } from '../../interfaces/SliderField/slider-field.interface'

	import type { TOrigamInput, TTick } from '../../types'

	import { clamp, convertToUnit, createRange, omit } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and the focus + RTL composables.
	 ********************************************************/
	const props = withDefaults(defineProps<ISliderFieldProps>(), {
		min: 0,
		max: 100,
		modelValue: 0,
		step: 0,
		direction: DIRECTION.HORIZONTAL,
		density: DENSITY.DEFAULT,
		inset: false,
		variant: 'field',
		showThumbOnHoverOnly: false,
		showHoverTooltip: false,
		formatHoverTooltip: (value: number) => String(value)
	})

	const emits = defineEmits<ISliderFieldEmits>()

	defineSlots<ISliderFieldSlots>()

	const {filterProps} = useProps<ISliderFieldProps>(props)

	const origamInputRef = ref<TOrigamInput>()

	const slots = useSlots()

	/*********************************************************
	 * Variant routing
	 *
	 * @description
	 * `variant='field'` keeps the legacy chrome (Phase-1 default).
	 * `variant='timer' | 'audio'` drop the `<origam-input>` wrapper
	 * for a sober media-scrubber look. Audio adds a waveform SVG.
	 ********************************************************/
	const isFieldVariant = computed(() => props.variant === SLIDER_FIELD_VARIANT.FIELD)
	const isAudioVariant = computed(() => props.variant === SLIDER_FIELD_VARIANT.AUDIO)
	const isBareVariant = computed(() => !isFieldVariant.value)

	/*********************************************************
	 * Value & Range
	 *
	 * @description
	 * Model value management, range mode detection, and the
	 * tick-aware stepping math via `useSteps`.
	 ********************************************************/
	const isRange = computed(() => !!props.range)
	const isVertical = computed(() => props.direction === DIRECTION.VERTICAL)
	const isReversed = computed(() => !!props.reverse)
	const indexFromEnd = computed(() => isVertical.value !== isReversed.value)

	const steps = useSteps(props)
	const {min: resolvedMin, max: resolvedMax, step: resolvedStep, roundValue} = steps

	const model = useVModel(
			props,
			'modelValue',
			isRange.value ? [resolvedMin.value, resolvedMax.value] : resolvedMin.value,
			(value: number | string | Array<number> | Array<string> | undefined) => {
				if (isRange.value) {
					const array = value as Array<number> | Array<string>
					if (!array?.length) return [resolvedMin.value, resolvedMax.value]

					return array.map((val) => roundValue(val))
				}

				return roundValue(value == null ? resolvedMin.value : value as number | string)
			}
	) as WritableComputedRef<[number, number] | number> & { readonly externalValue: Array<number> | number }

	const singleValue = computed(() => {
		return isRange.value ? resolvedMin.value : (model.value as number)
	})
	const rangeValue = computed<[number, number]>(() => {
		if (!isRange.value) return [resolvedMin.value, resolvedMax.value]
		const v = model.value as [number, number]
		return [v[0] ?? resolvedMin.value, v[1] ?? resolvedMax.value]
	})

	/*********************************************************
	 * Position math
	 *
	 * @description
	 * Pure-function value → percentage conversion, fully driven
	 * by the native `<input type="range">` value. No JS drag
	 * pipeline, no pointer math — the browser owns it.
	 ********************************************************/
	const toPercent = (val: number) => {
		const span = resolvedMax.value - resolvedMin.value
		if (!span) return 0
		const pct = ((val - resolvedMin.value) / span) * 100
		return clamp(isNaN(pct) ? 0 : pct, 0, 100)
	}

	const modelPercentage = computed(() => toPercent(singleValue.value))
	const rangeStartPercentage = computed(() => toPercent(rangeValue.value[0]))
	const rangeStopPercentage = computed(() => toPercent(rangeValue.value[1]))

	const trackStop = computed(() => modelPercentage.value)
	const trackRangeStart = computed(() => rangeStartPercentage.value)
	const trackRangeStop = computed(() => rangeStopPercentage.value)

	/*********************************************************
	 * Buffered (media-scrubber parity)
	 *
	 * @description
	 * `buffered` paints a secondary fill from `min` to `buffered`.
	 * Rendered as a sibling DOM element behind the active fill —
	 * CSS owns the visual stacking, no inline JS layout math.
	 ********************************************************/
	const hasBuffered = computed(() => {
		if (typeof props.buffered !== 'number') return false
		return Number.isFinite(props.buffered)
	})

	const bufferedPercentage = computed(() => {
		if (!hasBuffered.value) return 0
		const clamped = clamp(props.buffered as number, resolvedMin.value, resolvedMax.value)
		return toPercent(clamped)
	})

	/**
	 * Where the buffered fill is anchored: vertical sliders grow from the
	 * bottom, horizontal ones from whichever inline edge the track starts at.
	 * Split out of `bufferedStyles` as guard clauses — the three cases are
	 * mutually exclusive and read better than a nested ternary.
	 */
	const bufferedPosition = computed(() => {
		const pct = bufferedPercentage.value
		if (isVertical.value) return { height: `${pct}%`, bottom: '0' }
		if (indexFromEnd.value) return { width: `${pct}%`, insetInlineEnd: '0' }
		return { width: `${pct}%`, insetInlineStart: '0' }
	})

	const bufferedStyles = computed<StyleValue>(() => {
		return [bufferedPosition.value, roundedStyles.value] as StyleValue
	})

	/*********************************************************
	 * Waveform (variant='audio')
	 *
	 * @description
	 * `peaks` is a `[0..1]` array drawn as vertical bars BEHIND the
	 * track via inline SVG (a single `<svg>` sibling — `pointer-events:
	 * none` so the native input keeps full pointer capture). The bar
	 * fill is split at the model thumb position: left of the thumb uses
	 * `currentColor`, right uses a 35 % mix.
	 ********************************************************/
	const hasPeaks = computed(() => {
		if (!isAudioVariant.value) return false
		const peaks = props.peaks
		return Array.isArray(peaks) && peaks.length > 0
	})

	const normalizedPeaks = computed(() => {
		const peaks = props.peaks ?? []
		return peaks.map((p) => clamp(Number.isFinite(p) ? p : 0, 0, 1))
	})

	const waveformViewBox = computed(() => '0 0 100 100')

	const waveformBarClass = (index: number) => {
		const barPct = (index / Math.max(1, normalizedPeaks.value.length)) * 100
		return barPct <= modelPercentage.value
				? 'origam-slider-field__waveform-bar origam-slider-field__waveform-bar--active'
				: 'origam-slider-field__waveform-bar origam-slider-field__waveform-bar--inactive'
	}

	/*********************************************************
	 * Hover tooltip (RAF-throttled)
	 *
	 * @description
	 * The X-position of the cursor on the rail is forwarded as a CSS
	 * variable (`--origam-slider-field---hover-x`). A single pointermove
	 * handler is RAF-throttled so the tooltip position never re-renders
	 * more than once per frame.
	 ********************************************************/
	const hoverValue = ref<number | null>(null)
	const hoverRafId = ref<number | null>(null)
	const hoverContainerEl = ref<HTMLElement | null>(null)

	const hoverTooltipLabel = computed(() => {
		const fn = props.formatHoverTooltip
		const value = hoverValue.value ?? 0
		return fn ? fn(value) : String(value)
	})

	const computeHoverFromEvent = (event: PointerEvent, container: HTMLElement) => {
		const rect = container.getBoundingClientRect()
		const pct = isVertical.value
				? clamp(((rect.bottom - event.clientY) / Math.max(1, rect.height)) * 100, 0, 100)
				: clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 100, 0, 100)
		const adjusted = indexFromEnd.value && !isVertical.value ? 100 - pct : pct
		const span = resolvedMax.value - resolvedMin.value
		const rawValue = resolvedMin.value + (adjusted / 100) * span
		hoverValue.value = roundValue(clamp(rawValue, resolvedMin.value, resolvedMax.value)) as number
		container.style.setProperty('--origam-slider-field---hover-x', `${pct}%`)
	}

	const handleHoverPointerMove = (event: PointerEvent) => {
		if (props.disabled) return
		if (!props.showHoverTooltip) return
		const container = event.currentTarget as HTMLElement | null
		if (!container) return
		hoverContainerEl.value = container
		if (hoverRafId.value !== null) return
		hoverRafId.value = requestAnimationFrame(() => {
			hoverRafId.value = null
			computeHoverFromEvent(event, container)
		})
	}

	const handleHoverPointerLeave = () => {
		if (hoverRafId.value !== null) {
			cancelAnimationFrame(hoverRafId.value)
			hoverRafId.value = null
		}
		const container = hoverContainerEl.value
		if (container) {
			container.style.removeProperty('--origam-slider-field---hover-x')
		}
		hoverValue.value = null
	}

	/*********************************************************
	 * Ticks
	 *
	 * @description
	 * Tick descriptors computed once at the parent level and
	 * forwarded to the track as a flat array — keeps the track
	 * component dumb (props in, DOM out).
	 ********************************************************/
	const tickSize = computed<number>(() => {
		if (typeof props.tickSize === 'number') return props.tickSize
		return 2
	})

	const parsedTicks = computed<Array<TTick>>(() => {
		if (!props.showTicks) return []

		const span = resolvedMax.value - resolvedMin.value
		const step = resolvedStep.value
		const ticksProp = props.ticks

		if (!ticksProp) {
			if (!step || span <= 0) return []
			const count = span / step
			if (!isFinite(count)) return []
			return createRange(count + 1).map((t) => {
				const value = resolvedMin.value + (t * step)
				return {
					value,
					position: toPercent(value)
				}
			})
		}

		if (Array.isArray(ticksProp)) {
			return ticksProp.map((t) => ({
				value: t,
				position: toPercent(t),
				label: String(t)
			}))
		}

		if (typeof ticksProp === 'object' && ticksProp !== null) {
			return Object.keys(ticksProp as Record<string, string>).map((key) => ({
				value: parseFloat(key),
				position: toPercent(parseFloat(key)),
				label: (ticksProp as unknown as Record<string, string>)[key]
			}))
		}

		return []
	})

	const hasTickLabels = computed(() => parsedTicks.value.some(({label}) => !!label))

	/*********************************************************
	 * Focus & range thumb routing
	 *
	 * @description
	 * Focus state plus a `lastInteracted` flag that tracks which
	 * of the two range thumbs received the most recent input —
	 * used by the visual thumb proxy + the e2e/ a11y story.
	 ********************************************************/
	const {isFocused, onFocus, onBlur} = useFocus(props)
	const {rtlClasses} = useRtl()

	const lastInteracted = ref<'start' | 'stop'>('stop')

	const handleFocus = () => {
		onFocus()
	}
	const handleBlur = () => {
		onBlur()
	}
	const handleRangeFocusStart = () => {
		lastInteracted.value = 'start'
		onFocus()
	}
	const handleRangeFocusStop = () => {
		lastInteracted.value = 'stop'
		onFocus()
	}

	/*********************************************************
	 * Pointer lifecycle
	 *
	 * @description
	 * `start` / `end` emits map 1:1 to pointerdown / pointerup
	 * on the native input. The browser handles the drag itself,
	 * so we only need to flag pressed state for styling.
	 ********************************************************/
	const mousePressed = ref(false)
	const handleStart = () => {
		if (props.readonly || props.disabled) return
		mousePressed.value = true
		emits('start', model.value)
	}
	const handleEnd = () => {
		mousePressed.value = false
		emits('end', model.value)
	}

	/*********************************************************
	 * Input handlers
	 *
	 * @description
	 * Native `input` (live drag) and `change` (commit) events
	 * are bridged to v-model with step rounding.
	 ********************************************************/
	const handleSingleInput = (e: Event) => {
		const target = e.target as HTMLInputElement
		const v = roundValue(target.value)
		model.value = v
	}
	const handleSingleChange = handleSingleInput

	const handleRangeStartInput = (e: Event) => {
		const target = e.target as HTMLInputElement
		lastInteracted.value = 'start'
		const v = roundValue(target.value)
		const [, stop] = rangeValue.value
		model.value = [Math.min(v, stop), stop]
	}
	const handleRangeStartChange = (e: Event) => handleRangeStartInput(e)

	const handleRangeStopInput = (e: Event) => {
		const target = e.target as HTMLInputElement
		lastInteracted.value = 'stop'
		const v = roundValue(target.value)
		const [start] = rangeValue.value
		model.value = [start, Math.max(v, start)]
	}
	const handleRangeStopChange = (e: Event) => handleRangeStopInput(e)

	/*********************************************************
	 * Click-on-rail (range mode)
	 *
	 * @description
	 * In range mode the two stacked native inputs can shadow
	 * each other for a rail click — we proxy the click to the
	 * closest thumb when the original target is the container
	 * itself (not an input).
	 ********************************************************/
	const handleContainerClick = (e: MouseEvent) => {
		if (!isRange.value) return
		if (props.readonly || props.disabled) return
		const target = e.target as HTMLElement
		if (target.tagName === 'INPUT') return

		const container = (e.currentTarget as HTMLElement)
		const rect = container.getBoundingClientRect()
		const pct = isVertical.value
				? (rect.bottom - e.clientY) / rect.height
				: (e.clientX - rect.left) / rect.width
		const adjusted = indexFromEnd.value ? 1 - pct : pct
		const span = resolvedMax.value - resolvedMin.value
		const rawValue = clamp(resolvedMin.value + adjusted * span, resolvedMin.value, resolvedMax.value)
		const value = roundValue(rawValue)
		const [start, stop] = rangeValue.value
		// Pick the thumb whose value is closer to the click position.
		const distStart = Math.abs(value - start)
		const distStop = Math.abs(value - stop)
		if (distStart <= distStop) {
			lastInteracted.value = 'start'
			model.value = [Math.min(value, stop), stop]
		} else {
			lastInteracted.value = 'stop'
			model.value = [start, Math.max(value, start)]
		}
	}

	/*********************************************************
	 * Color
	 *
	 * @description
	 * `color` paints the fill + thumb surface (`currentColor`),
	 * `bgColor` paints the rail. `error` forces `danger` on both
	 * (override convention shared with Input/Form/Snackbar).
	 ********************************************************/
	const color = computed(() => {
		if (props.disabled) return undefined
		if (props.error) return 'danger'
		return props.color
	})
	const bgColor = computed(() => {
		if (props.disabled) return undefined
		if (props.error) return 'danger'
		return props.bgColor
	})

	const {backgroundColorClasses: thumbBgClasses, backgroundColorStyles: thumbBgStyles} = useBackgroundColor(color)
	const {textColorClasses: thumbTextClasses, textColorStyles: thumbTextStyles} = useTextColor(color)

	/*********************************************************
	 * Rounded
	 *
	 * @description
	 * `ISliderFieldProps extends IRoundedProps`, but until #283 the
	 * `rounded` prop was declared and never consumed anywhere in this
	 * component — no `useRounded()` call, no forwarding to the track,
	 * every radius in the SCSS was hardcoded (`999px`/`9999px`).
	 *
	 * `resolvedRounded` lets an explicit `trackProps.rounded` win (the
	 * dedicated track-level override channel), falling back to the
	 * slider's own top-level `rounded` prop otherwise. The SAME resolved
	 * value both (1) gets forwarded to `<OrigamSliderFieldTrack>` — which
	 * already wires `useRounded()` correctly, so the rail picks it up for
	 * free (no duplicated logic) — and (2) drives `roundedStyles` here,
	 * applied to the `__buffered` fill so it always matches the rail's
	 * shape. The default (unset) case is untouched: `roundedStyles` stays
	 * empty and every hardcoded radius falls back to the new
	 * `--origam-slider-field---border-radius` token (themeable without
	 * ever touching the `rounded` prop).
	 ********************************************************/
	const resolvedRounded = computed(() => {
		return props.trackProps?.rounded ?? props.rounded
	})
	const {roundedClasses, roundedStyles} = useRounded(resolvedRounded)

	/*********************************************************
	 * Native input styling
	 *
	 * @description
	 * Forwarded props (Input wrapper, Track, container classes,
	 * and the thumb visual proxy). The native `<input>` itself
	 * is transparent — it owns interaction only.
	 ********************************************************/

	/*********************************************************
	 * Forwarded props
	 ********************************************************/
	const inputProps = computed(() => {
		// Strip the entire IColorProps surface so `OrigamInput` (the
		// row wrapper) doesn't paint the consumer's intent on its
		// background. `color` / `bgColor` stay strictly scoped to the
		// slider track + thumb (per the project's color contract).
		return origamInputRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'focused', 'centerAffix', 'color', 'bgColor', 'activeColor', 'activeBgColor', 'hoverColor', 'hoverBgColor'])
	})
	const trackProps = computed(() => {
		return omit(props.trackProps ?? {}, ['class', 'start', 'stop', 'color', 'bgColor', 'disabled', 'error', 'isVertical', 'indexFromEnd', 'showTicks', 'tickSize', 'ticks', 'min', 'max'])
	})

	const hasPrepend = computed(() => {
		return !!(props.label) || slots.label || slots.prepend
	})

	const nativeInputClasses = (isStop: boolean) => {
		return [
			'origam-slider-field__input',
			isStop ? 'origam-slider-field__input--upper' : 'origam-slider-field__input--lower'
		]
	}

	const nativeInputStyles = (percentage: number) => {
		return {
			'--origam-slider-field__input---percentage': `${percentage}%`
		}
	}

	const thumbClasses = (focused: boolean | undefined) => {
		return [
			'origam-slider-field-thumb',
			'origam-slider-field__thumb',
			{
				'origam-slider-field-thumb--focused': focused,
				'origam-slider-field-thumb--pressed': focused && mousePressed.value
			}
		]
	}

	const thumbStyles = (percentage: number) => {
		const dirVar = isVertical.value ? 'bottom' : 'inset-inline-start'
		const computedPct = indexFromEnd.value && !isVertical.value ? 100 - percentage : percentage
		return {
			[dirVar]: `${computedPct}%`
		} as StyleValue
	}

	const thumbSurfaceClasses = computed(() => [
		'origam-slider-field-thumb__surface',
		thumbTextClasses.value,
		thumbBgClasses.value
	])

	const thumbSurfaceStyles = computed(() => [
		thumbTextStyles.value,
		thumbBgStyles.value
	] as StyleValue)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles.
	 ********************************************************/
	const sliderFieldStyles = computed(() => {
		return [
			{
				'--origam-slider-field---thumb-size': convertToUnit(20),
				'--origam-slider-field---track-size': convertToUnit(typeof props.trackProps?.size === 'number' ? props.trackProps.size : 4)
			},
			props.style
		] as StyleValue
	})
	const variantClass = computed(() => `origam-slider-field--variant-${props.variant ?? SLIDER_FIELD_VARIANT.FIELD}`)

	const sharedStateClasses = computed(() => ({
		'origam-slider-field--has-labels': slots.tickLabel || hasTickLabels.value,
		'origam-slider-field--focused': isFocused.value,
		'origam-slider-field--pressed': mousePressed.value,
		'origam-slider-field--disabled': props.disabled,
		'origam-slider-field--readonly': props.readonly,
		'origam-slider-field--error': props.error,
		'origam-slider-field--range': isRange.value,
		'origam-slider-field--inset': props.inset,
		'origam-slider-field--vertical': isVertical.value,
		'origam-slider-field--horizontal': !isVertical.value,
		'origam-slider-field--reverse': isReversed.value,
		'origam-slider-field--thumb-on-hover': props.showThumbOnHoverOnly || isBareVariant.value,
		'origam-slider-field--has-buffered': hasBuffered.value,
		'origam-slider-field--has-peaks': hasPeaks.value
	}))

	const sliderFieldClasses = computed(() => {
		return [
			'origam-slider-field',
			variantClass.value,
			sharedStateClasses.value,
			rtlClasses.value,
			roundedClasses.value,
			props.class
		]
	})

	const bareWrapperClasses = computed(() => {
		return [
			'origam-slider-field',
			'origam-slider-field--bare',
			variantClass.value,
			sharedStateClasses.value,
			rtlClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(sliderFieldStyles)


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
	.origam-slider-field {
		$this: &;

		&__container {
			position: relative;
			min-height: inherit;
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
		}

		&__label {
			margin-inline-end: 12px;
		}

		&__input {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			position: absolute;
			margin: 0;
			padding: 0;
			background: transparent;
			cursor: pointer;
			outline: none;
			pointer-events: auto;

			&::-webkit-slider-runnable-track {
				background: transparent;
				border: none;
				height: 100%;
			}

			&::-moz-range-track {
				background: transparent;
				border: none;
				height: 100%;
			}

			&::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				width: var(--origam-slider-field---thumb-size, 20px);
				height: var(--origam-slider-field---thumb-size, 20px);
				background: transparent;
				border: none;
				cursor: grab;
				pointer-events: auto;
			}

			&::-moz-range-thumb {
				width: var(--origam-slider-field---thumb-size, 20px);
				height: var(--origam-slider-field---thumb-size, 20px);
				background: transparent;
				border: none;
				cursor: grab;
				pointer-events: auto;
			}

			&:focus-visible::-webkit-slider-thumb {
				cursor: grabbing;
			}

			&:disabled {
				cursor: not-allowed;

				&::-webkit-slider-thumb {
					cursor: not-allowed;
				}

				&::-moz-range-thumb {
					cursor: not-allowed;
				}
			}
		}

		&__thumb {
			position: absolute;
			pointer-events: none;
			width: var(--origam-slider-field---thumb-size, 20px);
			height: var(--origam-slider-field---thumb-size, 20px);
			transform: translate(-50%, -50%);
			top: 50%;
			transition: 0.15s 0.05s transform cubic-bezier(0, 0, 0.2, 1);
		}

		&__buffered {
			position: absolute;
			pointer-events: none;
			background: var(--origam-slider-field__buffered---background-color, color-mix(in srgb, currentColor 40%, transparent));
			opacity: var(--origam-slider-field__buffered---opacity, 0.5);
			border-radius: var(--origam-slider-field---border-radius, 999px);
			top: 50%;
			transform: translateY(-50%);
			height: var(--origam-slider-field--variant--field---track-thickness, var(--origam-slider-field---track-size, 4px));
			z-index: 1;
		}

		&__waveform {
			position: absolute;
			pointer-events: none;
			inset: 0;
			width: 100%;
			height: 100%;
		}

		&__waveform-bar {
			&--active {
				fill: currentColor;
			}

			&--inactive {
				fill: color-mix(in srgb, currentColor 35%, transparent);
			}
		}

		&__hover-tooltip {
			position: absolute;
			pointer-events: none;
			bottom: calc(100% + 6px);
			inset-inline-start: var(--origam-slider-field---hover-x, 0%);
			transform: translateX(-50%);
			padding: 3px 6px;
			background: var(--origam-slider-field__hover-tooltip---background-color, var(--origam-color__surface--inverse---bg, rgba(0, 0, 0, 0.85)));
			color: var(--origam-slider-field__hover-tooltip---color, var(--origam-color__on--inverse---fg, #ffffff));
			font-size: 11px;
			font-weight: 600;
			font-family: var(--origam-font---family, system-ui, sans-serif);
			border-radius: 3px;
			white-space: nowrap;
			z-index: 4;
			opacity: 0;
			transition: opacity 120ms ease;
		}

		&__container:hover &__hover-tooltip,
		&__container:focus-within &__hover-tooltip,
		&--pressed &__hover-tooltip {
			opacity: 1;
		}

		&.origam-input {
			:deep(.origam-input__append),
			:deep(.origam-input__prepend) {
				padding: 0;
			}

			&--disabled {
				pointer-events: none;

				#{$this}__container {
					opacity: 0.38;
				}
			}

			&--error {
				#{$this}__container {
					color: rgba(255, 0, 0, 1);
				}
			}
		}

		&--horizontal {
			align-items: center;
			margin-inline: 8px 8px;

			:deep(.origam-input__control) {
				min-height: 32px;
				display: flex;
				align-items: center;
			}

			:deep(.origam-slider-field-track) {
				display: flex;
				align-items: center;
				width: 100%;
				font-size: 0.5rem;
				padding: 0 5px;
				background-color: rgb(148, 148, 148);
				height: var(--origam-slider-field---track-size, 14px);
				transition: 0.2s background-color cubic-bezier(0.4, 0, 0.2, 1);

				.origam-slider-field-track__background {
					height: var(--origam-slider-field---track-size, 14px);
				}

				.origam-slider-field-track__fill {
					height: inherit;
				}

				.origam-slider-field-track__tick {
					margin-top: calc(calc(var(--origam-slider-field---track-size, 14px) + 2px) / 2);
				}

				.origam-slider-field-track__tick-label {
					margin-top: calc(var(--origam-slider-field---track-size, 14px) / 2 + 8px);
					transform: translateX(-50%);
				}

				.origam-slider-field-track__tick--first {
					margin-inline-start: calc(var(--origam-slider-field---track-size, 14px) + 1px);
					transform: translateX(0%);
				}

				.origam-slider-field-track__tick--last {
					margin-inline-start: calc(100% - var(--origam-slider-field---track-size, 14px) - 1px);
					transform: translateX(-100%);
				}
			}

			#{$this}__input {
				inset-inline-start: 0;
				width: 100%;
				height: var(--origam-slider-field---thumb-size, 20px);
			}
		}

		&--vertical {
			justify-content: center;
			margin-top: 12px;
			margin-bottom: 12px;

			:deep(.origam-input__control) {
				min-height: 300px;
			}

			:deep(.origam-slider-field-track) {
				height: 100%;
				display: flex;
				justify-content: center;
				width: calc(var(--origam-slider-field-track---size, 2) + 2px);

				.origam-slider-field-track__background {
					width: var(--origam-slider-field-track---size, 2);
				}

				.origam-slider-field-track__fill {
					width: inherit;
				}

				.origam-slider-field-track__ticks {
					height: 100%;
				}

				.origam-slider-field-track__tick {
					margin-inline-start: calc(calc(var(--origam-slider-field-track---size) + 2px) / 2);
					transform: translate(calc(var(--origam-slider-field-track---size, 2) / -2), calc(var(--origam-slider-field-track---size, 2) / 2));
				}

				.origam-slider-field-track__tick--first {
					bottom: calc(0% + var(--origam-slider-field-track---size, 2) + 1px);
				}

				.origam-slider-field-track__tick--last {
					bottom: calc(100% - var(--origam-slider-field-track---size, 2) - 1px);
				}

				.origam-slider-field-track__tick-label {
					margin-inline-start: calc(var(--origam-slider-field-track---size, 2) / 2 + 12px);
					transform: translateY(-50%);
				}
			}

			#{$this}__input {
				writing-mode: vertical-lr;
				-webkit-appearance: slider-vertical;
				appearance: slider-vertical;
				width: var(--origam-slider-field---thumb-size, 20px);
				height: 100%;
				top: 0;
			}

			#{$this}__thumb {
				top: auto;
				left: 50%;
				transform: translate(-50%, 50%);
			}

			#{$this}__buffered {
				top: auto;
				bottom: 0;
				inset-inline-start: 50%;
				transform: translateX(-50%);
				width: var(--origam-slider-field--variant--field---track-thickness, var(--origam-slider-field---track-size, 4px));
				height: auto;
			}
		}

		&--has-labels {
			> :deep(.origam-input__control) {
				margin-bottom: 4px;
			}
		}

		&--pressed {
			--origam-slider-field---transition: var(--origam-slider-field--pressed---transition, none);
		}

		&--focused {
			:deep(.origam-slider-field-track) {
				.origam-slider-field-track__tick {
					opacity: 1;
				}
			}
		}

		&--inset {
			#{$this}__thumb {
				width: 10px;
				height: 10px;
			}

			:deep(.origam-slider-field-track) {
				background: transparent;
				border-radius: var(--origam-slider-field---border-radius, 999px);
			}

			:deep(.origam-slider-field-track__background) {
				border-radius: var(--origam-slider-field---border-radius, 999px);
			}

			:deep(.origam-slider-field-track__fill) {
				border-radius: var(--origam-slider-field---border-radius, 999px);
			}

			&.origam-slider-field--horizontal {
				:deep(.origam-input__control) {
					min-height: 16px;
				}

				:deep(.origam-slider-field-track),
				:deep(.origam-slider-field-track__background),
				:deep(.origam-slider-field-track__fill) {
					height: 14px;
				}
			}

			&.origam-slider-field--vertical {
				:deep(.origam-input__control) {
					min-height: 0;
					min-width: 16px;
				}

				:deep(.origam-slider-field-track),
				:deep(.origam-slider-field-track__background),
				:deep(.origam-slider-field-track__fill) {
					width: 14px;
				}
			}
		}

		&--range {
			#{$this}__input--start,
			#{$this}__input--stop {
				inset-inline-start: 0;
				pointer-events: none;
			}
		}

		&--thumb-on-hover {
			#{$this}__thumb {
				opacity: 0;
				transition: opacity 120ms ease, transform 0.15s 0.05s cubic-bezier(0, 0, 0.2, 1);
			}

			#{$this}__container:hover #{$this}__thumb,
			#{$this}__container:focus-within #{$this}__thumb,
			&#{$this}--pressed #{$this}__thumb {
				opacity: 1;
			}
		}
	}

	.origam-slider-field--bare {
		--origam-slider-field--variant--field---track-thickness: var(--origam-slider-field--bare---track-thickness, 2px);
		--origam-slider-field--variant--field---track-thickness-active: var(--origam-slider-field--bare---track-thickness-active, 4px);

		display: block;
		position: relative;
		width: 100%;
		min-width: 0;
		color: var(--origam-slider-field--bare---accent-color, var(--origam-color__action--primary---bg));

		.origam-slider-field__container {
			min-height: 14px;
			height: 14px;
		}

		:deep(.origam-slider-field-track) {
			background-color: var(--origam-slider-field--bare---track-background-color, color-mix(in srgb, currentColor 25%, transparent));
			border-radius: var(--origam-slider-field---border-radius, 999px);
			height: var(--origam-slider-field--variant--field---track-thickness);
			width: 100%;
			transition: height 140ms ease;

			.origam-slider-field-track__background {
				background: transparent;
				height: 100%;
			}

			.origam-slider-field-track__fill {
				background: currentColor;
				height: 100%;
				border-radius: var(--origam-slider-field---border-radius, 999px);
			}
		}

		.origam-slider-field__buffered {
			background: var(--origam-slider-field__buffered--bare---background-color, color-mix(in srgb, currentColor 40%, transparent));
			opacity: 1;
			border-radius: var(--origam-slider-field---border-radius, 999px);
			height: var(--origam-slider-field--variant--field---track-thickness);
			z-index: 1;
		}

		.origam-slider-field__input {
			inset-inline-start: 0;
			width: 100%;
			height: 14px;
		}

		.origam-slider-field__thumb {
			--origam-slider-field---thumb-size: var(--origam-slider-field--bare---thumb-size, 12px);
			background: currentColor;
		}

		&:hover :deep(.origam-slider-field-track),
		&:focus-within :deep(.origam-slider-field-track),
		&.origam-slider-field--pressed :deep(.origam-slider-field-track) {
			height: var(--origam-slider-field--variant--field---track-thickness-active);
		}

		&:hover .origam-slider-field__buffered,
		&:focus-within .origam-slider-field__buffered,
		&.origam-slider-field--pressed .origam-slider-field__buffered {
			height: var(--origam-slider-field--variant--field---track-thickness-active);
		}
	}

	.origam-slider-field--variant-audio {
		--origam-slider-field--audio---track-height: 48px;

		.origam-slider-field__container {
			min-height: var(--origam-slider-field--audio---track-height);
			height: var(--origam-slider-field--audio---track-height);
		}

		.origam-slider-field__input {
			height: var(--origam-slider-field--audio---track-height);
		}

		.origam-slider-field-thumb {
			display: none;
		}

		.origam-slider-field-track {
			background-color: transparent;
		}

		:deep(.origam-slider-field-track__background),
		:deep(.origam-slider-field-track__fill) {
			background-color: transparent;
		}
	}

	.origam-slider-field-thumb {
		$this: &;

		color: rgba(66, 66, 66, 1);
		outline: none;
		transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

		&__surface {
			width: var(--origam-slider-field---thumb-size, 20px);
			height: var(--origam-slider-field---thumb-size, 20px);
			border: 1px solid var(--origam-slider-field-thumb__surface---border-color, rgba(0, 0, 0, 0.18));
			border-radius: 50%;
			user-select: none;
			background-color: currentColor;
			box-shadow: none;
			transition: 0.15s 0.05s transform cubic-bezier(0, 0, 0.2, 1), 0.2s color cubic-bezier(0.4, 0, 0.2, 1), 0.2s background-color cubic-bezier(0.4, 0, 0.2, 1), 0.2s border-color cubic-bezier(0.4, 0, 0.2, 1);

			@media (forced-colors: active) {
				background-color: highlight;
			}

			&:before {
				transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				content: "";
				color: inherit;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				border-radius: 50%;
				background: currentColor;
				position: absolute;
				pointer-events: none;
				opacity: 0;
			}
		}

		&--focused {
			#{$this}__surface {
				&:before {
					transform: scale(2);
					opacity: 0.12;
				}
			}
		}

		&--pressed {
			transition: none;

			#{$this}__surface {
				&:before {
					opacity: 0.12;
				}
			}
		}

		@media (hover: hover) {
			&:hover {
				#{$this}__surface {
					&:before {
						transform: scale(2);
					}
				}

				&:not(#{$this}--focused) {
					#{$this}__surface {
						&:before {
							opacity: 0.04;
						}
					}
				}
			}
		}
	}
</style>
