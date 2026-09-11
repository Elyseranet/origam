<template>
	<Story
			group="components"
			title="Counter/OrigamCounter"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICounterProps>>({ value: 50, max: 100, active: true, color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-counter
						:value="state.value"
						:padding="state.padding"
						:margin="state.margin"
						:max="state.max"
						:active="state.active"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
				/>
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
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICounterProps>>({ value: 50, max: 100, active: true })"
		>
			<template #default="{ state }">
				<origam-counter
						:value="state.value"
						:max="state.max"
						:active="state.active"
						:disabled="state.disabled"
						:tag="state.tag"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.active"   title="Active (visible)"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstNumber v-model="state.value" title="Value" :min="0"  :max="999" :step="1"/>
					<HstNumber v-model="state.max"   title="Max"   :min="1"  :max="999" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-counter :value="42" :max="100" :active="true">
				<template #default="{ counter }">
					<strong>{{ counter }}</strong> items
				</template>
			</origam-counter>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICounterProps>({ value: 50, max: 100, active: true })"
		>
			<template #default="{ state }">
				<origam-counter v-bind="state"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstNumber v-model="state.value" title="Value" :min="0"  :max="999" :step="1"/>
					<HstNumber v-model="state.max"   title="Max"   :min="1"  :max="999" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.active"   title="Active"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamCounter } from '@origam/components'
	import type { ICounterProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>

<docs lang="md" src="@docs/components/Counter/OrigamCounter.md"/>
