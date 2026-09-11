<template>
	<Story
			group="components"
			title="Input/OrigamInput"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IInputProps>>({
					color: 'primary',
					label: 'Input',
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-input
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:density="state.density"
						:size="state.size"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-avatar="state.prependAvatar || undefined"
						:append-avatar="state.appendAvatar || undefined"
						:direction="state.direction"
						:center-affix="state.centerAffix"
						:width="state.width"
						:height="state.height"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:line-height="state.lineHeight"
						:label="state.label"
				>
					<template #default="{ id, isDisabled, isReadonly }">
						<input
								:id="id"
								:disabled="isDisabled"
								:readonly="isReadonly"
								placeholder="Type here…"
								style="border: none; outline: none; background: transparent; width: 100%;"
						/>
					</template>
				</origam-input>
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
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstText   v-model="state.prependAvatar" title="Prepend Avatar"/>
					<HstText   v-model="state.appendAvatar"  title="Append Avatar"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect   v-model="state.direction"   title="Direction"    :options="DIRECTION_OPTIONS"/>
					<HstCheckbox v-model="state.centerAffix" title="Center Affix"/>
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
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IInputProps>>({
					label: 'Stateful input',
					hint: 'Helper text',
					persistentHint: false,
					hideDetails: false,
					disabled: false,
					readonly: false,
					focused: false,
					error: false,
					errorMessages: [],
					messages: [],
					hideSpinButtons: false,
				})"
		>
			<template #default="{ state }">
				<origam-input
						v-model="functionalModel"
						:label="state.label"
						:hint="state.hint"
						:persistent-hint="state.persistentHint"
						:hide-details="state.hideDetails"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:focused="state.focused"
						:error="state.error"
						:error-messages="state.error ? ['Invalid value'] : []"
						:messages="state.messages"
						:hide-spin-buttons="state.hideSpinButtons"
				>
					<template #default="{ id, isDisabled, isReadonly }">
						<input
								:id="id"
								v-model="functionalModel"
								:disabled="isDisabled"
								:readonly="isReadonly"
								style="border: none; outline: none; background: transparent; width: 100%;"
						/>
					</template>
				</origam-input>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Label & Hint">
					<HstText     v-model="state.label"         title="Label"/>
					<HstText     v-model="state.hint"          title="Hint"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
					<HstCheckbox v-model="state.focused"   title="Focused"/>
					<HstCheckbox v-model="state.error"     title="Error"/>
				</StoryGroup>
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.hideDetails"     title="Hide Details"/>
					<HstCheckbox v-model="state.hideSpinButtons" title="Hide Spin Buttons"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-input
					v-model="emitUpdateModel"
					label="Type here"
					@update:model-value="logEvent('update:modelValue', $event)"
			>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="emitUpdateModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-input
					v-model="emitFocusModel"
					label="Focus / blur me"
					@update:focused="logEvent('update:focused', $event)"
			>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="emitFocusModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-input
					v-model="emitPrependModel"
					:prepend-icon="prependIcon"
					label="Click the prepend icon"
					@click:prepend="logEvent('click:prepend', $event)"
			>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="emitPrependModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Events - click:append">
			<origam-input
					v-model="emitAppendModel"
					:append-icon="appendIcon"
					label="Click the append icon"
					@click:append="logEvent('click:append', $event)"
			>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="emitAppendModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slots - Default">
			<origam-input v-model="slotDefaultModel" label="Custom default slot">
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="slotDefaultModel"
							:disabled="isDisabled"
							placeholder="Custom slot content"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-input v-model="slotPrependModel" label="With prepend slot">
				<template #prepend>
					<origam-icon :icon="prependIcon" style="color: var(--origam-color__feedback--danger---bg);"/>
				</template>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="slotPrependModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slots - Append">
			<origam-input v-model="slotAppendModel" label="With append slot">
				<template #append>
					<origam-icon :icon="appendIcon"/>
				</template>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="slotAppendModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-input
					v-model="slotMessagesModel"
					label="Custom messages"
					hint="Custom hint"
					persistent-hint
			>
				<template #messages="{ messages }">
					<em style="color: var(--origam-color__feedback--info---bg);">{{ messages.join(', ') }}</em>
				</template>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="slotMessagesModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slots - Message">
			<origam-input
					v-model="slotMessageModel"
					label="With message slot"
					:error-messages="['Validation error']"
					error
			>
				<template #message="{ message }">
					<em style="color: var(--origam-color__feedback--danger---bg);">{{ message }}</em>
				</template>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="slotMessageModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slots - Details">
			<origam-input v-model="slotDetailsModel" label="With details slot">
				<template #details>
					<span style="font-size: 0.75rem; color: var(--origam-color__text---secondary);">Custom details content</span>
				</template>
				<template #default="{ id, isDisabled }">
					<input
							:id="id"
							v-model="slotDetailsModel"
							:disabled="isDisabled"
							style="border: none; outline: none; background: transparent; width: 100%;"
					/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Prop — color">
			<origam-input label="Colored input" color="primary" data-cy="input-color">
				<template #default="{ id, isDisabled, isReadonly }">
					<input :id="id" :disabled="isDisabled" :readonly="isReadonly" style="border: none; outline: none; background: transparent; width: 100%;"/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Prop — hint & persistentHint">
			<origam-input v-model="hintModel" label="With hint" hint="This is a helpful hint" :persistent-hint="true" data-cy="input-hint">
				<template #default="{ id, isDisabled, isReadonly }">
					<input :id="id" v-model="hintModel" :disabled="isDisabled" :readonly="isReadonly" style="border: none; outline: none; background: transparent; width: 100%;"/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Prop — prependIcon & appendIcon">
			<origam-input
					v-model="adjacentModel"
					label="With icons"
					:prepend-icon="prependIcon"
					:append-icon="appendIcon"
					data-cy="input-adjacent"
			>
				<template #default="{ id, isDisabled, isReadonly }">
					<input :id="id" v-model="adjacentModel" :disabled="isDisabled" :readonly="isReadonly" style="border: none; outline: none; background: transparent; width: 100%;"/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Prop — disabled, readonly & error">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px;" data-cy="input-states">
				<origam-input label="Disabled" disabled>
					<template #default="{ id, isDisabled }">
						<input :id="id" :disabled="isDisabled" style="border: none; outline: none; background: transparent; width: 100%;"/>
					</template>
				</origam-input>
				<origam-input label="Readonly" readonly>
					<template #default="{ id, isDisabled, isReadonly }">
						<input :id="id" :disabled="isDisabled" :readonly="isReadonly" style="border: none; outline: none; background: transparent; width: 100%;"/>
					</template>
				</origam-input>
				<origam-input label="Error" error>
					<template #default="{ id, isDisabled }">
						<input :id="id" :disabled="isDisabled" style="border: none; outline: none; background: transparent; width: 100%;"/>
					</template>
				</origam-input>
			</div>
		</Variant>

		<Variant title="Emit — update:modelValue">
			<div style="padding: 16px;" data-cy="input-emit-update">
				<origam-input
						v-model="emitNewUpdateModel"
						label="Type something"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<template #default="{ id, isDisabled }">
						<input :id="id" v-model="emitNewUpdateModel" :disabled="isDisabled" style="border: none; outline: none; background: transparent; width: 100%;"/>
					</template>
				</origam-input>
				<p data-cy="input-emit-status" style="margin-top: 8px; font-size: 13px;">{{ emitNewUpdateModel }}</p>
			</div>
		</Variant>

		<Variant title="Emit — click:prepend & click:append">
			<origam-input
					v-model="emitClickModel"
					label="Click icons"
					:prepend-icon="prependIcon"
					:append-icon="appendIcon"
					data-cy="input-emit-click"
					@click:prepend="logEvent('click:prepend', $event)"
					@click:append="logEvent('click:append', $event)"
			>
				<template #default="{ id, isDisabled }">
					<input :id="id" v-model="emitClickModel" :disabled="isDisabled" style="border: none; outline: none; background: transparent; width: 100%;"/>
				</template>
			</origam-input>
		</Variant>

		<Variant title="Slot — prepend">
			<origam-input v-model="slotPrependNewModel" label="Custom prepend slot" data-cy="input-slot-prepend">
				<template #prepend>
					<origam-icon :icon="prependIcon"/>
				</template>
				<template #default="{ id, isDisabled }">
					<input :id="id" v-model="slotPrependNewModel" :disabled="isDisabled" style="border: none; outline: none; background: transparent; width: 100%;"/>
				</template>
			</origam-input>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IInputProps>({
					label: 'Input',
					color: 'primary',
					hint: '',
					persistentHint: false,
					hideDetails: false,
					disabled: false,
					readonly: false,
					error: false,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-input
						v-model="playgroundModel"
						v-bind="state"
						data-cy="input-playground"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<template #default="{ id, isDisabled, isReadonly }">
						<input
								:id="id"
								v-model="playgroundModel"
								:disabled="isDisabled"
								:readonly="isReadonly"
								style="border: none; outline: none; background: transparent; width: 100%;"
						/>
					</template>
				</origam-input>
				<p data-cy="input-playground-status" style="margin-top: 8px; font-size: 13px;">value = {{ playgroundModel }}</p>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.label" title="Label"/>
					<HstText   v-model="state.hint"  title="Hint"/>
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.error"         title="Error"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
					<HstCheckbox v-model="state.hideDetails"   title="Hide Details"/>
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

	import { OrigamIcon, OrigamInput } from '@origam/components'
	import { DIRECTION, MDI_ICONS } from '@origam/enums'
	import type { IInputProps, IOptions } from '@origam/interfaces'
	import type { TDirection } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ICON_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	const DIRECTION_OPTIONS: Array<IOptions<TDirection>> = [
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'Vertical',   value: DIRECTION.VERTICAL }
	]

	const prependIcon = MDI_ICONS.ACCOUNT
	const appendIcon  = MDI_ICONS.STAR

	const functionalModel  = ref('')
	const emitUpdateModel  = ref('')
	const emitFocusModel   = ref('')
	const emitPrependModel = ref('')
	const emitAppendModel  = ref('')
	const slotDefaultModel  = ref('')
	const slotPrependModel  = ref('')
	const slotAppendModel   = ref('')
	const slotMessagesModel = ref('')
	const slotMessageModel  = ref('')
	const slotDetailsModel  = ref('')
	const playgroundModel   = ref('')
	const hintModel         = ref('')
	const adjacentModel     = ref('')
	const emitNewUpdateModel = ref('')
	const emitClickModel    = ref('')
	const slotPrependNewModel = ref('')
</script>

<docs lang="md" src="@docs/components/Input/OrigamInput.md"/>
