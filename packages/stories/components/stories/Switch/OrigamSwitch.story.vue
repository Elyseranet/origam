<template>
	<Story
			group="components"
			title="Switch/OrigamSwitch"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISwitchProps>>({ color: 'primary', label: 'Switch' })"
		>
			<template #default="{ state }">
				<origam-switch
						:model-value="false"
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:inset="state.inset"
						:label="state.label"
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
				<StoryGroup title="Shape">
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
					<HstCheckbox v-model="state.inset"     title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IBgColorProps & IActiveProps>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-switch
						:model-value="false"
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						label="Switch"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
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
				:init-state="() => useStoryInitState<Partial<ISwitchProps> & ILoadingState>({
					label: 'Switch',
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24
				})"
		>
			<template #default="{ state }">
				<origam-switch
						v-model="functionalModel"
						:label="state.label"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:loading="resolveLoading(state)"
						:indeterminate="state.indeterminate"
						:required="state.required"
						:multiple="state.multiple"
						:inline="state.inline"
						:error="state.error"
						:name="state.name"
						:tag="state.tag"
				/>
				<div>value = {{ functionalModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.label" title="Label"/>
					<HstText   v-model="state.name"  title="Name"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.indeterminate" title="Indeterminate"/>
					<HstCheckbox v-model="state.required"      title="Required"/>
					<HstCheckbox v-model="state.error"         title="Error"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
					<HstCheckbox v-model="state.inline"   title="Inline"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind" :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)"  :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"    :min="12" :max="64"  :step="2"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-switch
					v-model="emitModel"
					label="Toggle me"
					data-cy="switch-emit-update"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<div>value = {{ emitModel }}</div>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-switch
					v-model="emitFocusedModel"
					label="Focus me"
					data-cy="switch-emit-focused"
					@update:focused="logEvent('update:focused', $event)"
			/>
		</Variant>

		<Variant title="Events - update:indeterminate">
			<origam-switch
					v-model="emitIndeterminateModel"
					:indeterminate="true"
					label="Indeterminate switch"
					data-cy="switch-emit-indeterminate"
					@update:indeterminate="logEvent('update:indeterminate', $event)"
			/>
		</Variant>

		<Variant title="Events - click:label">
			<origam-switch
					v-model="emitClickLabelModel"
					label="Click the label"
					data-cy="switch-emit-click-label"
					@click:label="logEvent('click:label', $event)"
			/>
		</Variant>

		<Variant title="Events - focus / blur">
			<origam-switch
					v-model="emitFocusModel"
					label="Focus & blur me"
					data-cy="switch-emit-focus"
					@focus="logEvent('focus', $event)"
					@blur="logEvent('blur', $event)"
			/>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-switch :model-value="false" loading label="Loading switch" data-cy="switch-slot-loader">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-switch>
		</Variant>

		<Variant title="Slots - Track False">
			<origam-switch v-model="slotTrackModel" label="Custom track false" data-cy="switch-slot-track-false">
				<template #track.false>
					<span style="font-size: 10px; color: #fff;">OFF</span>
				</template>
			</origam-switch>
		</Variant>

		<Variant title="Slots - Track True">
			<origam-switch v-model="slotTrackModel" label="Custom track" data-cy="switch-slot-track">
				<template #track.true>
					<span style="font-size: 10px; color: #fff;">ON</span>
				</template>
				<template #track.false>
					<span style="font-size: 10px; color: #fff;">OFF</span>
				</template>
			</origam-switch>
			<div>value = {{ slotTrackModel }}</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISwitchProps>({
					label: 'Enable feature',
					color: 'primary',
					inset: false,
					flat: false,
					indeterminate: false,
					disabled: false,
					readonly: false
				})"
		>
			<template #default="{ state }">
				<origam-switch
						v-model="playgroundModel"
						v-bind="state"
						data-cy="switch-playground"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
				<div>value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
					<HstCheckbox v-model="state.inset"     title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.indeterminate" title="Indeterminate"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'
	import { logEvent } from 'histoire/client'

	import { OrigamSwitch } from '@origam/components'
	import type {
		IActiveProps,
		IBgColorProps,
		IHoverProps,
		ISwitchProps
	} from '@origam/interfaces'
	import type { TLoadingValue } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	interface ILoadingState {
		enabled: boolean
		kind: 'bool' | 'number' | 'line' | 'circular' | 'skeleton'
		progress: number
		circularSize: number
	}

	const LOADING_KIND_OPTIONS = [
		{ label: 'true (default)', value: 'bool' },
		{ label: 'number', value: 'number' },
		{ label: '{ type: line }', value: 'line' },
		{ label: '{ type: circular }', value: 'circular' },
		{ label: '{ type: skeleton }', value: 'skeleton' }
	]

	const resolveLoading = (state: ILoadingState): TLoadingValue => {
		if (!state.enabled) return false
		if (state.kind === 'bool') return true
		if (state.kind === 'number') return state.progress
		if (state.kind === 'line') return { type: 'line' }
		if (state.kind === 'circular') return { type: 'circular', size: state.circularSize }
		if (state.kind === 'skeleton') return { type: 'skeleton' }

		return false
	}

	const functionalModel        = ref(false)
	const emitModel              = ref(false)
	const emitFocusedModel       = ref(false)
	const emitIndeterminateModel = ref(false)
	const emitClickLabelModel    = ref(false)
	const emitFocusModel         = ref(false)
	const slotTrackModel         = ref(false)
	const playgroundModel        = ref(false)
</script>

<docs lang="md" src="@docs/components/Switch/OrigamSwitch.md"/>
