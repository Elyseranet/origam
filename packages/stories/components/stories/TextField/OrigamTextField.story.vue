<template>
	<Story
			group="components"
			title="TextField/OrigamTextField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITextFieldProps>>({
					label: 'Label',
					color: 'primary',
					variant: undefined,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					flat: false,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					prefix: '',
					suffix: '',
					prependInnerIcon: undefined,
					appendInnerIcon: undefined,
					clearIcon: undefined,
					width: undefined,
					height: undefined,
					inline: false,
					singleLine: false,
					reverse: false,
					centerAffix: false,
				})"
		>
			<template #default="{ state }">
				<origam-text-field
						:label="state.label"
						:padding="state.padding"
						:margin="state.margin"
						:variant="state.variant"
						:color="state.color"
						:size="state.size"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:prefix="state.prefix || undefined"
						:suffix="state.suffix || undefined"
						:prepend-inner-icon="state.prependInnerIcon || undefined"
						:append-inner-icon="state.appendInnerIcon || undefined"
						:clear-icon="state.clearIcon || undefined"
						:width="state.width"
						:height="state.height"
						:inline="state.inline"
						:single-line="state.singleLine"
						:reverse="state.reverse"
						:center-affix="state.centerAffix"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_INPUT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
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
				<StoryGroup title="Adornments">
					<HstText   v-model="state.prefix"          title="Prefix"/>
					<HstText   v-model="state.suffix"          title="Suffix"/>
					<HstSelect v-model="state.prependInnerIcon" title="Prepend Inner Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendInnerIcon"  title="Append Inner Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.clearIcon"        title="Clear Icon"          :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline"       title="Inline"/>
					<HstCheckbox v-model="state.singleLine"   title="Single Line"/>
					<HstCheckbox v-model="state.reverse"      title="Reverse"/>
					<HstCheckbox v-model="state.centerAffix"  title="Center Affix"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & Partial<ITextFieldProps>>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-text-field
						label="Stateful field"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
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
				:init-state="() => useStoryInitState<Partial<ITextFieldProps> & ILoadingState>({
					label: 'Field',
					type: 'text',
					placeholder: '',
					counter: false,
					persistentCounter: false,
					persistentPlaceholder: false,
					autofocus: false,
					clearable: false,
					persistentClear: false,
					disabled: false,
					readonly: false,
					required: false,
					error: false,
					hideDetails: false,
					hint: '',
					persistentHint: false,
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24,
				})"
		>
			<template #default="{ state }">
				<origam-text-field
						:label="state.label"
						:type="state.type"
						:placeholder="state.placeholder || undefined"
						:counter="state.counter"
						:persistent-counter="state.persistentCounter"
						:persistent-placeholder="state.persistentPlaceholder"
						:autofocus="state.autofocus"
						:clearable="state.clearable"
						:persistent-clear="state.persistentClear"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:required="state.required"
						:error="state.error"
						:hide-details="state.hideDetails"
						:hint="state.hint || undefined"
						:persistent-hint="state.persistentHint"
						:loading="resolveLoading(state)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.required" title="Required"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Input">
					<HstSelect   v-model="state.type"                 title="Type"                 :options="TYPE_OPTIONS"/>
					<HstText     v-model="state.placeholder"          title="Placeholder"/>
					<HstCheckbox v-model="state.persistentPlaceholder" title="Persistent Placeholder"/>
					<HstCheckbox v-model="state.autofocus"            title="Autofocus"/>
				</StoryGroup>
				<StoryGroup title="Counter">
					<HstCheckbox v-model="state.counter"          title="Counter"/>
					<HstCheckbox v-model="state.persistentCounter" title="Persistent Counter"/>
				</StoryGroup>
				<StoryGroup title="Clear">
					<HstCheckbox v-model="state.clearable"     title="Clearable"/>
					<HstCheckbox v-model="state.persistentClear" title="Persistent Clear"/>
				</StoryGroup>
				<StoryGroup title="Hint">
					<HstText     v-model="state.hint"          title="Hint"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
					<HstCheckbox v-model="state.hideDetails"   title="Hide Details"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind" :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)"  :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"    :min="12" :max="64"  :step="2"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-text-field
					v-model="emitModel"
					label="Type here"
					data-cy="textfield-emit-update"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - focus">
			<origam-text-field
					v-model="emitFocusModel"
					label="Focus the field"
					data-cy="textfield-emit-focus"
					@focus="logEvent('focus', $event)"
			/>
		</Variant>

		<Variant title="Events - blur">
			<origam-text-field
					v-model="emitBlurModel"
					label="Blur the field"
					data-cy="textfield-emit-blur"
					@blur="logEvent('blur', $event)"
			/>
		</Variant>

		<Variant title="Events - click:control">
			<origam-text-field
					v-model="emitControlModel"
					label="Click the control"
					data-cy="textfield-emit-click-control"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-text-field
					v-model="emitMousedownModel"
					label="Mousedown on control"
					data-cy="textfield-emit-mousedown-control"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Events - click:clear">
			<origam-text-field
					v-model="emitClearModel"
					label="Clearable"
					clearable
					data-cy="textfield-emit-clear"
					@click:clear="logEvent('click:clear', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-text-field
					v-model="emitPrependModel"
					label="Click outer prepend"
					data-cy="textfield-emit-click-prepend"
					@click:prepend="logEvent('click:prepend', $event)"
			>
				<template #prepend>
					<origam-icon :icon="accountIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Events - click:append">
			<origam-text-field
					v-model="emitAppendModel"
					label="Click outer append"
					data-cy="textfield-emit-click-append"
					@click:append="logEvent('click:append', $event)"
			>
				<template #append>
					<origam-icon :icon="starIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Events - click:prependInner">
			<origam-text-field
					v-model="emitPrependInnerModel"
					label="Click inner prepend"
					:prepend-inner-icon="magnifyIcon"
					data-cy="textfield-emit-click-prepend-inner"
					@click:prepend-inner="logEvent('click:prependInner', $event)"
			/>
		</Variant>

		<Variant title="Events - click:appendInner">
			<origam-text-field
					v-model="emitAppendInnerModel"
					label="Click inner append"
					:append-inner-icon="closeIcon"
					data-cy="textfield-emit-click-append-inner"
					@click:append-inner="logEvent('click:appendInner', $event)"
			/>
		</Variant>

		<Variant title="Events - valid">
			<origam-text-field
					v-model="emitValidModel"
					mask="phone:fr"
					label="French mobile (mask)"
					data-cy="textfield-emit-valid"
					@valid="logEvent('valid', $event)"
			/>
		</Variant>

		<Variant title="Events - complete">
			<origam-text-field
					v-model="emitCompleteModel"
					mask="phone:fr"
					label="French mobile (mask)"
					data-cy="textfield-emit-complete"
					@complete="logEvent('complete', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-text-field label="Default slot" data-cy="textfield-slot-default">
				<span>Custom slot content</span>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-text-field v-model="slotOuterModel" label="With outer prepend" data-cy="textfield-slot-prepend">
				<template #prepend>
					<origam-icon :icon="accountIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-text-field v-model="slotOuterModel" label="With outer append" data-cy="textfield-slot-append">
				<template #append>
					<origam-icon :icon="starIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-text-field v-model="slotInnerModel" label="With inner prepend" data-cy="textfield-slot-prepend-inner">
				<template #prependInner>
					<origam-icon :icon="magnifyIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-text-field v-model="slotInnerModel" label="With inner append" data-cy="textfield-slot-append-inner">
				<template #appendInner>
					<origam-icon :icon="closeIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-text-field v-model="slotClearModel" label="Clearable" clearable data-cy="textfield-slot-clear">
				<template #clear>
					<origam-icon :icon="closeCircleIcon"/>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-text-field v-model="slotLabelModel" data-cy="textfield-slot-label">
				<template #label>
					<span style="font-style: italic;">Custom label</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-text-field v-model="slotFloatingLabelModel" data-cy="textfield-slot-floating-label">
				<template #floatingLabel>
					<span style="font-style: italic;">Floating label</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-text-field v-model="slotPrefixModel" label="Price" data-cy="textfield-slot-prefix">
				<template #prefix>
					<span>$</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-text-field v-model="slotSuffixModel" label="Amount" data-cy="textfield-slot-suffix">
				<template #suffix>
					<span>.00</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Counter">
			<origam-text-field v-model="slotCounterModel" label="Custom counter" :counter="50" data-cy="textfield-slot-counter">
				<template #counter>
					<span>{{ slotCounterModel.length }} / 50</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Field">
			<origam-text-field label="Field slot" data-cy="textfield-slot-field">
				<template #field>
					<span>Custom field content</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-text-field loading label="Loading field" data-cy="textfield-slot-loader">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-text-field v-model="slotMessageModel" label="Single message" :error="true" :error-messages="['Error']" data-cy="textfield-slot-message">
				<template #message="{ message }">
					<span style="font-style: italic;">{{ message }}</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-text-field v-model="slotMessagesModel" label="Custom messages" :error="true" :error-messages="['Error one', 'Error two']" data-cy="textfield-slot-messages">
				<template #messages>
					<span style="color: var(--origam-color__action--danger---bg);">Custom error display</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-text-field v-model="slotDetailsModel" label="Custom details" data-cy="textfield-slot-details">
				<template #details>
					<span style="font-size: 0.75rem;">Custom hint text</span>
				</template>
			</origam-text-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITextFieldProps>({
					label: 'Full name',
					color: 'primary',
					variant: undefined,
					size: undefined,
					density: undefined,
					type: 'text',
					placeholder: '',
					counter: false,
					clearable: false,
					disabled: false,
					readonly: false,
					error: false,
				})"
		>
			<template #default="{ state }">
				<origam-text-field
						v-model="playgroundModel"
						v-bind="state"
						data-cy="textfield-playground"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label"       title="Label"/>
					<HstText v-model="state.placeholder" title="Placeholder"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.type"     title="Type"     :options="TYPE_OPTIONS"/>
					<HstCheckbox v-model="state.counter"  title="Counter"/>
					<HstCheckbox v-model="state.clearable" title="Clearable"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
			</template>
		</Variant>
		<Variant title="Prop — mask (built-in patterns)">
			<origam-text-field
					v-model="maskBuiltinModel"
					mask="phone:fr"
					label="French mobile (mask)"
					data-cy="textfield-mask-builtin"
					@valid="v => maskBuiltinValid = v"
					@complete="e => maskBuiltinComplete = e.complete"
			/>
			<div data-cy="textfield-mask-builtin-status" style="margin-top: 8px; font-family: monospace; font-size: 12px;">
				unmasked = {{ maskBuiltinModel }} · complete = {{ maskBuiltinComplete }} · valid = {{ maskBuiltinValid }}
			</div>
		</Variant>

		<Variant title="Prop — mask (credit card with Luhn)">
			<origam-text-field
					v-model="maskCreditCardModel"
					mask="creditcard"
					label="Credit card (Luhn)"
					data-cy="textfield-mask-creditcard"
					@valid="v => maskCreditCardValid = v"
			/>
			<div data-cy="textfield-mask-creditcard-status" style="margin-top: 8px; font-family: monospace; font-size: 12px;">
				unmasked = {{ maskCreditCardModel }} · valid = {{ maskCreditCardValid }}
			</div>
		</Variant>

		<Variant title="Prop — mask (custom pattern)">
			<origam-text-field
					v-model="maskCustomModel"
					mask="(##) ###-####"
					label="US-style phone (custom pattern)"
					data-cy="textfield-mask-custom"
					@complete="e => maskCustomComplete = e.complete"
			/>
			<div data-cy="textfield-mask-custom-status" style="margin-top: 8px; font-family: monospace; font-size: 12px;">
				unmasked = {{ maskCustomModel }} · complete = {{ maskCustomComplete }}
			</div>
		</Variant>

		<Variant title="Emit — valid / complete">
			<origam-text-field
					v-model="maskEmitModel"
					mask="phone:fr"
					label="French mobile (mask)"
					data-cy="textfield-mask-emit"
					@valid="handleMaskEmitValid"
			/>
			<div data-cy="textfield-mask-emit-status" style="margin-top: 8px; font-family: monospace; font-size: 12px;">
				valid-emits = {{ maskEmitValidCount }}
			</div>
		</Variant>

	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'
	import { logEvent } from 'histoire/client'

	import { OrigamIcon, OrigamTextField } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IActiveProps, IHoverProps, ITextFieldProps } from '@origam/interfaces'
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
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		VARIANT_INPUT_OPTIONS
	} from '@stories/const'

	interface ILoadingState {
		enabled: boolean
		kind: 'bool' | 'number' | 'line' | 'circular' | 'skeleton'
		progress: number
		circularSize: number
	}

	const accountIcon     = MDI_ICONS.ACCOUNT
	const starIcon        = MDI_ICONS.STAR
	const magnifyIcon     = MDI_ICONS.MAGNIFY
	const closeIcon       = MDI_ICONS.CLOSE
	const closeCircleIcon = MDI_ICONS.CLOSE_CIRCLE

	const LOADING_KIND_OPTIONS = [
		{ label: 'true (default)', value: 'bool' },
		{ label: 'number', value: 'number' },
		{ label: '{ type: line }', value: 'line' },
		{ label: '{ type: circular }', value: 'circular' },
		{ label: '{ type: skeleton }', value: 'skeleton' }
	]

	const TYPE_OPTIONS = [
		{ label: 'text',     value: 'text'     },
		{ label: 'email',    value: 'email'     },
		{ label: 'search',   value: 'search'   },
		{ label: 'tel',      value: 'tel'      },
		{ label: 'url',      value: 'url'      },
		{ label: 'password', value: 'password' },
		{ label: 'number',   value: 'number'   },
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

	const emitModel             = ref('')
	const emitFocusModel        = ref('')
	const emitBlurModel         = ref('')
	const emitControlModel      = ref('')
	const emitMousedownModel    = ref('')
	const emitClearModel        = ref('')
	const emitPrependModel      = ref('')
	const emitAppendModel       = ref('')
	const emitPrependInnerModel = ref('')
	const emitAppendInnerModel  = ref('')
	const emitValidModel        = ref('')
	const emitCompleteModel     = ref('')

	const maskBuiltinModel      = ref('')
	const maskBuiltinValid      = ref(true)
	const maskBuiltinComplete   = ref(false)

	const maskCreditCardModel   = ref('')
	const maskCreditCardValid   = ref(true)

	const maskCustomModel       = ref('')
	const maskCustomComplete    = ref(false)

	const maskEmitModel         = ref('')
	const maskEmitValidCount    = ref(0)
	const handleMaskEmitValid = () => {
		maskEmitValidCount.value++
	}

	const slotOuterModel         = ref('')
	const slotInnerModel         = ref('')
	const slotClearModel         = ref('')
	const slotCounterModel       = ref('')
	const slotLabelModel         = ref('')
	const slotFloatingLabelModel = ref('')
	const slotPrefixModel        = ref('')
	const slotSuffixModel        = ref('')
	const slotDetailsModel       = ref('')
	const slotMessageModel       = ref('')
	const slotMessagesModel      = ref('')

	const playgroundModel = ref('')
</script>

<docs lang="md" src="@docs/components/TextField/OrigamTextField.md"/>
