<template>
	<Story
			group="components"
			title="Switch/OrigamSwitchTrack"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISwitchTrackProps>>({ modelValue: true, color: undefined, bgColor: undefined, inset: false })"
		>
			<template #default="{ state }">
				<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
					<origam-switch-track
							:model-value="state.modelValue"
							:color="state.color"
							:bg-color="state.bgColor"
							:inset="state.inset"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Variant">
					<HstCheckbox v-model="state.inset" title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstCheckbox v-model="state.modelValue" title="Model Value (on/off)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISwitchTrackProps>>({ modelValue: true, disabled: false, readonly: false, error: false, isValid: null })"
		>
			<template #default="{ state }">
				<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
					<origam-switch-track
							:model-value="state.modelValue"
							:disabled="state.disabled"
							:readonly="state.readonly"
							:error="state.error"
							:is-valid="state.isValid"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstCheckbox v-model="state.modelValue" title="Model Value (on/off)"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<HstSelect
							v-model="state.isValid"
							title="Is Valid"
							:options="IS_VALID_OPTIONS"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<div style="padding: 24px;">
				<origam-switch-track
						:model-value="false"
						@click="logEvent('click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - track.true">
			<div style="padding: 24px;">
				<origam-switch-track :model-value="true">
					<template #track.true>
						<origam-icon :icon="checkIcon"/>
					</template>
				</origam-switch-track>
			</div>
		</Variant>

		<Variant title="Slots - track.false">
			<div style="padding: 24px;">
				<origam-switch-track :model-value="false">
					<template #track.false>
						<origam-icon :icon="closeIcon"/>
					</template>
				</origam-switch-track>
			</div>
		</Variant>

		<Variant title="Slots - overlay">
			<div style="padding: 24px;">
				<origam-switch-track :model-value="true">
					<template #overlay>
						<span style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; pointer-events: none;">ON</span>
					</template>
				</origam-switch-track>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISwitchTrackProps>({
					modelValue: true,
					inset: false,
					disabled: false,
					readonly: false,
					error: false,
					isValid: null,
					color: undefined,
					bgColor: undefined,
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-switch-track
							v-bind="state"
							@click="logEvent('click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstCheckbox v-model="state.modelValue" title="Model Value (on/off)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstCheckbox v-model="state.inset"   title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
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

	import { OrigamIcon, OrigamSwitchTrack } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IOptions, ISwitchTrackProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { COLOR_OPTIONS } from '@stories/const'

	const checkIcon = MDI_ICONS.CHECK
	const closeIcon = MDI_ICONS.CLOSE

	const IS_VALID_OPTIONS: Array<IOptions<boolean | null>> = [
		{ label: '(none)', value: null },
		{ label: 'Valid (true)', value: true },
		{ label: 'Invalid (false)', value: false },
	]
</script>

<docs lang="md" src="@docs/components/Switch/OrigamSwitchTrack.md"/>
