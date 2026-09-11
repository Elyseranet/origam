<template>
	<Story
			group="components"
			title="ColorPicker/OrigamColorPickerEdit"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerEditProps>>({ mode: 'rgba', modes: ['rgb', 'rgba', 'hsl', 'hsla', 'hex', 'hexa'] })"
		>
			<template #default="{ state }">
				<origam-color-picker-edit
						:color-hsv="defaultColor"
						:mode="state.mode"
						:modes="state.modes"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode"  title="Mode"  :options="COLOR_MODES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Modes (enabled list)">
					<HstCheckbox
							v-for="opt in COLOR_MODES_OPTIONS"
							:key="opt.value"
							:title="opt.label"
							:model-value="state.modes?.includes(opt.value as TColorModes)"
							@update:model-value="(checked: boolean) => toggleMode(state, opt.value as TColorModes, checked)"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IColorPickerEditProps>>({ disabled: false, mode: 'rgba', modes: ['rgb', 'rgba', 'hsl', 'hsla', 'hex', 'hexa'] })"
		>
			<template #default="{ state }">
				<origam-color-picker-edit
						:color-hsv="defaultColor"
						:disabled="state.disabled"
						:mode="state.mode"
						:modes="state.modes"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Active Mode" :options="COLOR_MODES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Modes (enabled list)">
					<HstCheckbox
							v-for="opt in COLOR_MODES_OPTIONS"
							:key="opt.value"
							:title="opt.label"
							:model-value="state.modes?.includes(opt.value as TColorModes)"
							@update:model-value="(checked: boolean) => toggleMode(state, opt.value as TColorModes, checked)"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:colorHsv">
			<origam-color-picker-edit
					:color-hsv="defaultColor"
					@update:color-hsv="logEvent('update:colorHsv', $event)"
			/>
		</Variant>

		<Variant title="Events - update:mode">
			<origam-color-picker-edit
					:color-hsv="defaultColor"
					@update:mode="logEvent('update:mode', $event)"
			/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IColorPickerEditProps>({ disabled: false, mode: 'rgba', modes: ['rgb', 'rgba', 'hsl', 'hsla', 'hex', 'hexa'] })"
		>
			<template #default="{ state }">
				<origam-color-picker-edit
						v-bind="state"
						:color-hsv="defaultColor"
						@update:color-hsv="logEvent('update:colorHsv', $event)"
						@update:mode="logEvent('update:mode', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.mode" title="Mode" :options="COLOR_MODES_OPTIONS"/>
					<HstCheckbox
							v-for="opt in COLOR_MODES_OPTIONS"
							:key="opt.value"
							:title="`Mode enabled: ${opt.label}`"
							:model-value="state.modes?.includes(opt.value as TColorModes)"
							@update:model-value="(checked: boolean) => toggleMode(state, opt.value as TColorModes, checked)"
					/>
				</StoryGroup>
				<StoryGroup title="Functional">
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
	import { logEvent } from 'histoire/client'

	import { OrigamColorPickerEdit } from '@origam/components'
	import { COLOR_MODES_NAMES } from '@origam/enums'
	import type { IColorPickerEditProps } from '@origam/interfaces'
	import type { TColorModes } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const defaultColor = { h: 210, s: 0.7, v: 0.8, a: 1 }

	const COLOR_MODES_OPTIONS = [
		{ label: 'RGB',  value: COLOR_MODES_NAMES.RGB },
		{ label: 'RGBA', value: COLOR_MODES_NAMES.RGBA },
		{ label: 'HSL',  value: COLOR_MODES_NAMES.HSL },
		{ label: 'HSLA', value: COLOR_MODES_NAMES.HSLA },
		{ label: 'HEX',  value: COLOR_MODES_NAMES.HEX },
		{ label: 'HEXA', value: COLOR_MODES_NAMES.HEXA }
	]

	const toggleMode = (state: Partial<IColorPickerEditProps>, mode: TColorModes, checked: boolean) => {
		const current = state.modes ? [...state.modes] : []

		if (checked && !current.includes(mode)) {
			state.modes = [...current, mode]
		} else if (!checked) {
			state.modes = current.filter((m) => m !== mode)
		}
	}
</script>
