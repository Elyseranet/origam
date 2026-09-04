<template>
	<origam-responsive
			:id="id"
			class="origam-video"
			:class="rootClasses"
			:style="rootStyles"
			:aspect-ratio="effectiveAspectRatio"
			content-class="origam-video__inner"
			data-cy="origam-video"
			@mouseenter="onPlayerMouseEnter"
			@mouseleave="onPlayerMouseLeave"
	>
		<template #additional>
		<video
				ref="videoRef"
				class="origam-video__el"
				:src="singleSrc"
				:poster="poster"
				:autoplay="resolvedAutoplay"
				:muted="resolvedMuted"
				:loop="loop"
				:controls="controls === 'native'"
				:playsinline="playsInline"
				:preload="preload"
				:crossorigin="crossorigin"
				:disablepictureinpicture="disablePictureInPicture || undefined"
				data-cy="origam-video-el"
				@play="emit('play')"
				@pause="emit('pause')"
				@ended="emit('ended')"
				@timeupdate="onTimeUpdate"
				@volumechange="onVolumeChange"
				@loadedmetadata="onLoadedMetadata"
				@error="onErrorEvent"
				@enterpictureinpicture="emit('enterpip')"
				@leavepictureinpicture="emit('exitpip')"
				@pointerup="onVideoTap"
		>
			<source
					v-for="source in resolvedSources"
					:key="source.src"
					:src="source.src"
					:type="source.type"
			/>
			<track
					v-for="track in tracks"
					:key="`${track.kind}-${track.srclang}`"
					:kind="track.kind"
					:src="track.src"
					:srclang="track.srclang"
					:label="track.label || track.srclang.toUpperCase()"
					:default="track.default || undefined"
			/>
		</video>

		<transition name="origam-video-state-pulse">
			<div
					v-if="statePulse"
					:key="statePulse.id"
					class="origam-video__state-pulse"
					aria-hidden="true"
					data-cy="origam-video-state-pulse"
			>
				<origam-icon
						:icon="statePulse.kind === 'play' ? ICONS.PLAY : ICONS.PAUSE"
						class="origam-video__state-pulse-icon"
						aria-hidden="true"
				/>
			</div>
		</transition>

		<transition name="origam-video-skip-ripple">
			<div
					v-if="skipFeedback"
					:key="skipFeedback.id"
					class="origam-video__skip-ripple"
					:class="`origam-video__skip-ripple--${skipFeedback.side}`"
					aria-hidden="true"
					data-cy="origam-video-skip-ripple"
			>
				<div class="origam-video__skip-ripple-content">
					<div class="origam-video__skip-chevrons">
						<origam-icon
								:icon="skipFeedback.side === 'left' ? ICONS.CHEVRON_LEFT : ICONS.CHEVRON_RIGHT"
								class="origam-video__skip-chevron origam-video__skip-chevron--1"
								aria-hidden="true"
						/>
						<origam-icon
								:icon="skipFeedback.side === 'left' ? ICONS.CHEVRON_LEFT : ICONS.CHEVRON_RIGHT"
								class="origam-video__skip-chevron origam-video__skip-chevron--2"
								aria-hidden="true"
						/>
						<origam-icon
								:icon="skipFeedback.side === 'left' ? ICONS.CHEVRON_LEFT : ICONS.CHEVRON_RIGHT"
								class="origam-video__skip-chevron origam-video__skip-chevron--3"
								aria-hidden="true"
						/>
					</div>
					<span class="origam-video__skip-ripple-label">{{ t('origam.media.seconds', skipFeedback.seconds) }}</span>
				</div>
			</div>
		</transition>

		<div
				v-if="showPosterOverlay"
				class="origam-video__poster"
				data-cy="origam-video-poster"
				@click="methods.play()"
		>
			<slot name="poster">
				<img
						v-if="poster"
						class="origam-video__poster-img"
						:src="poster"
						alt=""
				/>
				<origam-btn
						:icon="ICONS.PLAY"
						class="origam-video__poster-btn"
						:aria-label="t('origam.media.play')"
						data-cy="origam-video-poster-btn"
						size="large"
						variant="elevated"
						@click.stop="methods.play()"
				/>
			</slot>
		</div>

		<div
				v-if="state.loading.value && !state.error.value"
				class="origam-video__loading"
				role="status"
				:aria-label="t('origam.loading')"
				data-cy="origam-video-loading"
				:style="typographyLoadingStyles"
		>
			<slot name="loading">
				<origam-icon
						:icon="ICONS.LOADING"
						class="origam-video__loading-icon"
						aria-hidden="true"
				/>
			</slot>
		</div>

		<div
				v-if="state.error.value"
				class="origam-video__error"
				role="alert"
				data-cy="origam-video-error"
				:style="typographyErrorStyles"
		>
			<slot
					name="error"
					:error="state.error.value"
			>
				<origam-icon
						:icon="ICONS.ALERT"
						class="origam-video__error-icon"
						aria-hidden="true"
				/>
				<span class="origam-video__error-msg">{{ errorMessage }}</span>
			</slot>
		</div>

		<slot
				v-if="controls === 'custom'"
				name="controls"
				v-bind="slotBindings"
		>
			<origam-media-controller
					:state="state"
					:methods="methods"
					:inset="inset"
					:visible="controlsVisible"
					:playback-rates="playbackRates"
					:allow-remote-playback="allowRemotePlayback"
					:downloadable="downloadable"
					:download-url="downloadUrl"
					:download-filename="downloadFilename"
					:quality-options="qualityOptions"
					:current-quality="currentQuality"
					data-cy="origam-video-controls"
					@quality-change="onQualityClick"
					@download="onDownloadClick"
			>
				<template #extraControlsRight>
					<origam-btn
							v-if="hasCaptions"
							:icon="ICONS.CAPTIONS"
							variant="text"
							:active="captionsEnabled"
							class="origam-video__btn"
							:aria-label="t(captionsLabelKey)"
							data-cy="origam-video-captions"
							@click="toggleCaptions"
					/>
					<origam-btn
							v-if="pipSupported"
							:icon="ICONS.PIP"
							variant="text"
							class="origam-video__btn"
							:aria-label="t(pipLabelKey)"
							data-cy="origam-video-pip"
							@click="togglePipBtn"
					/>
					<origam-btn
							:icon="fullscreenIcon"
							variant="text"
							class="origam-video__btn"
							:aria-label="t(fullscreenLabelKey)"
							data-cy="origam-video-fullscreen"
							@click="toggleFullscreenBtn"
					/>
				</template>
			</origam-media-controller>
		</slot>
		</template>
	</origam-responsive>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		onBeforeUnmount,
		ref,
		type StyleValue,
		watch
	} from 'vue'

	import { OrigamBtn } from '../Btn'
	import { OrigamIcon } from '../Icon'
	import { OrigamMediaController } from '../Media'
	import { OrigamResponsive } from '../Responsive'

	import { shouldSuppressAutoplay } from '../../composables/Media/use-media-player.composable'
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useColorEffect } from '../../composables/Commons/colorEffect.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'
	import { useVideoPlayer } from '../../composables/Video/video-player.composable'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { VIDEO_TRACK_KIND } from '../../enums/Video/video.enum'

	import type { IVideoProps } from '../../interfaces/Video/video.interface'
	import type { IVideoSource } from '../../interfaces/Video/video-track.interface'

	import type { IVideoEmits, IVideoSlots } from '../../interfaces/Video/video.interface'

	import type { TQualityOption } from '../../types/Media/quality-option.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamVideo>`. The component is a thin
	 * default skin on top of `useVideoPlayer` — it owns the toolbar
	 * markup, the poster / loading / error overlays, and the wiring
	 * between the native `<video>` element and the headless composable.
	 *
	 * Three controls modes:
	 *   - 'custom' (default): toolbar painted by this component.
	 *   - 'native': the native `controls` attribute is set on the
	 *     `<video>` and no custom UI is rendered.
	 *   - 'none': nothing — consumers either drive the player through
	 *     the `#controls` slot or programmatically.
	 *
	 * Defaults are inlined here (not pulled from a `VIDEO_DEFAULTS`
	 * const) because the Vue SFC compiler analyses `withDefaults`
	 * statically and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	/*********************************************************
	 * i18n — every user-facing label and aria string passes through
	 * `t()`. Media-shared keys live under `origam.media.*`, video-only
	 * ones (fullscreen, pip, captions) under `origam.video.*`.
	 ********************************************************/
	const { t } = useLocale()

	const props = withDefaults(defineProps<IVideoProps>(), {
		poster: undefined,
		tracks: () => [],
		autoplay: false,
		muted: false,
		loop: false,
		controls: 'custom',
		playsInline: true,
		preload: 'metadata',
		aspectRatio: '16/9',
		crossorigin: undefined,
		disablePictureInPicture: false,
		skipSeconds: 30,
		showCenterControls: true,
		playbackRates: () => [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
		playbackRate: 1,
		inset: true,
		allowRemotePlayback: true,
		doubleTapToSkip: true,
		downloadable: false,
		downloadFilename: undefined,
		color: undefined,
		bgColor: undefined
	})

	const emit = defineEmits<IVideoEmits>()

	defineSlots<IVideoSlots>()

	/*********************************************************
	 * Icon refs — single source of truth for the toolbar glyphs.
	 ********************************************************/
	const ICONS = {
		PLAY: MDI_ICONS.PLAY,
		PAUSE: MDI_ICONS.PAUSE,
		LOADING: MDI_ICONS.LOADING,
		ALERT: MDI_ICONS.ALERT_CIRCLE,
		CAPTIONS: MDI_ICONS.CLOSED_CAPTION,
		PIP: MDI_ICONS.PICTURE_IN_PICTURE_BOTTOM_RIGHT,
		FULLSCREEN: MDI_ICONS.FULLSCREEN,
		FULLSCREEN_EXIT: MDI_ICONS.FULLSCREEN_EXIT,
		CHEVRON_LEFT: MDI_ICONS.CHEVRON_LEFT,
		CHEVRON_RIGHT: MDI_ICONS.CHEVRON_RIGHT
	}

	/*********************************************************
	 * Resolved autoplay / muted — autoplay is suppressed when the user
	 * prefers reduced motion (a11y), and the browser requires muted=true
	 * for unattended playback in most cases. The composable also logs
	 * the suppression at mount time; we keep the SFC-level resolution
	 * here so the native `<video autoplay>` attribute is correct from
	 * the very first render.
	 ********************************************************/
	const resolvedAutoplay = computed(() => {
		if (!props.autoplay) return false
		if (shouldSuppressAutoplay()) return false
		return true
	})

	const resolvedMuted = computed(() => {
		if (props.muted) return true
		// Browsers gate `autoplay` on `muted` — auto-force when the
		// consumer asked for autoplay without explicitly muting.
		if (resolvedAutoplay.value) return true
		return false
	})

	/*********************************************************
	 * Source resolution — `src` can be a single URL or an array of
	 * `<source>` descriptors. When it's an array we render multiple
	 * `<source>` children; when it's a string we set the `src`
	 * attribute on the `<video>` directly (and skip the children).
	 ********************************************************/
	const singleSrc = computed<string | undefined>(() => {
		return typeof props.src === 'string' ? props.src : undefined
	})

	const resolvedSources = computed<Array<IVideoSource>>(() => {
		const sources = Array.isArray(props.src) ? props.src : []
		// When quality variants are declared, only render the active
		// quality's <source> tags (plus any without a quality field,
		// which are treated as codec siblings of every quality). The
		// quality switcher then `video.load()`-swaps the underlying URL
		// directly via `video.src`, so this list only matters for the
		// initial mount.
		if (currentQuality.value && hasQualityOptions.value) {
			return sources.filter((s) => !s.quality || s.quality === currentQuality.value)
		}
		return sources
	})

	/*********************************************************
	 * Composable
	 ********************************************************/
	const { videoRef, state, methods } = useVideoPlayer({
		autoplay: props.autoplay,
		muted: resolvedMuted.value,
		loop: props.loop,
		preload: props.preload
	})

	/*********************************************************
	 * Native event handlers — forward to the parent emit pipeline. The
	 * composable already listens to the same events internally; the
	 * forwarding here keeps the public emit contract independent of
	 * the headless state surface.
	 ********************************************************/
	function onTimeUpdate () {
		emit('timeupdate', state.currentTime.value)
	}

	function onVolumeChange () {
		emit('volumechange', state.volume.value)
	}

	const naturalWidth = ref<number | null>(null)
	const naturalHeight = ref<number | null>(null)

	function onLoadedMetadata (event: Event) {
		const v = event.target as HTMLVideoElement
		if (v.videoWidth && v.videoHeight) {
			naturalWidth.value = v.videoWidth
			naturalHeight.value = v.videoHeight
		}
		emit('loadedmetadata', { duration: state.duration.value })
	}

	// Effective aspect-ratio fed to OrigamResponsive. Priority:
	//   1. Explicit `aspectRatio` prop (string '16/9' or number).
	//   2. Natural dimensions from <video> metadata once loaded.
	//   3. Fallback to 16/9 so the placeholder area has a sensible
	//      shape before the video metadata arrives.
	const effectiveAspectRatio = computed<string | number>(() => {
		if (props.aspectRatio) return props.aspectRatio
		if (naturalWidth.value && naturalHeight.value) {
			return naturalWidth.value / naturalHeight.value
		}
		return '16/9'
	})

	function onErrorEvent () {
		if (state.error.value) emit('error', state.error.value)
	}

	/*********************************************************
	 * Hover / auto-hide state — `inset` controls auto-fade once the
	 * cursor leaves the player (except while paused, where the
	 * toolbar stays visible). `hovered` also gates the center-control
	 * overlay (play / ±skip buttons floating over the video).
	 ********************************************************/
	const hovered = ref<boolean>(false)
	const onPlayerMouseEnter = (): void => { hovered.value = true }
	const onPlayerMouseLeave = (): void => { hovered.value = false }

	const controlsVisible = computed<boolean>(() => {
		// In `inset` mode the bottom toolbar auto-hides while the
		// video plays and the cursor sits outside the player. In the
		// non-inset (always-on) mode, the toolbar always paints.
		if (!props.inset) return true
		if (state.paused.value) return true
		return hovered.value
	})

	/*********************************************************
	 * Skip handlers — wrap the composable skip methods so we also
	 * emit a `skip` event (positive seconds = forward, negative =
	 * backward). The default skip seconds come from the prop.
	 ********************************************************/
	const skipBy = (seconds: number): void => {
		if (seconds > 0) methods.skipForward(seconds)
		else if (seconds < 0) methods.skipBackward(Math.abs(seconds))
		emit('skip', seconds)
	}
	const onSkipBack = (): void => skipBy(-Math.abs(props.skipSeconds || 0))
	const onSkipForward = (): void => skipBy(Math.abs(props.skipSeconds || 0))

	/*********************************************************
	 * Double-tap / double-click to skip. YouTube-style: two clicks
	 * within 300ms on the same half (left = backward, right =
	 * forward) of the video surface trigger a skip. Works for BOTH
	 * touch (pointerType === 'touch') AND mouse (pointerType ===
	 * 'mouse' or 'pen') so desktop users get the same behaviour
	 * as mobile.
	 *
	 * Single clicks fall through to the center play/pause button
	 * via the parent overlay — no `event.stopPropagation()` here.
	 *
	 * The visual feedback (ripple + seconds badge) is driven by
	 * `skipFeedback`, consumed by the template overlay.
	 ********************************************************/
	const _lastTap = ref<{ time: number, side: 'left' | 'right' } | null>(null)
	const skipFeedback = ref<{ side: 'left' | 'right', seconds: number, id: number } | null>(null)
	let _skipFeedbackTimeout = -1

	/*********************************************************
	 * Center state pulse — purely cosmetic flash at the centre of the
	 * video when play/pause toggles (YouTube pattern). pointer-events:
	 * none, never absorbs clicks. Disappears after 600 ms.
	 ********************************************************/
	const statePulse = ref<{ kind: 'play' | 'pause', id: number } | null>(null)
	let _statePulseTimeout = -1
	function triggerStatePulse (kind: 'play' | 'pause'): void {
		statePulse.value = { kind, id: Date.now() }
		if (_statePulseTimeout !== -1) window.clearTimeout(_statePulseTimeout)
		_statePulseTimeout = window.setTimeout(() => {
			statePulse.value = null
			_statePulseTimeout = -1
		}, 600)
	}

	const triggerSkipFeedback = (side: 'left' | 'right'): void => {
		skipFeedback.value = { side, seconds: props.skipSeconds, id: Date.now() }
		if (_skipFeedbackTimeout !== -1) window.clearTimeout(_skipFeedbackTimeout)
		_skipFeedbackTimeout = window.setTimeout(() => {
			skipFeedback.value = null
			_skipFeedbackTimeout = -1
		}, 700)
	}

	/*********************************************************
	 * Single-tap deferred toggle. YouTube-style: a click on the
	 * video surface toggles play / pause, but if a second tap lands
	 * within 300 ms on the SAME side, that gesture turns into a
	 * skip and the deferred toggle is cancelled. Net effect:
	 *   - single click     → toggle (after a ~280 ms delay)
	 *   - double click     → skip on same side (no toggle)
	 *                      OR toggle on different side (cancels pending)
	 ********************************************************/
	let _pendingTogglePlayTimeout = -1
	function schedulePendingTogglePlay (): void {
		clearPendingTogglePlay()
		_pendingTogglePlayTimeout = window.setTimeout(() => {
			togglePlay()
			_pendingTogglePlayTimeout = -1
		}, 280)
	}
	function clearPendingTogglePlay (): void {
		if (_pendingTogglePlayTimeout !== -1) {
			window.clearTimeout(_pendingTogglePlayTimeout)
			_pendingTogglePlayTimeout = -1
		}
	}

	onBeforeUnmount(() => {
		if (_skipFeedbackTimeout !== -1) window.clearTimeout(_skipFeedbackTimeout)
		if (_statePulseTimeout !== -1) window.clearTimeout(_statePulseTimeout)
		clearPendingTogglePlay()
	})

	const onVideoTap = (event: PointerEvent): void => {
		// Skip keyboard / synthetic events without coordinates.
		if (event.clientX == null) return

		// Ignore taps on the inline center skip buttons — they have
		// their own @click handlers and should not also count as a
		// surface tap.
		const eventTarget = event.target as HTMLElement | null
		if (eventTarget?.closest('.origam-video__center-btn')) return

		// Compute the side based on the VIDEO element bounding box,
		// not the current target (which may be the center overlay).
		const videoEl = videoRef.value
		if (!videoEl) return
		const rect = videoEl.getBoundingClientRect()
		const side: 'left' | 'right' = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right'
		const now = Date.now()
		const last = _lastTap.value
		if (props.doubleTapToSkip && last && now - last.time < 300 && last.side === side) {
			// Second tap of a same-side pair → skip, suppress the pending
			// togglePlay that was queued by the first tap.
			clearPendingTogglePlay()
			if (side === 'left') onSkipBack()
			else onSkipForward()
			triggerSkipFeedback(side)
			_lastTap.value = null
			event.preventDefault()
		} else {
			// First tap (or a second tap that doesn't qualify as a
			// same-side skip pair): record for a potential pairing and
			// schedule a deferred togglePlay. If a second tap comes in
			// soon enough on the same side, the pending toggle is
			// cancelled and a skip happens instead.
			_lastTap.value = { time: now, side }
			schedulePendingTogglePlay()
		}
	}

	/*********************************************************
	 * Quality switcher — derived from the unique `quality` values
	 * exposed by the source array. Only renders when ≥ 2 distinct
	 * qualities exist. The component otherwise plays whatever the
	 * browser picked first (typical mp4 + webm dual-source case).
	 *
	 * The Controller shell handles the menu UI; OrigamVideo keeps the
	 * derivation + the `<source>` swap because both depend on the
	 * `props.src` shape which is video-specific.
	 ********************************************************/
	// `src` is required here (unlike the generic `TQualityOption.src?`):
	// every entry is derived from `IVideoSource.src`, which IS required —
	// the `video.src = target.src` swap below relies on that guarantee.
	const qualityOptions = computed<Array<TQualityOption & { src: string }>>(() => {
		const sources = Array.isArray(props.src) ? props.src : []
		const seen = new Set<string>()
		const out: Array<TQualityOption & { src: string }> = []
		for (const s of sources) {
			if (!s?.quality || seen.has(s.quality)) continue
			seen.add(s.quality)
			out.push({ quality: s.quality, label: s.label ?? s.quality, src: s.src, type: s.type })
		}
		return out
	})

	const hasQualityOptions = computed<boolean>(() => qualityOptions.value.length >= 2)
	const currentQuality = ref<string | null>(null)

	// Initialise the active quality from the first source that has one
	// once the props settle.
	const initQuality = () => {
		if (currentQuality.value !== null) return
		if (!hasQualityOptions.value) return
		currentQuality.value = qualityOptions.value[0].quality
	}
	initQuality()

	function onQualityClick (quality: string): void {
		const target = qualityOptions.value.find((q) => q.quality === quality)
		if (!target || !videoRef.value) return
		const video = videoRef.value
		const wasPaused = video.paused
		const at = video.currentTime
		currentQuality.value = quality
		emit('quality-change', quality)
		// Swap source in place, then resume position + play state once
		// the new track has its metadata ready.
		const onReady = () => {
			try { video.currentTime = at } catch { /* range error → noop */ }
			if (!wasPaused) video.play().catch(() => { /* autoplay blocked, ignore */ })
			video.removeEventListener('loadedmetadata', onReady)
		}
		video.addEventListener('loadedmetadata', onReady)
		video.src = target.src
		video.load()
	}

	/*********************************************************
	 * Download — the cog-menu row is a NATIVE `<a href :download>` in
	 * `<OrigamMediaController>`, so the browser fires the download
	 * action directly from the user click (no JS-side `a.click()`
	 * orchestration, no `fetch` round-trip). We just relay the emit
	 * upward for analytics / parent forwarding.
	 *
	 * Cross-origin caveat : per HTML spec, browsers IGNORE the
	 * `download` attribute on cross-origin links. Self-hosted videos
	 * therefore trigger a real "Save as…" flow ; a video on a
	 * third-party CDN navigates instead unless the CDN sends
	 * `Content-Disposition: attachment`. Documented in the doc
	 * page — there is no JS-side workaround that survives a user
	 * gesture trace without a CORS-friendly CDN.
	 ********************************************************/
	function onDownloadClick (): void {
		const url = downloadUrl.value
		if (!url) return
		emit('download', url)
	}

	const downloadUrl = computed<string | null>(() => {
		if (typeof props.src === 'string') return props.src || null
		// Multi-source array: prefer the active quality, fall back to first.
		const sources = props.src as Array<IVideoSource>
		if (!sources.length) return null
		if (currentQuality.value) {
			const match = sources.find((s) => s.quality === currentQuality.value)
			if (match) return match.src
		}
		return sources[0]?.src ?? null
	})

	/*********************************************************
	 * Apply initial playback rate (prop) once metadata is ready.
	 * Subsequent prop changes are honoured via the watcher below.
	 ********************************************************/
	watch(() => props.playbackRate, (rate) => {
		if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
			methods.setPlaybackRate(rate)
		}
	}, { immediate: true })

	/*********************************************************
	 * Forward playback-rate changes initiated by the Controller's
	 * config menu via the public `update:playbackRate` emit so the
	 * v-model contract on the wrapper stays intact.
	 ********************************************************/
	watch(() => state.playbackRate.value, (rate) => {
		emit('update:playbackRate', rate)
	})

	/*********************************************************
	 * Toolbar handlers — wrap the composable methods so we can also
	 * surface the user gesture as the matching emit event (parents
	 * who want to log a play/pause click track these directly).
	 ********************************************************/
	function togglePlay (): void {
		if (state.playing.value) {
			methods.pause()
			triggerStatePulse('pause')
		} else {
			methods.play()
			triggerStatePulse('play')
		}
	}

	async function toggleFullscreenBtn (): Promise<void> {
		const wasFs = state.fullscreen.value
		await methods.toggleFullscreen()
		// The composable updates `fullscreen` via the document-level
		// `fullscreenchange` listener — after the await we know the
		// new value is committed and can fire the right event.
		if (state.fullscreen.value && !wasFs) emit('enterfullscreen')
		else if (!state.fullscreen.value && wasFs) emit('exitfullscreen')
	}

	async function togglePipBtn (): Promise<void> {
		await methods.togglePip()
	}

	/*********************************************************
	 * Captions — track the active text track index and allow toggling
	 * the whole subtitle UI off. We treat any non-disabled track as
	 * "captions on"; toggling off sets every track to `disabled`.
	 ********************************************************/
	const captionsEnabled = ref<boolean>(false)

	const hasCaptions = computed(() => props.tracks.some((track) => {
		return track.kind === VIDEO_TRACK_KIND.CAPTIONS || track.kind === VIDEO_TRACK_KIND.SUBTITLES
	}))

	function toggleCaptions (): void {
		const el = videoRef.value
		if (!el) return
		const trackList = el.textTracks
		captionsEnabled.value = !captionsEnabled.value
		for (let i = 0; i < trackList.length; i++) {
			const track = trackList[i]
			if (!captionsEnabled.value) {
				track.mode = 'disabled'
			} else {
				// Activate the first one that matches the user's
				// declared default; otherwise the very first.
				const declared = props.tracks[i]
				if (declared?.default) track.mode = 'showing'
				else if (i === 0) track.mode = 'showing'
				else track.mode = 'disabled'
			}
		}
	}

	// Watch ready to initialise captions once tracks are wired up.
	watch(() => state.ready.value, (ready) => {
		if (!ready) return
		const el = videoRef.value
		if (!el) return
		// Mirror the `default` attribute to our internal flag so the
		// first paint after metadata matches what the user expected.
		const someShowing = Array.from(el.textTracks).some((track) => track.mode === 'showing')
		captionsEnabled.value = someShowing
	})

	/*********************************************************
	 * PIP support — fall back gracefully on browsers that don't expose
	 * the API (Firefox, some embedded WebViews). We feature-detect at
	 * computation time rather than at module load so SSR doesn't crash.
	 ********************************************************/
	const pipSupported = computed<boolean>(() => {
		if (props.disablePictureInPicture) return false
		if (typeof document === 'undefined') return false
		const doc = document as unknown as { pictureInPictureEnabled?: boolean }
		return Boolean(doc.pictureInPictureEnabled)
	})

	/*********************************************************
	 * Poster + error overlay visibility. The Controller owns time /
	 * volume / scrubber formatting; OrigamVideo only computes what
	 * the overlays need.
	 ********************************************************/
	const showPosterOverlay = computed(() => {
		return Boolean(props.poster) &&
			state.paused.value &&
			state.currentTime.value === 0 &&
			!state.error.value
	})

	const errorMessage = computed(() => {
		const err = state.error.value
		if (!err) return 'Playback error'
		if ('message' in err && err.message) return err.message
		return 'Playback error'
	})

	/*********************************************************
	 * Aria-label keys for the buttons injected into the
	 * `#extraControlsRight` slot of the Controller. Computed so the
	 * template stays free of inline ternaries (cf. CLAUDE.md "no
	 * logic in templates").
	 ********************************************************/
	const captionsLabelKey = computed<string>(() => {
		return captionsEnabled.value ? 'origam.video.disable_captions' : 'origam.video.enable_captions'
	})

	const pipLabelKey = computed<string>(() => {
		return state.pip.value ? 'origam.video.exit_pip' : 'origam.video.enter_pip'
	})

	const fullscreenLabelKey = computed<string>(() => {
		return state.fullscreen.value ? 'origam.video.exit_fullscreen' : 'origam.video.enter_fullscreen'
	})

	const fullscreenIcon = computed<string>(() => {
		return state.fullscreen.value ? ICONS.FULLSCREEN_EXIT : ICONS.FULLSCREEN
	})

	/*********************************************************
	 * Slot bindings — single source of truth for the `#controls` slot.
	 ********************************************************/
	const slotBindings = computed(() => ({
		playing: state.playing.value,
		paused: state.paused.value,
		currentTime: state.currentTime.value,
		duration: state.duration.value,
		buffered: state.buffered.value,
		volume: state.volume.value,
		muted: state.muted.value,
		fullscreen: state.fullscreen.value,
		pip: state.pip.value,
		loading: state.loading.value,
		error: state.error.value,
		playbackRate: state.playbackRate.value,
		remoteAvailable: state.remoteAvailable.value,
		remoteState: state.remoteState.value,
		methods
	}))

	/*********************************************************
	 * Colour mixin — `color` and `bgColor` props let the consumer
	 * tint the video chrome (icons + scrubber) and the host
	 * background. `useColorEffect` pairs them WCAG-aware so a
	 * single intent (`color="primary"`) flows through without
	 * leaving illegible text on a saturated surface.
	 ********************************************************/
	const { colorClasses, colorStyles } = useColorEffect(props)

	const hasColorProp = computed(() => !!props.color)
	const hasBgColorProp = computed(() => !!props.bgColor)

	/*********************************************************
	 * Layout composables — margin / padding / border / rounded /
	 * elevation / dimension wired from the extended interface.
	 ********************************************************/
	const { borderClasses, borderStyles } = useBorder(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { elevationClasses } = useElevation(props)
	const { dimensionStyles } = useDimension(props)

	/*********************************************************
	 * Typography — per-surface tokens.
	 *   video__loading → font-size (état overlay)
	 *   video--error   → font-size (état overlay)
	 * useColorEffect drives color; typographyStyles only sets font vars.
	 ********************************************************/
	const { typographyStyles: typographyLoadingStyles } = useTypography(props, 'video__loading')
	const { typographyStyles: typographyErrorStyles } = useTypography(props, 'video--error')

	/*********************************************************
	 * scrubberColorStyle — drives `--origam-media-controller__scrubber---color`
	 * on the host. The MediaController reads this variable for the
	 * played-portion of the scrubber.
	 *
	 *   - No `color` / `bgColor` prop → default to **white**.
	 *     The video overlay is dark (rgba(0,0,0,0.55) gradient on
	 *     the bottom bar) and the rest of the chrome (play/volume/
	 *     cog icons, time) is white via `.origam-video__btn`. A
	 *     white scrubber matches that hierarchy.
	 *
	 *   - `color` OR `bgColor` set → `currentColor`. Through
	 *     `useColorEffect`'s class/style binding the host's `color`
	 *     is the resolved intent fg, so the scrubber adopts it.
	 *     (`bgColor="primary"` alone auto-pairs the fg to primary's
	 *     paired foreground token via `useColorEffect`, so the
	 *     scrubber tracks that contrast pair automatically.)
	 ********************************************************/
	const scrubberColorStyle = computed<Record<string, string>>(() => {
		if (hasColorProp.value || hasBgColorProp.value) {
			return { '--origam-media-controller__scrubber---color': 'currentColor' }
		}
		return { '--origam-media-controller__scrubber---color': '#ffffff' }
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-video--playing': state.playing.value,
			'origam-video--paused': state.paused.value,
			'origam-video--loading': state.loading.value,
			'origam-video--error': state.error.value !== null,
			'origam-video--fullscreen': state.fullscreen.value,
			'origam-video--pip': state.pip.value,
			'origam-video--controls-native': props.controls === 'native',
			'origam-video--controls-custom': props.controls === 'custom',
			'origam-video--controls-none': props.controls === 'none',
			'origam-video--has-color': hasColorProp.value,
			'origam-video--has-bg-color': hasBgColorProp.value
		},
		...colorClasses.value,
		borderClasses.value,
		roundedClasses.value,
		elevationClasses.value,
		marginClasses.value,
		paddingClasses.value,
		props.class
	])

	// aspect-ratio is now handled by `<origam-responsive :aspect-ratio>`.
	// rootStyles carries the user pass-through + the scrubber colour
	// variable + the inline output of `useColorEffect` for raw / custom
	// values that don't have a utility class.
	const rootStyles = computed<StyleValue>(() => [
		colorStyles.value,
		scrubberColorStyle.value,
		borderStyles.value,
		roundedStyles.value,
		marginStyles.value,
		paddingStyles.value,
		dimensionStyles.value,
		props.style
	] as StyleValue)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		videoRef,
		state,
		methods
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-video {
		position: relative;
		display: block;
		width: 100%;
		background-color: var(--origam-video---background-color, #000000);
		overflow: hidden;
		border-radius: var(--origam-video---border-radius, 0);

		--origam-media-controller---color: #ffffff;
	}

	.origam-video--has-color,
	.origam-video--has-bg-color {
		--origam-media-controller---color: inherit;

		:deep(.origam-media-controller) {
			color: inherit;
		}

		.origam-video__btn {
			color: inherit;
		}
	}

	:deep(.origam-media-volume-control__btn) {
		color: inherit;
	}

	:deep(.origam-media-controller__scrubber) {
		--origam-media-scrubber---track-background-color: rgba(255, 255, 255, 0.28);
		--origam-media-scrubber---buffer-background-color: rgba(255, 255, 255, 0.42);
	}

	.origam-video__el {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.origam-video__poster {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background-color: var(--origam-video__poster---background-color, #000000);
	}

	.origam-video__poster-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.origam-video__poster-btn {
		all: unset;
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--origam-video---poster-btn-size, 64px);
		height: var(--origam-video---poster-btn-size, 64px);
		border-radius: 50%;
		background-color: var(--origam-video---poster-btn-background-color, rgba(0, 0, 0, 0.6));
		color: var(--origam-video---poster-btn-color, #ffffff);
		font-size: var(--origam-video---poster-btn-font-size, 28px);
		cursor: pointer;
		transition: background-color 160ms ease;
	}

	.origam-video__poster-btn:hover {
		background-color: var(--origam-video---poster-btn-background-color-hover, rgba(0, 0, 0, 0.8));
	}

	.origam-video__loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--origam-video__loading---color, #ffffff);
		font-size: var(--origam-video__loading---font-size, 32px);
		pointer-events: none;
	}

	.origam-video__loading-icon {
		animation: origam-video-spin 1s linear infinite;
	}

	@keyframes origam-video-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.origam-video__error {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: var(--origam-video--error---gap, 8px);
		padding: var(--origam-video--error---padding, 16px);
		background-color: var(--origam-video--error---background-color, rgba(0, 0, 0, 0.85));
		color: var(--origam-video--error---color, #f87171);
		font-size: var(--origam-video--error---font-size, 14px);
		text-align: center;
	}

	.origam-video__error-icon {
		font-size: var(--origam-video--error---icon-font-size, 32px);
	}

	.origam-video__state-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.55);
		color: #ffffff;
		pointer-events: none;
		z-index: 2;
	}

	.origam-video__state-pulse-icon {
		font-size: 40px;
		line-height: 1;
	}

	.origam-video-state-pulse-enter-active {
		transition: opacity 180ms ease, transform 480ms cubic-bezier(0.2, 0.6, 0.2, 1);
	}
	.origam-video-state-pulse-leave-active {
		transition: opacity 280ms ease, transform 480ms cubic-bezier(0.2, 0.6, 0.2, 1);
	}
	.origam-video-state-pulse-enter-from {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.6);
	}
	.origam-video-state-pulse-leave-to {
		opacity: 0;
		transform: translate(-50%, -50%) scale(1.5);
	}
	.origam-video-state-pulse-enter-to,
	.origam-video-state-pulse-leave-from {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-video-state-pulse-enter-active,
		.origam-video-state-pulse-leave-active {
			transition: opacity 100ms ease;
			transform: translate(-50%, -50%);
		}

		.origam-video__loading-icon {
			animation: none;
		}
	}

	// YouTube-parity double-tap skip overlay :
	//
	//   • Whole element is a PERFECT CIRCLE (`width: 40 %` of the
	//     video width, `aspect-ratio: 1`, `border-radius: 50 %`).
	//     Most of the disc lives OUTSIDE the video frame — we anchor
	//     with `right: -28 %` (or `left: -28 %`), so only the
	//     12 %-wide bulge intrudes into the visible area. The parent
	//     `.origam-video` clips the offscreen portion via its existing
	//     `overflow: hidden` — what the user sees is genuinely a slice
	//     of a circle, not an elongated oval.
	//   • Frosted background : light dark wash + `backdrop-filter:
	//     blur(6px)` for the frosted look. Fallback (browsers without
	//     backdrop-filter support) keeps a denser solid alpha so the
	//     chevrons stay readable.
	//   • Three chevrons stay visible at baseline opacity 0.5 ; a
	//     brightness wave (opacity 1 + scale 1.1) cascades through
	//     them on a 800 ms loop. The wave direction follows the skip
	//     direction (right skip → wave runs left→right ; left skip →
	//     wave runs right→left) via per-side animation-delay swap, so
	//     the eye chases the chevrons toward the skip target.
	//   • Disc itself fades + scales in/out (200 ms ease) — no
	//     translate, just a subtle "puff in" matching YouTube.
	.origam-video__skip-ripple {
		position: absolute;
		top: 50%;
		width: 40%;
		aspect-ratio: 1;
		z-index: 3;
		pointer-events: none;
		background: rgba(0, 0, 0, 0.45);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	@supports ((backdrop-filter: blur(6px)) or (-webkit-backdrop-filter: blur(6px))) {
		.origam-video__skip-ripple {
			background: rgba(0, 0, 0, 0.30);
			backdrop-filter: blur(6px);
			-webkit-backdrop-filter: blur(6px);
		}
	}

	.origam-video__skip-ripple--left {
		left: -25%;
		align-items: flex-end;
		padding-right: 5%;
	}

	.origam-video__skip-ripple--right {
		right: -25%;
		align-items: flex-start;
		padding-left: 5%;
	}

	.origam-video__skip-ripple-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		color: #ffffff;
		text-align: center;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
	}

	.origam-video__skip-chevrons {
		display: inline-flex;
		align-items: center;
		gap: 0;
		line-height: 0;
	}

	.origam-video__skip-chevron {
		display: inline-block;
		line-height: 0;
		opacity: 0.5;
		margin: 0 -4px;
		animation: origam-video-chevron-wave 800ms ease-in-out infinite;
	}

	.origam-video__skip-chevron :deep(.origam-icon) {
		font-size: 28px;
		line-height: 1;
	}

	@keyframes origam-video-chevron-wave {
		0%, 80%, 100% { opacity: 0.5; transform: scale(1); }
		40%           { opacity: 1;   transform: scale(1.1); }
	}

	// Cascade order follows the skip direction :
	//   right skip → chevrons peak 1 → 2 → 3 (left to right)
	//   left skip  → chevrons peak 3 → 2 → 1 (right to left)
	.origam-video__skip-ripple--right .origam-video__skip-chevron--1 { animation-delay:   0ms; }
	.origam-video__skip-ripple--right .origam-video__skip-chevron--2 { animation-delay: 120ms; }
	.origam-video__skip-ripple--right .origam-video__skip-chevron--3 { animation-delay: 240ms; }
	.origam-video__skip-ripple--left  .origam-video__skip-chevron--1 { animation-delay: 240ms; }
	.origam-video__skip-ripple--left  .origam-video__skip-chevron--2 { animation-delay: 120ms; }
	.origam-video__skip-ripple--left  .origam-video__skip-chevron--3 { animation-delay:   0ms; }

	.origam-video__skip-ripple-label {
		font-size: 13px;
		font-weight: 600;
		font-family: var(--origam-font---family, system-ui, sans-serif);
		letter-spacing: 0.02em;
		white-space: nowrap;
		user-select: none;
		line-height: 1.2;
	}

	// Note: disc anchored at `top: 50%` with no transform — the y-axis
	// `translateY(-50%)` we'd normally add is moved INTO the enter/leave
	// keyframes so we can compose it with the scale puff-in without
	// fighting the static positioning transform.
	.origam-video__skip-ripple {
		transform: translateY(-50%) scale(1);
	}

	.origam-video-skip-ripple-enter-active,
	.origam-video-skip-ripple-leave-active {
		transition: opacity 200ms ease, transform 200ms ease;
	}

	.origam-video-skip-ripple-enter-from,
	.origam-video-skip-ripple-leave-to {
		opacity: 0;
		transform: translateY(-50%) scale(0.96);
	}

	.origam-video-skip-ripple-enter-to,
	.origam-video-skip-ripple-leave-from {
		opacity: 1;
		transform: translateY(-50%) scale(1);
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-video__skip-icon,
		.origam-video__skip-ripple,
		.origam-video-skip-ripple-enter-active,
		.origam-video-skip-ripple-leave-active {
			transition: none;
		}
		.origam-video__skip-chevron {
			animation: none;
			opacity: 0.85;
		}
	}

	:deep(.origam-video__btn.origam-btn) {
		--origam-btn---color: var(--origam-video__btn---color, #ffffff);
		--origam-btn---min-width: 36px;
		--origam-btn---width: 36px;
		--origam-btn---height: 36px;
		--origam-btn---min-height: 36px;
		--origam-btn---border-radius: 50%;
		opacity: 0.95;
		transition: background-color 120ms ease, transform 120ms ease, opacity 120ms ease;

		&:hover,
		&:focus-visible {
			opacity: 1;
			background-color: rgba(255, 255, 255, 0.12);
		}

		&:active {
			transform: scale(0.92);
		}

		.origam-icon {
			font-size: 20px;
			line-height: 1;
		}
	}

	:deep(.origam-video__btn.origam-btn.origam-btn--active) {
		opacity: 1;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: 2px;
			width: 4px;
			height: 4px;
			border-radius: 50%;
			background: #ef4444;
		}
	}

	.origam-video--fullscreen {
		border-radius: 0;
	}

	.origam-video--error .origam-video__poster {
		display: none;
	}
</style>
