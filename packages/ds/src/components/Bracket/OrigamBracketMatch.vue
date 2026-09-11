<template>
	<component
			:is="tag"
			:id="id"
			ref="matchRef"
			:aria-label="ariaLabel"
			:class="matchClasses"
			:style="matchStyles"
			role="group"
			@click="handleMatchClick"
			@mouseenter="onMouseenter"
			@mouseleave="onMouseleave"
	>
		<div
				v-if="match.scheduledAt || resolvedStatus"
				class="origam-bracket-match__meta"
		>
			<span
					v-if="resolvedStatus"
					:class="statusClasses"
			>
				{{ statusLabel }}
			</span>
			<a
					v-if="isLive && to"
					:href="to"
					class="origam-bracket-match__watch"
					rel="noopener noreferrer"
					target="_blank"
			>
				{{ watchLabel }}
			</a>
			<span
					v-if="match.scheduledAt"
					class="origam-bracket-match__schedule"
			>
				{{ match.scheduledAt }}
			</span>
		</div>

		<div class="origam-bracket-match__body">
			<slot
					name="competitor"
					:competitor="match.competitorA"
					:match="match"
					:is-winner="isWinnerA"
					:side="'A'"
			>
				<origam-bracket-competitor
						:advantage-rounds="advantageA"
						:forfeit="isForfeitA"
						:competitor="match.competitorA"
						:interactive="interactive"
						:is-loser="isLoserA"
						:is-winner="isWinnerA"
						:score="match.scoreA"
						:show-score="showScores"
						:show-seed="showSeed"
						class="origam-bracket-match__row"
						@click="handleCompetitorClick($event, match.competitorA, 'A')"
				/>
			</slot>

			<origam-divider class="origam-bracket-match__divider"/>

			<slot
					name="competitor"
					:competitor="match.competitorB"
					:match="match"
					:is-winner="isWinnerB"
					:side="'B'"
			>
				<origam-bracket-competitor
						:advantage-rounds="advantageB"
						:forfeit="isForfeitB"
						:competitor="match.competitorB"
						:interactive="interactive"
						:is-loser="isLoserB"
						:is-winner="isWinnerB"
						:score="match.scoreB"
						:show-score="showScores"
						:show-seed="showSeed"
						class="origam-bracket-match__row"
						@click="handleCompetitorClick($event, match.competitorB, 'B')"
				/>
			</slot>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, onBeforeUnmount, onMounted, ref, StyleValue, watch } from 'vue'

	import OrigamBracketCompetitor from './OrigamBracketCompetitor.vue'
	import OrigamDivider from '../Divider/OrigamDivider.vue'

	import { useActive, useDensity, useDimension, useHover, useMargin, usePadding, useProps } from '../../composables'

	import { bracketSurfaceVars, resolveBracketForeground } from '../../utils/Bracket/bracket-surface.util'

	import type { IBracketSurfaceInput } from '../../utils/Bracket/bracket-surface.util'

	import type { IBracketCompetitor, IBracketMatch, IBracketMatchProps } from '../../interfaces'

	const props = withDefaults(defineProps<IBracketMatchProps>(), {
		tag: 'div',
		isFinal: false,
		showScores: true,
		showSeed: false,
		interactive: true,
		color: 'primary'
	})

	const emit = defineEmits<{
		(e: 'click', match: IBracketMatch, event: MouseEvent): void
		(e: 'competitor-click', competitor: IBracketCompetitor, match: IBracketMatch, side: 'A' | 'B', event: MouseEvent | KeyboardEvent): void
		(e: 'winner-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
	}>()

	const {filterProps} = useProps<IBracketMatchProps>(props)

	const resolvedStatus = computed(() => props.status ?? props.match.status)

	const STATUS_LABELS: Record<string, string> = {
		pending: 'TBD',
		live: 'LIVE',
		completed: 'Completed',
		forfeited: 'Forfeit'
	}

	const statusLabel = computed<string>(() => {
		if (!resolvedStatus.value) return ''

		return STATUS_LABELS[resolvedStatus.value] ?? resolvedStatus.value
	})

	const watchLabel = 'Watch live'

	const statusClasses = computed(() => {
		return [
			'origam-bracket-match__status',
			`origam-bracket-match__status--${resolvedStatus.value ?? 'pending'}`
		]
	})

	const isWinnerA = computed<boolean>(() => {
		if (props.match.winnerId == null) return false
		if (!props.match.competitorA) return false

		return props.match.competitorA.id === props.match.winnerId
	})

	const isWinnerB = computed<boolean>(() => {
		if (props.match.winnerId == null) return false
		if (!props.match.competitorB) return false

		return props.match.competitorB.id === props.match.winnerId
	})

	const isLoserA = computed<boolean>(() => {
		if (props.match.winnerId == null) return false
		if (!props.match.competitorA) return false

		return props.match.competitorA.id !== props.match.winnerId
	})

	const isLoserB = computed<boolean>(() => {
		if (props.match.winnerId == null) return false
		if (!props.match.competitorB) return false

		return props.match.competitorB.id !== props.match.winnerId
	})

	// On a forfeited match the LOSER (the side that didn't advance) is the
	// one that forfeited — flag it so the row can show it.
	const isForfeitA = computed<boolean>(() => resolvedStatus.value === 'forfeited' && isLoserA.value)
	const isForfeitB = computed<boolean>(() => resolvedStatus.value === 'forfeited' && isLoserB.value)

	const advantageFor = (competitor: IBracketCompetitor | null): number | undefined => {
		const advantage = props.match.advantage
		if (!advantage || !competitor) return undefined
		if (advantage.competitorId !== competitor.id) return undefined

		return advantage.rounds ?? 1
	}

	const advantageA = computed<number | undefined>(() => advantageFor(props.match.competitorA))
	const advantageB = computed<number | undefined>(() => advantageFor(props.match.competitorB))

	const ariaLabel = computed<string>(() => {
		const a = props.match.competitorA?.name ?? 'TBD'
		const b = props.match.competitorB?.name ?? 'TBD'

		return `Match: ${a} versus ${b}`
	})

	const handleMatchClick = (event: MouseEvent) => {
		onActive()

		const target = event.target as HTMLElement | null
		if (target?.closest('.origam-bracket-competitor')) return

		emit('click', props.match, event)
	}

	const handleCompetitorClick = (event: MouseEvent | KeyboardEvent, competitor: IBracketCompetitor | null, side: 'A' | 'B') => {
		if (!competitor) return

		emit('competitor-click', competitor, props.match, side, event)

		if (props.match.winnerId != null && competitor.id === props.match.winnerId) {
			emit('winner-click', competitor, props.match, event)
		}
	}

	/*********************************************************
	 * Cross-cutting surface — shared resolvers + composables
	 *
	 * @description
	 * `bgColor` / `rounded` / `elevation` / `border*` paint the card through
	 * the shared `bracketSurfaceVars` (same source of truth as OrigamBracket);
	 * `density` / `dimension` / `padding` / `margin` ride the Commons
	 * composables. `color` sets the card text — auto-contrast against the
	 * painted surface wins when `bgColor` is set, so a standalone card stays
	 * legible like it does inside a bracket.
	 ********************************************************/
	const matchRef = ref<HTMLElement | null>(null)

	// Interaction state — `hover` / `active` paint the card surface from the
	// hover / active state objects (same as everywhere). A `live` match IS
	// the active state, so it picks up the active surface automatically.
	const {hoverClasses, isHover, hoverState, onMouseenter, onMouseleave} = useHover(props)
	const {activeClasses, isActive, activeState, onActive} = useActive(props)

	const isLive = computed<boolean>(() => resolvedStatus.value === 'live')
	const isActiveOrLive = computed<boolean>(() => isActive.value || isLive.value)

	// Effective surface props: hover / active (incl. live) state objects
	// override the resting props, then everything flows through the shared
	// `bracketSurfaceVars` so the card repaints on state — exactly like a
	// `useStateEffect`-driven component, but through the bracket's vars.
	const surfaceInput = computed(() => {
		// Hover wins over active (incl. live) — hovering a live match shows
		// the hover surface. Mirrors useStateEffect's hover-first precedence.
		if (isHover.value && hoverState.value) return {...props, ...hoverState.value}
		if (isActiveOrLive.value && activeState.value) return {...props, ...activeState.value}

		return props
	})

	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {dimensionStyles} = useDimension(props)
	const {densityClasses} = useDensity(props, 'origam-bracket-match')

	const autoTextColor = ref<string | null>(null)

	const measureContrast = (): void => {
		const el = matchRef.value
		if (!props.bgColor || !el) {
			autoTextColor.value = null

			return
		}

		const channels = getComputedStyle(el).backgroundColor.match(/\d+(?:\.\d+)?/g)
		if (!channels || channels.length < 3) {
			autoTextColor.value = null

			return
		}

		const linear = (channel: number): number => {
			const c = channel / 255

			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
		}
		const luminance = 0.2126 * linear(+channels[0]) + 0.7152 * linear(+channels[1]) + 0.0722 * linear(+channels[2])

		autoTextColor.value = luminance < 0.179 ? '#ffffff' : '#000000'
	}

	let contrastTimer: ReturnType<typeof setTimeout> | null = null

	const scheduleContrast = (): void => {
		if (typeof window === 'undefined') return
		if (contrastTimer) clearTimeout(contrastTimer)

		contrastTimer = setTimeout(measureContrast, 200)
	}

	watch([() => props.bgColor, () => props.match, isHover, isActiveOrLive], scheduleContrast, {flush: 'post'})
	onMounted(scheduleContrast)
	onBeforeUnmount(() => {
		if (contrastTimer) clearTimeout(contrastTimer)
		contrastTimer = null
	})

	const matchStyles = computed<StyleValue>(() => {
		const textColor = autoTextColor.value ?? resolveBracketForeground(props.color as string | null | undefined)

		return [
			bracketSurfaceVars(surfaceInput.value as IBracketSurfaceInput),
			textColor ? {'--origam-bracket---color': textColor, color: textColor} : {},
			paddingStyles.value,
			marginStyles.value,
			dimensionStyles.value,
			props.style
		] as StyleValue
	})

	const matchClasses = computed(() => {
		return [
			'origam-bracket-match',
			{
				'origam-bracket-match--final': props.isFinal,
				'origam-bracket-match--interactive': props.interactive,
				[`origam-bracket-match--status-${resolvedStatus.value}`]: !!resolvedStatus.value
			},
			hoverClasses.value,
			activeClasses.value,
			densityClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	defineExpose({
		filterProps
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-bracket-match {
		display: flex;
		flex-direction: column;
		width: var(--origam-bracket-match---width, 240px);
		min-height: var(--origam-bracket-match---min-height, 72px);
		background-color: var(--origam-bracket-match---background-color, var(--origam-color__surface---default, #fff));
		border-width: var(--origam-bracket-match---border-width, 1px);
		border-style: var(--origam-bracket-match---border-style, solid);
		border-color: var(--origam-bracket-match---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)));
		border-radius: var(--origam-bracket-match---border-radius, 6px);
		box-shadow: var(--origam-bracket-match---box-shadow, 0 1px 2px rgba(0, 0, 0, 0.06));
		overflow: hidden;
		transition: background-color var(--origam-bracket-match---transition-duration, 120ms) ease,
		border-color var(--origam-bracket-match---transition-duration, 120ms) ease,
		box-shadow var(--origam-bracket-match---transition-duration, 120ms) ease;

		&__meta {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 2px 8px;
			font-size: 0.6875rem;
			border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.08));
		}

		&__status {
			display: inline-flex;
			align-items: center;
			gap: 5px;
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.04em;

			&::before {
				content: '';
				width: 7px;
				height: 7px;
				border-radius: 50%;
				background: currentColor;
				flex: 0 0 auto;
			}

			&--pending {
				color: var(--origam-color__text---tertiary, rgba(0, 0, 0, 0.5));
			}

			&--live {
				color: var(--origam-color__feedback--danger---bg, #d32f2f);

				&::before {
					box-shadow: 0 0 0 0 currentColor;
					animation: origam-bracket-blink 1s steps(1, end) infinite, origam-bracket-ping 1.4s ease-out infinite;
				}
			}

			&--completed {
				color: var(--origam-color__feedback--success---bg, #2e7d32);
			}

			&--forfeited {
				color: var(--origam-color__feedback--warning---bg, #ed6c02);
			}
		}

		&__watch {
			display: inline-flex;
			align-items: center;
			gap: 2px;
			color: var(--origam-color__feedback--danger---bg, #d32f2f);
			font-weight: 600;
			text-decoration: none;

			&::after {
				content: '↗';
			}

			&:hover {
				text-decoration: underline;
			}
		}

		&__schedule {
			color: var(--origam-color__text---tertiary, rgba(0, 0, 0, 0.5));
		}

		&__body {
			display: flex;
			flex-direction: column;
			flex: 1 1 auto;
		}

		&--interactive {
			cursor: pointer;

			&:hover {
				background-color: var(--origam-bracket-match--hover---background-color, var(--origam-color__surface---elevated, #fafafa));
				border-color: var(--origam-bracket-match--hover---border-color, var(--origam-color__border---default, rgba(0, 0, 0, 0.24)));
			}
		}

		&--status-completed {
			opacity: 0.95;
		}

		&--density-compact {
			--origam-bracket-match---min-height: 56px;
			--origam-bracket-competitor---height: 28px;
			--origam-bracket-competitor---padding-block: 2px;
		}

		&--density-comfortable {
			--origam-bracket-match---min-height: 88px;
			--origam-bracket-competitor---height: 44px;
			--origam-bracket-competitor---padding-block: 8px;
		}
	}

	@keyframes origam-bracket-blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0.2; }
	}

	@keyframes origam-bracket-ping {
		0% { box-shadow: 0 0 0 0 currentColor; }
		70%, 100% { box-shadow: 0 0 0 5px transparent; }
	}

	@media (prefers-reduced-motion: reduce) {
		@keyframes origam-bracket-blink {
			0%, 100% { opacity: 1; }
		}
		@keyframes origam-bracket-ping {
			0%, 100% { box-shadow: none; }
		}
	}
</style>

<style>
	:root {
		--origam-bracket-match---width: 240px;
		--origam-bracket-match---min-height: 72px;
		--origam-bracket-match---border-width: 1px;
		--origam-bracket-match---border-style: solid;
		--origam-bracket-match---border-radius: 6px;
		--origam-bracket-match---transition-duration: 120ms;
	}
</style>
