<template>
	<Story
			group="components"
			title="ConfirmWrapper/OrigamConfirmWrapper"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IConfirmWrapperProps>>({
					label: 'Email',
					direction: DIRECTION.VERTICAL
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; max-width: 500px;">
					<origam-confirm-wrapper
							v-model="designValue"
							v-model:confirm="designConfirm"
							:label="state.label"
							:confirm-label="state.confirmLabel"
							:direction="state.direction"
							:color="state.color"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:variant="state.variant"
							:prepend-icon="state.prependIcon || undefined"
							:append-icon="state.appendIcon || undefined"
							:center-affix="state.centerAffix"
							field="text-field"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Label">
					<HstText v-model="state.label"        title="Label"/>
					<HstText v-model="state.confirmLabel" title="Confirm Label"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Affix">
					<HstCheckbox v-model="state.centerAffix" title="Center Affix"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IConfirmWrapperProps>>({
					field: 'text-field',
					disabled: false,
					readonly: false,
					required: false,
					error: false,
					hideDetails: false,
					persistentHint: false,
					centerAffix: true
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; max-width: 500px;">
					<origam-confirm-wrapper
							v-model="functionalValue"
							v-model:confirm="functionalConfirm"
							:field="state.field || 'text-field'"
							:disabled="state.disabled"
							:readonly="state.readonly"
							:required="state.required"
							:error="state.error"
							:error-messages="state.error ? ['Validation error'] : undefined"
							:hide-details="state.hideDetails"
							:hint="state.hint"
							:persistent-hint="state.persistentHint"
							:defaults="{ label: 'Email' }"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.required" title="Required"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Messages">
					<HstCheckbox v-model="state.hideDetails"    title="Hide Details"/>
					<HstText     v-model="state.hint"           title="Hint"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
				</StoryGroup>
				<StoryGroup title="Field">
					<HstText v-model="state.field" title="Field (shorthand)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — field (shorthand)">
			<div style="padding: 24px; max-width: 400px;" data-cy="confirm-wrapper-default">
				<origam-confirm-wrapper
						v-model="designValue"
						v-model:confirm="designConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						data-cy="confirm-wrapper-default-input"
				/>
			</div>
		</Variant>

		<Variant title="Prop — direction">
			<div style="padding: 24px; max-width: 600px;">
				<origam-confirm-wrapper
						v-model="designValue"
						v-model:confirm="designConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						:direction="DIRECTION.HORIZONTAL"
						data-cy="confirm-wrapper-direction"
				/>
			</div>
		</Variant>

		<Variant title="Prop — label & prependIcon">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="designValue"
						v-model:confirm="designConfirm"
						label="Email address"
						confirm-label="Confirm email"
						:prepend-icon="iconHeart"
						field="text-field"
						data-cy="confirm-wrapper-label"
				/>
			</div>
		</Variant>

		<Variant title="Prop — disabled, readonly & error">
			<div style="padding: 24px; max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
				<origam-confirm-wrapper
						v-model="functionalValue"
						v-model:confirm="functionalConfirm"
						field="text-field"
						:defaults="{ label: 'Disabled' }"
						disabled
						data-cy="confirm-wrapper-states"
				/>
			</div>
		</Variant>

		<Variant title="Prop — confirm (mismatch validation)">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="propValidValue"
						v-model:confirm="propValidConfirm"
						field="text-field"
						:defaults="{ label: 'Password', type: 'password' }"
						data-cy="confirm-wrapper-validation"
				/>
				<p data-cy="confirm-wrapper-validation-status" style="margin-top: 8px; font-size: 0.875rem;">
					{{ propValidValue === propValidConfirm ? 'Match' : 'Mismatch' }}
				</p>
			</div>
		</Variant>

		<Variant title="Slot — header">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotHeaderValue"
						v-model:confirm="slotHeaderConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						data-cy="confirm-wrapper-slot-header"
				>
					<template #header>
						<div style="padding-bottom: 8px; font-weight: 700;">Custom header slot</div>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slot — default & confirm">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotDefaultValue"
						v-model:confirm="slotDefaultConfirm"
				>
					<origam-text-field v-model="slotDefaultValue" label="Custom primary" data-cy="confirm-wrapper-custom-field"/>
					<template #confirm>
						<origam-text-field v-model="slotDefaultConfirm" label="Confirm custom" data-cy="confirm-wrapper-confirm-field"/>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Emit — update:modelValue & update:confirm">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="emitModelValue"
						v-model:confirm="emitModelConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						data-cy="confirm-wrapper-emit"
						@update:model-value="logEvent('update:modelValue', $event)"
						@update:confirm="logEvent('update:confirm', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="emitModelValue"
						v-model:confirm="emitModelConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:confirm">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="emitConfirmValue"
						v-model:confirm="emitConfirmConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						@update:confirm="logEvent('update:confirm', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:focused">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="emitFocusedValue"
						v-model:confirm="emitFocusedConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						@update:focused="logEvent('update:focused', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - click:prepend">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="emitPrependValue"
						v-model:confirm="emitPrependConfirm"
						:prepend-icon="iconHeart"
						field="text-field"
						:defaults="{ label: 'Email' }"
						@click:prepend="logEvent('click:prepend', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - click:append">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="emitAppendValue"
						v-model:confirm="emitAppendConfirm"
						:append-icon="iconArrowRight"
						field="text-field"
						:defaults="{ label: 'Email' }"
						@click:append="logEvent('click:append', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotDefaultValue"
						v-model:confirm="slotDefaultConfirm"
				>
					<origam-text-field v-model="slotDefaultValue" label="Custom primary input"/>
					<template #confirm>
						<origam-text-field v-model="slotDefaultConfirm" label="Confirm custom input"/>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Confirm">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotConfirmValue"
						v-model:confirm="slotConfirmConfirm"
						field="text-field"
						:defaults="{ label: 'Password', type: 'password' }"
				>
					<template #confirm>
						<origam-text-field v-model="slotConfirmConfirm" label="Custom confirm field"/>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Header">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotHeaderValue"
						v-model:confirm="slotHeaderConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
				>
					<template #header>
						<div style="padding-bottom: 8px; font-weight: 700;">Custom header slot</div>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotTitleValue"
						v-model:confirm="slotTitleConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
				>
					<template #title>
						<span>Custom title slot</span>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Prepend">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotPrependValue"
						v-model:confirm="slotPrependConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
				>
					<template #prepend>
						<origam-icon :icon="iconHeart"/>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Append">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotAppendValue"
						v-model:confirm="slotAppendConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
				>
					<template #append>
						<origam-icon :icon="iconHeart"/>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Messages">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotMessagesValue"
						v-model:confirm="slotMessagesConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						:error-messages="['Error A', 'Error B']"
				>
					<template #messages="{ messages }">
						<span v-for="(m, i) in messages" :key="i">{{ m }}</span>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Message">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotMessageValue"
						v-model:confirm="slotMessageConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
						:error-messages="['Error message']"
				>
					<template #message="{ message }">
						<span>{{ message }}</span>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant title="Slots - Details">
			<div style="padding: 24px; max-width: 400px;">
				<origam-confirm-wrapper
						v-model="slotDetailsValue"
						v-model:confirm="slotDetailsConfirm"
						field="text-field"
						:defaults="{ label: 'Email' }"
				>
					<template #details>
						<span>Custom details slot content</span>
					</template>
				</origam-confirm-wrapper>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IConfirmWrapperProps>({
					label: 'Email',
					direction: DIRECTION.VERTICAL,
					disabled: false,
					readonly: false,
					error: false,
					centerAffix: true
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; max-width: 500px;">
					<origam-confirm-wrapper
							v-model="playgroundValue"
							v-model:confirm="playgroundConfirm"
							v-bind="state"
							field="text-field"
							:defaults="{ label: state.label }"
							@update:model-value="logEvent('update:modelValue', $event)"
							@update:confirm="logEvent('update:confirm', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label"        title="Label"/>
					<HstText v-model="state.confirmLabel" title="Confirm Label"/>
					<HstText v-model="state.hint"         title="Hint"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.variant"   title="Variant"   :options="VARIANT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"       title="Disabled"/>
					<HstCheckbox v-model="state.readonly"       title="Readonly"/>
					<HstCheckbox v-model="state.required"       title="Required"/>
					<HstCheckbox v-model="state.error"          title="Error"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
					<HstCheckbox v-model="state.centerAffix"    title="Center Affix"/>
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

	import { OrigamConfirmWrapper, OrigamIcon, OrigamTextField } from '@origam/components'
	import { DIRECTION, MDI_ICONS } from '@origam/enums'
	import type { IConfirmWrapperProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		VARIANT_OPTIONS
	} from '@stories/const'

	import type { IOptions } from '@origam/interfaces'
	import type { TDirection } from '@origam/types'

	const DIRECTION_OPTIONS: Array<IOptions<TDirection>> = [
		{ label: 'Vertical', value: DIRECTION.VERTICAL },
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL }
	]

	const iconHeart = MDI_ICONS.HEART
	const iconArrowRight = MDI_ICONS.ARROW_RIGHT

	const propValidValue = ref('')
	const propValidConfirm = ref('')

	const designValue = ref('')
	const designConfirm = ref('')

	const functionalValue = ref('')
	const functionalConfirm = ref('')

	const emitModelValue = ref('')
	const emitModelConfirm = ref('')

	const emitConfirmValue = ref('')
	const emitConfirmConfirm = ref('')

	const emitFocusedValue = ref('')
	const emitFocusedConfirm = ref('')

	const emitPrependValue = ref('')
	const emitPrependConfirm = ref('')

	const emitAppendValue = ref('')
	const emitAppendConfirm = ref('')

	const slotDefaultValue = ref('')
	const slotDefaultConfirm = ref('')

	const slotConfirmValue = ref('')
	const slotConfirmConfirm = ref('')

	const slotHeaderValue = ref('')
	const slotHeaderConfirm = ref('')

	const slotTitleValue = ref('')
	const slotTitleConfirm = ref('')

	const slotPrependValue = ref('')
	const slotPrependConfirm = ref('')

	const slotAppendValue = ref('')
	const slotAppendConfirm = ref('')

	const slotMessagesValue = ref('')
	const slotMessagesConfirm = ref('')

	const slotMessageValue = ref('')
	const slotMessageConfirm = ref('')

	const slotDetailsValue = ref('')
	const slotDetailsConfirm = ref('')

	const playgroundValue = ref('')
	const playgroundConfirm = ref('')
</script>

<docs lang="md" src="@docs/components/ConfirmWrapper/OrigamConfirmWrapper.md"/>
