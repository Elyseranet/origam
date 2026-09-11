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
					color: 'primary'
				})"
		>
			<template #default="{ state }">
				<div class="story-round-shell">
					<origam-bracket-round
							:round="SAMPLE_ROUND"
							:index="0"
							:total-rounds="3"
							:color="state.color"
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
					color: 'primary'
				})"
		>
			<template #default="{ state }">
				<div class="story-round-shell">
					<origam-bracket-round
							v-bind="state"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
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
	import { OrigamBracketRound } from '@origam/components'
	import type { IBracketMatch, IBracketRound, IBracketRoundProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS
	} from '@stories/const'

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
