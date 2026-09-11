<template>
	<Story
			group="components"
			title="DatePicker/OrigamDatePickerControls"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDatePickerControlsProps>>({ text: 'May 2026' })"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-date-picker-controls
							:active="['date']"
							:text="state.text"
							:next-icon="state.nextIcon || undefined"
							:prev-icon="state.prevIcon || undefined"
							:mode-icon="state.modeIcon || undefined"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.nextIcon" title="Next Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.prevIcon" title="Prev Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.modeIcon" title="Mode Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDatePickerControlsProps>>({ disabled: false, disabledMonth: false, disabledYear: false, disabledNext: false, disabledPrev: false, viewMode: 'month' })"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-date-picker-controls
							:active="['date']"
							:disabled="state.disabled"
							:disabled-month="state.disabledMonth"
							:disabled-year="state.disabledYear"
							:disabled-next="state.disabledNext"
							:disabled-prev="state.disabledPrev"
							:view-mode="state.viewMode"
							text="May 2026"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled (all)"/>
					<HstCheckbox v-model="state.disabledMonth" title="Disabled Month"/>
					<HstCheckbox v-model="state.disabledYear"  title="Disabled Year"/>
					<HstCheckbox v-model="state.disabledNext"  title="Disabled Next"/>
					<HstCheckbox v-model="state.disabledPrev"  title="Disabled Prev"/>
				</StoryGroup>
				<StoryGroup title="View">
					<HstSelect v-model="state.viewMode" title="View Mode" :options="DATE_MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:month">
			<div style="padding: 24px;">
				<origam-date-picker-controls
						:active="['date']"
						text="May 2026"
						data-cy="dp-controls-emit-month"
						@click:month="logEvent('click:month', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - click:year">
			<div style="padding: 24px;">
				<origam-date-picker-controls
						:active="['date']"
						text="May 2026"
						data-cy="dp-controls-emit-year"
						@click:year="logEvent('click:year', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - click:prev">
			<div style="padding: 24px;">
				<origam-date-picker-controls
						:active="['date']"
						text="May 2026"
						data-cy="dp-controls-emit-prev"
						@click:prev="logEvent('click:prev', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - click:next">
			<div style="padding: 24px;">
				<origam-date-picker-controls
						:active="['date']"
						text="May 2026"
						data-cy="dp-controls-emit-next"
						@click:next="logEvent('click:next', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - click:text">
			<div style="padding: 24px;">
				<origam-date-picker-controls
						:active="['date']"
						text="May 2026"
						data-cy="dp-controls-emit-text"
						@click:text="logEvent('click:text', $event)"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDatePickerControlsProps>>({ text: 'May 2026', disabled: false, disabledMonth: false, disabledYear: false, disabledNext: false, disabledPrev: false, viewMode: 'month' })"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-date-picker-controls
							:active="['date']"
							v-bind="state"
							@click:month="logEvent('click:month', $event)"
							@click:year="logEvent('click:year', $event)"
							@click:prev="logEvent('click:prev', $event)"
							@click:next="logEvent('click:next', $event)"
							@click:text="logEvent('click:text', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.nextIcon" title="Next Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.prevIcon" title="Prev Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.modeIcon" title="Mode Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.viewMode"      title="View Mode"      :options="DATE_MODE_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled (all)"/>
					<HstCheckbox v-model="state.disabledMonth" title="Disabled Month"/>
					<HstCheckbox v-model="state.disabledYear"  title="Disabled Year"/>
					<HstCheckbox v-model="state.disabledNext"  title="Disabled Next"/>
					<HstCheckbox v-model="state.disabledPrev"  title="Disabled Prev"/>
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

	import { OrigamDatePickerControls } from '@origam/components'
	import { DATE_MODE } from '@origam/enums'
	import type { IDatePickerControlsProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { ICON_OPTIONS } from '@stories/const'

	const DATE_MODE_OPTIONS = [
		{ label: 'Month', value: DATE_MODE.MONTH },
		{ label: 'Months', value: DATE_MODE.MONTHS },
		{ label: 'Years', value: DATE_MODE.YEARS }
	]
</script>

<docs lang="md" src="@docs/components/DatePicker/OrigamDatePickerControls.md"/>
