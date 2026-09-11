<template>
	<Story
			group="components"
			title="PasswordField/OrigamPasswordField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IPasswordFieldProps>>({
					label: 'Password',
					color: 'primary',
					variant: VARIANT_INPUT.OUTLINED,
				})"
		>
			<template #default="{ state }">
				<origam-password-field
						v-model="designModel"
						:label="state.label"
						:variant="state.variant"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:on-icon="state.onIcon || undefined"
						:off-icon="state.offIcon || undefined"
						:requirements-layout="state.requirementsLayout || undefined"
						:width="state.width"
						:height="state.height"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Label">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
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
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.onIcon"  title="On Icon (visible)"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.offIcon" title="Off Icon (hidden)"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Requirements Layout">
					<HstSelect v-model="state.requirementsLayout" title="Requirements Layout" :options="REQUIREMENTS_LAYOUT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IColorProps>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-password-field
						v-model="stateModel"
						label="Password"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover" title="Hover" :options="HOVER_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IPasswordFieldProps>>({
					label: 'Password',
					disabled: false,
					readonly: false,
					error: false,
					loading: false,
					clearable: false,
					requirements: false,
					minLength: 8,
					needTiny: false,
					needUppercase: false,
					needNumber: false,
					needSpecial: false,
					persistentRequirements: false,
					strengthBar: false,
					minimal: false,
				})"
		>
			<template #default="{ state }">
				<origam-password-field
						v-model="functionalModel"
						:label="state.label"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:loading="state.loading"
						:clearable="state.clearable"
						:requirements="state.requirements"
						:min-length="state.minLength"
						:need-tiny="state.needTiny"
						:need-uppercase="state.needUppercase"
						:need-number="state.needNumber"
						:need-special="state.needSpecial"
						:persistent-requirements="state.persistentRequirements"
						:strength-bar="state.strengthBar"
						:minimal="state.minimal"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstCheckbox v-model="state.clearable" title="Clearable"/>
					<HstCheckbox v-model="state.minimal"   title="Minimal"/>
				</StoryGroup>
				<StoryGroup title="Requirements">
					<HstCheckbox v-model="state.requirements"           title="Requirements"/>
					<HstNumber   v-model="state.minLength"              title="Min Length" :min="4" :max="64" :step="1"/>
					<HstCheckbox v-model="state.needTiny"               title="Need Tiny"/>
					<HstCheckbox v-model="state.needUppercase"          title="Need Uppercase"/>
					<HstCheckbox v-model="state.needNumber"             title="Need Number"/>
					<HstCheckbox v-model="state.needSpecial"            title="Need Special"/>
					<HstCheckbox v-model="state.persistentRequirements" title="Persistent Requirements"/>
				</StoryGroup>
				<StoryGroup title="Strength">
					<HstCheckbox v-model="state.strengthBar" title="Strength Bar"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-password-field
					v-model="emitUpdateModel"
					label="Type password"
					color="primary"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - click:control">
			<origam-password-field
					label="Click the field"
					color="primary"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-password-field
					label="Mousedown the field"
					color="primary"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Events - focus & blur">
			<origam-password-field
					v-model="emitFocusModel"
					label="Focus & blur"
					color="primary"
					@focus="logEvent('focus', $event)"
					@blur="logEvent('blur', $event)"
			/>
		</Variant>

		<Variant title="Events - update:strength">
			<origam-password-field
					v-model="emitStrengthModel"
					label="Password (strength)"
					color="primary"
					strength-bar
					@update:strength="logEvent('update:strength', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-password-field label="Password">
				<span>Custom default slot content</span>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-password-field label="Password">
				<template #prepend>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-password-field label="Password">
				<template #append>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-password-field label="Password">
				<template #prependInner>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-password-field label="Password">
				<template #appendInner>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-password-field label="Password" model-value="secret" clearable>
				<template #clear>
					<origam-icon :icon="closeIcon"/>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-password-field label="Password">
				<template #label>
					<strong>Custom label</strong>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-password-field label="Password">
				<template #floatingLabel>
					<em>Floating custom label</em>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-password-field label="Password">
				<template #prefix>
					<span>PFX</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-password-field label="Password">
				<template #suffix>
					<span>SFX</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-password-field label="Password" loading>
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Counter">
			<origam-password-field label="Password" counter>
				<template #counter>
					<span>Custom counter</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-password-field label="Password">
				<template #details>
					<span>Custom details area</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-password-field label="Password" :error-messages="['Error A', 'Error B']">
				<template #messages="{ messages }">
					<span v-for="(m, i) in messages" :key="i">{{ m }}</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-password-field label="Password" :error-messages="['Error message']">
				<template #message="{ message }">
					<strong>{{ message }}</strong>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Info">
			<origam-password-field label="Password" requirements>
				<template #info>
					<span>Custom requirements popup content</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant title="Slots - Field">
			<origam-password-field label="Password">
				<template #field>
					<span>Custom field control</span>
				</template>
			</origam-password-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IPasswordFieldProps>({
					label: 'Password',
					color: 'primary',
					variant: VARIANT_INPUT.OUTLINED,
					requirements: false,
					minLength: 8,
					needTiny: false,
					needUppercase: false,
					needNumber: false,
					needSpecial: false,
					persistentRequirements: false,
					disabled: false,
					readonly: false,
					error: false,
				})"
		>
			<template #default="{ state }">
				<origam-password-field
						v-model="playgroundModel"
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"               title="Disabled"/>
					<HstCheckbox v-model="state.readonly"               title="Readonly"/>
					<HstCheckbox v-model="state.error"                  title="Error"/>
					<HstCheckbox v-model="state.loading"                title="Loading"/>
					<HstCheckbox v-model="state.requirements"           title="Requirements"/>
					<HstCheckbox v-model="state.persistentRequirements" title="Persistent Requirements"/>
					<HstCheckbox v-model="state.strengthBar"            title="Strength Bar"/>
					<HstCheckbox v-model="state.minimal"                title="Minimal"/>
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

	import { OrigamIcon, OrigamPasswordField } from '@origam/components'
	import { MDI_ICONS, VARIANT_INPUT } from '@origam/enums'
	import type {
		IColorProps,
		IHoverProps,
		IPasswordFieldProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
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

	const heartIcon = MDI_ICONS.HEART
	const closeIcon = MDI_ICONS.CLOSE

	const REQUIREMENTS_LAYOUT_OPTIONS = [
		{ label: '(none)', value: undefined },
		{ label: 'List', value: 'list' },
		{ label: 'Tiles', value: 'tiles' },
	]

	const designModel      = ref('')
	const stateModel       = ref('')
	const functionalModel  = ref('')
	const playgroundModel  = ref('')
	const emitUpdateModel  = ref('')
	const emitFocusModel   = ref('')
	const emitStrengthModel = ref('')
</script>

<docs lang="md" src="@docs/components/PasswordField/OrigamPasswordField.md"/>
