<template>
	<Story
			group="components"
			title="Audio/OrigamAudio"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IAudioProps>>({
					src: SOUND_HELIX_TRACK,
					title: 'Daydream',
					artist: 'Origam DS Cast',
					album: 'Season 3',
					cover: PICSUM_COVER,
					variant: 'expanded',
					coverPosition: 'left',
					waveform: true,
					width: undefined,
					height: undefined,
					padding: undefined,
					margin: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-audio
							:src="state.src"
							:title="state.title || undefined"
							:artist="state.artist || undefined"
							:album="state.album || undefined"
							:cover="state.cover || undefined"
							:variant="state.variant"
							:cover-position="state.coverPosition"
							:color="state.color || undefined"
							:bg-color="state.bgColor || undefined"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:width="state.width"
							:height="state.height"
							:padding="state.padding"
							:margin="state.margin"
							:waveform="state.waveform"
							:waveform-color="state.waveformColor || undefined"
							:font-size="state.fontSize || undefined"
							:font-weight="state.fontWeight || undefined"
							:line-height="state.lineHeight || undefined"
							class="story-audio"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant"       title="Variant"        :options="AUDIO_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.coverPosition" title="Cover Position" :options="COVER_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Waveform">
					<HstCheckbox v-model="state.waveform"      title="Waveform"/>
					<HstText     v-model="state.waveformColor" title="Waveform Color"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IAudioProps>>({
					src: SOUND_HELIX_TRACK,
					title: 'Daydream',
					artist: 'Origam DS Cast',
					album: 'Season 3',
					cover: PICSUM_COVER,
					controls: 'custom',
					preload: 'metadata',
					playbackRate: 1,
					loopMode: 'none',
					autoplay: false,
					muted: false,
					loop: false,
					shuffle: false,
					downloadable: false,
					allowRemotePlayback: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-audio
							:src="state.src"
							:title="state.title || undefined"
							:artist="state.artist || undefined"
							:album="state.album || undefined"
							:cover="state.cover || undefined"
							:controls="state.controls"
							:preload="state.preload"
							:playback-rate="state.playbackRate"
							:loop-mode="state.loopMode"
							:autoplay="state.autoplay"
							:muted="state.muted"
							:loop="state.loop"
							:shuffle="state.shuffle"
							:playlist="DEMO_PLAYLIST"
							:downloadable="state.downloadable"
							:download-filename="state.downloadFilename || undefined"
							:allow-remote-playback="state.allowRemotePlayback"
							:crossorigin="state.crossorigin || undefined"
							:tag="state.tag"
							class="story-audio"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Metadata">
					<HstText v-model="state.src"    title="Src"/>
					<HstText v-model="state.title"  title="Title"/>
					<HstText v-model="state.artist" title="Artist"/>
					<HstText v-model="state.album"  title="Album"/>
					<HstText v-model="state.cover"  title="Cover (URL)"/>
				</StoryGroup>
				<StoryGroup title="Playback">
					<HstSelect v-model="state.controls"     title="Controls"      :options="AUDIO_CONTROLS_OPTIONS"/>
					<HstSelect v-model="state.preload"      title="Preload"       :options="AUDIO_PRELOAD_OPTIONS"/>
					<HstSelect v-model="state.loopMode"     title="Loop Mode"     :options="AUDIO_LOOP_MODE_OPTIONS"/>
					<HstNumber v-model="state.playbackRate" title="Playback Rate" :min="0.25" :max="3" :step="0.25"/>
				</StoryGroup>
				<StoryGroup title="Flags">
					<HstCheckbox v-model="state.autoplay"            title="Autoplay"/>
					<HstCheckbox v-model="state.muted"               title="Muted"/>
					<HstCheckbox v-model="state.loop"                title="Loop (legacy)"/>
					<HstCheckbox v-model="state.shuffle"             title="Shuffle"/>
					<HstCheckbox v-model="state.downloadable"        title="Downloadable"/>
					<HstCheckbox v-model="state.allowRemotePlayback" title="Allow Remote Playback"/>
				</StoryGroup>
				<StoryGroup title="Download">
					<HstText v-model="state.downloadFilename" title="Download Filename"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstSelect v-model="state.tag"        title="Tag"        :options="TAG_OPTIONS"/>
					<HstText   v-model="state.crossorigin" title="Crossorigin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - play">
			<div class="story-shell">
				<origam-audio
						:src="SOUND_HELIX_TRACK"
						title="Daydream"
						artist="Origam DS Cast"
						class="story-audio"
						@play="logEvent('play', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - pause">
			<div class="story-shell">
				<origam-audio
						:src="SOUND_HELIX_TRACK"
						title="Daydream"
						artist="Origam DS Cast"
						class="story-audio"
						@pause="logEvent('pause', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - ended">
			<div class="story-shell">
				<origam-audio
						:src="SOUND_HELIX_TRACK"
						title="Daydream"
						artist="Origam DS Cast"
						class="story-audio"
						@ended="logEvent('ended', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - timeupdate">
			<div class="story-shell">
				<origam-audio
						:src="SOUND_HELIX_TRACK"
						title="Daydream"
						artist="Origam DS Cast"
						class="story-audio"
						@timeupdate="logEvent('timeupdate', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - volumechange">
			<div class="story-shell">
				<origam-audio
						:src="SOUND_HELIX_TRACK"
						title="Daydream"
						artist="Origam DS Cast"
						class="story-audio"
						@volumechange="logEvent('volumechange', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - download">
			<div class="story-shell">
				<origam-audio
						:src="SAMPLELIB_MP3"
						:downloadable="true"
						download-filename="sample-3s.mp3"
						title="Downloadable Track"
						artist="SampleLib"
						class="story-audio"
						@download="logEvent('download', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - track-change">
			<div class="story-shell">
				<origam-audio
						:playlist="DEMO_PLAYLIST"
						class="story-audio"
						@track-change="(track, idx) => logEvent('track-change', `${idx} · ${track.title}`)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:loopMode">
			<div class="story-shell">
				<origam-audio
						:src="SOUND_HELIX_TRACK"
						title="Daydream"
						artist="Origam DS Cast"
						class="story-audio"
						@update:loop-mode="logEvent('update:loopMode', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:shuffle">
			<div class="story-shell">
				<origam-audio
						:playlist="DEMO_PLAYLIST"
						class="story-audio"
						@update:shuffle="logEvent('update:shuffle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - metadata">
			<div class="story-shell">
				<origam-audio :src="SOUND_HELIX_TRACK" class="story-audio">
					<template #metadata>
						<div class="story-slot-badge">Custom metadata slot</div>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant title="Slots - cover">
			<div class="story-shell">
				<origam-audio :src="SOUND_HELIX_TRACK" title="Custom Cover" class="story-audio">
					<template #cover>
						<div class="story-slot-cover">🎵</div>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant title="Slots - title">
			<div class="story-shell">
				<origam-audio :src="SOUND_HELIX_TRACK" artist="Origam DS Cast" class="story-audio">
					<template #title>
						<strong>Custom Title Slot</strong>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant title="Slots - waveform">
			<div class="story-shell">
				<origam-audio :src="SOUND_HELIX_TRACK" title="Daydream" :waveform="true" class="story-audio">
					<template #waveform="{ peaks, currentTime, duration }">
						<div class="story-slot-waveform">
							Custom waveform — {{ peaks.length }} peaks, {{ currentTime.toFixed(1) }}s / {{ duration.toFixed(1) }}s
						</div>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant title="Slots - controls">
			<div class="story-shell">
				<origam-audio :src="SOUND_HELIX_TRACK" title="Custom Controls" class="story-audio">
					<template #controls="{ playing, methods }">
						<div class="story-slot-controls">
							<button type="button" @click="playing ? methods.pause() : methods.play()">
								{{ playing ? 'Pause' : 'Play' }}
							</button>
						</div>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant title="Slots - loading">
			<div class="story-shell">
				<origam-audio :src="SOUND_HELIX_TRACK" title="Loading state" class="story-audio">
					<template #loading>
						<div class="story-slot-badge">Loading…</div>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant title="Slots - error">
			<div class="story-shell">
				<origam-audio src="invalid://bad-url" title="Error state" class="story-audio">
					<template #error="{ error }">
						<div class="story-slot-badge">Error: {{ error.message }}</div>
					</template>
				</origam-audio>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IAudioProps>({
					src: SOUND_HELIX_TRACK,
					title: 'Daydream',
					artist: 'Origam DS Cast',
					album: 'Season 3',
					cover: PICSUM_COVER,
					variant: 'expanded',
					coverPosition: 'left',
					controls: 'custom',
					preload: 'metadata',
					playbackRate: 1,
					loopMode: 'none',
					waveform: true,
					autoplay: false,
					muted: false,
					loop: false,
					shuffle: false,
					downloadable: false,
					allowRemotePlayback: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-audio
							v-bind="state"
							class="story-audio"
							@play="logEvent('play', $event)"
							@pause="logEvent('pause', $event)"
							@ended="logEvent('ended', $event)"
							@download="logEvent('download', $event)"
							@track-change="(track, idx) => logEvent('track-change', `${idx} · ${track.title}`)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.src"    title="Src"/>
					<HstText v-model="state.title"  title="Title"/>
					<HstText v-model="state.artist" title="Artist"/>
					<HstText v-model="state.album"  title="Album"/>
					<HstText v-model="state.cover"  title="Cover (URL)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"       title="Variant"        :options="AUDIO_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.coverPosition" title="Cover Position" :options="COVER_POSITION_OPTIONS"/>
					<HstSelect v-model="state.color"         title="Color"          :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"       title="Bg Color"       :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"       title="Rounded"        :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"     title="Elevation"      :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.waveform"    title="Waveform"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.controls"          title="Controls"       :options="AUDIO_CONTROLS_OPTIONS"/>
					<HstSelect   v-model="state.preload"           title="Preload"        :options="AUDIO_PRELOAD_OPTIONS"/>
					<HstSelect   v-model="state.loopMode"          title="Loop Mode"      :options="AUDIO_LOOP_MODE_OPTIONS"/>
					<HstNumber   v-model="state.playbackRate"      title="Playback Rate"  :min="0.25" :max="3" :step="0.25"/>
					<HstCheckbox v-model="state.autoplay"          title="Autoplay"/>
					<HstCheckbox v-model="state.muted"             title="Muted"/>
					<HstCheckbox v-model="state.shuffle"           title="Shuffle"/>
					<HstCheckbox v-model="state.downloadable"      title="Downloadable"/>
					<HstCheckbox v-model="state.allowRemotePlayback" title="Allow Remote Playback"/>
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

	import { OrigamAudio } from '@origam/components'
	import { AUDIO_LOOP_MODE, AUDIO_VARIANT, COVER_POSITION } from '@origam/enums'
	import type { IAudioProps, IAudioTrack } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const SOUND_HELIX_TRACK = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
	const SAMPLELIB_MP3 = 'https://samplelib.com/mp3/sample-3s.mp3'
	const PICSUM_COVER = 'https://picsum.photos/seed/origam-audio/256/256'

	const DEMO_PLAYLIST: ReadonlyArray<IAudioTrack> = [
		{
			id: 'sh-1',
			src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
			title: 'Daydream',
			artist: 'SoundHelix',
			album: 'Examples',
			cover: 'https://picsum.photos/seed/audio-1/96',
			duration: 372
		},
		{
			id: 'sh-2',
			src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
			title: 'Liftoff',
			artist: 'SoundHelix',
			album: 'Examples',
			cover: 'https://picsum.photos/seed/audio-2/96',
			duration: 422
		},
		{
			id: 'sh-3',
			src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
			title: 'Submerged',
			artist: 'SoundHelix',
			album: 'Examples',
			cover: 'https://picsum.photos/seed/audio-3/96',
			duration: 366
		},
		{
			id: 'sh-4',
			src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
			title: 'Pixel Drift',
			artist: 'SoundHelix',
			album: 'Examples',
			cover: 'https://picsum.photos/seed/audio-4/96',
			duration: 313
		}
	]

	const AUDIO_VARIANT_OPTIONS = [
		{ label: 'Expanded', value: AUDIO_VARIANT.EXPANDED },
		{ label: 'Compact', value: AUDIO_VARIANT.COMPACT }
	]

	const COVER_POSITION_OPTIONS = [
		{ label: 'Left', value: COVER_POSITION.LEFT },
		{ label: 'Right', value: COVER_POSITION.RIGHT }
	]

	const AUDIO_CONTROLS_OPTIONS = [
		{ label: 'Custom', value: 'custom' },
		{ label: 'Native', value: 'native' }
	]

	const AUDIO_PRELOAD_OPTIONS = [
		{ label: 'None', value: 'none' },
		{ label: 'Metadata', value: 'metadata' },
		{ label: 'Auto', value: 'auto' }
	]

	const AUDIO_LOOP_MODE_OPTIONS = [
		{ label: 'None', value: AUDIO_LOOP_MODE.NONE },
		{ label: 'All', value: AUDIO_LOOP_MODE.ALL },
		{ label: 'One', value: AUDIO_LOOP_MODE.ONE }
	]
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		max-width: 720px;
	}

	.story-audio {
		width: 100%;
		max-width: 640px;
	}

	.story-slot-badge {
		padding: 8px 12px;
		background-color: var(--origam-color__surface---raised, #f3f4f6);
		border-radius: 6px;
		font: 0.875rem/1.4 system-ui, sans-serif;
	}

	.story-slot-cover {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96px;
		height: 96px;
		background-color: var(--origam-color__surface---raised, #f3f4f6);
		border-radius: 8px;
		font-size: 2rem;
	}

	.story-slot-waveform {
		padding: 8px 12px;
		background-color: var(--origam-color__surface---raised, #f3f4f6);
		border-radius: 6px;
		font: 0.75rem/1.4 ui-monospace, monospace;
	}

	.story-slot-controls {
		display: flex;
		gap: 8px;
		padding: 8px;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Audio/OrigamAudio.md"
/>
