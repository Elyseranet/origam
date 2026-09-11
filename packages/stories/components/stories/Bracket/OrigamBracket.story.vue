<template>
	<Story
			group="components"
			title="Bracket/OrigamBracket"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBracketProps>>({
					variant: BRACKET_VARIANT.DOUBLE_ELIMINATION,
					direction: DIRECTION.HORIZONTAL,
					color: 'primary',
					showRoundTitles: true,
					showScores: true,
					showSeed: false
				})"
		>
			<template #default="{ state }">
				<origam-bracket
						:rounds="roundsFor(state.variant)"
						:padding="state.padding"
						:margin="state.margin"
						:variant="state.variant"
						:direction="state.direction"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:show-round-titles="state.showRoundTitles"
						:show-scores="state.showScores"
						:show-seed="state.showSeed"
						:winners-label="state.winnersLabel"
						:losers-label="state.losersLabel"
						:width="state.width"
						:height="state.height"
						:min-width="state.minWidth"
						:max-width="state.maxWidth"
						:min-height="state.minHeight"
						:max-height="state.maxHeight"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:letter-spacing="state.letterSpacing"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant"   title="Variant"   :options="BRACKET_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.direction" title="Direction" :options="BRACKET_DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderColor" title="Border Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showRoundTitles" title="Show Round Titles"/>
					<HstCheckbox v-model="state.showScores"      title="Show Scores"/>
					<HstCheckbox v-model="state.showSeed"        title="Show Seed"/>
				</StoryGroup>
				<StoryGroup title="Double elimination">
					<HstText v-model="state.winnersLabel" title="Winners Label"/>
					<HstText v-model="state.losersLabel"  title="Losers Label"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"       :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"     :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing"  :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IBracketProps>>({
					rounds: SINGLE_ELIM_4,
					interactive: true,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<origam-bracket
						:rounds="state.rounds ?? SINGLE_ELIM_4"
						:interactive="state.interactive"
						:tag="state.tag"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.interactive" title="Interactive"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - match-click">
			<div class="story-shell" data-cy="bracket-emit-match-click">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-emit-match-click-host"
						@match-click="logEvent('match-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - winner-click">
			<div class="story-shell" data-cy="bracket-emit-winner-click">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-emit-winner-click-host"
						@winner-click="logEvent('winner-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - competitor-click">
			<div class="story-shell" data-cy="bracket-emit-competitor-click">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-emit-competitor-click-host"
						@competitor-click="logEvent('competitor-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Match">
			<div class="story-shell" data-cy="bracket-slot-match">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-slot-match-host"
				>
					<template #match="{ match }">
						<div class="custom-match" data-cy="bracket-slot-match-card">
							<strong>{{ match.competitorA?.name ?? 'TBD' }}</strong>
							vs
							<strong>{{ match.competitorB?.name ?? 'TBD' }}</strong>
						</div>
					</template>
				</origam-bracket>
			</div>
		</Variant>

		<Variant title="Slots - Competitor">
			<div class="story-shell" data-cy="bracket-slot-competitor">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-slot-competitor-host"
				>
					<template #competitor="{ competitor, isWinner }">
						<div
								:class="['custom-competitor', { 'custom-competitor--winner': isWinner }]"
								data-cy="bracket-slot-competitor-row"
						>
							<span class="custom-competitor__flag">🏳️</span>
							<span>{{ competitor?.name ?? 'TBD' }}</span>
						</div>
					</template>
				</origam-bracket>
			</div>
		</Variant>

		<Variant title="Slots - RoundTitle">
			<div class="story-shell" data-cy="bracket-slot-round-title">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-slot-round-title-host"
				>
					<template #round-title="{ round }">
						<div class="custom-round-title" data-cy="bracket-slot-round-title-content">
							{{ round.title }} — custom
						</div>
					</template>
				</origam-bracket>
			</div>
		</Variant>

		<Variant title="Slots - Connector">
			<div class="story-shell" data-cy="bracket-slot-connector">
				<origam-bracket
						:rounds="SINGLE_ELIM_4"
						data-cy="bracket-slot-connector-host"
				>
					<template #connector="{ from, to }">
						<path
								:d="`M ${from.x},${from.y} L ${to.x},${to.y}`"
								fill="none"
								stroke="var(--origam-color__action--primary---bg, #1976d2)"
								stroke-dasharray="4 2"
								stroke-width="2"
						/>
					</template>
				</origam-bracket>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IBracketProps>>({
					variant: BRACKET_VARIANT.SINGLE_ELIMINATION,
					direction: DIRECTION.HORIZONTAL,
					density: DENSITY.DEFAULT,
					color: 'primary',
					showRoundTitles: true,
					showScores: true,
					showSeed: false,
					interactive: true
				})"
		>
			<template #default="{ state }">
				<div class="story-shell" data-cy="bracket-playground">
					<origam-bracket
							:rounds="roundsFor(state.variant, true)"
							:variant="state.variant"
							:direction="state.direction"
							:density="state.density"
							:color="state.color"
							:bg-color="state.bgColor"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:show-round-titles="state.showRoundTitles"
							:show-scores="state.showScores"
							:show-seed="state.showSeed"
							:interactive="state.interactive"
							:tag="state.tag"
							data-cy="bracket-playground-host"
							@match-click="logEvent('match-click', $event)"
							@winner-click="logEvent('winner-click', $event)"
							@competitor-click="logEvent('competitor-click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.variant"         title="Variant"           :options="BRACKET_VARIANT_OPTIONS"/>
					<HstSelect   v-model="state.direction"       title="Direction"         :options="BRACKET_DIRECTION_OPTIONS"/>
					<HstSelect   v-model="state.color"           title="Color"             :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"         title="Bg Color"          :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.density"         title="Density"           :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"         title="Rounded"           :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"       title="Elevation"         :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.showRoundTitles" title="Show Round Titles"/>
					<HstCheckbox v-model="state.showScores"      title="Show Scores"/>
					<HstCheckbox v-model="state.showSeed"        title="Show Seed"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.interactive" title="Interactive"/>
					<HstSelect   v-model="state.tag"         title="Tag" :options="TAG_OPTIONS"/>
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

	import { OrigamBracket } from '@origam/components'
	import { BRACKET_VARIANT, DENSITY, DIRECTION } from '@origam/enums'
	import type {
		IBracketMatch,
		IBracketProps,
		IBracketRound,
		IOptions
	} from '@origam/interfaces'
	import type { TBracketVariant } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const BRACKET_VARIANT_OPTIONS: Array<IOptions<TBracketVariant>> = [
		{ label: 'Single elimination', value: BRACKET_VARIANT.SINGLE_ELIMINATION },
		{ label: 'Double elimination', value: BRACKET_VARIANT.DOUBLE_ELIMINATION },
		{ label: 'Round robin',        value: BRACKET_VARIANT.ROUND_ROBIN }
	]

	const BRACKET_DIRECTION_OPTIONS: Array<IOptions<'horizontal' | 'vertical'>> = [
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'Vertical',   value: DIRECTION.VERTICAL }
	]

	const SINGLE_ELIM_8: IBracketRound[] = [
		{
			id: 'qf',
			title: 'Quarter-finals',
			matches: [
				{
					id: 'qf1',
					competitorA: { id: 't1', name: 'T1', seed: 1 },
					competitorB: { id: 'navi', name: 'NaVi', seed: 8 },
					scoreA: 2,
					scoreB: 0,
					winnerId: 't1',
					status: 'completed',
					nextMatchId: 'sf1'
				},
				{
					id: 'qf2',
					competitorA: { id: 'g2', name: 'G2', seed: 5 },
					competitorB: { id: 'tl', name: 'Team Liquid', seed: 4 },
					scoreA: 2,
					scoreB: 1,
					winnerId: 'g2',
					status: 'completed',
					nextMatchId: 'sf1'
				},
				{
					id: 'qf3',
					competitorA: { id: 'fnc', name: 'FNATIC', seed: 3 },
					competitorB: { id: 'astralis', name: 'Astralis', seed: 6 },
					scoreA: 0,
					scoreB: 2,
					winnerId: 'astralis',
					status: 'completed',
					nextMatchId: 'sf2'
				},
				{
					id: 'qf4',
					competitorA: { id: 'c9', name: 'Cloud9', seed: 7 },
					competitorB: { id: 'faze', name: 'FaZe', seed: 2 },
					scoreA: 1,
					scoreB: 2,
					winnerId: 'faze',
					status: 'completed',
					nextMatchId: 'sf2'
				}
			]
		},
		{
			id: 'sf',
			title: 'Semi-finals',
			matches: [
				{
					id: 'sf1',
					competitorA: { id: 't1', name: 'T1', seed: 1 },
					competitorB: { id: 'g2', name: 'G2', seed: 5 },
					scoreA: 2,
					scoreB: 1,
					winnerId: 't1',
					status: 'completed',
					nextMatchId: 'final'
				},
				{
					id: 'sf2',
					competitorA: { id: 'astralis', name: 'Astralis', seed: 6 },
					competitorB: { id: 'faze', name: 'FaZe', seed: 2 },
					status: 'live',
					nextMatchId: 'final'
				}
			]
		},
		{
			id: 'final',
			title: 'Final',
			matches: [
				{
					id: 'final',
					competitorA: { id: 't1', name: 'T1', seed: 1 },
					competitorB: null,
					status: 'pending'
				}
			]
		}
	]

	const SINGLE_ELIM_4: IBracketRound[] = [
		{
			id: 'sf',
			title: 'Semi-finals',
			matches: [
				{
					id: 'sf1',
					competitorA: { id: 't1', name: 'T1', seed: 1 },
					competitorB: { id: 'g2', name: 'G2', seed: 4 },
					scoreA: 2,
					scoreB: 0,
					winnerId: 't1',
					nextMatchId: 'f1'
				},
				{
					id: 'sf2',
					competitorA: { id: 'fnc', name: 'FNATIC', seed: 2 },
					competitorB: { id: 'tl', name: 'Team Liquid', seed: 3 },
					scoreA: 1,
					scoreB: 2,
					winnerId: 'tl',
					nextMatchId: 'f1'
				}
			]
		},
		{
			id: 'final',
			title: 'Final',
			matches: [
				{
					id: 'f1',
					competitorA: { id: 't1', name: 'T1', seed: 1 },
					competitorB: { id: 'tl', name: 'Team Liquid', seed: 3 },
					scoreA: 3,
					scoreB: 2,
					winnerId: 't1',
					status: 'completed'
				}
			]
		}
	]

	const DOUBLE_ELIM_4: IBracketRound[] = [
		{
			id: 'wb-sf',
			title: 'Winner semis',
			side: 'winner',
			matches: [
				{
					id: 'wsf1',
					competitorA: { id: 't1', name: 'T1' },
					competitorB: { id: 'g2', name: 'G2' },
					scoreA: 2, scoreB: 0, winnerId: 't1',
					status: 'completed', nextMatchId: 'wf'
				},
				{
					id: 'wsf2',
					competitorA: { id: 'fnc', name: 'FNATIC' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					scoreA: 1, scoreB: 2, winnerId: 'tl',
					status: 'completed', nextMatchId: 'wf'
				}
			]
		},
		{
			id: 'wb-f',
			title: 'Winner final',
			side: 'winner',
			matches: [
				{
					id: 'wf',
					competitorA: { id: 't1', name: 'T1' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					scoreA: 2, scoreB: 1, winnerId: 't1',
					status: 'completed', nextMatchId: 'gf'
				}
			]
		},
		{
			id: 'lb-r1',
			title: 'Losers round 1',
			side: 'loser',
			matches: [
				{
					id: 'lr1',
					competitorA: { id: 'g2', name: 'G2' },
					competitorB: { id: 'fnc', name: 'FNATIC' },
					scoreA: 2, scoreB: 1, winnerId: 'g2',
					status: 'completed', nextMatchId: 'lf'
				}
			]
		},
		{
			id: 'lb-f',
			title: 'Losers final',
			side: 'loser',
			matches: [
				{
					id: 'lf',
					competitorA: { id: 'g2', name: 'G2' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					scoreA: 1, scoreB: 2, winnerId: 'tl',
					status: 'completed', nextMatchId: 'gf'
				}
			]
		},
		{
			id: 'gf',
			title: 'Grand Final',
			side: 'grand-final',
			matches: [
				{
					id: 'gf',
					competitorA: { id: 't1', name: 'T1' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					status: 'pending',
					advantage: { competitorId: 't1', rounds: 1 }
				}
			]
		}
	]

	const ROUND_ROBIN_4: IBracketRound[] = [
		{
			id: 'rr',
			title: 'Group stage',
			matches: [
				{
					id: 'rr1',
					competitorA: { id: 't1', name: 'T1' },
					competitorB: { id: 'g2', name: 'G2' },
					scoreA: 2, scoreB: 1, winnerId: 't1'
				},
				{
					id: 'rr2',
					competitorA: { id: 't1', name: 'T1' },
					competitorB: { id: 'fnc', name: 'FNATIC' },
					scoreA: 2, scoreB: 0, winnerId: 't1'
				},
				{
					id: 'rr3',
					competitorA: { id: 't1', name: 'T1' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					scoreA: 1, scoreB: 2, winnerId: 'tl'
				},
				{
					id: 'rr4',
					competitorA: { id: 'g2', name: 'G2' },
					competitorB: { id: 'fnc', name: 'FNATIC' },
					scoreA: 2, scoreB: 1, winnerId: 'g2'
				},
				{
					id: 'rr5',
					competitorA: { id: 'g2', name: 'G2' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					scoreA: 0, scoreB: 2, winnerId: 'tl'
				},
				{
					id: 'rr6',
					competitorA: { id: 'fnc', name: 'FNATIC' },
					competitorB: { id: 'tl', name: 'Team Liquid' },
					scoreA: 1, scoreB: 2, winnerId: 'tl'
				}
			]
		}
	]

	const roundsFor = (variant: TBracketVariant | undefined, bigSingle = false): IBracketRound[] => {
		if (variant === BRACKET_VARIANT.DOUBLE_ELIMINATION) return DOUBLE_ELIM_4
		if (variant === BRACKET_VARIANT.ROUND_ROBIN) return ROUND_ROBIN_4

		return bigSingle ? SINGLE_ELIM_8 : SINGLE_ELIM_4
	}
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 16px;
		overflow: auto;
	}

	.custom-match {
		min-height: 72px;
		width: 100%;
		box-sizing: border-box;
		padding: 12px;
		border: 1px dashed var(--origam-color__action--primary---bg, #1976d2);
		border-radius: 6px;
		font: 0.875rem/1.4 system-ui, sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: var(--origam-color__surface---default, #fff);
	}

	.custom-competitor {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		font: 0.875rem/1.4 system-ui, sans-serif;
	}

	.custom-competitor--winner {
		font-weight: 700;
		color: var(--origam-color__action--primary---bg, #1976d2);
	}

	.custom-competitor__flag {
		font-size: 1rem;
	}

	.custom-round-title {
		padding: 4px 8px;
		font: 0.75rem/1.4 system-ui, sans-serif;
		font-weight: 600;
		color: var(--origam-color__action--primary---bg, #1976d2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>

<docs lang="md" src="@docs/components/Bracket/OrigamBracket.md"/>
