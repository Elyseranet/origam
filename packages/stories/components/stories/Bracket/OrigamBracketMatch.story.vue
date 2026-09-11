<template>
	<Story
			group="components"
			title="Bracket/OrigamBracketMatch"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBracketMatchProps>>({
					color: 'primary',
					showScores: true,
					showSeed: false
				})"
		>
			<template #default="{ state }">
				<div class="story-match-shell">
					<origam-bracket-match
							:match="MATCH_COMPLETED"
							:color="state.color"
							:bg-color="state.bgColor"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:width="state.width"
							:height="state.height"
							:padding="state.padding"
							:margin="state.margin"
							:status="state.status"
							:to="state.to"
							:show-scores="state.showScores"
							:show-seed="state.showSeed"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Status">
					<HstSelect v-model="state.status" title="Status"           :options="STATUS_OPTIONS"/>
					<HstText   v-model="state.to"     title="Live URL (to)"/>
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
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showScores" title="Show Scores"/>
					<HstCheckbox v-model="state.showSeed"   title="Show Seed"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<IBracketMatchProps>>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<div class="story-match-shell">
					<origam-bracket-match
							:match="MATCH_COMPLETED"
							:color="state.color"
							:bg-color="state.bgColor"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
              :status="BRACKET_MATCH_STATUS.LIVE"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IBracketMatchProps>>({
					status: BRACKET_MATCH_STATUS.LIVE,
					isFinal: false,
					interactive: true,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<div class="story-match-shell">
					<origam-bracket-match
							:match="MATCH_COMPLETED"
							:status="state.status"
							:is-final="state.isFinal"
							:interactive="state.interactive"
							:tag="state.tag"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstSelect   v-model="state.status"      title="Status" :options="STATUS_OPTIONS"/>
					<HstCheckbox v-model="state.isFinal"     title="Is Final"/>
					<HstCheckbox v-model="state.interactive" title="Interactive"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<div class="story-match-shell" data-cy="match-emit-click">
				<origam-bracket-match
						:match="MATCH_COMPLETED"
						@click="logEvent('click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - competitor-click">
			<div class="story-match-shell" data-cy="match-emit-competitor-click">
				<origam-bracket-match
						:match="MATCH_COMPLETED"
						@competitor-click="logEvent('competitor-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - winner-click">
			<div class="story-match-shell" data-cy="match-emit-winner-click">
				<origam-bracket-match
						:match="MATCH_COMPLETED"
						@winner-click="logEvent('winner-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Competitor">
			<div class="story-match-shell">
				<origam-bracket-match :match="MATCH_COMPLETED">
					<template #competitor="{ competitor, isWinner }">
						<div :class="['custom-competitor', { 'custom-competitor--winner': isWinner }]">
							<span>🏳️</span>
							<span>{{ competitor?.name ?? 'TBD' }}</span>
						</div>
					</template>
				</origam-bracket-match>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBracketMatchProps>({
					match: MATCH_COMPLETED,
					color: 'primary',
					status: undefined,
					isFinal: false,
					showScores: true,
					showSeed: false,
					interactive: true,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<div class="story-match-shell">
					<origam-bracket-match
							v-bind="state"
							@click="logEvent('click', $event)"
							@competitor-click="logEvent('competitor-click', $event)"
							@winner-click="logEvent('winner-click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"  title="Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.status" title="Status" :options="STATUS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showScores" title="Show Scores"/>
					<HstCheckbox v-model="state.showSeed"   title="Show Seed"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.isFinal"     title="Is Final"/>
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

	import { OrigamBracketMatch } from '@origam/components'
	import { BRACKET_MATCH_STATUS } from '@origam/enums'
	import type { IBracketMatch, IBracketMatchProps, IOptions } from '@origam/interfaces'
	import type { TBracketMatchStatus } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveActiveState,
		resolveHoverState,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const STATUS_OPTIONS: Array<IOptions<TBracketMatchStatus>> = [
		{ label: 'pending',   value: BRACKET_MATCH_STATUS.PENDING   },
		{ label: 'live',      value: BRACKET_MATCH_STATUS.LIVE      },
		{ label: 'completed', value: BRACKET_MATCH_STATUS.COMPLETED },
		{ label: 'forfeited', value: BRACKET_MATCH_STATUS.FORFEITED },
	]

	const MATCH_COMPLETED: IBracketMatch = {
		id: 'm1',
		competitorA: { id: 't1', name: 'T1', seed: 1 },
		competitorB: { id: 'g2', name: 'G2', seed: 4 },
		scoreA: 2,
		scoreB: 1,
		winnerId: 't1',
		status: 'completed'
	}

</script>

<style scoped>
	.story-match-shell {
		width: 260px;
	}

	.custom-competitor {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		font: 0.875rem/1.4 system-ui, sans-serif;
	}

	.custom-competitor--winner {
		font-weight: 700;
		color: var(--origam-color__action--primary---bg, #1976d2);
	}
</style>

<docs lang="md" src="@docs/components/Bracket/OrigamBracketMatch.md"/>
