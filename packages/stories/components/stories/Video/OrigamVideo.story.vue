<template>
	<Story
			group="components"
			title="Video/OrigamVideo"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IVideoProps>>({
					src: BIG_BUCK_BUNNY,
					poster: BUNNY_POSTER,
					aspectRatio: '16/9',
					inset: true,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					color: undefined,
					bgColor: undefined,
					width: undefined,
					height: undefined,
					fontSize: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-video
							:src="state.src"
							:padding="state.padding"
							:margin="state.margin"
							:poster="state.poster"
							:aspect-ratio="state.aspectRatio"
							:inset="state.inset"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:color="state.color"
							:bg-color="state.bgColor"
							:width="state.width"
							:height="state.height"
							:font-size="state.fontSize || undefined"
							class="story-video"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstSelect v-model="state.aspectRatio" title="Aspect Ratio" :options="ASPECT_RATIO_OPTIONS"/>
					<HstCheckbox v-model="state.inset"     title="Inset (toolbar overlay)"/>
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
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
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
					<HstSelect v-model="state.fontSize" title="Font Size (state overlays)" :options="FONT_SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IVideoProps>>({
					src: BIG_BUCK_BUNNY,
					poster: BUNNY_POSTER,
					controls: 'custom',
					preload: 'metadata',
					crossorigin: undefined,
					autoplay: false,
					muted: false,
					loop: false,
					playsInline: true,
					showCenterControls: true,
					disablePictureInPicture: false,
					allowRemotePlayback: true,
					doubleTapToSkip: true,
					skipSeconds: 30,
					playbackRate: 1,
					downloadable: false,
					downloadFilename: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-video
							:src="state.src"
							:poster="state.poster"
							:controls="state.controls"
							:preload="state.preload"
							:crossorigin="state.crossorigin || undefined"
							:autoplay="state.autoplay"
							:muted="state.muted"
							:loop="state.loop"
							:plays-inline="state.playsInline"
							:show-center-controls="state.showCenterControls"
							:disable-picture-in-picture="state.disablePictureInPicture"
							:allow-remote-playback="state.allowRemotePlayback"
							:double-tap-to-skip="state.doubleTapToSkip"
							:skip-seconds="state.skipSeconds"
							:playback-rate="state.playbackRate"
							:downloadable="state.downloadable"
							:download-filename="state.downloadFilename || undefined"
							class="story-video"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Media Source">
					<HstText v-model="state.src"    title="Src (URL)"/>
					<HstText v-model="state.poster" title="Poster (URL)"/>
				</StoryGroup>
				<StoryGroup title="Controls">
					<HstSelect v-model="state.controls" title="Controls" :options="CONTROLS_OPTIONS"/>
					<HstCheckbox v-model="state.showCenterControls" title="Show Center Controls"/>
				</StoryGroup>
				<StoryGroup title="Buffering">
					<HstSelect v-model="state.preload"     title="Preload"     :options="PRELOAD_OPTIONS"/>
					<HstSelect v-model="state.crossorigin" title="Cross Origin" :options="CROSSORIGIN_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Playback Flags">
					<HstCheckbox v-model="state.autoplay"    title="Autoplay"/>
					<HstCheckbox v-model="state.muted"       title="Muted"/>
					<HstCheckbox v-model="state.loop"        title="Loop"/>
					<HstCheckbox v-model="state.playsInline" title="Plays Inline"/>
				</StoryGroup>
				<StoryGroup title="Skip / Speed">
					<HstNumber v-model="state.skipSeconds"   title="Skip Seconds" :min="0" :max="60" :step="5"/>
					<HstNumber v-model="state.playbackRate"  title="Playback Rate" :min="0.25" :max="4" :step="0.25"/>
				</StoryGroup>
				<StoryGroup title="Features">
					<HstCheckbox v-model="state.doubleTapToSkip"        title="Double Tap to Skip"/>
					<HstCheckbox v-model="state.allowRemotePlayback"    title="Allow Remote Playback"/>
					<HstCheckbox v-model="state.disablePictureInPicture" title="Disable Picture-in-Picture"/>
				</StoryGroup>
				<StoryGroup title="Download">
					<HstCheckbox v-model="state.downloadable"     title="Downloadable"/>
					<HstText     v-model="state.downloadFilename" title="Download Filename"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - play / pause / ended">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@play="logEvent('play', $event)"
						@pause="logEvent('pause', $event)"
						@ended="logEvent('ended', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - timeupdate">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@timeupdate="logEvent('timeupdate', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - volumechange">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@volumechange="logEvent('volumechange', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - loadedmetadata">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@loadedmetadata="logEvent('loadedmetadata', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - skip">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@skip="logEvent('skip', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:playbackRate">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@update:playback-rate="logEvent('update:playbackRate', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - quality-change">
			<div class="story-shell">
				<origam-video
						:src="QUALITY_SOURCES"
						:poster="BUNNY_POSTER"
						class="story-video"
						@quality-change="logEvent('quality-change', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - download">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						:downloadable="true"
						class="story-video"
						@download="logEvent('download', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - enterfullscreen / exitfullscreen">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@enterfullscreen="logEvent('enterfullscreen', null)"
						@exitfullscreen="logEvent('exitfullscreen', null)"
				/>
			</div>
		</Variant>

		<Variant title="Events - enterpip / exitpip">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
						@enterpip="logEvent('enterpip', null)"
						@exitpip="logEvent('exitpip', null)"
				/>
			</div>
		</Variant>

		<Variant title="Events - error">
			<div class="story-shell">
				<origam-video
						src="https://invalid.example.com/missing-video.mp4"
						:poster="BUNNY_POSTER"
						class="story-video"
						@error="logEvent('error', ($event as Error).message || 'media error')"
				/>
			</div>
		</Variant>

		<Variant title="Prop — tracks (captions)">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						:tracks="CAPTION_TRACKS"
						class="story-video"
				/>
				<p class="story-hint">Open the settings-adjacent captions button in the toolbar to toggle the English track declared below.</p>
			</div>
		</Variant>

		<Variant title="Slots - Controls">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
				>
					<template #controls="{ playing, currentTime, duration, methods }">
						<div class="story-custom-controls">
							<button
									type="button"
									class="story-custom-controls__btn"
									:aria-label="playing ? 'Pause' : 'Play'"
									@click="playing ? methods.pause() : methods.play()"
							>{{ playing ? 'Pause' : 'Play' }}</button>
							<span class="story-custom-controls__time">
								{{ formatTimestamp(currentTime) }} / {{ formatTimestamp(duration) }}
							</span>
						</div>
					</template>
				</origam-video>
			</div>
		</Variant>

		<Variant title="Slots - Poster">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
				>
					<template #poster>
						<div class="story-custom-poster">
							<span class="story-custom-poster__label">Click to watch</span>
						</div>
					</template>
				</origam-video>
			</div>
		</Variant>

		<Variant title="Slots - Loading">
			<div class="story-shell">
				<origam-video
						:src="BIG_BUCK_BUNNY"
						:poster="BUNNY_POSTER"
						class="story-video"
				>
					<template #loading>
						<div class="story-custom-loading">
							<span class="story-custom-loading__label">Decoding…</span>
						</div>
					</template>
				</origam-video>
			</div>
		</Variant>

		<Variant title="Slots - Error">
			<div class="story-shell">
				<origam-video
						src="https://invalid.example.com/missing-video.mp4"
						:poster="BUNNY_POSTER"
						class="story-video"
				>
					<template #error="{ error }">
						<div class="story-custom-error">
							<strong>Cannot play this video</strong>
							<small>{{ (error as Error).message || 'Unknown media error' }}</small>
						</div>
					</template>
				</origam-video>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IVideoProps>({
					src: BIG_BUCK_BUNNY,
					poster: BUNNY_POSTER,
					controls: 'custom',
					aspectRatio: '16/9',
					inset: true,
					autoplay: false,
					muted: false,
					loop: false,
					playsInline: true,
					preload: 'metadata',
					showCenterControls: true,
					skipSeconds: 30,
					playbackRate: 1,
					disablePictureInPicture: false,
					allowRemotePlayback: true,
					doubleTapToSkip: true,
					downloadable: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-video
							v-bind="state"
							class="story-video"
							@play="logEvent('play', $event)"
							@pause="logEvent('pause', $event)"
							@ended="logEvent('ended', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.src"    title="Src (URL)"/>
					<HstText v-model="state.poster" title="Poster (URL)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.aspectRatio" title="Aspect Ratio" :options="ASPECT_RATIO_OPTIONS"/>
					<HstCheckbox v-model="state.inset"       title="Inset"/>
					<HstSelect   v-model="state.rounded"     title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"   title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.color"       title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"     title="Bg Color"  :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.controls"              title="Controls"           :options="CONTROLS_OPTIONS"/>
					<HstSelect   v-model="state.preload"               title="Preload"            :options="PRELOAD_OPTIONS"/>
					<HstCheckbox v-model="state.autoplay"              title="Autoplay"/>
					<HstCheckbox v-model="state.muted"                 title="Muted"/>
					<HstCheckbox v-model="state.loop"                  title="Loop"/>
					<HstCheckbox v-model="state.showCenterControls"    title="Show Center Controls"/>
					<HstCheckbox v-model="state.downloadable"          title="Downloadable"/>
					<HstCheckbox v-model="state.doubleTapToSkip"       title="Double Tap to Skip"/>
					<HstCheckbox v-model="state.disablePictureInPicture" title="Disable PiP"/>
					<HstCheckbox v-model="state.allowRemotePlayback"   title="Allow Remote Playback"/>
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

	import { OrigamVideo } from '@origam/components'
	import type {
		IVideoProps,
		IVideoSource,
		IVideoTrack
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const BIG_BUCK_BUNNY = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm'
	const BUNNY_POSTER = 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg'

	const ENGLISH_VTT = `data:text/vtt,${encodeURIComponent('WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello captions.\n')}`

	const CAPTION_TRACKS: Array<IVideoTrack> = [
		{ kind: 'captions', src: ENGLISH_VTT, srclang: 'en', label: 'English', default: true }
	]

	const QUALITY_SOURCES: Array<IVideoSource> = [
		{ src: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4', type: 'video/mp4', quality: '180p', label: '180p (SD)' },
		{ src: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_640x360.mp4', type: 'video/mp4', quality: '360p', label: '360p' }
	]

	const CONTROLS_OPTIONS = [
		{ value: 'custom', label: 'custom' },
		{ value: 'native', label: 'native' },
		{ value: 'none', label: 'none' }
	]

	const ASPECT_RATIO_OPTIONS = [
		{ value: '16/9', label: '16/9' },
		{ value: '4/3', label: '4/3' },
		{ value: '1/1', label: '1/1' },
		{ value: '21/9', label: '21/9' },
		{ value: '9/16', label: '9/16' }
	]

	const PRELOAD_OPTIONS = [
		{ value: 'metadata', label: 'metadata' },
		{ value: 'none', label: 'none' },
		{ value: 'auto', label: 'auto' }
	]

	const CROSSORIGIN_OPTIONS = [
		{ value: undefined, label: '(none)' },
		{ value: 'anonymous', label: 'anonymous' },
		{ value: 'use-credentials', label: 'use-credentials' }
	]

	function formatTimestamp (seconds: number): string {
		if (!Number.isFinite(seconds) || seconds < 0) return '--:--'
		const total = Math.floor(seconds)
		const m = Math.floor(total / 60)
		const s = total % 60

		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
	}
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		max-width: 960px;
	}

	.story-video {
		width: 100%;
		max-width: 720px;
		border-radius: 8px;
		overflow: hidden;
	}

	.story-custom-controls {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.7);
		color: #ffffff;
		font: 0.875rem/1.2 system-ui, sans-serif;
	}

	.story-custom-controls__btn {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		border: 0;
		padding: 4px 12px;
		border-radius: 4px;
		cursor: pointer;
		font: inherit;
	}

	.story-custom-controls__time {
		font-family: ui-monospace, monospace;
	}

	.story-custom-poster {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at center, rgba(139, 92, 246, 0.4), rgba(0, 0, 0, 0.9));
		color: #ffffff;
		cursor: pointer;
	}

	.story-custom-poster__label {
		font: 600 1rem/1.2 system-ui, sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.story-custom-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.6);
		color: #ffffff;
		border-radius: 8px;
		font: 0.875rem/1.2 system-ui, sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.story-custom-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 16px;
		background: rgba(127, 29, 29, 0.85);
		color: #ffffff;
		border-radius: 8px;
		font: 0.875rem/1.3 system-ui, sans-serif;
	}

	.story-custom-error small {
		opacity: 0.85;
	}

	.story-hint {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--origam-color__text---secondary);
	}
</style>

<docs lang="md" src="@docs/components/Video/OrigamVideo.md"/>
