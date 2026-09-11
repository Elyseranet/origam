<template>
	<article
			class="origam-audio"
			:class="rootClasses"
			:style="rootStyles"
			data-cy="origam-audio"
	>
		<audio
				ref="audioRef"
				class="origam-audio__el"
				:src="singleSrc"
				:autoplay="resolvedAutoplay"
				:muted="resolvedMuted"
				:loop="audioLoopAttr"
				:controls="isNativeControls"
				:preload="preload"
				:crossorigin="crossorigin"
				data-cy="origam-audio-el"
				@play="emit('play')"
				@pause="emit('pause')"
				@ended="onNativeEnded"
				@timeupdate="onTimeUpdate"
				@volumechange="onVolumeChange"
				@loadedmetadata="onLoadedMetadata"
				@error="onErrorEvent"
		>
			<source
					v-for="source in resolvedSources"
					:key="source.src"
					:src="source.src"
					:type="source.type"
			/>
			<track
					v-for="trackItem in resolvedTracks"
					:key="`${ trackItem.kind }-${ trackItem.srclang }`"
					:kind="trackItem.kind"
					:src="trackItem.src"
					:srclang="trackItem.srclang"
					:label="trackItem.label || trackItem.srclang.toUpperCase()"
					:default="trackItem.default || undefined"
			/>
		</audio>

		<origam-media-controller
				v-if="isCustomControls"
				v-model:loop-mode="internalLoopMode"
				v-model:shuffle="internalShuffle"
				:state="state"
				:methods="methods"
				:playback-rates="playbackRates"
				:allow-remote-playback="allowRemotePlayback"
				:downloadable="downloadable"
				:download-url="downloadUrl"
				:download-filename="downloadFilename"
				:show-previous="hasPlaylist"
				:show-next="hasPlaylist"
				:show-loop="true"
				:show-shuffle="hasPlaylist"
				class="origam-audio__controller"
				data-cy="origam-audio-controls"
				@previous="onPrevious"
				@next="onNext"
				@download="onDownloadClick"
		>
			<template #header>
				<slot name="header">
					<div
							v-if="hasCover || hasMetadata"
							class="origam-audio__header"
							:class="{ 'origam-audio__header--no-cover': !hasCover }"
					>
						<figure
								v-if="hasCover"
								class="origam-audio__cover"
								data-cy="origam-audio-cover-figure"
						>
							<slot name="cover">
								<img
										:src="resolvedCover!"
										:alt="coverAlt"
										:width="coverSizePx"
										:height="coverSizePx"
										class="origam-audio__cover-img"
										data-cy="origam-audio-cover"
										loading="lazy"
										decoding="async"
								/>
							</slot>
						</figure>

						<header
								v-if="hasMetadata"
								class="origam-audio__metadata"
								data-cy="origam-audio-metadata"
						>
							<slot name="metadata">
								<slot name="title">
									<strong
											v-if="resolvedTitle"
											class="origam-audio__title"
											data-cy="origam-audio-title"
											:style="typographyTitleStyles"
									>{{ resolvedTitle }}</strong>
								</slot>
								<span
										v-if="hasMetaLine"
										class="origam-audio__meta"
										:style="typographyMetaStyles"
								>
									<span
											v-if="resolvedArtist"
											class="origam-audio__artist"
											data-cy="origam-audio-artist"
									>{{ resolvedArtist }}</span>
									<span
											v-if="resolvedAlbum"
											class="origam-audio__album"
											data-cy="origam-audio-album"
									>{{ resolvedAlbum }}</span>
									<span
											v-if="hasDurationLabel"
											class="origam-audio__duration"
											data-cy="origam-audio-duration"
									>{{ formattedDuration }}</span>
								</span>
							</slot>
						</header>
					</div>
				</slot>
			</template>

			<template #waveform>
				<slot
						name="waveform"
						:peaks="peaks"
						:current-time="state.currentTime.value"
						:duration="state.duration.value"
				>
					<origam-slider-field
							:model-value="state.currentTime.value"
							:max="scrubberMax"
							:step="0.1"
							:buffered="state.buffered.value"
							:peaks="isCompactVariant ? undefined : displayedPeaks"
							:aria-label="waveformAriaLabel"
							:variant="isCompactVariant ? 'timer' : 'audio'"
							show-thumb-on-hover-only
							show-hover-tooltip
							:format-hover-tooltip="formatTimeTooltip"
							class="origam-audio__waveform-slider"
							:style="{ color: 'inherit' }"
							data-cy="origam-audio-waveform-slider"
							@update:model-value="onWaveformSeek"
					/>
				</slot>
			</template>

			<template
					v-if="hasPlaylist"
					#footer
			>
				<slot
						name="playlist"
						:tracks="props.playlist"
						:current-index="safeTrackIndex"
						:select="setActiveTrack"
				>
					<origam-list
						class="origam-audio__playlist"
						data-cy="origam-audio-playlist"
					>
						<origam-list-item
								v-for="(track, index) in props.playlist"
								:key="track.id ?? index"
								:active="index === safeTrackIndex"
								:title="track.title ?? `Track ${ index + 1 }`"
								:subtitle="track.artist"
								:prepend-avatar="track.cover"
								class="origam-audio__playlist-item"
								:data-cy="`origam-audio-playlist-item-${ index }`"
								@click="setActiveTrack(index)"
						>
							<template
									v-if="track.duration"
									#append
							>
								<span class="origam-audio__playlist-duration">{{ formatMediaTime(track.duration) }}</span>
							</template>
						</origam-list-item>
					</origam-list>
				</slot>
			</template>
		</origam-media-controller>

		<div
				v-if="state.loading.value && !state.error.value"
				class="origam-audio__loading"
				role="status"
				:aria-label="loadingLabel"
				data-cy="origam-audio-loading"
				:style="typographyLoadingStyles"
		>
			<slot name="loading">
				<origam-icon
						:icon="ICONS.LOADING"
						class="origam-audio__loading-icon"
						aria-hidden="true"
				/>
			</slot>
		</div>

		<div
				v-if="state.error.value"
				class="origam-audio__error"
				role="alert"
				data-cy="origam-audio-error"
				:style="typographyErrorStyles"
		>
			<slot
					name="error"
					:error="state.error.value"
			>
				<origam-icon
						:icon="ICONS.ALERT"
						class="origam-audio__error-icon"
						aria-hidden="true"
				/>
				<span class="origam-audio__error-msg">{{ errorMessage }}</span>
			</slot>
		</div>
	</article>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		nextTick,
		ref,
		type StyleValue,
		watch
	} from 'vue'

	import { OrigamIcon } from '../Icon'
	import { OrigamList, OrigamListItem } from '../List'
	import { OrigamMediaController } from '../Media'
	import { OrigamSliderField } from '../SliderField'

	import {
		useBorder,
		useColorEffect,
		useDimension,
		useElevation,
		useLocale,
		useMargin,
		usePadding,
		usePosition,
		useRounded,
		useTypography
	} from '../../composables'
	import { useAudioPlayer } from '../../composables/Audio/use-audio-player.composable'
	import { useWaveform } from '../../composables/Audio/use-waveform.composable'
	import { shouldSuppressAutoplay } from '../../composables/Media/use-media-player.composable'

	import { MDI_ICONS } from '../../enums'

	import type {
		IAudioEmits,
		IAudioProps,
		IAudioSource,
		IAudioTrack
	} from '../../interfaces/Audio/audio-player.interface'

	import type { TAudioLoopMode } from '../../types'

	import { formatMediaTime } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Stemtracks studio strip: cover (left/right) + body column with
	 * a metadata header, a waveform mini scrubber, and a transport
	 * `<nav>` row. The body is a CSS grid composed entirely from atomic
	 * media components — `<OrigamMediaController>` is intentionally NOT
	 * used here so the audio shell can ship its own transport layout.
	 *
	 * Defaults are inlined here (not pulled from a constant object)
	 * because the Vue SFC compiler analyses `withDefaults` statically
	 * and only resolves literal values — cf. CLAUDE.md rule.
	 ********************************************************/
	const { t } = useLocale()

	const props = withDefaults(defineProps<IAudioProps>(), {
		tag: 'article',
		variant: 'expanded',
		coverPosition: 'left',
		position: 'relative',
		top: undefined,
		bottom: undefined,
		left: undefined,
		right: undefined,
		color: undefined,
		bgColor: undefined,
		tracks: () => [],
		title: undefined,
		artist: undefined,
		album: undefined,
		cover: undefined,
		autoplay: false,
		muted: false,
		loop: false,
		loopMode: 'none',
		shuffle: false,
		playlist: undefined,
		currentTrackIndex: 0,
		preload: 'metadata',
		crossorigin: undefined,
		controls: 'custom',
		playbackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
		playbackRate: 1,
		allowRemotePlayback: false,
		downloadable: false,
		downloadFilename: undefined,
		waveform: false,
		waveformColor: 'currentColor'
	})

	const emit = defineEmits<IAudioEmits>()

	/*********************************************************
	 * Icon refs — single source of truth for the transport + status
	 * glyphs. Inlined as a const object so the template only sees
	 * literal references (CLAUDE.md "no logic in templates" rule).
	 ********************************************************/
	const ICONS = {
		LOADING: MDI_ICONS.LOADING,
		ALERT: MDI_ICONS.ALERT_CIRCLE,
	}

	/*********************************************************
	 * i18n labels — only the ones used by OrigamAudio's own
	 * overlays / scrubber aria-label. Every transport label
	 * (play, pause, mute, volume, prev, next, loop, shuffle,
	 * cast, settings, speed, quality, download, normal-speed,
	 * transport) lives inside `<origam-media-controller>` and
	 * resolves there directly.
	 ********************************************************/
	const waveformAriaLabel = computed<string>(() => t('origam.media.seek', 'Seek'))
	const loadingLabel = computed<string>(() => t('origam.loading', 'Loading'))

	/*********************************************************
	 * Resolved autoplay / muted — autoplay is suppressed when the user
	 * prefers reduced motion (a11y), and the browser requires muted=true
	 * for unattended playback in most cases.
	 ********************************************************/
	const resolvedAutoplay = computed<boolean>(() => {
		if (!props.autoplay) return false
		if (shouldSuppressAutoplay()) return false
		return true
	})

	const resolvedMuted = computed<boolean>(() => {
		if (props.muted) return true
		if (resolvedAutoplay.value) return true
		return false
	})

	/*********************************************************
	 * Controls strategy — drives both the native `controls` attribute
	 * on the `<audio>` AND the conditional render of the custom
	 * Stemtracks body.
	 ********************************************************/
	const isCustomControls = computed<boolean>(() => props.controls === 'custom')
	const isNativeControls = computed<boolean>(() => props.controls === 'native')

	/*********************************************************
	 * Variant normalisation — accept the legacy `'normal' | 'minimal'`
	 * aliases as well as the canonical `'expanded' | 'compact'` values
	 * so the brief swap is non-breaking for v0.x consumers.
	 ********************************************************/
	const isCompactVariant = computed<boolean>(() => {
		return props.variant === 'compact' || props.variant === 'minimal'
	})
	const isExpandedVariant = computed<boolean>(() => !isCompactVariant.value)

	/*********************************************************
	 * Playlist state machine
	 *
	 * @description
	 * When `props.playlist` is set, the active track drives the
	 * `<audio>` source AND the metadata strip. The component owns
	 * an internal `currentTrackIndex` ref that v-models against the
	 * parent so consumers can either read it or control it externally.
	 *
	 * Shuffle mode picks a new track uniformly at random from the
	 * full playlist at EACH navigation event (prev / next / auto-
	 * advance on `ended`). Same track twice in a row is allowed —
	 * it's true randomness, not a pre-computed permutation. To avoid
	 * "stuck on the same track" feeling on small playlists, we
	 * retry once when the picked index matches the current track and
	 * the playlist has more than one entry.
	 ********************************************************/
	const hasPlaylist = computed<boolean>(() => Array.isArray(props.playlist) && props.playlist.length > 0)

	const internalTrackIndex = ref<number>(props.currentTrackIndex ?? 0)

	watch(() => props.currentTrackIndex, (next) => {
		if (typeof next === 'number' && next !== internalTrackIndex.value) {
			internalTrackIndex.value = next
		}
	})

	const safeTrackIndex = computed<number>(() => {
		if (!hasPlaylist.value) return 0
		const total = props.playlist!.length
		if (total === 0) return 0
		const i = internalTrackIndex.value
		return ((i % total) + total) % total
	})

	const activeTrack = computed<IAudioTrack | undefined>(() => {
		if (!hasPlaylist.value) return undefined
		return props.playlist![safeTrackIndex.value]
	})

	/*********************************************************
	 * `pendingResumeOnLoad` carries the "user was playing when we
	 * swapped the track" intent across the async reload cycle:
	 *
	 *   1. Vue updates `<audio :src>` synchronously after
	 *      `setActiveTrack`.
	 *   2. The browser resets the audio element to a fresh state,
	 *      pausing playback and re-emitting `loadstart` /
	 *      `loadedmetadata` / `canplay` as the new track buffers.
	 *   3. Once `state.ready` flips back to true (= `canplay`), the
	 *      watch below kicks off `methods.play()` so the user
	 *      perceives an uninterrupted hand-off between tracks.
	 *
	 * Without this flag, clicking the next btn while playing would
	 * silently land on the new track in a paused state — the exact
	 * user-reported bug ("passé au next stop la lecture et
	 * impossible de la relancer").
	 ********************************************************/
	const pendingResumeOnLoad = ref<boolean>(false)

	function setActiveTrack (nextIndex: number): void {
		if (!hasPlaylist.value) return
		const total = props.playlist!.length
		if (total === 0) return
		const wrapped = ((nextIndex % total) + total) % total
		if (wrapped === safeTrackIndex.value) return

		// Snapshot the playback intent BEFORE we mutate the index —
		// the src swap is reactive and pauses playback before we get
		// another chance to read `state.playing`.
		if (state.playing.value) pendingResumeOnLoad.value = true

		internalTrackIndex.value = wrapped
		emit('update:currentTrackIndex', wrapped)
		const track = props.playlist![wrapped]
		if (track) emit('track-change', track, wrapped)
	}

	/*********************************************************
	 * Random pick — uniformly samples a playlist index from the
	 * (total - 1) non-current tracks. Guarantees the next track
	 * is always different from the current one, so shuffle always
	 * advances. The math `(cur + 1 + r) % total` with `r` uniform
	 * in `[0, total - 1)` enumerates every non-current index
	 * exactly once with equal probability.
	 ********************************************************/
	function pickRandomIndex (): number {
		const total = props.playlist?.length ?? 0
		if (total <= 1) return 0
		const cur = safeTrackIndex.value
		const offset = 1 + Math.floor(Math.random() * (total - 1))
		return (cur + offset) % total
	}

	function navigateRelative (delta: 1 | -1): void {
		if (!hasPlaylist.value) return
		const total = props.playlist!.length
		if (total === 0) return

		if (internalShuffle.value) {
			setActiveTrack(pickRandomIndex())
			return
		}

		let target = safeTrackIndex.value + delta
		if (target < 0 || target >= total) {
			if (resolvedLoopMode.value === 'all' || resolvedLoopMode.value === 'one') {
				target = ((target % total) + total) % total
			} else {
				return
			}
		}
		setActiveTrack(target)
	}

	/*********************************************************
	 * Loop mode (tri-state) + shuffle — v-modelled with the parent.
	 * `loopMode` cycle: 'none' → 'all' → 'one' → 'none'.
	 *
	 * Legacy `loop: true` maps to `loopMode='one'` at read-time when
	 * the consumer hasn't explicitly set `loopMode`.
	 ********************************************************/
	// Initialise the internal loop mode honouring the legacy `loop:true`
	// flag when the consumer hasn't passed an explicit `loopMode`.
	// `withDefaults` resolves `loopMode` to `'none'` by default, so we
	// only fall through to `'one'` when `loop:true` AND `loopMode` was
	// left at its default — never overriding an explicit `'none'`.
	const initialLoopMode: TAudioLoopMode =
		props.loopMode && props.loopMode !== 'none'
			? props.loopMode
			: (props.loop ? 'one' : 'none')

	const internalLoopMode = ref<TAudioLoopMode>(initialLoopMode)
	watch(() => props.loopMode, (next) => {
		if (next && next !== internalLoopMode.value) internalLoopMode.value = next
	})
	// Legacy `loop: boolean` flag — mirror runtime changes into the
	// tri-state mode so toggling `:loop="true"` from a parent checks
	// the loop button. Only fires when `loopMode` was not explicitly
	// set by the consumer (otherwise loopMode wins).
	watch(() => props.loop, (next) => {
		if (props.loopMode && props.loopMode !== 'none') return
		internalLoopMode.value = next ? 'one' : 'none'
		emit('update:loopMode', internalLoopMode.value)
	})

	const resolvedLoopMode = computed<TAudioLoopMode>(() => internalLoopMode.value)

	const internalShuffle = ref<boolean>(props.shuffle ?? false)
	watch(() => props.shuffle, (next) => {
		if (typeof next === 'boolean' && next !== internalShuffle.value) {
			internalShuffle.value = next
		}
	})

	/*********************************************************
	 * Source resolution — when a playlist is active the `<audio>`
	 * source comes from the active track; otherwise we fall back to
	 * the root `src` prop.
	 ********************************************************/
	const effectiveSrc = computed<string | IAudioSource | Array<IAudioSource> | undefined>(() => {
		if (hasPlaylist.value && activeTrack.value) return activeTrack.value.src
		return props.src
	})

	const singleSrc = computed<string | undefined>(() => {
		const s = effectiveSrc.value
		return typeof s === 'string' ? s : undefined
	})

	const resolvedSources = computed<Array<IAudioSource>>(() => {
		const s = effectiveSrc.value
		if (typeof s === 'string' || s == null) return []
		if (Array.isArray(s)) return s
		return [s]
	})

	const resolvedTracks = computed(() => props.tracks ?? [])

	/*********************************************************
	 * Composable
	 ********************************************************/
	const { audioRef, state, methods } = useAudioPlayer({
		autoplay: props.autoplay,
		muted: resolvedMuted.value,
		loop: props.loop,
		preload: props.preload
	})

	/*********************************************************
	 * Resume playback once the new track is ready — paired with
	 * `pendingResumeOnLoad` from `setActiveTrack`.
	 *
	 * We listen to the native `loadeddata` event on the <audio>
	 * element directly because the composable's `state.ready` flag
	 * doesn't flip back to `false` on `loadstart` (track swap), so
	 * it would never re-fire the false → true transition needed to
	 * drive a watcher. Subscribing to the DOM event gives us a
	 * deterministic "new track is buffered, you can play()" signal
	 * exactly once per track change.
	 ********************************************************/
	watch(audioRef, (el, _prev, onCleanup) => {
		if (!el) return
		const onLoadedData = () => {
			if (!pendingResumeOnLoad.value) return
			pendingResumeOnLoad.value = false
			methods.play()
		}
		el.addEventListener('loadeddata', onLoadedData)
		onCleanup(() => el.removeEventListener('loadeddata', onLoadedData))
	}, { immediate: true })

	/*********************************************************
	 * Reactive autoplay — the native `autoplay` attribute only acts at load
	 * time, so flipping the prop after the element mounted (e.g. ticking the
	 * control) would do nothing. React to `resolvedAutoplay` going truthy and
	 * actually start playback. It plays muted (`resolvedMuted`, browser policy)
	 * and stays suppressed under `prefers-reduced-motion` (a11y) since
	 * `resolvedAutoplay` already accounts for it.
	 ********************************************************/
	watch(resolvedAutoplay, (on) => {
		if (on) void methods.play()
	})

	/*********************************************************
	 * Native event handlers — forward to the parent emit pipeline.
	 ********************************************************/
	function onTimeUpdate (event: Event): void {
		emit('timeupdate', event)
	}

	function onVolumeChange (event: Event): void {
		emit('volumechange', event)
	}

	function onLoadedMetadata (event: Event): void {
		emit('loadedmetadata', event)
	}

	function onErrorEvent (event: Event): void {
		emit('error', state.error.value ?? event)
	}

	/*********************************************************
	 * Metadata strip — hides itself when title/artist/album are
	 * absent. Cover figure renders separately so the cover can still
	 * stand on its own if the consumer only passes an image.
	 ********************************************************/
	const resolvedTitle = computed<string | undefined>(() => activeTrack.value?.title ?? props.title)
	const resolvedArtist = computed<string | undefined>(() => activeTrack.value?.artist ?? props.artist)
	const resolvedAlbum = computed<string | undefined>(() => activeTrack.value?.album ?? props.album)

	const resolvedCover = computed<string | undefined>(() => {
		if (activeTrack.value?.cover) return activeTrack.value.cover
		if (!props.cover) return undefined
		if (typeof props.cover === 'string') return props.cover
		return props.cover.src
	})

	const coverAlt = computed<string>(() => {
		const t = resolvedTitle.value
		const a = resolvedArtist.value
		if (t && a) return `${ t } — ${ a }`
		if (t) return t
		return ''
	})

	const hasCover = computed<boolean>(() => Boolean(resolvedCover.value))

	/*********************************************************
	 * Cover size — `<origam-img>` needs explicit `width` / `height`
	 * attribute values to clamp its inner `<img>` (CSS scoped on
	 * the parent doesn't pierce the wrapper). Resolved at the parent
	 * level from the variant — 96px for `expanded`, 48px for `compact`.
	 ********************************************************/
	const coverSizePx = computed<number>(() => (isCompactVariant.value ? 48 : 96))

	const hasMetadata = computed<boolean>(() => {
		return Boolean(resolvedTitle.value || resolvedArtist.value || resolvedAlbum.value)
	})
	const hasMetaLine = computed<boolean>(() => {
		return Boolean(resolvedArtist.value || resolvedAlbum.value || hasDurationLabel.value)
	})

	const hasDurationLabel = computed<boolean>(() => {
		return Number.isFinite(state.duration.value) && state.duration.value > 0
	})

	const formattedDuration = computed<string>(() => formatMediaTime(state.duration.value))

	/*********************************************************
	 * Waveform — decoded on the fly via `useWaveform`. The waveform
	 * mini scrubber lives between the metadata header and the
	 * transport row in the EXPANDED variant; the COMPACT variant
	 * hides it to keep the dock height tight.
	 ********************************************************/
	const waveformEnabled = computed<boolean>(() => {
		if (isCompactVariant.value) return false
		if (props.waveform === true) return true
		if (props.waveform === 'auto') {
			if (typeof window === 'undefined') return false
			const win = window as unknown as { OfflineAudioContext?: unknown }
			return Boolean(win.OfflineAudioContext)
		}
		return false
	})

	const showWaveform = computed<boolean>(() => waveformEnabled.value || isExpandedVariant.value)

	const waveformSrc = computed<string | undefined>(() => {
		if (!waveformEnabled.value) return undefined
		if (typeof props.src === 'string') return props.src
		if (Array.isArray(props.src)) return props.src[0]?.src
		return props.src?.src
	})

	const { peaks } = useWaveform(waveformSrc, {
		bins: 200,
		crossOrigin: props.crossorigin === 'use-credentials' || props.crossorigin === 'anonymous'
			? props.crossorigin
			: undefined
	})

	watch(peaks, (next) => {
		if (next.length > 0) emit('waveform', next)
	})

	/*********************************************************
	 * Displayed peaks — the audio variant of `<OrigamSliderField>`
	 * only paints its waveform SVG when the `peaks` array is non-empty.
	 * Real peaks come from `useWaveform` which depends on a successful
	 * `OfflineAudioContext.decodeAudioData()`. The decode fails silently
	 * on CORS-blocked or HLS sources — the visual identity of the
	 * scrubber would collapse back to a hairline (Stemtracks loses its
	 * signature). We seed a deterministic synthetic waveform (sum of
	 * three sine waves, ~120 bars, values 0.15-1.0) so the audio
	 * scrubber ALWAYS reads as "audio" at a glance, then overwrites
	 * with real peaks as soon as `useWaveform` resolves.
	 ********************************************************/
	const SYNTHETIC_PEAKS_COUNT = 120
	const syntheticPeaks: ReadonlyArray<number> = (() => {
		const out: Array<number> = []
		for (let i = 0; i < SYNTHETIC_PEAKS_COUNT; i++) {
			const t = i / SYNTHETIC_PEAKS_COUNT
			const w =
				Math.sin(t * Math.PI * 7) * 0.5 +
				Math.sin(t * Math.PI * 13 + 1.2) * 0.3 +
				Math.sin(t * Math.PI * 29 + 0.4) * 0.2
			out.push(0.55 + w * 0.42)
		}
		return out.map(v => Math.max(0.12, Math.min(1, Math.abs(v))))
	})()

	const displayedPeaks = computed<ReadonlyArray<number>>(() => {
		if (peaks.value && peaks.value.length > 0) return peaks.value
		return syntheticPeaks
	})

	/*********************************************************
	 * Scrubber math — both the waveform mini scrubber AND the inline
	 * timer scrubber share the same `max` (clamped to a finite
	 * duration) and seek handler.
	 ********************************************************/
	const scrubberMax = computed<number>(() => {
		return Number.isFinite(state.duration.value) ? state.duration.value : 0
	})

	function onWaveformSeek (value: number | Array<number>): void {
		if (Array.isArray(value)) return
		methods.seek(value)
	}

	function formatTimeTooltip (seconds: number): string {
		return formatMediaTime(seconds)
	}

	/*********************************************************
	 * Transport handlers — previous / next bubbled from
	 * `<origam-media-controller>` are handled here (we own the
	 * playlist + skip-time policy). Play / pause / mute / volume
	 * are routed by MediaController directly through `methods.*`.
	 ********************************************************/
	function onPrevious (): void {
		emit('previous')
		if (hasPlaylist.value) {
			navigateRelative(-1)
		} else {
			methods.skipBackward(10)
		}
	}

	function onNext (): void {
		emit('next')
		if (hasPlaylist.value) {
			navigateRelative(1)
		} else {
			methods.skipForward(10)
		}
	}

	/*********************************************************
	 * Native `<audio>` loop attribute — mapped from the resolved
	 * loop mode. `'one'` sets the native `loop` flag so the same
	 * track restarts on `ended` without our intervention. `'all'`
	 * keeps `loop=false` and triggers a programmatic `next` on
	 * `ended` to advance through the playlist; on the last track
	 * we wrap to the first. `'none'` lets playback stop after the
	 * last track.
	 ********************************************************/
	const audioLoopAttr = computed<boolean>(() => resolvedLoopMode.value === 'one')

	function onNativeEnded (): void {
		emit('ended')
		if (resolvedLoopMode.value === 'one') return
		if (!hasPlaylist.value) return
		const total = props.playlist!.length
		if (total === 0) return

		if (internalShuffle.value) {
			setActiveTrack(pickRandomIndex())
			void nextTick(() => { void methods.play() })
			return
		}

		const cur = safeTrackIndex.value
		const target = cur + 1
		if (target < total) {
			setActiveTrack(target)
			void nextTick(() => { void methods.play() })
		} else if (resolvedLoopMode.value === 'all') {
			setActiveTrack(0)
			void nextTick(() => { void methods.play() })
		}
	}


	/*********************************************************
	 * Download URL resolution — single-source playback means we
	 * always know the active URL; multi-source arrays fall back to
	 * the first entry. Forwarded to `<origam-media-controller>` via
	 * its `:download-url` prop. The Controller emits `download` when
	 * the listener clicks the row; we re-emit with the URL payload
	 * for v0.x consumers.
	 ********************************************************/
	const downloadUrl = computed<string | null>(() => {
		const src = effectiveSrc.value
		if (typeof src === 'string') return src || null
		if (Array.isArray(src)) {
			const first = src[0]
			return first?.src ?? null
		}
		return src?.src ?? null
	})

	function onDownloadClick (): void {
		const url = downloadUrl.value
		if (!url) return
		emit('download', url)
	}

	/*********************************************************
	 * Apply initial playback rate (prop) once metadata is ready.
	 ********************************************************/
	watch(() => props.playbackRate, (rate) => {
		if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
			methods.setPlaybackRate(rate)
		}
	}, { immediate: true })

	/*********************************************************
	 * Forward playback-rate updates from `<origam-media-controller>`'s
	 * config menu through our public emit pipeline so v-model'ing
	 * `:playback-rate` on `<origam-audio>` keeps working.
	 ********************************************************/
	watch(() => state.playbackRate.value, (rate) => {
		emit('update:playbackRate', rate)
	})

	/*********************************************************
	 * Error formatting for the default error overlay.
	 ********************************************************/
	const errorMessage = computed<string>(() => {
		const err = state.error.value
		if (!err) return 'Playback error'
		if ('message' in err && err.message) return err.message
		return 'Playback error'
	})

	/*********************************************************
	 * Wrapper chrome — every canonical DS transverse composable.
	 * The SCSS host carries the dark studio backdrop by default;
	 * `bgColor` overrides it when the consumer provides an intent
	 * or hex.
	 ********************************************************/
	/*********************************************************
	 * `useColorEffect` resolves color + bgColor TOGETHER so that
	 * passing `bgColor="primary"` automatically pairs with the
	 * intent's WCAG-validated foreground token (no invisible
	 * text on dark intent surfaces). The composable falls back
	 * to inline `:style` declarations for raw hex/rgb values
	 * and keeps the resting tokens whenever both props are
	 * supplied so the consumer's intent is always respected.
	 ********************************************************/
	const { colorClasses, colorStyles } = useColorEffect(props)
	const hasColorProp = computed(() => !!props.color)
	const hasBgColorProp = computed(() => !!props.bgColor)
	const scrubberColorStyle = computed<Record<string, string>>(() => {
		// When the consumer sets `color` (or `bgColor`, which auto-pairs
		// its fg via `useColorEffect`), the scrubber adopts the resulting
		// `currentColor`. With NO color prop, the scrubber stays neutral
		// grey so it doesn't compete with the play-button accent.
		if (hasColorProp.value || hasBgColorProp.value) {
			return {'--origam-media-controller__scrubber---color': 'currentColor'}
		}
		return {'--origam-media-controller__scrubber---color': 'var(--origam-color__text---secondary, color-mix(in srgb, currentColor 55%, transparent))'}
	})
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { borderClasses, borderStyles } = useBorder(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { positionClasses, positionStyles } = usePosition(props)
	const { dimensionStyles } = useDimension(props)

	/*********************************************************
	 * Typography — per-surface tokens. One useTypography call per
	 * CSS-variable namespace read by the SCSS:
	 *   audio__title  → font-size, font-weight, line-height (all read)
	 *   audio__meta   → font-size only
	 *   audio__loading / audio--error → font-size only (état overlays)
	 * useColorEffect drives color; typographyStyles only sets font vars.
	 ********************************************************/
	const { typographyStyles: typographyTitleStyles } = useTypography(props, 'audio__title')
	const { typographyStyles: typographyMetaStyles } = useTypography(props, 'audio__meta')
	const { typographyStyles: typographyLoadingStyles } = useTypography(props, 'audio__loading')
	const { typographyStyles: typographyErrorStyles } = useTypography(props, 'audio--error')

	/*********************************************************
	 * Class & Style — Strategy A: classes win for tokenised values,
	 * inline styles win for raw CSS, both bind in parallel.
	 ********************************************************/
	const variantClassName = computed<string>(() => `origam-audio--${ isCompactVariant.value ? 'compact' : 'expanded' }`)

	const rootClasses = computed(() => [
		variantClassName.value,
		`origam-audio--cover-${ props.coverPosition }`,
		{
			'origam-audio--playing': state.playing.value,
			'origam-audio--paused': state.paused.value,
			'origam-audio--loading': state.loading.value,
			'origam-audio--error': state.error.value !== null,
			'origam-audio--controls-native': isNativeControls.value,
			'origam-audio--controls-custom': isCustomControls.value,
			'origam-audio--has-cover': hasCover.value,
			'origam-audio--has-waveform': showWaveform.value
		},
		positionClasses.value,
		...colorClasses.value,
		{
			'origam-audio--has-color': hasColorProp.value,
			'origam-audio--has-bg-color': hasBgColorProp.value
		},
		...roundedClasses.value,
		...borderClasses.value,
		...paddingClasses.value,
		...marginClasses.value,
		...elevationClasses.value,
		props.class
	])

	const rootStyles = computed<StyleValue>(() => [
		positionStyles.value,
		colorStyles.value,
		scrubberColorStyle.value,
		roundedStyles.value,
		borderStyles.value,
		paddingStyles.value,
		marginStyles.value,
		elevationStyles.value,
		dimensionStyles.value,
		props.style
	] as StyleValue)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		audioRef,
		state,
		methods
	})
