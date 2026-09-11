<template>
	<Story
			group="components"
			title="Timeline/OrigamTimeline"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITimelineProps>>({ color: 'primary', density: 'default', size: 'default' })"
		>
			<template #default="{ state }">
				<origam-timeline
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:items="releaseEntries"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITimelineProps>>({
					orientation: 'vertical',
					side: 'start',
					truncateLine: false,
					ariaLabel: ''
				})"
		>
			<template #default="{ state }">
				<div :style="state.orientation === 'horizontal' ? { maxWidth: '560px' } : {}">
					<origam-timeline
							:orientation="state.orientation"
							:side="state.side"
							:truncate-line="state.truncateLine"
							:aria-label="state.ariaLabel || undefined"
							:tag="state.tag"
							:items="releaseEntries"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstSelect   v-model="state.orientation"  title="Orientation" :options="TIMELINE_ORIENTATION_OPTIONS"/>
					<HstSelect   v-model="state.side"         title="Side"        :options="TIMELINE_SIDE_OPTIONS"/>
					<HstCheckbox v-model="state.truncateLine" title="Truncate Line"/>
				</StoryGroup>
				<StoryGroup title="Accessibility">
					<HstText v-model="state.ariaLabel" title="Aria Label"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Size / Density">
			<origam-timeline :items="releaseEntries" size="default" density="default" data-cy="timeline-size-density"/>
		</Variant>

		<Variant title="Prop — orientation (horizontal, scroll-snap slider)">
			<div style="max-width: 560px; overflow: hidden;">
				<origam-timeline :items="releaseEntries" orientation="horizontal" data-cy="timeline-horizontal"/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-timeline>
				<origam-timeline-item
						title="v1.0.0"
						subtitle="May 5, 2026"
						intent="primary"
						:is-last="false"
				>
					<template #default>
						<p><strong>v1.0.0 — Stable release</strong></p>
						<ul>
							<li>240 components shipped</li>
							<li>Full token coverage</li>
							<li>Playwright e2e suite</li>
						</ul>
					</template>
				</origam-timeline-item>
				<origam-timeline-item
						title="v0.9-rc"
						subtitle="Apr 28, 2026"
						intent="success"
						:is-last="true"
				>
					<template #default>
						<p>Release candidate — API surface frozen.</p>
					</template>
				</origam-timeline-item>
			</origam-timeline>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITimelineProps>({
					orientation: 'vertical',
					side: 'start',
					truncateLine: false,
					color: undefined,
					bgColor: undefined,
					density: 'default',
					size: 'default'
				})"
		>
			<template #default="{ state }">
				<div :style="state.orientation === 'horizontal' ? { maxWidth: '560px' } : {}">
					<origam-timeline
							v-bind="state"
							:items="releaseEntries"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.orientation"  title="Orientation" :options="TIMELINE_ORIENTATION_OPTIONS"/>
					<HstSelect   v-model="state.side"         title="Side"        :options="TIMELINE_SIDE_OPTIONS"/>
					<HstCheckbox v-model="state.truncateLine" title="Truncate Line"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamTimeline, OrigamTimelineItem } from '@origam/components'
	import type { ITimelineEntry, ITimelineProps } from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'
	import type { TTimelineOrientation, TTimelineSide } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const TIMELINE_ORIENTATION_OPTIONS: Array<IOptions<TTimelineOrientation>> = [
		{ label: 'Vertical',   value: 'vertical' },
		{ label: 'Horizontal', value: 'horizontal' }
	]

	const TIMELINE_SIDE_OPTIONS: Array<IOptions<TTimelineSide>> = [
		{ label: 'Start',       value: 'start' },
		{ label: 'End',         value: 'end' },
		{ label: 'Alternating', value: 'alternating' }
	]

	const releaseEntries: ITimelineEntry[] = [
		{
			title: 'v1.0.0',
			subtitle: 'May 5, 2026',
			description: 'Stable release · 240 components',
			intent: 'primary'
		},
		{
			title: 'v0.9-rc',
			subtitle: 'Apr 28, 2026',
			description: 'Release candidate, API freeze',
			intent: 'success'
		},
		{
			title: 'v0.8',
			subtitle: 'Apr 12, 2026',
			description: 'Dark theme tokens, motion system',
			intent: 'info'
		},
		{
			title: 'v0.7',
			subtitle: 'Mar 30, 2026',
			description: 'Forms refactor, OTP component',
			intent: 'warning'
		}
	]
</script>

<docs
		lang="md"
		src="@docs/components/Timeline/OrigamTimeline.md"
/>
