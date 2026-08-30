<template>
	<div
			:id="id"
			class="origam-media-controller"
			:class="rootClasses"
			:style="style"
			data-cy="origam-media-controller"
	>
		<slot name="header"/>

		<div class="origam-media-controller__progress-row">
			<slot
					name="waveform"
					:state="state"
					:methods="methods"
			>
				<origam-media-scrubber
						:model-value="state.currentTime.value"
						:max="scrubberMax"
						:step="0.1"
						:buffered="state.buffered.value"
						orientation="horizontal"
						show-thumb-on-hover-only
						show-hover-tooltip
						:format-hover-tooltip="formatScrubberTime"
						:aria-label="seekLabel"
						:aria-value-text="formattedCurrentTime"
						class="origam-media-controller__scrubber"
						data-cy="origam-media-controller-scrubber"
						@update:model-value="onScrubberSeek"
						@change="onScrubberCommit"
				/>
			</slot>
		</div>

		<nav
				class="origam-media-controller__buttons-row"
				:aria-label="transportLabel"
		>
			<div class="origam-media-controller__buttons-left">
				<slot name="prepend-transport"/>

				<origam-btn
						v-if="showPrevious"
						variant="text"
						density="compact"
						:icon="ICONS.PREVIOUS"
						:aria-label="previousLabel"
						data-cy="origam-media-controller-previous"
						@click="emitPrevious"
				/>

				<origam-btn
						variant="text"
						density="compact"
						:icon="state.playing.value ? ICONS.PAUSE : ICONS.PLAY"
						:aria-label="state.playing.value ? pauseLabel : playLabel"
						class="origam-media-controller__play-btn"
						data-cy="origam-media-controller-play"
						@click="onTogglePlay"
				/>

				<origam-btn
						v-if="showNext"
						variant="text"
						density="compact"
						:icon="ICONS.NEXT"
						:aria-label="nextLabel"
						data-cy="origam-media-controller-next"
						@click="emitNext"
				/>

				<origam-media-volume-control
						:volume="state.volume.value"
						:muted="state.muted.value"
						:mute-label="muteLabel"
						:unmute-label="unmuteLabel"
						:volume-label="volumeLabel"
						data-cy="origam-media-controller-volume"
						@update:muted="onToggleMute"
						@update:volume="onVolumeChangeFromScrubber"
				/>

				<span
						class="origam-media-controller__time"
						data-cy="origam-media-controller-time"
				>
					<span class="origam-media-controller__time-current">{{ formattedCurrentTime }}</span>
					<span class="origam-media-controller__time-sep">/</span>
					<span class="origam-media-controller__time-total">{{ formattedDuration }}</span>
				</span>

				<slot name="extraControlsLeft"/>
			</div>

			<div class="origam-media-controller__buttons-right">
				<slot name="extraControlsRight"/>

				<origam-btn
						v-if="showShuffle"
						variant="text"
						density="compact"
						:icon="ICONS.SHUFFLE"
						:active="internalShuffle"
						:aria-label="shuffleLabel"
						:aria-pressed="internalShuffle"
						data-cy="origam-media-controller-shuffle"
						@click="toggleShuffle"
				/>

				<origam-btn
						v-if="showLoop"
						variant="text"
						density="compact"
						:icon="loopIcon"
						:active="isLoopActive"
						:aria-label="loopAriaLabel"
						:aria-pressed="isLoopActive"
						data-cy="origam-media-controller-loop"
						@click="cycleLoopMode"
				/>

				<origam-btn
						v-if="showCastButton"
						variant="text"
						density="compact"
						:icon="ICONS.CAST"
						:active="isCasting"
						:aria-label="isCasting ? stopCastLabel : castLabel"
						:aria-pressed="isCasting"
						data-cy="origam-media-controller-cast"
						@click="onCastClick"
				/>

				<origam-menu
						v-if="hasConfigContent"
						v-model="configMenuOpen"
						:items="configMenuItems"
						:item-children="'children'"
						data-cy="origam-media-controller-config"
				>
					<template #activator="{ props: activatorProps }">
						<origam-btn
								v-bind="activatorProps"
								variant="text"
						density="compact"
								:icon="ICONS.COG"
								:active="configMenuOpen"
								:aria-label="settingsLabel"
								data-cy="origam-media-controller-config-btn"
						/>
					</template>
				</origam-menu>

				<slot name="append-transport"/>
			</div>
		</nav>

		<slot name="footer"/>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, type CSSProperties, ref, useSlots, watch } from 'vue'

	import { OrigamBtn } from '../Btn'
	import { OrigamMenu } from '../Menu'

	import { useLocale } from '../../composables/Commons/locale.composable'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import { formatMediaTime } from '../../utils/Media/format-time.util'

	import type {
		IMediaControllerEmits,
		IMediaControllerProps,
		IMediaControllerSlots
	} from '../../interfaces/Media/media-controller.interface'

	import type { IConfigMenuItem } from '../../interfaces/Media/media-config-menu-item.interface'

	import type { TAudioLoopMode } from '../../types/Audio/audio.type'

	import OrigamMediaScrubber from './OrigamMediaScrubber.vue'
	import OrigamMediaVolumeControl from './OrigamMediaVolumeControl.vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Universal media controls shell consumed by `<OrigamVideo>` AND
	 * `<OrigamAudio>`. The transport row uses native DS components
	 * (`<origam-btn>` for every icon-only button, `<origam-menu>` for
	 * the cog drill-down). Audio-specific features (playlist nav,
	 * tri-state loop, shuffle) are opt-in via `show*` props — video
	 * keeps a zero-regression default surface.
	 *
	 * Defaults are inlined here (not pulled from a constant object)
	 * because the Vue SFC compiler analyses `withDefaults` statically
	 * and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const { t } = useLocale()

	const props = withDefaults(defineProps<IMediaControllerProps>(), {
		inset: false,
		visible: true,
		playbackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
		allowRemotePlayback: false,
		downloadable: false,
		downloadUrl: null,
		downloadFilename: undefined,
		qualityOptions: () => [],
		currentQuality: null,
		showPrevious: false,
		showNext: false,
		showLoop: false,
		showShuffle: false,
		loopMode: 'none',
		shuffle: false
	})

	const emit = defineEmits<IMediaControllerEmits>()

	defineSlots<IMediaControllerSlots>()

	const slots = useSlots()

	/*********************************************************
	 * Icon refs — single source of truth for every transport glyph.
	 ********************************************************/
	const ICONS = {
		PLAY: MDI_ICONS.PLAY,
		PAUSE: MDI_ICONS.PAUSE,
		PREVIOUS: MDI_ICONS.SKIP_PREVIOUS,
		NEXT: MDI_ICONS.SKIP_NEXT,
		LOOP: MDI_ICONS.REPEAT,
		LOOP_ONE: MDI_ICONS.REPEAT_ONCE,
		SHUFFLE: MDI_ICONS.SHUFFLE,
		COG: MDI_ICONS.COG,
		CAST: MDI_ICONS.CAST,
		DOWNLOAD: MDI_ICONS.DOWNLOAD
	}

	/*********************************************************
	 * i18n labels — pre-translated for the ARIA contract. Template
	 * stays free of `t(...)` calls (CLAUDE.md "no logic in templates"
	 * rule).
	 ********************************************************/
	const playLabel = computed<string>(() => t('origam.media.play'))
	const pauseLabel = computed<string>(() => t('origam.media.pause'))
	const muteLabel = computed<string>(() => t('origam.media.mute'))
	const unmuteLabel = computed<string>(() => t('origam.media.unmute'))
	const volumeLabel = computed<string>(() => t('origam.media.volume'))
	const seekLabel = computed<string>(() => t('origam.media.seek'))
	const previousLabel = computed<string>(() => t('origam.media.previous_track'))
	const nextLabel = computed<string>(() => t('origam.media.next_track'))
	const loopAllLabel = computed<string>(() => t('origam.media.loop_all'))
	const loopOneLabel = computed<string>(() => t('origam.media.loop_one'))
	const loopOffLabel = computed<string>(() => t('origam.media.loop_off'))
	const shuffleLabel = computed<string>(() => t('origam.media.shuffle'))
	const castLabel = computed<string>(() => t('origam.media.cast_to_device'))
	const stopCastLabel = computed<string>(() => t('origam.media.stop_casting'))
	const settingsLabel = computed<string>(() => t('origam.media.settings'))
	const downloadLabel = computed<string>(() => t('origam.media.download'))
	const speedLabel = computed<string>(() => t('origam.media.playback_speed'))
	const normalSpeedLabel = computed<string>(() => t('origam.media.normal_speed'))
	const qualityLabel = computed<string>(() => t('origam.media.quality'))
	const transportLabel = computed<string>(() => t('origam.media.transport'))

	/*********************************************************
	 * Reactive shorthands — surfaced as locals so the template stays
	 * free of `props.state.X.value` accesses.
	 ********************************************************/
	const state = computed(() => props.state)
	const methods = computed(() => props.methods)

	/*********************************************************
	 * Play / pause — uses the composable's `play()` / `pause()`
	 * methods directly. The parent can observe `state.playing` to
	 * paint additional UX (YouTube-style center pulse, …); the side
	 * effect is intentionally left to the parent.
	 ********************************************************/
	function onTogglePlay (): void {
		if (state.value.playing.value) methods.value.pause()
		else methods.value.play()
	}

	/*********************************************************
	 * Mute / volume — the volume composable owns the icon swap and
	 * the muted-collapse rule (slider sits at 0 when muted=true).
	 ********************************************************/
	function onToggleMute (): void {
		methods.value.toggleMute()
	}

	function onVolumeChangeFromScrubber (value: number): void {
		if (value > 0 && state.value.muted.value) methods.value.toggleMute()
		else if (value === 0 && !state.value.muted.value) methods.value.toggleMute()
		methods.value.setVolume(value)
	}

	/*********************************************************
	 * Scrubber — both `update:modelValue` (live drag) and `change`
	 * (commit) call `seek` so the media tracks the thumb in real
	 * time. The native element ignores redundant seeks to the same
	 * position so no throttling is needed.
	 ********************************************************/
	const scrubberMax = computed<number>(() => {
		return Number.isFinite(state.value.duration.value) ? state.value.duration.value : 0
	})

	function onScrubberSeek (value: number): void {
		methods.value.seek(value)
	}

	function onScrubberCommit (value: number): void {
		methods.value.seek(value)
	}

	function formatScrubberTime (seconds: number): string {
		return formatMediaTime(seconds)
	}

	/*********************************************************
	 * Time display — formatted via the shared util.
	 ********************************************************/
	const formattedCurrentTime = computed<string>(() => formatMediaTime(state.value.currentTime.value))
	const formattedDuration = computed<string>(() => formatMediaTime(state.value.duration.value))

	/*********************************************************
	 * Cast / Remote Playback — visibility gate combines the parent's
	 * allow flag with the runtime `remoteAvailable` ref.
	 ********************************************************/
	const showCastButton = computed<boolean>(() => {
		return Boolean(props.allowRemotePlayback) && state.value.remoteAvailable.value
	})

	const isCasting = computed<boolean>(() => state.value.remoteState.value === 'connected')

	async function onCastClick (): Promise<void> {
		await methods.value.requestRemotePlayback()
	}

	/*********************************************************
	 * Previous / next — pure emits. Parents (`<OrigamAudio>` for
	 * playlist navigation, `<OrigamVideo>` for chapter / skip) own
	 * the action.
	 ********************************************************/
	function emitPrevious (): void {
		emit('previous')
	}

	function emitNext (): void {
		emit('next')
	}

	/*********************************************************
	 * Tri-state loop — cycles `none → all → one → none …`. The
	 * controller owns the cycle but mirrors the value via
	 * `update:loopMode` so consumers can use `v-model:loopMode`.
	 ********************************************************/
	const internalLoopMode = ref<TAudioLoopMode>(props.loopMode ?? 'none')

	watch(() => props.loopMode, (next) => {
		if (next && next !== internalLoopMode.value) internalLoopMode.value = next
	})

	const resolvedLoopMode = computed<TAudioLoopMode>(() => internalLoopMode.value)

	function cycleLoopMode (): void {
		const next: TAudioLoopMode =
			internalLoopMode.value === 'none' ? 'all'
				: internalLoopMode.value === 'all' ? 'one'
					: 'none'
		internalLoopMode.value = next
		emit('update:loopMode', next)
	}

	const loopIcon = computed<string>(() => {
		return resolvedLoopMode.value === 'one' ? ICONS.LOOP_ONE : ICONS.LOOP
	})

	const isLoopActive = computed<boolean>(() => resolvedLoopMode.value !== 'none')

	const loopAriaLabel = computed<string>(() => {
		if (resolvedLoopMode.value === 'one') return loopOneLabel.value
		if (resolvedLoopMode.value === 'all') return loopAllLabel.value
		return loopOffLabel.value
	})

	/*********************************************************
	 * Shuffle toggle — v-modelled with the parent.
	 ********************************************************/
	const internalShuffle = ref<boolean>(props.shuffle ?? false)

	watch(() => props.shuffle, (next) => {
		if (typeof next === 'boolean' && next !== internalShuffle.value) {
			internalShuffle.value = next
		}
	})

	function toggleShuffle (): void {
		internalShuffle.value = !internalShuffle.value
		emit('update:shuffle', internalShuffle.value)
	}

	/*********************************************************
	 * Config menu — `<origam-menu>` with a typed items array. Each
	 * row exposes `:title`, optional `:appendText` (for the current
	 * value display), optional `:prependIcon`, and `:children` to
	 * drill into sub-menus (speed / quality submenus).
	 *
	 * The download row carries a `data` payload with the URL +
	 * filename so the consumer can wire a native `<a download>` via
	 * the menu's link contract OR receive the click and route it
	 * through their own fetch+blob pipeline.
	 ********************************************************/
	const configMenuOpen = ref<boolean>(false)

	const hasQualityOptions = computed<boolean>(() => props.qualityOptions.length >= 2)
	const hasPlaybackRates = computed<boolean>(() => (props.playbackRates?.length ?? 0) > 1)
	const canDownload = computed<boolean>(() => Boolean(props.downloadable) && Boolean(props.downloadUrl))

	const hasConfigContent = computed<boolean>(() => {
		return Boolean(slots.configExtra)
			|| hasPlaybackRates.value
			|| hasQualityOptions.value
			|| canDownload.value
	})

	const formattedPlaybackRate = computed<string>(() => {
		const r = state.value.playbackRate.value
		if (Math.abs(r - 1) < 0.01) return normalSpeedLabel.value
		return `${ r }×`
	})

	const formattedQuality = computed<string>(() => {
		if (!props.currentQuality) return ''
		const match = props.qualityOptions.find((q) => q.quality === props.currentQuality)
		return match?.label ?? props.currentQuality
	})

	/*********************************************************
	 * configMenuItems
	 *
	 * Each leaf item carries its OWN `onClick`, dispatched through the
	 * underlying `<OrigamListItem>`; parent rows that open a submenu
	 * purposely have NO click (the menu toggles the submenu on
	 * hover/click via its own activator binding).
	 *
	 * `<OrigamMenu>` also emits `select` for a picked leaf row, so this
	 * component deliberately does NOT listen for it: both channels fire
	 * on the same click, and routing both into `onConfigSelect` emitted
	 * `download` twice per click (and called `setPlaybackRate` /
	 * `quality-change` twice). The per-item handler is the one kept
	 * because `handleDownloadClick` needs the real `MouseEvent` to
	 * `preventDefault()` the cross-origin anchor navigation — the
	 * `select` payload is the item object, not the event.
	 ********************************************************/
	const configMenuItems = computed<Array<IConfigMenuItem>>(() => {
		const items: Array<IConfigMenuItem> = []

		if (hasPlaybackRates.value) {
			items.push({
				title: speedLabel.value,
				appendText: formattedPlaybackRate.value,
				key: 'speed-root',
				children: props.playbackRates!.map((rate) => ({
					title: rate === 1 ? normalSpeedLabel.value : `${ rate }×`,
					key: `speed-${ rate }`,
					value: rate,
					link: true,
					onClick: () => onConfigSelect({
						title: rate === 1 ? normalSpeedLabel.value : `${ rate }×`,
						key: `speed-${ rate }`,
						value: rate
					})
				}))
			})
		}

		if (hasQualityOptions.value) {
			items.push({
				title: qualityLabel.value,
				appendText: formattedQuality.value,
				key: 'quality-root',
				children: props.qualityOptions.map((q) => ({
					title: q.label,
					key: `quality-${ q.quality }`,
					value: q.quality,
					link: true,
					onClick: () => onConfigSelect({
						title: q.label,
						key: `quality-${ q.quality }`,
						value: q.quality
					})
				}))
			})
		}

		if (canDownload.value) {
			/*
			 * Hybrid download strategy:
			 *
			 *   - Same-origin / `data:` / `blob:` URLs → native
			 *     `<a href download>` does the job. Cheap, one frame,
			 *     no network round-trip, browser owns the user gesture.
			 *
			 *   - Cross-origin URLs → the HTML spec IGNORES the
			 *     `download` attribute (anti-phishing safeguard). The
			 *     anchor would just NAVIGATE to the media URL, which
			 *     the browser then opens inline (the user's exact
			 *     report: "le contenu est remplacé par l'audio natif").
			 *     We `preventDefault()` and route through `fetch` →
			 *     blob → `URL.createObjectURL` → blob URL anchor click.
			 *     The blob URL IS same-origin so the `download`
			 *     attribute on the second anchor IS honoured.
			 *
			 *   - Cross-origin without CORS (server rejects the fetch)
			 *     → `window.open(url, '_blank')` so the user at least
			 *     gets the file in a new tab rather than the current
			 *     page being replaced by an inline media viewer.
			 *
			 * The user gesture is preserved across the async fetch:
			 * the click handler kicks off `fetch` from inside the
			 * synchronous gesture, and modern browsers extend the user
			 * activation flag through the subsequent `a.click()` on
			 * the blob URL. This is the same approach `<OrigamVideo>`
			 * shipped before its CORS-enabled CDN made it unnecessary.
			 */
			items.push({
				title: downloadLabel.value,
				prependIcon: ICONS.DOWNLOAD,
				key: 'download',
				href: props.downloadUrl ?? undefined,
				download: props.downloadFilename || '',
				rel: 'noopener',
				onClick: handleDownloadClick
			} as IConfigMenuItem)
		}

		return items
	})

	function onConfigSelect (item: IConfigMenuItem): void {
		if (!item) return
		if (item.key.startsWith('speed-') && typeof item.value === 'number') {
			methods.value.setPlaybackRate(item.value)
			configMenuOpen.value = false
			return
		}
		if (item.key.startsWith('quality-') && typeof item.value === 'string') {
			emit('quality-change', item.value)
			configMenuOpen.value = false
			return
		}
	}

	/*********************************************************
	 * handleDownloadClick
	 *
	 * Wired on the cog-menu Download row. Detects same-origin vs
	 * cross-origin URLs and routes accordingly (see big comment block
	 * on the item factory above). Always closes the menu and emits
	 * `download` so consumers observe the intent immediately.
	 ********************************************************/
	function handleDownloadClick (event: MouseEvent): void {
		emit('download')
		configMenuOpen.value = false

		const url = props.downloadUrl
		if (!url) {
			event.preventDefault()
			return
		}
		if (typeof window === 'undefined' || typeof document === 'undefined') return

		const isSameOriginOrLocal = (raw: string): boolean => {
			if (raw.startsWith('data:') || raw.startsWith('blob:')) return true
			try {
				const u = new URL(raw, window.location.href)
				return u.origin === window.location.origin
			} catch {
				return true
			}
		}

		// Same-origin / data: / blob: → the native anchor click is
		// already correct (download attribute is honoured). Let the
		// browser's default action proceed — we don't preventDefault.
		if (isSameOriginOrLocal(url)) return

		// Cross-origin: cancel the native navigation; route through
		// `fetch` → blob → blob URL anchor.
		event.preventDefault()

		const filename = props.downloadFilename
			|| url.split('?')[0].split('/').pop()
			|| 'download'

		const triggerAnchor = (href: string): void => {
			const a = document.createElement('a')
			a.href = href
			a.download = filename
			a.rel = 'noopener'
			a.style.display = 'none'
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		}

		fetch(url, { mode: 'cors', credentials: 'omit' })
			.then((response) => {
				if (!response.ok) throw new Error(`HTTP ${ response.status }`)
				return response.blob()
			})
			.then((blob) => {
				const blobUrl = URL.createObjectURL(blob)
				triggerAnchor(blobUrl)
				// Defer revoke so the browser has time to start streaming.
				// 30s is generous; multi-GB files might need more but
				// holding the blob in memory beyond that is wasteful.
				setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
			})
			.catch(() => {
				// CORS-denied or offline. Last-resort: open the URL in
				// a new tab so the user is NOT stuck on a page replaced
				// by an inline media viewer.
				window.open(url, '_blank', 'noopener,noreferrer')
			})
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-media-controller--inset': props.inset,
			'origam-media-controller--visible': props.visible
		},
		props.class
	])

	const style = computed<CSSProperties | string | undefined>(() => props.style as CSSProperties | string | undefined)

	defineExpose({
		configMenuOpen,
		resolvedLoopMode,
		internalShuffle
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-media-controller {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0 0 6px;
		color: var(--origam-media-controller---color, inherit);
		transition: opacity 180ms ease, transform 220ms ease;
	}

	.origam-media-controller__progress-row {
		padding: 0 12px;
	}

	.origam-media-controller__buttons-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
		min-height: 36px;
	}

	.origam-media-controller__buttons-left,
	.origam-media-controller__buttons-right {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.origam-media-controller__buttons-row :deep(.origam-btn) {
		--origam-btn---color: currentColor;
		--origam-btn---background-color: transparent;
		--origam-btn---min-width: 32px;
		--origam-btn---width: 32px;
		--origam-btn---height: 32px;
	}

	.origam-media-controller__buttons-row :deep(.origam-btn--active) {
		color: var(--origam-media-controller---accent-color, var(--origam-color__action--primary---bg));
		background-color: color-mix(in srgb, var(--origam-media-controller---accent-color, var(--origam-color__action--primary---bg)) 14%, transparent);
	}

	.origam-media-controller--inset {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.35) 60%, transparent 100%);
		opacity: 0;
		pointer-events: none;
	}

	.origam-media-controller--inset.origam-media-controller--visible {
		opacity: 1;
		pointer-events: auto;
	}

	.origam-media-controller__scrubber {
		--origam-media-scrubber---color: var(
			--origam-media-controller__scrubber---color,
			currentColor
		);
		--origam-media-scrubber---track-background-color: color-mix(in srgb, currentColor 18%, transparent);
		--origam-media-scrubber---buffer-background-color: color-mix(in srgb, currentColor 32%, transparent);
		width: 100%;
	}

	.origam-media-controller__time {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		color: var(--origam-media-controller__time---color, inherit);
		white-space: nowrap;
		user-select: none;
	}

	.origam-media-controller__time-sep {
		color: var(--origam-media-controller__time-sep---color, var(--origam-color__text---secondary));
	}

	.origam-media-controller__time-total {
		color: var(--origam-media-controller__time-total---color, var(--origam-color__text---secondary));
	}
</style>
