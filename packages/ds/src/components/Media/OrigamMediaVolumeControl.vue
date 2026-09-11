<template>
	<origam-tooltip
			:open-delay="80"
			:close-delay="300"
			location="top"
			content-class="origam-media-volume-control__tooltip"
	>
		<template #activator="{ props: activatorProps }">
			<button
					v-bind="activatorProps"
					:id="id"
					type="button"
					class="origam-media-volume-control__btn"
					:class="rootClasses"
					:style="rootStyles"
					:aria-label="toggleLabel"
					:data-cy="btnDataCy"
					@click="onToggleMute"
			>
				<origam-icon
						:icon="volumeIcon"
						aria-hidden="true"
				/>
			</button>
		</template>
		<div
				class="origam-media-volume-control__wrapper"
				:data-cy="wrapperDataCy"
		>
			<origam-media-scrubber
					class="origam-media-volume-control__scrubber"
					orientation="vertical"
					:model-value="resolvedVolume"
					:max="1"
					:step="0.05"
					:aria-label="volumeLabel"
					:aria-value-text="formattedVolume"
					:format-hover-tooltip="formatVolumeTooltip"
					:data-cy="scrubberDataCy"
					@update:model-value="onVolumeFromScrubber"
			/>
		</div>
	</origam-tooltip>
</template>

<script
		lang="ts"
		setup
