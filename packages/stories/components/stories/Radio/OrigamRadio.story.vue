<template>
	<Story
			group="components"
			title="Radio/OrigamRadio"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IRadioProps>>({ label: 'Radio option', value: 'opt', color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-radio
						v-model="designModel"
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:size="state.size"
						:density="state.density"
						:direction="state.direction"
						:width="state.width"
						:height="state.height"
						:label="state.label"
						:value="state.value"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & IColorProps>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-radio
						v-model="stateModel"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						label="Radio option"
						value="opt"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IRadioProps>>({ label: 'Radio option', value: 'opt', color: 'primary', disabled: false, readonly: false })"
		>
			<template #default="{ state }">
				<origam-radio
						v-model="functionalModel"
						:color="state.color"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:error-messages="state.errorMessages"
						:hide-details="state.hideDetails"
						:hint="state.hint"
						:persistent-hint="state.persistentHint"
						:required="state.required"
						:multiple="state.multiple"
						:inline="state.inline"
						:label="state.label"
						:value="state.value"
				/>
				<div>value = {{ functionalModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstText     v-model="state.label" title="Label"/>
					<HstText     v-model="state.value" title="Value"/>
					<HstCheckbox v-model="state.required"  title="Required"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<HstCheckbox v-model="state.error"        title="Error"/>
					<HstText     v-model="state.errorMessages" title="Error Message"/>
				</StoryGroup>
				<StoryGroup title="Hint">
					<HstText     v-model="state.hint"          title="Hint"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
					<HstCheckbox v-model="state.hideDetails"   title="Hide Details"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline" title="Inline"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:label">
			<origam-radio
					v-model="emitClickLabelModel"
					value="x"
					label="Click the label"
					@click:label="logEvent('click:label', $event)"
			/>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-radio
					v-model="emitFocusedModel"
					value="x"
					label="Focus me"
					@update:focused="logEvent('update:focused', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-radio
					v-model="emitModelValueModel"
					value="yes"
					label="Select me"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<div>value = {{ emitModelValueModel }}</div>
		</Variant>

		<Variant title="Events - focus & blur">
			<origam-radio
					v-model="emitFocusBlurModel"
					value="x"
					label="Focus and blur me"
					@focus="logEvent('focus', $event)"
					@blur="logEvent('blur', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-radio v-model="slotDefaultModel" value="custom">
				<span>Custom slot content</span>
			</origam-radio>
		</Variant>

		<Variant title="Slots - Label">
			<origam-radio v-model="slotLabelModel" value="custom">
				<template #label="{ props: labelProps }">
					<label :for="labelProps.id" style="font-style: italic; color: var(--origam-color__action--primary---bg);">Custom label slot</label>
				</template>
			</origam-radio>
			<div>value = {{ slotLabelModel }}</div>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-radio v-model="slotPrependModel" value="custom" label="With prepend">
				<template #prepend>
					<origam-icon :icon="prependIcon"/>
				</template>
			</origam-radio>
		</Variant>

		<Variant title="Slots - Append">
			<origam-radio v-model="slotAppendModel" value="custom" label="With append">
				<template #append>
					<origam-icon :icon="appendIcon"/>
				</template>
			</origam-radio>
		</Variant>

		<Variant title="Slots - Input">
			<origam-radio v-model="slotInputModel" value="custom" label="Custom input">
				<template #input>
					<span>Custom input slot content</span>
				</template>
			</origam-radio>
		</Variant>

		<Variant title="Slots - Details">
			<origam-radio v-model="slotDetailsModel" value="custom" label="With details">
				<template #details>
					<span style="font-size: 0.75rem;">Custom hint text</span>
				</template>
			</origam-radio>
		</Variant>

		<Variant title="Slots - Message">
			<origam-radio v-model="slotMessageModel" value="custom" label="With message" :error="true" :error-messages="['Error']">
				<template #message="{ message }">
					<span style="font-style: italic;">{{ message }}</span>
				</template>
			</origam-radio>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-radio v-model="slotMessagesModel" value="custom" label="With messages" :error="true" :error-messages="['Error one', 'Error two']">
				<template #messages>
					<span style="color: var(--origam-color__action--danger---bg);">Custom error display</span>
				</template>
			</origam-radio>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IRadioProps>({ label: 'Radio option', value: 'opt', color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-radio v-model="playgroundModel" v-bind="state" @click:label="logEvent('click:label', $event)"/>
				<div>value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
					<HstText v-model="state.value" title="Value"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.error"         title="Error"/>
					<HstCheckbox v-model="state.required"      title="Required"/>
					<HstCheckbox v-model="state.hideDetails"   title="Hide Details"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
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

	import { OrigamIcon, OrigamRadio } from '@origam/components'
	import { DIRECTION, MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IColorProps,
		IHoverProps,
		IRadioProps
	} from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'
	import type { TDirection } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		SIZE_OPTIONS
	} from '@stories/const'

	const DIRECTION_OPTIONS: Array<IOptions<TDirection>> = [
		{ label: '(none)', value: undefined },
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'Vertical', value: DIRECTION.VERTICAL },
	]

	const prependIcon = MDI_ICONS.HEART
	const appendIcon = MDI_ICONS.ARROW_RIGHT

	const designModel         = ref<string | null>(null)
	const stateModel          = ref<string | null>(null)
	const functionalModel     = ref<string | null>(null)
	const emitClickLabelModel = ref<string | null>(null)
	const emitFocusedModel    = ref<string | null>(null)
	const emitModelValueModel = ref<string | null>(null)
	const emitFocusBlurModel  = ref<string | null>(null)
	const slotDefaultModel    = ref<string | null>(null)
	const slotLabelModel      = ref<string | null>(null)
	const slotPrependModel    = ref<string | null>(null)
	const slotAppendModel     = ref<string | null>(null)
	const slotInputModel      = ref<string | null>(null)
	const slotDetailsModel    = ref<string | null>(null)
	const slotMessageModel    = ref<string | null>(null)
	const slotMessagesModel   = ref<string | null>(null)
	const playgroundModel     = ref<string | null>(null)
</script>

<docs lang="md" src="@docs/components/Radio/OrigamRadio.md"/>
