<template>
	<component
			:is="tag"
			:id="resolvedId"
			:aria-label="ariaLabel"
			:class="rootClasses"
			:style="rootStyles"
			role="region"
	>
		<template v-if="variant === BRACKET_VARIANT.ROUND_ROBIN">
			<div
					class="origam-bracket__round-robin"
					data-cy="origam-bracket-round-robin"
					role="table"
			>
				<div
						class="origam-bracket__rr-row origam-bracket__rr-row--head"
						role="row"
				>
					<div
							class="origam-bracket__rr-corner"
							role="columnheader"
					/>
					<div
							v-for="competitor in roundRobinCompetitors"
							:key="`head-${competitor.id}`"
							:title="competitor.name"
							class="origam-bracket__rr-head"
							role="columnheader"
					>
						{{ competitor.name }}
					</div>
				</div>
				<div
						v-for="row in roundRobinCompetitors"
						:key="`row-${row.id}`"
						class="origam-bracket__rr-row"
						role="row"
				>
					<div
							:title="row.name"
							class="origam-bracket__rr-head origam-bracket__rr-head--row"
							role="rowheader"
					>
						{{ row.name }}
					</div>
					<div
							v-for="col in roundRobinCompetitors"
							:key="`cell-${row.id}-${col.id}`"
							:aria-label="describeRoundRobinCell(row, col)"
							:class="roundRobinCellClasses(row, col)"
							role="cell"
							@click="onRoundRobinCellClick(row, col, $event)"
					>
						<template v-if="row.id === col.id">
							—
						</template>
						<template v-else>
							{{ roundRobinScore(row, col) }}
						</template>
					</div>
				</div>
			</div>
		</template>

		<template v-else-if="variant === BRACKET_VARIANT.DOUBLE_ELIMINATION">
			<div
					ref="doubleRef"
					class="origam-bracket__double"
					data-cy="origam-bracket-double"
			>
				<svg
						v-if="showConnectors"
						:viewBox="connectorViewBox"
						aria-hidden="true"
						class="origam-bracket__connectors"
						preserveAspectRatio="none"
				>
					<template
							v-for="path in connectorPaths"
							:key="path.key"
					>
						<slot
								name="connector"
								:from="path.from"
								:to="path.to"
						>
							<path
									:class="['origam-bracket__connector', { 'origam-bracket__connector--winner': path.winner }]"
									:d="path.d"
									fill="none"
							/>
						</slot>
					</template>
				</svg>

				<section
						v-for="section in doubleSections"
						:key="section.key"
						:class="['origam-bracket__de-section', `origam-bracket__de-section--${section.key}`]"
						:data-cy="`origam-bracket-de-${section.key}`"
				>
					<h2
							v-if="section.label"
							class="origam-bracket__de-label"
							:style="typographyStyles"
					>
						{{ section.label }}
					</h2>
					<div class="origam-bracket__de-tree">
						<origam-bracket-round
								v-for="(round, index) in section.rounds"
								:key="round.id"
								:color="roundColor"
								:data-cy="`origam-bracket-${section.key}-round-${index}`"
								:direction="DIRECTION.HORIZONTAL"
								:index="index"
								:interactive="interactive"
								:round="round"
								:show-round-title="showRoundTitles"
								:show-scores="showScores"
								:show-seed="showSeed"
								:total-rounds="section.rounds.length"
								class="origam-bracket__round"
								@competitor-click="onCompetitorClick"
								@match-click="onMatchClick"
								@winner-click="onWinnerClick"
						>
							<template
									v-if="$slots['round-title']"
									#round-title="scope"
							>
								<slot
										name="round-title"
										v-bind="scope"
								/>
							</template>
							<template
									v-if="$slots.match"
									#match="scope"
							>
								<slot
										name="match"
										v-bind="scope"
								/>
							</template>
							<template
									v-if="$slots.competitor"
									#competitor="scope"
							>
								<slot
										name="competitor"
										v-bind="scope"
								/>
							</template>
						</origam-bracket-round>
					</div>
				</section>
			</div>
		</template>

		<template v-else>
			<div
					ref="treeRef"
					:class="treeClasses"
					data-cy="origam-bracket-tree"
			>
				<svg
						v-if="showConnectors"
						:viewBox="connectorViewBox"
						aria-hidden="true"
						class="origam-bracket__connectors"
						preserveAspectRatio="none"
				>
					<template
							v-for="path in connectorPaths"
							:key="path.key"
					>
						<slot
								name="connector"
								:from="path.from"
								:to="path.to"
						>
							<path
									:class="['origam-bracket__connector', { 'origam-bracket__connector--winner': path.winner }]"
									:d="path.d"
									fill="none"
							/>
						</slot>
					</template>
				</svg>

				<origam-bracket-round
						v-for="(round, index) in displayRounds"
						:key="round.id"
						:color="roundColor"
						:data-cy="`origam-bracket-round-${index}`"
						:direction="direction"
						:index="index"
						:interactive="interactive"
						:round="round"
						:show-round-title="showRoundTitles"
						:show-scores="showScores"
						:show-seed="showSeed"
						:style="roundStyleFor(index)"
						:total-rounds="displayRounds.length"
						class="origam-bracket__round"
						@competitor-click="onCompetitorClick"
						@match-click="onMatchClick"
						@winner-click="onWinnerClick"
				>
					<template
							v-if="$slots['round-title']"
							#round-title="scope"
					>
						<slot
								name="round-title"
								v-bind="scope"
						/>
					</template>
					<template
							v-if="$slots.match"
							#match="scope"
					>
						<slot
								name="match"
								v-bind="scope"
						/>
					</template>
					<template
							v-if="$slots.competitor"
							#competitor="scope"
					>
						<slot
								name="competitor"
								v-bind="scope"
						/>
					</template>
				</origam-bracket-round>
			</div>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, StyleValue, watch } from 'vue'

	import OrigamBracketRound from './OrigamBracketRound.vue'

	import {
		useDimension,
		useMargin,
		usePadding,
		useProps,
		useTypography
	} from '../../composables'

	import {
		BRACKET_DEFAULT_MATCH_GAP,
		BRACKET_DEFAULT_MATCH_HEIGHT,
		BRACKET_DEFAULT_MATCH_WIDTH,
		BRACKET_DEFAULT_ROUND_GAP
	} from '../../consts'

	import { BRACKET_VARIANT, DIRECTION } from '../../enums'

	import {
		bracketDashArray,
		bracketSurfaceVars,
		resolveBracketBorderColor,
		resolveBracketBorderWidth,
		resolveBracketForeground
	} from '../../utils/Bracket/bracket-surface.util'

	import type {
		IBracketCompetitor,
		IBracketMatch,
		IBracketProps,
		IBracketRound
	} from '../../interfaces'

	import type { IBracketSurfaceInput } from '../../utils/Bracket/bracket-surface.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 ********************************************************/
	const props = withDefaults(defineProps<IBracketProps>(), {
		tag: 'div',
		variant: BRACKET_VARIANT.SINGLE_ELIMINATION,
		direction: DIRECTION.HORIZONTAL,
		showRoundTitles: true,
		showScores: true,
		showSeed: false,
		interactive: true,
		color: 'primary',
		winnersLabel: 'Winners bracket',
		losersLabel: 'Losers bracket'
	})

	const emit = defineEmits<{
		(e: 'match-click', match: IBracketMatch, round: IBracketRound, event: MouseEvent): void
		(e: 'winner-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
		(e: 'competitor-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
	}>()

	const {filterProps} = useProps<IBracketProps>(props)

	const resolvedId = computed(() => props.id ?? 'origam-bracket')
	const ariaLabel = 'Tournament bracket'

	// `IBracketRoundProps.color` expects `TIntent | undefined` but `IBracketProps`
	// inherits `color` from `IColorProps` (TColor). Cast to the narrower type
	// expected by child round components — type-only, no runtime change.
	const roundColor = computed<TIntent | undefined>(() => props.color as TIntent | undefined)

	/*********************************************************
	 * Display rounds
	 *
	 * @description
	 * Single-elimination and round-robin pass straight through.
	 * Double-elimination sorts rounds into Winner Bracket, then
	 * Loser Bracket, then Grand Final — preserving the input
	 * order within each group.
	 ********************************************************/
	const displayRounds = computed<IBracketRound[]>(() => {
		if (props.variant !== BRACKET_VARIANT.DOUBLE_ELIMINATION) return props.rounds

		const winners = props.rounds.filter(r => r.side === 'winner' || r.side === undefined)
		const losers = props.rounds.filter(r => r.side === 'loser')
		const grandFinals = props.rounds.filter(r => r.side === 'grand-final')

		return [...winners, ...losers, ...grandFinals]
	})

	/*********************************************************
	 * Double-elimination sections
	 *
	 * @description
	 * A real double-elimination is two independent trees — the
	 * Winner Bracket and the Loser Bracket — that converge on a
	 * single Grand Final. The Winner Bracket champion carries a
	 * one-round head start into that match (set via the match's
	 * `advantage`, rendered as a `+N` badge on its competitor row).
	 * Each section is rendered as its own tree; empty sections are
	 * dropped.
	 ********************************************************/
	const winnerRounds = computed<IBracketRound[]>(() => props.rounds.filter(r => r.side === 'winner' || r.side === undefined))
	const loserRounds = computed<IBracketRound[]>(() => props.rounds.filter(r => r.side === 'loser'))
	const grandFinalRounds = computed<IBracketRound[]>(() => props.rounds.filter(r => r.side === 'grand-final'))

	type TDoubleSection = {
		key: 'winners' | 'losers' | 'grand-final'
		label: string
		rounds: IBracketRound[]
	}

	const doubleSections = computed<TDoubleSection[]>(() => {
		const all: TDoubleSection[] = [
			{key: 'winners', label: props.winnersLabel ?? '', rounds: winnerRounds.value},
			{key: 'losers', label: props.losersLabel ?? '', rounds: loserRounds.value},
			{key: 'grand-final', label: '', rounds: grandFinalRounds.value}
		]

		return all.filter(section => section.rounds.length > 0)
	})

	/*********************************************************
	 * Round-robin computed
	 *
	 * @description
	 * For round-robin we ignore the round axis and collapse
	 * every match into a competitor x competitor lookup.
	 ********************************************************/
	const roundRobinCompetitors = computed<IBracketCompetitor[]>(() => {
		const seen = new Map<string | number, IBracketCompetitor>()

		for (const round of props.rounds) {
			for (const match of round.matches) {
				if (match.competitorA && !seen.has(match.competitorA.id)) {
					seen.set(match.competitorA.id, match.competitorA)
				}
				if (match.competitorB && !seen.has(match.competitorB.id)) {
					seen.set(match.competitorB.id, match.competitorB)
				}
			}
		}

		return Array.from(seen.values())
	})

	const roundRobinMap = computed<Map<string, IBracketMatch>>(() => {
		const out = new Map<string, IBracketMatch>()

		for (const round of props.rounds) {
			for (const match of round.matches) {
				if (!match.competitorA || !match.competitorB) continue

				const aId = match.competitorA.id
				const bId = match.competitorB.id

				out.set(`${aId}|${bId}`, match)
			}
		}

		return out
	})

	const findRoundRobinMatch = (rowId: string | number, colId: string | number): IBracketMatch | undefined => {
		return roundRobinMap.value.get(`${rowId}|${colId}`) ?? roundRobinMap.value.get(`${colId}|${rowId}`)
	}

	const roundRobinScore = (row: IBracketCompetitor, col: IBracketCompetitor): string => {
		const match = findRoundRobinMatch(row.id, col.id)
		if (!match) return ''

		const isOrderedNormal = match.competitorA?.id === row.id
		const rowScore = isOrderedNormal ? match.scoreA : match.scoreB
		const colScore = isOrderedNormal ? match.scoreB : match.scoreA

		if (rowScore == null && colScore == null) return ''

		return `${rowScore ?? '—'} – ${colScore ?? '—'}`
	}

	const roundRobinCellClasses = (row: IBracketCompetitor, col: IBracketCompetitor) => {
		const isDiag = row.id === col.id
		const match = findRoundRobinMatch(row.id, col.id)
		const isWinner = match?.winnerId === row.id

		return [
			'origam-bracket__rr-cell',
			{
				'origam-bracket__rr-cell--diag': isDiag,
				'origam-bracket__rr-cell--winner': isWinner,
				'origam-bracket__rr-cell--clickable': !isDiag && match && props.interactive
			}
		]
	}

	const describeRoundRobinCell = (row: IBracketCompetitor, col: IBracketCompetitor): string => {
		if (row.id === col.id) return `${row.name} versus itself, not applicable`

		const match = findRoundRobinMatch(row.id, col.id)
		if (!match) return `${row.name} vs ${col.name}, no match`

		const score = roundRobinScore(row, col)

		return `${row.name} vs ${col.name}${score ? `, score ${score}` : ''}`
	}

	const onRoundRobinCellClick = (row: IBracketCompetitor, col: IBracketCompetitor, event: MouseEvent) => {
		if (row.id === col.id) return

		const match = findRoundRobinMatch(row.id, col.id)
		if (!match) return

		const round = props.rounds.find(r => r.matches.some(m => m.id === match.id))
		if (!round) return

		emit('match-click', match, round, event)
	}

	/*********************************************************
	 * Connector layout
	 *
	 * @description
	 * Pure-function path computation. Each round occupies one
	 * column of width `matchWidth`. Matches inside a round are
	 * evenly spaced — the spacing doubles at each round so the
	 * tree branches classically.
	 *
	 * Connector path = horizontal exit (16px) + vertical
	 * traversal to the centre of the target match + horizontal
	 * entry (16px).
	 ********************************************************/
	const matchWidth = BRACKET_DEFAULT_MATCH_WIDTH
	const matchHeight = BRACKET_DEFAULT_MATCH_HEIGHT
	const baseGap = BRACKET_DEFAULT_MATCH_GAP
	const roundGap = BRACKET_DEFAULT_ROUND_GAP

	const isHorizontal = computed<boolean>(() => props.direction === DIRECTION.HORIZONTAL)

	/*********************************************************
	 * Round thickness — direction-aware
	 *
	 * @description
	 * In horizontal mode each round is a column of width `matchWidth`
	 * (~240 px). In vertical mode each round is a row whose thickness
	 * controls how compact the bracket is vertically AND where the SVG
	 * connectors anchor. Using `matchWidth` (240) leaves a lot of empty
	 * space below every match card; using a tighter value keeps the
	 * connectors aligned with the cards while shrinking the layout.
	 ********************************************************/
	const verticalRoundThickness = 120

	const showConnectors = computed<boolean>(() => {
		if (props.variant === BRACKET_VARIANT.ROUND_ROBIN) return false

		return displayRounds.value.length > 1
	})

	const maxMatchesInRound = computed<number>(() => {
		let max = 1

		for (const r of displayRounds.value) {
			if (r.matches.length > max) max = r.matches.length
		}

		return max
	})

	const totalHeight = computed<number>(() => {
		return maxMatchesInRound.value * (matchHeight + baseGap)
	})

	const treeRef = ref<HTMLElement | null>(null)
	const doubleRef = ref<HTMLElement | null>(null)
	const connectorViewBox = ref<string>('0 0 0 0')

	type TConnectorPath = {
		key: string
		d: string
		from: { matchId: IBracketMatch['id']; x: number; y: number }
		to: { matchId: IBracketMatch['id']; x: number; y: number }
		winner: boolean
	}

	/*********************************************************
	 * Connector measurement (real DOM positions)
	 *
	 * @description
	 * Connectors are drawn from the *measured* centre of each
	 * match card rather than a computed grid. The flex layout
	 * (space-around + gap) and the per-round title offset move
	 * cards away from any formula-predicted position, so a
	 * formula produced visibly off-centre, unbalanced links.
	 * Measuring the live rects keeps every link anchored to the
	 * exact middle of the card it leaves / enters, whatever the
	 * title, density, scores or gap.
	 ********************************************************/
	const connectorPaths = ref<TConnectorPath[]>([])

	/*********************************************************
	 * Double-elimination connectors (id-driven)
	 *
	 * @description
	 * The two trees + grand final converge in arbitrary positions,
	 * so connectors are driven purely by `nextMatchId`: every match
	 * that declares a downstream id draws a link to it, wherever that
	 * card lands. Measured against the whole double-elim container so
	 * WB-final → GF and LB-final → GF both resolve across the trees.
	 ********************************************************/
	const measureDoubleConnectors = (): void => {
		const rootEl = doubleRef.value

		if (!rootEl || !showConnectors.value) {
			connectorPaths.value = []

			return
		}

		const rootRect = rootEl.getBoundingClientRect()

		connectorViewBox.value = `0 0 ${rootRect.width} ${rootRect.height}`

		const rectById = new Map<string, DOMRect>()
		rootEl.querySelectorAll<HTMLElement>('[data-match-id]').forEach((card) => {
			rectById.set(String(card.dataset.matchId), card.getBoundingClientRect())
		})

		const paths: TConnectorPath[] = []

		for (const round of props.rounds) {
			for (const match of round.matches) {
				if (match.nextMatchId == null) continue

				const fromRect = rectById.get(String(match.id))
				const toRect = rectById.get(String(match.nextMatchId))

				if (!fromRect || !toRect) continue

				const fromCenterY = (fromRect.top - rootRect.top) + fromRect.height / 2
				const toCenterY = (toRect.top - rootRect.top) + toRect.height / 2
				const startX = fromRect.right - rootRect.left
				const endX = toRect.left - rootRect.left
				const midX = (startX + endX) / 2

				paths.push({
					key: `${match.id}-${match.nextMatchId}`,
					d: `M ${startX},${fromCenterY} L ${midX},${fromCenterY} L ${midX},${toCenterY} L ${endX},${toCenterY}`,
					from: {matchId: match.id, x: startX, y: fromCenterY},
					to: {matchId: match.nextMatchId, x: endX, y: toCenterY},
					winner: match.winnerId != null
				})
			}
		}

		connectorPaths.value = paths
	}

	const measureSingleConnectors = (): void => {
		const treeEl = treeRef.value

		if (!treeEl || !showConnectors.value) {
			connectorPaths.value = []

			return
		}

		const treeRect = treeEl.getBoundingClientRect()

		connectorViewBox.value = `0 0 ${treeRect.width} ${treeRect.height}`

		const roundEls = Array.from(treeEl.querySelectorAll<HTMLElement>('.origam-bracket__round'))
		const cardsPerRound = roundEls.map((roundEl) => {
			const matchesEl = roundEl.querySelector('.origam-bracket-round__matches')

			return matchesEl
				? Array.from(matchesEl.children).map(card => card.getBoundingClientRect())
				: []
		})

		const horiz = isHorizontal.value
		const paths: TConnectorPath[] = []

		for (let r = 0; r < displayRounds.value.length - 1; r += 1) {
			const round = displayRounds.value[r]
			const nextRound = displayRounds.value[r + 1]
			const fromCards = cardsPerRound[r] ?? []
			const toCards = cardsPerRound[r + 1] ?? []

			for (let i = 0; i < round.matches.length; i += 1) {
				const match = round.matches[i]

				let nextIndex = -1
				if (match.nextMatchId != null) {
					nextIndex = nextRound.matches.findIndex(m => m.id === match.nextMatchId)
				}
				if (nextIndex === -1) nextIndex = Math.floor(i / 2)

				const nextMatch = nextRound.matches[nextIndex]
				const fromRect = fromCards[i]
				const toRect = toCards[nextIndex]

				if (!nextMatch || !fromRect || !toRect) continue

				const fromCenterX = (fromRect.left - treeRect.left) + fromRect.width / 2
				const fromCenterY = (fromRect.top - treeRect.top) + fromRect.height / 2
				const toCenterX = (toRect.left - treeRect.left) + toRect.width / 2
				const toCenterY = (toRect.top - treeRect.top) + toRect.height / 2

				let d: string
				let from: TConnectorPath['from']
				let to: TConnectorPath['to']

				if (horiz) {
					const startX = fromRect.right - treeRect.left
					const endX = toRect.left - treeRect.left
					const midX = (startX + endX) / 2

					d = `M ${startX},${fromCenterY} L ${midX},${fromCenterY} L ${midX},${toCenterY} L ${endX},${toCenterY}`
					from = {matchId: match.id, x: startX, y: fromCenterY}
					to = {matchId: nextMatch.id, x: endX, y: toCenterY}
				} else {
					const startY = fromRect.bottom - treeRect.top
					const endY = toRect.top - treeRect.top
					const midY = (startY + endY) / 2

					d = `M ${fromCenterX},${startY} L ${fromCenterX},${midY} L ${toCenterX},${midY} L ${toCenterX},${endY}`
					from = {matchId: match.id, x: fromCenterX, y: startY}
					to = {matchId: nextMatch.id, x: toCenterX, y: endY}
				}

				paths.push({
					key: `${match.id}-${nextMatch.id}`,
					d,
					from,
					to,
					winner: match.winnerId != null
				})
			}
		}

		connectorPaths.value = paths
	}

	const measureConnectors = (): void => {
		if (props.variant === BRACKET_VARIANT.DOUBLE_ELIMINATION) {
			measureDoubleConnectors()

			return
		}

		if (props.variant === BRACKET_VARIANT.ROUND_ROBIN) {
			connectorPaths.value = []

			return
		}

		measureSingleConnectors()
	}

	const connectorContainer = (): HTMLElement | null => {
		return props.variant === BRACKET_VARIANT.DOUBLE_ELIMINATION ? doubleRef.value : treeRef.value
	}

	let connectorResizeObserver: ResizeObserver | null = null

	const attachConnectorObserver = (): void => {
		connectorResizeObserver?.disconnect()

		const el = connectorContainer()

		if (typeof ResizeObserver !== 'undefined' && el) {
			connectorResizeObserver = new ResizeObserver(() => measureConnectors())
			connectorResizeObserver.observe(el)
		}
	}

	onMounted(() => {
		nextTick(() => {
			attachConnectorObserver()
			measureConnectors()
		})
	})

	onBeforeUnmount(() => {
		connectorResizeObserver?.disconnect()
		connectorResizeObserver = null
	})

	watch(
		() => props.variant,
		() => nextTick(() => {
			attachConnectorObserver()
			measureConnectors()
		}),
		{flush: 'post'}
	)

	watch(
		[
			displayRounds,
			isHorizontal,
			() => props.showScores,
			() => props.showSeed,
			() => props.density,
			() => props.showRoundTitles
		],
		() => nextTick(measureConnectors),
		{flush: 'post'}
	)

	const roundStyleFor = (_index: number): StyleValue => {
		const minHeight = `${totalHeight.value}px`

		if (isHorizontal.value) {
			return {
				minHeight,
				width: `${matchWidth}px`,
				flex: '0 0 auto'
			}
		}

		return {
			minWidth: `${totalHeight.value}px`,
			height: `${verticalRoundThickness}px`,
			flex: '0 0 auto'
		}
	}

	/*********************************************************
	 * Event proxies
	 ********************************************************/
	const onMatchClick = (match: IBracketMatch, event: MouseEvent) => {
		const round = displayRounds.value.find(r => r.matches.some(m => m.id === match.id))
		if (!round) return

		emit('match-click', match, round, event)
	}

	const onWinnerClick = (competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent) => {
		emit('winner-click', competitor, match, event)
	}

	const onCompetitorClick = (competitor: IBracketCompetitor, match: IBracketMatch, _side: 'A' | 'B', event: MouseEvent | KeyboardEvent) => {
		emit('competitor-click', competitor, match, event)
	}

	// Legible text for a painted surface. The intent → foreground tokens
	// always pair white, which only contrasts a *dark* fill; on a light
	// intent (warning, success, …) white is unreadable. Since the surface
	// resolves to a theme var we cannot WCAG-test it in JS — so we measure
	// the painted match card at runtime and pick the better of black /
	// white. Reactive: re-measured on mount, on bgColor / variant change.
	const autoTextColor = ref<string | null>(null)

	const measureContrast = (): void => {
		if (!props.bgColor) {
			autoTextColor.value = null

			return
		}

		const card = connectorContainer()?.querySelector<HTMLElement>('.origam-bracket-match')
		if (!card) {
			autoTextColor.value = null

			return
		}

		const channels = getComputedStyle(card).backgroundColor.match(/\d+(?:\.\d+)?/g)
		if (!channels || channels.length < 3) {
			autoTextColor.value = null

			return
		}

		// Pick the black / white that maximises the WCAG ratio against the
		// rendered surface. Crossover is at a gamma-corrected relative
		// luminance of ~0.179: darker fills (primary) take white, lighter
		// ones (warning, success, info) take black.
		const linear = (channel: number): number => {
			const c = channel / 255

			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
		}
		const luminance = 0.2126 * linear(+channels[0]) + 0.7152 * linear(+channels[1]) + 0.0722 * linear(+channels[2])

		autoTextColor.value = luminance < 0.179 ? '#ffffff' : '#000000'
	}

	/*********************************************************
	 * Color / shape / border → CSS custom properties
	 *
	 * @description
	 * `bgColor` / `rounded` / `elevation` / `border*` paint EACH match via
	 * the shared `bracketSurfaceVars` resolver (single source of truth with
	 * OrigamBracketMatch). `color` drives the match text (auto-contrast wins
	 * when a surface is painted). The connector links follow the match
	 * border (width + style + colour) so trees and links read as one.
	 ********************************************************/
	const colorVars = computed<Record<string, string>>(() => {
		const vars: Record<string, string> = bracketSurfaceVars(props as IBracketSurfaceInput)

		// Text foreground: a painted surface (`bgColor`) takes the measured
		// black / white that actually passes WCAG against it; with no
		// surface, `color` drives the text on the neutral background.
		const foreground = autoTextColor.value ?? resolveBracketForeground(props.color as string | null | undefined)
		if (foreground) vars['--origam-bracket---color'] = foreground

		// Connector links mirror the match border. stroke-width is set
		// explicitly (not just via the SCSS fallback) because a global
		// `:root` default for it would otherwise always win.
		const borderColor = resolveBracketBorderColor(props.borderColor)
		if (borderColor) {
			vars['--origam-bracket-connector---stroke-color'] = borderColor
			vars['--origam-bracket-connector---stroke-color-winner'] = borderColor
		}

		const borderWidth = resolveBracketBorderWidth(props.border as string | number | boolean | null | undefined)
		if (borderWidth) vars['--origam-bracket-connector---stroke-width'] = borderWidth

		const dash = bracketDashArray(props.borderStyle)
		if (dash.dasharray) vars['--origam-bracket-connector---stroke-dasharray'] = dash.dasharray
		if (dash.linecap) vars['--origam-bracket-connector---stroke-linecap'] = dash.linecap

		return vars
	})

	// Read the SETTLED surface: the match card animates its background
	// (`transition: background-color 120ms`), so an immediate read sees the
	// mid-transition colour and locks the wrong black / white. Wait past
	// the transition before measuring.
	const CONTRAST_SETTLE_MS = 200
	let contrastTimer: ReturnType<typeof setTimeout> | null = null

	const scheduleContrast = (): void => {
		if (typeof window === 'undefined') return
		if (contrastTimer) clearTimeout(contrastTimer)

		contrastTimer = setTimeout(measureContrast, CONTRAST_SETTLE_MS)
	}

	watch(
		[() => props.bgColor, () => props.variant, displayRounds],
		scheduleContrast,
		{flush: 'post'}
	)

	onMounted(scheduleContrast)

	onBeforeUnmount(() => {
		if (contrastTimer) clearTimeout(contrastTimer)
		contrastTimer = null
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * `rounded`, `elevation` and `border*` are applied PER-MATCH via
	 * `colorVars` (CSS custom properties the match cards consume), not on
	 * the bracket root — so each card is shaped / elevated / bordered.
	 ********************************************************/
	const {dimensionStyles} = useDimension(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {typographyStyles} = useTypography(props, 'bracket-double-label')

	const rootStyles = computed<StyleValue>(() => {
		return [
			dimensionStyles.value,
			marginStyles.value,
			paddingStyles.value,
			{
				'--origam-bracket---round-gap': `${roundGap}px`,
				'--origam-bracket---match-gap': `${baseGap}px`,
				...colorVars.value
			},
			props.style
		] as StyleValue
	})

	const rootClasses = computed(() => {
		return [
			'origam-bracket',
			`origam-bracket--variant-${props.variant}`,
			`origam-bracket--direction-${props.direction}`,
			`origam-bracket--density-${props.density ?? 'default'}`,
			`origam-bracket--color-${props.color}`,
			marginClasses.value,
			paddingClasses.value,
			props.class
		]
	})

	const treeClasses = computed(() => {
		return [
			'origam-bracket__tree',
			`origam-bracket__tree--direction-${props.direction}`
		]
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		displayRounds,
		connectorPaths,
		roundRobinCompetitors
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-bracket {
		display: block;
		position: relative;
		color: var(--origam-bracket---color, currentColor);
		background-color: var(--origam-bracket---background-color, transparent);
		padding-block: var(--origam-bracket---padding-block, 16px);
		padding-inline: var(--origam-bracket---padding-inline, 16px);
		overflow: auto;

		&__tree {
			display: flex;
			position: relative;
			gap: var(--origam-bracket---round-gap, 48px);
			/* Pin to natural size — otherwise a wider parent stretches
			 * the tree, the connectors SVG stretches with it (via
			 * preserveAspectRatio="none"), but the round columns keep
			 * their fixed width → connectors land outside the cards. */
			width: max-content;

			&--direction-horizontal {
				flex-direction: row;
				align-items: stretch;
			}

			&--direction-vertical {
				flex-direction: column;
				align-items: stretch;
			}
		}

		&__round {
			position: relative;
			z-index: 1;
		}

		&__double {
			display: grid;
			position: relative;
			grid-template-columns: max-content max-content;
			grid-template-areas:
				"winners grand-final"
				"losers  grand-final";
			column-gap: var(--origam-bracket---round-gap, 48px);
			row-gap: var(--origam-bracket-double---section-gap, 40px);
			width: max-content;
		}

		&__de-section {
			position: relative;
			z-index: 1;

			&--winners {
				grid-area: winners;
			}

			&--losers {
				grid-area: losers;
			}

			&--grand-final {
				grid-area: grand-final;
				align-self: center;
			}
		}

		&__de-label {
			margin: 0 0 var(--origam-bracket-double-label---margin-block-end, 12px);
			color: var(--origam-bracket-double-label---color, var(--origam-color__text---primary, #1a1a1a));
			font-size: var(--origam-bracket-double-label---font-size, 0.75rem);
			font-weight: var(--origam-bracket-double-label---font-weight, 700);
			letter-spacing: var(--origam-bracket-double-label---letter-spacing, 0.08em);
			text-transform: var(--origam-bracket-double-label---text-transform, uppercase);
		}

		&__de-tree {
			display: flex;
			position: relative;
			flex-direction: row;
			align-items: stretch;
			gap: var(--origam-bracket---round-gap, 48px);
			width: max-content;
		}

		&__connectors {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			pointer-events: none;
			z-index: 0;
			overflow: visible;
		}

		&__connector {
			stroke: var(--origam-bracket-connector---stroke-color, var(--origam-bracket-match---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))));
			stroke-width: var(--origam-bracket-connector---stroke-width, var(--origam-bracket-match---border-width, 1px));
			stroke-dasharray: var(--origam-bracket-connector---stroke-dasharray, none);
			stroke-linecap: var(--origam-bracket-connector---stroke-linecap, butt);

			&--winner {
				stroke: var(--origam-bracket-connector---stroke-color-winner, var(--origam-bracket-match---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))));
				stroke-width: var(--origam-bracket-connector---stroke-width, var(--origam-bracket-match---border-width, 1px));
			}
		}

		&__round-robin {
			display: grid;
			gap: 1px;
			background: var(--origam-color__border---subtle, rgba(0, 0, 0, 0.08));
			border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.08));
			border-radius: 6px;
			overflow: hidden;
			min-width: max-content;
		}

		&__rr-row {
			display: grid;
			grid-template-columns: 200px repeat(auto-fit, minmax(72px, 1fr));
			gap: 1px;
		}

		&__rr-corner {
			background: var(--origam-bracket-round-robin---header-background, var(--origam-color__surface---subtle, #f5f5f5));
		}

		&__rr-head {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 8px 12px;
			background: var(--origam-bracket-round-robin---header-background, var(--origam-color__surface---subtle, #f5f5f5));
			color: var(--origam-bracket-round-robin---header-color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66)));
			font-size: 0.8125rem;
			font-weight: 600;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&--row {
				justify-content: flex-start;
			}
		}

		&__rr-cell {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: var(--origam-bracket-round-robin---cell-size, 56px);
			padding: 8px;
			background: var(--origam-bracket-round-robin---cell-background, var(--origam-color__surface---default, #fff));
			font-size: 0.8125rem;
			color: var(--origam-color__text---primary, #1a1a1a);

			&--diag {
				background: var(--origam-bracket-round-robin---cell-background-diag, var(--origam-color__surface---subtle, #f5f5f5));
				color: var(--origam-color__text---tertiary, rgba(0, 0, 0, 0.4));
			}

			&--winner {
				font-weight: 600;
				color: var(--origam-color__action--primary---fg, #1976d2);
			}

			&--clickable {
				cursor: pointer;

				&:hover {
					background: var(--origam-color__surface---elevated, #fafafa);
				}
			}
		}

		&--density-compact {
			--origam-bracket-match---min-height: 56px;
			--origam-bracket-competitor---height: 28px;
			--origam-bracket-round---match-gap: 16px;
		}
	}
</style>

<style>
	:root {
		--origam-bracket---round-gap: 48px;
		--origam-bracket---match-gap: 24px;
		--origam-bracket---padding-block: 16px;
		--origam-bracket---padding-inline: 16px;
		--origam-bracket-connector---stroke-width: 1px;
	}
</style>