>
	import { computed, type StyleValue, toRef } from 'vue'

	import { OrigamIcon } from '../Icon'
	import { OrigamTooltip } from '../Tooltip'

	import OrigamMediaScrubber from './OrigamMediaScrubber.vue'

	import { useDensity } from '../../composables/Commons/density.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useTextColor } from '../../composables/Commons/textColor.composable'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IMediaVolumeControlEmits, IMediaVolumeControlProps, IMediaVolumeControlSlots } from '../../interfaces/Media/media-volume-control.interface'

	const props = withDefaults(defineProps<IMediaVolumeControlProps>(), {
		dataCy: 'origam-media-volume-control'
	})

	const emit = defineEmits<IMediaVolumeControlEmits>()

	defineSlots<IMediaVolumeControlSlots>()

	const ICONS = {
		VOLUME_HIGH: MDI_ICONS.VOLUME_HIGH,
		VOLUME_MEDIUM: MDI_ICONS.VOLUME_MEDIUM,
		VOLUME_LOW: MDI_ICONS.VOLUME_LOW,
		VOLUME_OFF: MDI_ICONS.VOLUME_OFF
	}

	/*********************************************************
	 * Design channels — every read is deferred inside a `computed`
	 * (ADR-005): the theme props resolver writes `instance.props` in
	 * `beforeCreate`, i.e. AFTER this `setup()` body runs, so a value
	 * captured eagerly here would never see `theme.components`.
	 *
	 * `toRef` for `color` (foreground-only channel: this widget paints
	 * no surface of its own — the hover wash and the tooltip scrubber
	 * are both `color-mix(… currentColor …)`), the props OBJECT for
	 * `useRounded` so the four per-corner props stay reachable.
	 ********************************************************/
	const { textColorClasses, textColorStyles } = useTextColor(toRef(props, 'color'))
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { sizeClasses, sizeStyles } = useSize(props)
	const { densityClasses } = useDensity(props)

	const rootClasses = computed(() => [
		props.class,
		textColorClasses.value,
		roundedClasses.value,
		sizeClasses.value,
		densityClasses.value
	])

	const rootStyles = computed<Array<StyleValue>>(() => [
		props.style as StyleValue,
		textColorStyles.value as StyleValue,
		roundedStyles.value as StyleValue,
		sizeStyles.value as StyleValue
	])

	const toggleLabel = computed<string>(() => (props.muted ? props.unmuteLabel : props.muteLabel))

	const btnDataCy = computed<string>(() => `${props.dataCy}-mute`)
	const wrapperDataCy = computed<string>(() => `${props.dataCy}-wrapper`)
	const scrubberDataCy = computed<string>(() => props.dataCy)

	const volumeIcon = computed<string>(() => {
		if (props.muted || props.volume === 0) return ICONS.VOLUME_OFF
		if (props.volume < 0.34) return ICONS.VOLUME_LOW
		if (props.volume < 0.67) return ICONS.VOLUME_MEDIUM
		return ICONS.VOLUME_HIGH
	})

	const resolvedVolume = computed<number>(() => {
		return props.muted ? 0 : props.volume
	})

	const formattedVolume = computed<string>(() => {
		const pct = Math.round(resolvedVolume.value * 100)
		return `${pct} %`
	})

	function formatVolumeTooltip (value: number): string {
		return `${Math.round(value * 100)} %`
	}

	function onToggleMute (): void {
		emit('update:muted', !props.muted)
	}

	function onVolumeFromScrubber (value: number): void {
		emit('update:volume', value)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-media-volume-control__btn {
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--origam-media-volume-control__btn---size) + var(--origam-media-volume-control---density));
		height: calc(var(--origam-media-volume-control__btn---size) + var(--origam-media-volume-control---density));
		border-radius: var(--origam-media-volume-control__btn---border-radius);
		cursor: pointer;
		color: var(--origam-media-volume-control__btn---color);
		background-color: var(--origam-media-volume-control__btn---background-color);
		transition:
			background-color var(--origam-media-volume-control__btn---transition-duration) ease,
			transform var(--origam-media-volume-control__btn---transition-duration) ease,
			opacity var(--origam-media-volume-control__btn---transition-duration) ease;
		opacity: var(--origam-media-volume-control__btn---opacity);
	}

	.origam-media-volume-control__btn:hover,
	.origam-media-volume-control__btn:focus-visible {
		opacity: var(--origam-media-volume-control__btn--hover---opacity);
		background-color: var(--origam-media-volume-control__btn--hover---background-color);
	}

	.origam-media-volume-control__btn:active {
		transform: scale(var(--origam-media-volume-control__btn--active---scale));
	}

	.origam-media-volume-control__btn :deep(.origam-icon) {
		font-size: var(--origam-media-volume-control__icon---font-size);
		line-height: 1;
	}

	.origam-media-volume-control--size-x-small {
		--origam-media-volume-control__btn---size: var(--origam-media-volume-control__btn---size-xs);
		--origam-media-volume-control__icon---font-size: var(--origam-media-volume-control__icon---font-size-xs);
	}

	.origam-media-volume-control--size-small {
		--origam-media-volume-control__btn---size: var(--origam-media-volume-control__btn---size-sm);
		--origam-media-volume-control__icon---font-size: var(--origam-media-volume-control__icon---font-size-sm);
	}

	.origam-media-volume-control--size-default {
		--origam-media-volume-control__btn---size: var(--origam-media-volume-control__btn---size-md);
		--origam-media-volume-control__icon---font-size: var(--origam-media-volume-control__icon---font-size-md);
	}

	.origam-media-volume-control--size-large {
		--origam-media-volume-control__btn---size: var(--origam-media-volume-control__btn---size-lg);
		--origam-media-volume-control__icon---font-size: var(--origam-media-volume-control__icon---font-size-lg);
	}

	.origam-media-volume-control--size-x-large {
		--origam-media-volume-control__btn---size: var(--origam-media-volume-control__btn---size-xl);
		--origam-media-volume-control__icon---font-size: var(--origam-media-volume-control__icon---font-size-xl);
	}

	.origam-media-volume-control--density-comfortable {
		--origam-media-volume-control---density: var(--origam-media-volume-control--comfortable---density);
	}

	.origam-media-volume-control--density-default {
		--origam-media-volume-control---density: var(--origam-media-volume-control--default---density);
	}

	.origam-media-volume-control--density-compact {
		--origam-media-volume-control---density: var(--origam-media-volume-control--compact---density);
	}

	:deep(.origam-media-volume-control__tooltip) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--origam-media-volume-control__tooltip---padding);
		color: var(--origam-media-volume-control__tooltip---color);
		background-color: var(--origam-media-volume-control__tooltip---background-color);
	}

	.origam-media-volume-control__wrapper {
		width: var(--origam-media-volume-control__wrapper---width);
		height: var(--origam-media-volume-control__wrapper---height);
		display: flex;
		align-items: stretch;
		justify-content: center;
	}

	.origam-media-volume-control__scrubber {
		--origam-media-scrubber---color: currentColor;
		--origam-media-scrubber---track-background-color: var(--origam-media-volume-control__scrubber---track-background-color);
		--origam-media-scrubber---track-size: var(--origam-media-volume-control__scrubber---track-size);
		--origam-media-scrubber---track-size-active: var(--origam-media-volume-control__scrubber---track-size);
		--origam-media-scrubber---thumb-diameter: var(--origam-media-volume-control__scrubber---thumb-diameter);
	}
</style>
