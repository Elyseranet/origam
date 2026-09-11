<template>
	<Story
			group="components"
			title="Bracket/OrigamBracketCompetitor"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBracketCompetitorProps>>({
					color: 'primary',
					showScore: true,
					showSeed: true
				})"
		>
			<template #default="{ state }">
				<div class="story-competitor-shell">
					<origam-bracket-competitor
							:competitor="COMPETITOR"
							:score="2"
							:advantage-rounds="2"
							:color="state.color"
							:bg-color="state.bgColor"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:density="state.density"
							:width="state.width"
							:height="state.height"
							:padding="state.padding"
							:margin="state.margin"
							:show-score="state.showScore"
							:show-seed="state.showSeed"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
					/>
				</div>
			</template>
			<template #controls="{ state }">
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
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showScore" title="Show Score"/>
					<HstCheckbox v-model="state.showSeed"  title="Show Seed"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<IBracketCompetitorProps>>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<div class="story-competitor-shell">
					<origam-bracket-competitor
							:competitor="COMPETITOR"
							:score="2"
							:color="state.color"
							:bg-color="state.bgColor"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
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
				:init-state="() => useStoryInitState<Partial<IBracketCompetitorProps>>({
					interactive: true,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<div class="story-competitor-shell">
					<origam-bracket-competitor
							:competitor="COMPETITOR"
							:score="2"
							:interactive="state.interactive"
							:tag="state.tag"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.interactive" title="Interactive"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<div class="story-competitor-shell" data-cy="competitor-emit-click">
				<origam-bracket-competitor
						:competitor="COMPETITOR"
						:score="2"
						@click="logEvent('click', $event)"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBracketCompetitorProps>({
					competitor: COMPETITOR_AVATAR,
					score: 2,
					color: 'primary',
					bgColor: undefined,
					isWinner: false,
					isLoser: false,
					advantageRounds: 0,
					showScore: true,
					showSeed: true,
					interactive: true,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<div class="story-competitor-shell">
					<origam-bracket-competitor
							v-bind="state"
							@click="logEvent('click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstNumber v-model="state.score"   title="Score"/>
				</StoryGroup>
				<StoryGroup title="State">
					<HstCheckbox v-model="state.isWinner" title="Is Winner"/>
					<HstCheckbox v-model="state.isLoser"  title="Is Loser"/>
					<HstNumber   v-model="state.advantageRounds" title="Advantage Rounds"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showScore" title="Show Score"/>
					<HstCheckbox v-model="state.showSeed"  title="Show Seed"/>
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

	import { OrigamBracketCompetitor } from '@origam/components'
	import type { IBracketCompetitor, IBracketCompetitorProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		HOVER_OPTIONS,
		resolveActiveState,
		resolveHoverState,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const COMPETITOR: IBracketCompetitor = { id: 't1', name: 'T1', seed: 1 }
	const COMPETITOR_AVATAR: IBracketCompetitor = {
		id: 'tl',
		name: 'Team Liquid',
		seed: 3,
		avatar: 'https://i.pravatar.cc/40?img=12'
	}
</script>

<style scoped>
	.story-competitor-shell {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 240px;
	}
</style>

<docs lang="md" src="@docs/components/Bracket/OrigamBracketCompetitor.md"/>
