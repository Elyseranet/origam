<template>
	<Story
			group="components"
			title="OtpInputField/OrigamOtpInputField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IOtpInputFieldProps>>({
					label: 'Verification code',
					length: 6,
					color: 'primary',
					divider: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-otp-input-field
						v-model="designModel"
						:label="state.label"
						:length="state.length"
						:color="state.color"
						:bg-color="state.bgColor"
						:variant="state.variant"
						:density="state.density"
						:size="state.size"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:reverse="state.reverse"
						:single-line="state.singleLine"
						:divider="state.divider"
						:prefix="state.prefix"
						:suffix="state.suffix"
						:prepend-inner-icon="state.prependInnerIcon || undefined"
						:append-inner-icon="state.appendInnerIcon || undefined"
						:clearable="state.clearable"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_INPUT_OPTIONS"/>
				</StoryGroup>
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
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.reverse"    title="Reverse"/>
					<HstCheckbox v-model="state.singleLine" title="Single Line"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.label"   title="Label"/>
					<HstText v-model="state.divider" title="Divider"/>
					<HstText v-model="state.prefix"  title="Prefix"/>
					<HstText v-model="state.suffix"  title="Suffix"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect   v-model="state.prependInnerIcon" title="Prepend Inner Icon" :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.appendInnerIcon"  title="Append Inner Icon"  :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.clearable"        title="Clearable"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & { color?: string }>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-otp-input-field
						v-model="stateModel"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						:length="4"
						label="State"
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
				:init-state="() => useStoryInitState<Partial<IOtpInputFieldProps>>({
					length: 6,
					type: OTP_INPUT_FIELD_TYPE.TEXT,
					disabled: false,
					readonly: false,
					error: false,
					loading: false,
					autofocus: false,
					focusAll: false,
					persistentPlaceholder: false,
					required: false,
					hideDetails: false,
				})"
		>
			<template #default="{ state }">
				<origam-otp-input-field
						v-model="functionalModel"
						:length="state.length"
						:type="state.type"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:error-messages="state.error ? ['Invalid code'] : []"
						:loading="state.loading"
						:autofocus="state.autofocus"
						:focus-all="state.focusAll"
						:placeholder="state.placeholder"
						:persistent-placeholder="state.persistentPlaceholder"
						:required="state.required"
						:hide-details="state.hideDetails"
						:hint="state.hint"
						:validate-on="state.validateOn"
						label="Functional OTP"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="OTP">
					<HstNumber v-model="state.length"         title="Length" :min="4" :max="10" :step="1"/>
					<HstSelect v-model="state.type"           title="Type"   :options="OTP_TYPE_OPTIONS"/>
					<HstText   v-model="state.placeholder"    title="Placeholder"/>
					<HstCheckbox v-model="state.persistentPlaceholder" title="Persistent Placeholder"/>
					<HstCheckbox v-model="state.focusAll"              title="Focus All"/>
					<HstCheckbox v-model="state.autofocus"             title="Autofocus"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
					<HstCheckbox v-model="state.required" title="Required"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<HstSelect v-model="state.validateOn" title="Validate On" :options="VALIDATE_ON_OPTIONS"/>
					<HstText   v-model="state.hint"       title="Hint"/>
					<HstSelect v-model="state.hideDetails" title="Hide Details" :options="HIDE_DETAILS_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-otp-input-field
					v-model="emitModel"
					:length="6"
					label="Enter OTP"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<div>value = {{ emitModel }}</div>
		</Variant>

		<Variant title="Events - finish">
			<origam-otp-input-field
					v-model="emitFinishModel"
					:length="4"
					label="Complete 4 digits"
					@finish="logEvent('finish', $event)"
			/>
			<div>value = {{ emitFinishModel }}</div>
		</Variant>

		<Variant title="Events - click:clear">
			<origam-otp-input-field
					v-model="emitClearModel"
					:length="6"
					clearable
					label="Clearable OTP"
					@click:clear="logEvent('click:clear', $event)"
			/>
		</Variant>

		<Variant title="Events - click:control">
			<origam-otp-input-field
					:length="6"
					label="Click control"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-otp-input-field
					:length="6"
					label="Mousedown control"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-otp-input-field :length="4" label="Default slot">
				<span>Custom slot content</span>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-otp-input-field :length="6">
				<template #label>
					<strong>Custom label</strong>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-otp-input-field :length="6" label="Floating label slot">
				<template #floatingLabel>
					<em>Custom floating label</em>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-otp-input-field :length="6" label="Prefix slot">
				<template #prefix>
					<span>+</span>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-otp-input-field :length="6" label="Suffix slot">
				<template #suffix>
					<span>OTP</span>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-otp-input-field :length="6" label="Prepend inner slot">
				<template #prependInner>
					<origam-icon :icon="MDI_ICONS.LOCK_OUTLINE"/>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-otp-input-field :length="6" label="Append inner slot">
				<template #appendInner>
					<origam-icon :icon="MDI_ICONS.INFORMATION_OUTLINE"/>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-otp-input-field :length="6" label="Clear slot" clearable>
				<template #clear>
					<origam-icon :icon="MDI_ICONS.CLOSE_CIRCLE"/>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-otp-input-field :length="6" loading label="Loading OTP">
				<template #loader>
					<span>Loading…</span>
				</template>
			</origam-otp-input-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IOtpInputFieldProps>({
					label: 'Verification code',
					length: 6,
					type: OTP_INPUT_FIELD_TYPE.TEXT,
					color: 'primary',
					disabled: false,
					readonly: false,
					error: false,
				})"
		>
			<template #default="{ state }">
				<origam-otp-input-field
						v-model="playgroundModel"
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
						@finish="logEvent('finish', $event)"
				/>
				<div>value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.label"   title="Label"/>
					<HstNumber v-model="state.length"  title="Length" :min="4" :max="10" :step="1"/>
					<HstSelect v-model="state.type"    title="Type"   :options="OTP_TYPE_OPTIONS"/>
					<HstText   v-model="state.divider" title="Divider"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
					<HstCheckbox v-model="state.error"     title="Error"/>
					<HstCheckbox v-model="state.loading"   title="Loading"/>
					<HstCheckbox v-model="state.clearable" title="Clearable"/>
					<HstCheckbox v-model="state.required"  title="Required"/>
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

	import { OrigamIcon, OrigamOtpInputField } from '@origam/components'
	import { MDI_ICONS, OTP_INPUT_FIELD_TYPE } from '@origam/enums'
	import type {
		IActiveProps,
		IHoverProps,
		IOtpInputFieldProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		VARIANT_INPUT_OPTIONS
	} from '@stories/const'

	const designModel     = ref<string | null>(null)
	const stateModel      = ref<string | null>(null)
	const functionalModel = ref<string | null>(null)
	const emitModel       = ref<string | null>(null)
	const emitFinishModel = ref<string | null>(null)
	const emitClearModel  = ref<string | null>(null)
	const playgroundModel = ref<string | null>(null)

	const OTP_TYPE_OPTIONS = [
		{ label: 'text',     value: OTP_INPUT_FIELD_TYPE.TEXT },
		{ label: 'number',   value: OTP_INPUT_FIELD_TYPE.NUMBER },
		{ label: 'password', value: OTP_INPUT_FIELD_TYPE.PASSWORD },
	]

	const VALIDATE_ON_OPTIONS = [
		{ label: '(none)',       value: undefined },
		{ label: 'input',        value: 'input' },
		{ label: 'blur',         value: 'blur' },
		{ label: 'submit',       value: 'submit' },
		{ label: 'input lazy',   value: 'input lazy' },
		{ label: 'blur lazy',    value: 'blur lazy' },
		{ label: 'submit lazy',  value: 'submit lazy' },
	]

	const HIDE_DETAILS_OPTIONS = [
		{ label: 'false',  value: false },
		{ label: 'true',   value: true },
		{ label: 'auto',   value: 'auto' },
	]
</script>

<docs lang="md" src="@docs/components/OtpInputField/OrigamOtpInputField.md"/>