</script>

<style
		lang="scss"
		scoped
>
	@keyframes origam-audio-vinyl-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.origam-audio {
		$this: &;

		display: flex;
		flex-direction: column;
		position: var(--origam-audio---position, static);
		padding: var(--origam-audio---padding, 16px);
		border-radius: var(--origam-audio---border-radius, var(--origam-radius---lg, 12px));
		color: var(--origam-audio---color, var(--origam-color__text---primary));
		background-color: var(--origam-audio---background-color, var(--origam-color__surface---raised));
		accent-color: var(--origam-audio---accent-color, var(--origam-color__action--primary---bg));
		border: var(--origam-audio---border-width, 1px) solid var(--origam-audio---border-color, var(--origam-color__border---subtle));
		box-shadow: var(--origam-audio---box-shadow, 0px 1px 3px 0px rgba(0, 0, 0, 0.06), 0px 1px 2px -1px rgba(0, 0, 0, 0.06));

		&--rounded-shaped {
			border-start-start-radius: var(--origam-audio---border-radius, var(--origam-radius---lg, 12px));
			border-start-end-radius: 0;
			border-end-start-radius: 0;
			border-end-end-radius: var(--origam-audio---border-radius, var(--origam-radius---lg, 12px));
		}

		&--rounded-shaped-invert {
			border-start-start-radius: 0;
			border-start-end-radius: var(--origam-audio---border-radius, var(--origam-radius---lg, 12px));
			border-end-start-radius: var(--origam-audio---border-radius, var(--origam-radius---lg, 12px));
			border-end-end-radius: 0;
		}

		&__controller {
			flex: 1 1 auto;
			min-height: 0;

			:deep(.origam-media-controller__progress-row) {
				flex: 1 1 auto;
				display: flex;
				flex-direction: column;
				justify-content: center;
			}

			:deep(.origam-media-controller__buttons-row) {
				margin-block-start: auto;
			}
		}

		:deep(.origam-slider-field--bare) {
			color: inherit !important;
		}

		&__el {
			display: block;
			width: 100%;
		}

		&__header {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: var(--origam-audio__header---gap, 16px);
			align-items: center;
			margin-bottom: var(--origam-audio__header---margin-bottom, 12px);

			&--no-cover {
				grid-template-columns: 1fr;
			}
		}

		&__cover {
			margin: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 0 0 auto;
			position: relative;
			width: var(--origam-audio__cover---size, 96px);
			height: var(--origam-audio__cover---size, 96px);
			border-radius: 50%;
			overflow: hidden;
			box-shadow:
				0 4px 12px rgba(0, 0, 0, 0.28),
				inset 0 0 0 1px rgba(0, 0, 0, 0.4);

			/*
			 * Vinyl body fallback — a fixed dark disc behind the album art so a
			 * transparent / not-yet-loaded image never lets the surface colour
			 * bleed through the record.
			 */
			background: var(--origam-audio__cover---background, #18181b);

			/*
			 * Spindle hole — a real transparent dot punched THROUGH the
			 * whole disc (image + grooves + label) so the audio shell
			 * background (or whatever is rendered behind it) shows
			 * through. Implemented with a CSS `mask` that fills the
			 * disc with opaque black except for a small radial cutout
			 * at the centre. Prefix variant covers Safari ≤ 15.
			 */
			--origam-audio__cover---spindle-radius: 3%;

			mask:
				radial-gradient(
					circle at center,
					transparent 0,
					transparent var(--origam-audio__cover---spindle-radius),
					black calc(var(--origam-audio__cover---spindle-radius) + 0.5%),
					black 100%
				);
			-webkit-mask:
				radial-gradient(
					circle at center,
					transparent 0,
					transparent var(--origam-audio__cover---spindle-radius),
					black calc(var(--origam-audio__cover---spindle-radius) + 0.5%),
					black 100%
				);
		}

		&__cover-img {
			display: block;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			object-fit: cover;
		}

		/*
		 * Vinyl-record overlay — pure CSS, no extra DOM.
		 *
		 *   ::before draws the concentric grooves with a
		 *     `repeating-radial-gradient` of thin, translucent dark
		 *     bands. The gradient repeats every 4 px from the center,
		 *     giving 8–12 visible rings at 96 px and proportionally
		 *     scaling with `--origam-audio__cover---size`.
		 *
		 *   ::after draws the center label disc: a black ring with a
		 *     small transparent spindle hole punched through the
		 *     middle via a radial-gradient mask. The ring sits on
		 *     top of the album art, framing it as the "label" of the
		 *     record.
		 *
		 * Both pseudo-elements are `pointer-events: none` so the user
		 * can still interact with the image / play-btn underneath.
		 */
		&__cover::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: 50%;
			pointer-events: none;
			background:
				repeating-radial-gradient(
					circle at center,
					rgba(0, 0, 0, 0.32) 0,
					rgba(0, 0, 0, 0.32) 1px,
					transparent 1px,
					transparent 6px
				);
			mix-blend-mode: multiply;
		}

		&__cover::after {
			/*
			 * Label disc — solid black ring framing the spindle hole.
			 * The hole itself is no longer drawn by this pseudo: the
			 * mask on `.origam-audio__cover` punches a real transparent
			 * dot through this disc + image + grooves at the exact
			 * centre, so we get a single continuous see-through hole.
			 */
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 26%;
			height: 26%;
			border-radius: 50%;
			background: #0a0a0a;
			box-shadow:
				inset 0 0 0 1px rgba(255, 255, 255, 0.06),
				0 0 6px rgba(0, 0, 0, 0.35);
			pointer-events: none;
		}

		/*
		 * Spin the disc while playing, freeze when paused. Real LPs
		 * spin at 33⅓ RPM (≈ 1.8 s per turn); we use 3.5 s for a
		 * gentler perceptual motion that doesn't compete with the
		 * scrubber updates.
		 */
		&--playing &__cover {
			animation: origam-audio-vinyl-spin 3.5s linear infinite;
		}

		&--paused &__cover,
		&--loading &__cover {
			animation: origam-audio-vinyl-spin 3.5s linear infinite;
			animation-play-state: paused;
		}

		@media (prefers-reduced-motion: reduce) {
			&__cover {
				animation: none !important;
			}
		}

		&__metadata {
			display: flex;
			flex-direction: column;
			min-width: 0;
			gap: var(--origam-audio__metadata---gap, 2px);
		}

		&__title {
			font-size: var(--origam-audio__title---font-size, 18px);
			font-weight: var(--origam-audio__title---font-weight, 700);
			line-height: var(--origam-audio__title---line-height, 1.25);
			color: var(--origam-audio__title---color, inherit);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&__meta {
			display: inline-flex;
			flex-wrap: wrap;
			align-items: baseline;
			gap: var(--origam-audio__meta---gap, 6px);
			font-size: var(--origam-audio__meta---font-size, 13px);
			color: var(--origam-audio__meta---color, color-mix(in srgb, currentColor 60%, transparent));
			min-width: 0;
		}

		&__artist,
		&__album,
		&__duration {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			min-width: 0;
		}

		&__artist + &__album::before,
		&__artist + &__duration::before,
		&__album + &__duration::before {
			content: var(--origam-audio__meta-separator---content, "·");
			margin-inline-end: 6px;
			opacity: 0.6;
		}

		&__waveform {
			display: block;
			width: 100%;
			--origam-slider-field--audio---track-height: var(--origam-audio__waveform---height, 56px);
		}

		&__waveform-slider {
			width: 100%;
			color: var(--origam-audio__waveform---color, color-mix(in srgb, currentColor 50%, transparent));
		}

		&__transport {
			display: flex;
			align-items: center;
			gap: var(--origam-audio__transport---gap, 8px);
			min-height: var(--origam-audio__transport---min-height, 48px);
		}

		&__nav-btn {
			all: unset;
			box-sizing: border-box;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: var(--origam-audio__nav-btn---size, 32px);
			height: var(--origam-audio__nav-btn---size, 32px);
			border-radius: var(--origam-audio__nav-btn---border-radius, 50%);
			cursor: pointer;
			color: var(--origam-audio__nav-btn---color, inherit);
			opacity: 0.85;
			transition: background-color 120ms ease, opacity 120ms ease, transform 120ms ease;

			&:hover,
			&:focus-visible {
				opacity: 1;
				background-color: var(--origam-audio__nav-btn---hover-background-color, color-mix(in srgb, currentColor 8%, transparent));
			}

			&:active {
				transform: scale(0.92);
			}

			&--active {
				color: var(--origam-audio---accent-color, var(--origam-color__accent---base));
				opacity: 1;
				background-color: var(--origam-audio__nav-btn--active---background-color, color-mix(in srgb, var(--origam-audio---accent-color, var(--origam-color__accent---base)) 18%, transparent));
				position: relative;

				&::after {
					content: '';
					position: absolute;
					bottom: 3px;
					left: 50%;
					transform: translateX(-50%);
					width: 4px;
					height: 4px;
					border-radius: 50%;
					background: var(--origam-audio---accent-color, var(--origam-color__accent---base));
					pointer-events: none;
				}
			}

			&--loop-one {
				color: var(--origam-audio---accent-color, var(--origam-color__accent---base));
			}
		}

		&__play-btn {
			--origam-media-play-btn---size: var(--origam-audio__play-btn---size, 48px);
			--origam-media-play-btn---icon-size: var(--origam-audio__play-btn---icon-size, 24px);
			--origam-media-play-btn---color: var(--origam-audio__play-btn---color, var(--origam-audio---accent-color, var(--origam-color__accent---base)));
		}

		&__time {
			--origam-media-time-label---color: var(--origam-audio__time---color, inherit);
		}

		&__spacer {
			flex: 1 1 auto;
			min-width: 0;
		}

		&__volume,
		&__cast,
		&__config {
			flex: 0 0 auto;
		}

		&__loading {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			color: var(--origam-audio__loading---color, inherit);
			font-size: var(--origam-audio__loading---font-size, 0.875rem);
			grid-column: 1 / -1;
		}

		&__error {
			display: inline-flex;
			align-items: center;
			gap: var(--origam-audio--error---gap, 6px);
			padding: var(--origam-audio--error---padding, 8px 12px);
			background-color: var(--origam-audio--error---background-color, var(--origam-color__status--error--bg, transparent));
			color: var(--origam-audio--error---color, var(--origam-color__status--error---color, inherit));
			border-radius: var(--origam-audio--error---border-radius, var(--origam-radius---sm, 4px));
			font-size: var(--origam-audio--error---font-size, 0.875rem);
			grid-column: 1 / -1;
		}

		&__error-icon {
			font-size: var(--origam-audio--error---icon-font-size, 1.1rem);
		}

		&__playlist {
			max-height: var(--origam-audio__playlist---max-height, 220px);
			overflow-y: auto;
			border-top: 1px solid var(--origam-audio__playlist---border-color, color-mix(in srgb, currentColor 8%, transparent));
			padding-top: var(--origam-audio__playlist---padding-top, 8px);
			margin-top: var(--origam-audio__playlist---margin-top, 12px);
			background-color: transparent;

			/*
			 * Playlist inherits the host's resolved color/bgColor:
			 * `transparent` background + `color: inherit` lets the
			 * playlist visually adopt whatever the consumer set on
			 * the audio shell (intent surface, custom hex, dark
			 * theme, …) without needing a dedicated set of tokens.
			 */
			:deep(.origam-list),
			:deep(.origam-list-item) {
				background-color: transparent;
				color: inherit;
			}

			:deep(.origam-list-item__content),
			:deep(.origam-list-item__title),
			:deep(.origam-list-item__subtitle) {
				color: inherit;
			}

			:deep(.origam-list-item__subtitle) {
				opacity: 0.7;
			}
		}

		&__playlist-item {
			cursor: pointer;
			border-radius: 6px;
			transition: background-color 120ms ease, color 120ms ease;

			/* Breathing room between the avatar and the content (title /
			   subtitle). Pre-fix the OrigamListItem grid put them flush. */
			:deep(.origam-list-item__prepend) {
				margin-inline-end: var(--origam-audio__playlist-item__prepend---margin-inline-end, 12px);
			}

			/*
			 * Vinyl decoration on the playlist avatar — same recipe as
			 * the main audio cover (concentric grooves + center label
			 * with spindle hole). The avatar is a small square that
			 * becomes circular here.
			 */
			:deep(.origam-avatar) {
				position: relative;
				border-radius: 50%;
				overflow: hidden;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);

				/* Spindle hole punched through the avatar (mirror of
				   the main cover — see comment block on `&__cover`). */
				mask:
					radial-gradient(
						circle at center,
						transparent 0,
						transparent 3.5%,
						black 4%,
						black 100%
					);
				-webkit-mask:
					radial-gradient(
						circle at center,
						transparent 0,
						transparent 3.5%,
						black 4%,
						black 100%
					);
			}

			:deep(.origam-avatar__image),
			:deep(.origam-avatar__wrapper) {
				border-radius: 50%;
			}

			:deep(.origam-avatar)::before {
				content: '';
				position: absolute;
				inset: 0;
				border-radius: 50%;
				pointer-events: none;
				background:
					repeating-radial-gradient(
						circle at center,
						rgba(0, 0, 0, 0.32) 0,
						rgba(0, 0, 0, 0.32) 1px,
						transparent 1px,
						transparent 5px
					);
				mix-blend-mode: multiply;
				z-index: 1;
			}

			:deep(.origam-avatar)::after {
				/* Solid label disc; real spindle hole is punched by
				   the `mask` on `.origam-avatar` itself. */
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 28%;
				height: 28%;
				border-radius: 50%;
				background: #0a0a0a;
				pointer-events: none;
				z-index: 2;
			}

			&:hover {
				background-color: color-mix(in srgb, currentColor 8%, transparent);
			}

			&.origam-list-item--active {
				background-color: color-mix(in srgb, currentColor 16%, transparent);

				:deep(.origam-list-item__content),
				:deep(.origam-list-item__title) {
					color: inherit;
				}
			}
		}

		&__playlist-artist {
			font-size: 12px;
			opacity: 0.65;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&__playlist-duration {
			font-variant-numeric: tabular-nums;
			font-size: 12px;
			opacity: 0.6;
			flex: 0 0 auto;
		}

		/*
		 * Visual hierarchy applied to EVERY variant (expanded, compact)
		 * so the play btn always reads as the primary action.
		 *
		 *   - Secondary actions (loop, shuffle, volume, cog, prev, next):
		 *     square 24×24 (compact) / 32×32 (expanded) with icons sized
		 *     at ~75 % of the frame.
		 *   - Play btn: exactly 2× the secondary size — 48×48 (compact)
		 *     / 64×64 (expanded) — mirrors Spotify / YouTube Music. The
		 *     icon also doubles in size to keep the visual hierarchy
		 *     unambiguous (no perceptible difference when the frame
		 *     grows but the glyph stays the same).
		 *
		 * `density="compact"` on `<origam-btn>` subtracts 8 px from
		 * `--origam-btn---height`, so we neutralise it
		 * (`--origam-btn---density: 0px`) AND force `min-width` /
		 * `min-height` so OrigamBtn's calc keeps our values.
		 *
		 * `!important` is used here on purpose: OrigamBtn ships its own
		 * `--origam-btn---*` defaults through a `&--icon` modifier rule
		 * with the same specificity (`.origam-btn--icon`), and source
		 * order alone is fragile across HMR reloads — `!important` makes
		 * the audio hierarchy robust regardless of when the host
		 * stylesheet lands in the cascade.
		 */
		:deep(.origam-media-controller__buttons-row .origam-btn) {
			--origam-btn---density: 0px !important;
			--origam-btn---min-width: var(--origam-audio__btn---size, 28px) !important;
			--origam-btn---width: var(--origam-audio__btn---size, 28px) !important;
			--origam-btn---height: var(--origam-audio__btn---size, 28px) !important;
			--origam-btn---min-height: var(--origam-audio__btn---size, 28px) !important;

			.origam-icon {
				font-size: var(--origam-audio__btn---icon-size, 16px) !important;
			}
		}

		/*
		 * The volume control is NOT an `<origam-btn>` — it's a raw
		 * `<button class="origam-media-volume-control__btn">` exposed
		 * by `OrigamMediaVolumeControl` (which owns its own scrubber
		 * popover). Its native scoped CSS ships a 36 × 36 frame with a
		 * 20 px icon — too prominent next to our 24 / 14 secondaries.
		 * Align the volume btn on the same secondary footprint so the
		 * row visually flattens around the dominant play btn.
		 */
		:deep(.origam-media-controller__buttons-row .origam-media-volume-control__btn) {
			width: var(--origam-audio__btn---size, 28px) !important;
			height: var(--origam-audio__btn---size, 28px) !important;
			min-width: var(--origam-audio__btn---size, 28px) !important;
			min-height: var(--origam-audio__btn---size, 28px) !important;

			.origam-icon {
				font-size: var(--origam-audio__btn---icon-size, 16px) !important;
			}
		}

		:deep(.origam-media-controller__buttons-row .origam-btn.origam-media-controller__play-btn) {
			--origam-btn---min-width: var(--origam-audio__play-btn---size, 64px) !important;
			--origam-btn---width: var(--origam-audio__play-btn---size, 64px) !important;
			--origam-btn---height: var(--origam-audio__play-btn---size, 64px) !important;
			--origam-btn---min-height: var(--origam-audio__play-btn---size, 64px) !important;

			.origam-icon {
				font-size: var(--origam-audio__play-btn---icon-size, 48px) !important;
			}
		}

		&--controls-custom #{$this}__el {
			display: none;
		}

		&--controls-native #{$this}__el {
			display: block;
		}

		&--cover-right {
			#{$this}__header {
				grid-template-columns: 1fr auto;
			}

			#{$this}__cover {
				grid-column: 2;
				grid-row: 1;
			}

			#{$this}__metadata {
				grid-column: 1;
				grid-row: 1;
			}
		}

		&--has-color,
		&--has-bg-color {
			#{$this}__waveform-slider,
			#{$this}__title {
				color: inherit;
			}

			#{$this}__meta {
				color: color-mix(in srgb, currentColor 78%, transparent);
			}

			#{$this}__artist {
				color: color-mix(in srgb, currentColor 82%, transparent);
			}

			#{$this}__album,
			#{$this}__duration {
				color: color-mix(in srgb, currentColor 70%, transparent);
			}

			:deep(.origam-media-controller) {
				color: inherit;
			}
		}

		&--compact {
			padding: var(--origam-audio--compact---padding, 8px 12px);
			/*
			 * Compact mode pins the progress bar (`position: absolute`)
			 * to the bottom edge, which requires a positioned ancestor.
			 * When the consumer didn't pass `position="…"` we promote
			 * the box to `relative` via the CSS variable so the
			 * progress anchoring still works; if `position="sticky"`
			 * (or any other modifier) is set, the modifier rule below
			 * the variant block overrides this default.
			 */
			--origam-audio---position: relative;
			overflow: hidden;

			/*
			 * Size the DISC (not the inner image) for compact. Sizing only
			 * `__cover-img` left the disc at its base 96px with a 48px image
			 * centred inside, so the exposed outer ring rendered as a large
			 * "floating grooves" disc (and bled the surface colour through).
			 * The image fills the disc via its base `width/height: 100%`.
			 */
			#{$this}__cover {
				width: var(--origam-audio--compact__cover---size, 48px);
				height: var(--origam-audio--compact__cover---size, 48px);
			}

			#{$this}__metadata {
				flex-direction: row;
				align-items: baseline;
				gap: var(--origam-audio--compact__metadata---gap, 8px);
				flex-wrap: wrap;
			}

			#{$this}__title {
				font-size: var(--origam-audio--compact__title---font-size, 14px);
			}

			#{$this}__playlist {
				display: none;
			}

			:deep(.origam-media-controller) {
				display: grid;
				grid-template-columns: 1fr auto;
				grid-template-areas: "header transport";
				gap: 0 8px;
				padding: 0;

				> #{$this}__header {
					grid-area: header;
					margin-bottom: 0;
					align-items: center;
					gap: var(--origam-audio--compact__header---gap, 12px);
				}
			}

			:deep(.origam-media-controller__buttons-row) {
				grid-area: transport;
				min-height: 0;
				padding: 0 0 4px 0;
				gap: 2px;
				align-self: center;
			}

			:deep(.origam-media-controller__buttons-left),
			:deep(.origam-media-controller__buttons-right) {
				gap: 0;
			}

			/*
			 * Visual hierarchy in the compact dock:
			 *   - secondary actions (loop, shuffle, volume, cog, prev, next)
			 *     shrink to a square 24×24 footprint so the row stays dense;
			 *   - the play btn becomes the unique anchor at 48×48 — exactly
			 *     2× the secondary size, mirroring Spotify / YouTube Music
			 *     mini-players.
			 *
			 * `density="compact"` on `<origam-btn>` subtracts 8 px from
			 * `--origam-btn---height`, so we neutralise it on the play btn
			 * (`--origam-btn---density: 0px`) AND force `min-height` /
			 * `min-width` so the calc inside OrigamBtn keeps the 48 px.
			 */
			:deep(.origam-media-controller__buttons-row .origam-btn) {
				--origam-btn---density: 0px !important;
				--origam-btn---min-width: var(--origam-audio--compact__btn---size, 24px) !important;
				--origam-btn---width: var(--origam-audio--compact__btn---size, 24px) !important;
				--origam-btn---height: var(--origam-audio--compact__btn---size, 24px) !important;
				--origam-btn---min-height: var(--origam-audio--compact__btn---size, 24px) !important;

				.origam-icon {
					font-size: var(--origam-audio--compact__btn---icon-size, 14px) !important;
				}
			}

			/* Volume btn (raw `<button>`, see comment in the root rule) */
			:deep(.origam-media-controller__buttons-row .origam-media-volume-control__btn) {
				width: var(--origam-audio--compact__btn---size, 24px) !important;
				height: var(--origam-audio--compact__btn---size, 24px) !important;
				min-width: var(--origam-audio--compact__btn---size, 24px) !important;
				min-height: var(--origam-audio--compact__btn---size, 24px) !important;

				.origam-icon {
					font-size: var(--origam-audio--compact__btn---icon-size, 14px) !important;
				}
			}

			:deep(.origam-media-controller__buttons-row .origam-btn.origam-media-controller__play-btn) {
				--origam-btn---min-width: var(--origam-audio--compact__play-btn---size, 56px) !important;
				--origam-btn---width: var(--origam-audio--compact__play-btn---size, 56px) !important;
				--origam-btn---height: var(--origam-audio--compact__play-btn---size, 56px) !important;
				--origam-btn---min-height: var(--origam-audio--compact__play-btn---size, 56px) !important;

				.origam-icon {
					font-size: var(--origam-audio--compact__play-btn---icon-size, 40px) !important;
				}
			}

			:deep(.origam-media-controller__time) {
				display: none;
			}

			/*
			 * Compact progress — pinned to the bottom edge of the audio shell,
			 * spanning the full width so it reads as part of the chrome
			 * (mirrors the OrigamCard top-edge progress, here on the bottom).
			 * The audio shell has `position: relative` + `overflow: hidden`,
			 * so the bar follows the rounded-corner clip without extra rules.
			 */
			:deep(.origam-media-controller__progress-row) {
				position: absolute;
				inset-inline: 0;
				inset-block-end: 0;
				width: 100%;
				margin: 0;
				padding: 0;
				height: var(--origam-audio--compact__progress---height, 3px);
				z-index: 1;
				pointer-events: auto;

				.origam-slider-field {
					--origam-slider-field--bare---track-thickness: var(--origam-audio--compact__progress---height, 3px);
					--origam-slider-field--bare---track-thickness-active: var(--origam-audio--compact__progress---height, 3px);
					--origam-slider-field--bare---track-background-color: color-mix(in srgb, currentColor 22%, transparent);
					width: 100%;
					height: var(--origam-audio--compact__progress---height, 3px);
					/*
					 * `.origam-slider-field--horizontal` ships with
					 * `margin-inline: 8px 8px` for native sliders; in the
					 * compact docked-progress role we need the bar to bleed
					 * edge-to-edge so it reads as part of the chrome.
					 */
					margin-inline: 0;
				}

				.origam-slider-field__input {
					inset-inline-start: 0;
				}

				.origam-slider-field-track {
					background-color: color-mix(in srgb, currentColor 22%, transparent) !important;
					border-radius: 0 !important;
				}

				.origam-slider-field-track__background {
					background-color: transparent !important;
				}

				.origam-slider-field-track__fill {
					background-color: currentColor !important;
					border-radius: 0 !important;
				}
			}

			:deep(.origam-slider-field__container) {
				min-height: var(--origam-audio--compact__progress---height, 3px);
				height: var(--origam-audio--compact__progress---height, 3px);
				padding: 0;
			}
		}

		/*
		 * Position modifiers — placed AFTER `&--compact` on purpose so
		 * they win in source order when both classes coexist (e.g.
		 * `variant="compact" position="sticky" bottom="0"`). `usePosition`
		 * emits the modifier class AND inline `top|right|bottom|left`
		 * styles; the modifier flips the `--origam-audio---position`
		 * variable consumed by the root rule.
		 */
		&--relative {
			--origam-audio---position: relative;
		}

		&--absolute {
			--origam-audio---position: absolute;
		}

		&--fixed {
			--origam-audio---position: fixed;
		}

		&--sticky {
			--origam-audio---position: sticky;
		}

		&--static {
			--origam-audio---position: static;
		}
	}
</style>
