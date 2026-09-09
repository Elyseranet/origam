<template>
	<Story
			group="components"
			title="MediaVolumeControl/OrigamMediaVolumeControl"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IMediaVolumeControlProps>>({ color: undefined, size: undefined, density: undefined, rounded: undefined, roundedTopLeft: undefined, roundedTopRight: undefined, roundedBottomLeft: undefined, roundedBottomRight: undefined })"
		>
			<template #default="{ state }">
				<div class="story-surface">
					<origam-media-volume-control
							:volume="0.7"
							:muted="false"
							:color="state.color"
							:size="state.size"
							:density="state.density"
							:rounded="state.rounded"
							:rounded-top-left="state.roundedTopLeft"
							:rounded-top-right="state.roundedTopRight"
							:rounded-bottom-left="state.roundedBottomLeft"
							:rounded-bottom-right="state.roundedBottomRight"
							mute-label="Mute"
							unmute-label="Unmute"
							volume-label="Volume"
							data-cy="mvc-design"
					/>
					<p class="story-hint">Hover the button to open the vertical volume scrubber.</p>

					<p class="story-hint">
						Reference matrix — fixed props, no control. Each row is what the
						controls above produce, side by side.
					</p>

					<ul class="story-matrix">
						<li
								v-for="item in SIZE_MATRIX"
								:key="item.dataCy"
								class="story-matrix__item"
						>
							<origam-media-volume-control
									:volume="0.7"
									:muted="false"
									:size="item.size"
									mute-label="Mute"
									unmute-label="Unmute"
									volume-label="Volume"
									:data-cy="item.dataCy"
							/>
							<span class="story-matrix__label">size {{ item.size }}</span>
						</li>
					</ul>

					<ul class="story-matrix">
						<li
								v-for="item in DENSITY_MATRIX"
								:key="item.dataCy"
								class="story-matrix__item"
						>
							<origam-media-volume-control
									:volume="0.7"
									:muted="false"
									:density="item.density"
									mute-label="Mute"
									unmute-label="Unmute"
									volume-label="Volume"
									:data-cy="item.dataCy"
							/>
							<span class="story-matrix__label">density {{ item.density }}</span>
						</li>
					</ul>

					<ul class="story-matrix">
						<li
								v-for="item in ROUNDED_MATRIX"
								:key="item.dataCy"
								class="story-matrix__item"
						>
							<origam-media-volume-control
									:volume="0.7"
									:muted="false"
									:rounded="item.rounded"
									mute-label="Mute"
									unmute-label="Unmute"
									volume-label="Volume"
									:data-cy="item.dataCy"
							/>
							<span class="story-matrix__label">rounded {{ item.label }}</span>
						</li>
					</ul>

					<ul class="story-matrix">
						<li
								v-for="item in COLOR_MATRIX"
								:key="item.dataCy"
								class="story-matrix__item"
						>
							<origam-media-volume-control
									:volume="0.7"
									:muted="false"
									:color="item.color"
									mute-label="Mute"
									unmute-label="Unmute"
									volume-label="Volume"
									:data-cy="item.dataCy"
							/>
							<span class="story-matrix__label">color {{ item.color }}</span>
						</li>
					</ul>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect
							v-model="state.color"
							title="Color"
							:options="COLOR_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect
							v-model="state.size"
							title="Size"
							:options="SIZE_OPTIONS"
					/>
					<HstSelect
							v-model="state.density"
							title="Density"
							:options="DENSITY_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect
							v-model="state.rounded"
							title="Rounded"
							:options="ROUNDED_OPTIONS"
					/>
					<HstText
							v-model="state.roundedTopLeft"
							title="Rounded Top Left"
					/>
					<HstText
							v-model="state.roundedTopRight"
							title="Rounded Top Right"
					/>
					<HstText
							v-model="state.roundedBottomLeft"
							title="Rounded Bottom Left"
					/>
					<HstText
							v-model="state.roundedBottomRight"
							title="Rounded Bottom Right"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IMediaVolumeControlProps>>({ volume: 0.7, muted: false, muteLabel: 'Mute', unmuteLabel: 'Unmute', volumeLabel: 'Volume', dataCy: 'mvc-functional' })"
		>
			<template #default="{ state }">
				<div class="story-surface">
					<origam-media-volume-control
							:volume="state.volume"
							:muted="state.muted"
							:mute-label="state.muteLabel"
							:unmute-label="state.unmuteLabel"
							:volume-label="state.volumeLabel"
							:data-cy="state.dataCy"
					/>
					<p class="story-hint">
						icon rung — 0 / muted → off, &lt; 0.34 → low, &lt; 0.67 → medium, else high
					</p>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Value">
					<HstNumber
							v-model="state.volume"
							title="Volume (0 → 1)"
							:step="0.05"
					/>
					<HstCheckbox
							v-model="state.muted"
							title="Muted"
					/>
				</StoryGroup>
				<StoryGroup title="Accessible names">
					<HstText
							v-model="state.muteLabel"
							title="Mute Label"
					/>
					<HstText
							v-model="state.unmuteLabel"
							title="Unmute Label"
					/>
					<HstText
							v-model="state.volumeLabel"
							title="Volume Label"
					/>
				</StoryGroup>
				<StoryGroup title="Testing">
					<HstText
							v-model="state.dataCy"
							title="Data Cy"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:muted">
			<div class="story-surface">
				<origam-media-volume-control
						:volume="mutedEventVolume"
						:muted="mutedEventMuted"
						mute-label="Mute"
						unmute-label="Unmute"
						volume-label="Volume"
						data-cy="mvc-events-muted"
						@update:muted="onMutedEvent"
				/>
				<p class="story-status">muted = <strong>{{ mutedEventMuted }}</strong></p>
			</div>
		</Variant>

		<Variant title="Events - update:volume">
			<div class="story-surface">
				<origam-media-volume-control
						:volume="volumeEventValue"
						:muted="false"
						mute-label="Mute"
						unmute-label="Unmute"
						volume-label="Volume"
						data-cy="mvc-events-volume"
						@update:volume="onVolumeEvent"
				/>
				<p class="story-status">volume = <strong>{{ volumeEventValue }}</strong></p>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IMediaVolumeControlProps>({ volume: 0.7, muted: false, muteLabel: 'Mute', unmuteLabel: 'Unmute', volumeLabel: 'Volume', dataCy: 'origam-media-volume-control' })"
		>
			<template #default="{ state }">
				<div class="story-surface">
					<origam-media-volume-control v-bind="state"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstNumber
							v-model="state.volume"
							title="Volume (0 → 1)"
							:step="0.05"
					/>
					<HstCheckbox
							v-model="state.muted"
							title="Muted"
					/>
					<HstText
							v-model="state.muteLabel"
							title="Mute Label"
					/>
					<HstText
							v-model="state.unmuteLabel"
							title="Unmute Label"
					/>
					<HstText
							v-model="state.volumeLabel"
							title="Volume Label"
					/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect
							v-model="state.color"
							title="Color"
							:options="COLOR_OPTIONS"
					/>
					<HstSelect
							v-model="state.size"
							title="Size"
							:options="SIZE_OPTIONS"
					/>
					<HstSelect
							v-model="state.density"
							title="Density"
							:options="DENSITY_OPTIONS"
					/>
					<HstSelect
							v-model="state.rounded"
							title="Rounded"
							:options="ROUNDED_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText
							v-model="state.dataCy"
							title="Data Cy"
					/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { logEvent } from 'histoire/client'
	import { ref } from 'vue'

	import { OrigamMediaVolumeControl } from '@origam/components'
	import { DENSITY, INTENT, ROUNDED, ROUNDED_TOKEN, SIZES } from '@origam/enums'
	import type { IMediaVolumeControlProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	/*
	 * Reference matrix — every entry is a REAL enum member, never a literal
	 * invented for the story. The e2e spec measures these instances rather
	 * than mutating classes in the DOM: a prop driven by Vue is the only
	 * thing that proves the prop itself is alive.
	 */
	const SIZE_MATRIX = [ SIZES.X_SMALL, SIZES.SMALL, SIZES.DEFAULT, SIZES.LARGE, SIZES.X_LARGE ]
		.map((size) => ({ size, dataCy: `mvc-size-${size}` }))

	const DENSITY_MATRIX = [ DENSITY.DEFAULT, DENSITY.COMPACT, DENSITY.COMFORTABLE ]
		.map((density) => ({ density, dataCy: `mvc-density-${density}` }))

	const ROUNDED_MATRIX = [
		{ rounded: ROUNDED_TOKEN.NONE, label: ROUNDED_TOKEN.NONE, dataCy: 'mvc-rounded-none' },
		{ rounded: ROUNDED_TOKEN.SM, label: ROUNDED_TOKEN.SM, dataCy: 'mvc-rounded-sm' },
		{ rounded: ROUNDED_TOKEN.FULL, label: ROUNDED_TOKEN.FULL, dataCy: 'mvc-rounded-full' },
		{ rounded: ROUNDED.LARGE, label: ROUNDED.LARGE, dataCy: 'mvc-rounded-large' }
	]

	const COLOR_MATRIX = [ INTENT.PRIMARY, INTENT.DANGER, INTENT.SUCCESS ]
		.map((color) => ({ color, dataCy: `mvc-color-${color}` }))

	const mutedEventMuted = ref<boolean>(false)
	const mutedEventVolume = ref<number>(0.7)

	const volumeEventValue = ref<number>(0.7)

	function onMutedEvent (muted: boolean): void {
		mutedEventMuted.value = muted
		logEvent('update:muted', muted)
	}

	function onVolumeEvent (volume: number): void {
		volumeEventValue.value = volume
		logEvent('update:volume', volume)
	}
</script>

<style scoped>
	.story-surface {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: 48px 16px 16px;
	}

	.story-matrix {
		display: flex;
		align-items: flex-end;
		gap: 20px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.story-matrix__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.story-matrix__label {
		font-size: 11px;
		opacity: 0.6;
	}

	.story-hint,
	.story-status {
		margin: 0;
		font-size: 12px;
		opacity: 0.7;
	}
</style>

<docs lang="md" src="@docs/components/Media/OrigamMediaVolumeControl.md"/>
