<template>
	<Story
			group="components"
			title="Bracket/OrigamBracketRound"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBracketRoundProps>>({
					showRoundTitle: true,
					showScores: true,
					showSeed: false,
					interactive: true,
					color: 'primary',
					direction: DIRECTION.HORIZONTAL
				})"
		>
			<template #default="{ state }">
				<div class="story-round-shell">
					<origam-bracket-round
							:round="SAMPLE_ROUND"
							:index="0"
							:total-rounds="3"
							:color="state.color"
							:direction="state.direction"
							:show-round-title="state.showRoundTitle"
							:show-scores="state.showScores"
							:show-seed="state.showSeed"
							:interactive="state.interactive"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
							:letter-spacing="state.letterSpacing"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showRoundTitle" title="Show Round Title"/>
					<HstCheckbox v-model="state.showScores"    title="Show Scores"/>
					<HstCheckbox v-model="state.showSeed"      title="Show Seed"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"       :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"     :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing"  :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - match-click">
			<div class="story-round-shell" data-cy="round-emit-match-click">
				<origam-bracket-round
						:round="SAMPLE_ROUND"
						:index="0"
						:total-rounds="3"
						@match-click="logEvent('match-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - competitor-click">
			<div class="story-round-shell" data-cy="round-emit-competitor-click">
				<origam-bracket-round
						:round="SAMPLE_ROUND"
						:index="0"
						:total-rounds="3"
						@competitor-click="logEvent('competitor-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - winner-click">
			<div class="story-round-shell" data-cy="round-emit-winner-click">
				<origam-bracket-round
						:round="SAMPLE_ROUND"
						:index="0"
						:total-rounds="3"
						@winner-click="logEvent('winner-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Round-title">
			<div class="story-round-shell">
				<origam-bracket-round
						:round="SAMPLE_ROUND"
						:index="0"
						:total-rounds="3"
				>
					<template #round-title="{ round }">
						<div class="custom-round-title" data-cy="round-slot-title">
							🏆 {{ round.title }}
						</div>
					</template>
				</origam-bracket-round>
			</div>
		</Variant>

		<Variant title="Slots - Match">
			<div class="story-round-shell">
				<origam-bracket-round
						:round="SAMPLE_ROUND"
						:index="0"
						:total-rounds="3"
				>
					<template #match="{ match }">
						<div class="custom-match-card" data-cy="round-slot-match">
							{{ match.competitorA.name }} vs {{ match.competitorB.name }}
						</div>
					</template>
				</origam-bracket-round>
			</div>
		</Variant>

		<Variant title="Slots - Competitor">
			<div class="story-round-shell">
				<origam-bracket-round
						:round="SAMPLE_ROUND"
						:index="0"
						:total-rounds="3"
				>
					<template #competitor="{ competitor, isWinner }">
						<div :class="['custom-competitor', { 'custom-competitor--winner': isWinner }]" data-cy="round-slot-competitor">
							<span>🏳️</span>
							<span>{{ competitor?.name ?? 'TBD' }}</span>
						</div>
					</template>
				</origam-bracket-round>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBracketRoundProps>({
					round: SAMPLE_ROUND,
					index: 0,
					totalRounds: 3,
					showRoundTitle: true,
					showScores: true,
					showSeed: false,
					interactive: true,
					color: 'primary',
					direction: DIRECTION.HORIZONTAL
				})"
		>
			<template #default="{ state }">
				<div class="story-round-shell">
					<origam-bracket-round
							v-bind="state"
							@match-click="logEvent('match-click', $event)"
							@competitor-click="logEvent('competitor-click', $event)"
							@winner-click="logEvent('winner-click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showRoundTitle" title="Show Round Title"/>
					<HstCheckbox v-model="state.showScores"    title="Show Scores"/>
					<HstCheckbox v-model="state.showSeed"      title="Show Seed"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.interactive" title="Interactive"/>
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

	import { OrigamBracketRound } from '@origam/components'
	import { DIRECTION } from '@origam/enums'
	import type { IBracketMatch, IBracketRound, IBracketRoundProps, IOptions } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS
	} from '@stories/const'

	const DIRECTION_OPTIONS: Array<IOptions<'horizontal' | 'vertical'>> = [
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'Vertical',   value: DIRECTION.VERTICAL   }
	]

	const SAMPLE_MATCH: IBracketMatch = {
		id: 'sm1',
		competitorA: { id: 't1', name: 'T1', seed: 1 },
		competitorB: { id: 'g2', name: 'G2', seed: 4 },
		scoreA: 2,
		scoreB: 1,
		winnerId: 't1',
		status: 'completed'
	}

	const SAMPLE_ROUND: IBracketRound = {
		id: 'qf',
		title: 'Quarter-finals',
		matches: [SAMPLE_MATCH]
	}
</script>

<style scoped>
	.story-round-shell {
		width: 280px;
	}
</style>

<docs lang="md" src="@docs/components/Bracket/OrigamBracketRound.md"/>
