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
					type="button"
					class="origam-media-volume-control__btn"
					:class="rootClasses"
					:style="rootStyle"
					:aria-label="muted ? unmuteLabel : muteLabel"
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
	import { computed, type CSSProperties } from 'vue'

	import { OrigamIcon } from '../Icon'
	import { OrigamTooltip } from '../Tooltip'

	import OrigamMediaScrubber from './OrigamMediaScrubber.vue'

	import { MDI_ICONS } from '../../enums'

	import type {
		IMediaVolumeControlEmits,
		IMediaVolumeControlProps
	} from '../../interfaces'

	const props = withDefaults(defineProps<IMediaVolumeControlProps>(), {
		dataCy: 'origam-media-volume-control'
	})

	const emit = defineEmits<IMediaVolumeControlEmits>()

	const ICONS = {
		VOLUME_HIGH: MDI_ICONS.VOLUME_HIGH,
		VOLUME_MEDIUM: MDI_ICONS.VOLUME_MEDIUM,
		VOLUME_LOW: MDI_ICONS.VOLUME_LOW,
		VOLUME_OFF: MDI_ICONS.VOLUME_OFF
	}

	const rootClasses = computed(() => [props.class])
	const rootStyle = computed<CSSProperties | string | undefined>(() => props.style as CSSProperties | string | undefined)

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
		width: var(--origam-media-volume-control---btn-size, 36px);
		height: var(--origam-media-volume-control---btn-size, 36px);
		border-radius: var(--origam-media-volume-control---btn-border-radius, 50%);
		cursor: pointer;
		color: var(--origam-media-volume-control---color, inherit);
		transition: background-color 120ms ease, transform 120ms ease, opacity 120ms ease;
		opacity: 0.95;
	}

	.origam-media-volume-control__btn:hover,
	.origam-media-volume-control__btn:focus-visible {
		opacity: 1;
		background-color: var(--origam-media-volume-control---hover-background-color, color-mix(in srgb, currentColor 12%, transparent));
	}

	.origam-media-volume-control__btn:active {
		transform: scale(0.92);
	}

	.origam-media-volume-control__btn .origam-icon {
		font-size: var(--origam-media-volume-control---icon-size, 20px);
		line-height: 1;
	}

	:deep(.origam-media-volume-control__tooltip) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px 8px;
		background-color: var(--origam-media-volume-control---tooltip-background-color, rgba(28, 28, 28, 0.92));
	}

	.origam-media-volume-control__wrapper {
		width: 14px;
		height: 80px;
		display: flex;
		align-items: stretch;
		justify-content: center;
	}

	.origam-media-volume-control__scrubber {
		--origam-media-scrubber---color: currentColor;
		--origam-media-scrubber---track-background-color: color-mix(in srgb, currentColor 30%, transparent);
		--origam-media-scrubber---track-size: 4px;
		--origam-media-scrubber---track-size-active: 4px;
		--origam-media-scrubber---thumb-diameter: 10px;
	}
</style>
