<template>
	<Story
			group="components"
			title="TextareaField/OrigamTextareaField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITextareaFieldProps>>({ label: 'Label', color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-textarea-field
						v-model="designModel"
						:variant="state.variant"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-inner-icon="state.prependInnerIcon || undefined"
						:append-inner-icon="state.appendInnerIcon || undefined"
						:label="state.label"
						:width="state.width"
						:height="state.height"
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
					<HstSelect v-model="state.prependIcon"      title="Prepend Icon"       :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"       title="Append Icon"        :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.prependInnerIcon" title="Prepend Inner Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendInnerIcon"  title="Append Inner Icon"  :options="ICON_OPTIONS"/>
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
				:init-state="() => useStoryInitState<IHoverProps & { bgColor?: string }>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-textarea-field
						v-model="stateModel"
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						label="State textarea"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover" title="Hover" :options="HOVER_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITextareaFieldProps> & ILoadingState>({
					label: 'Label',
					rows: 3,
					autoGrow: false,
					noResize: false,
					counter: false,
					disabled: false,
					readonly: false,
					error: false,
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24
				})"
		>
			<template #default="{ state }">
				<origam-textarea-field
						v-model="functionalModel"
						:label="state.label"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:error-messages="state.error ? ['Content too long'] : []"
						:loading="resolveLoading(state)"
						:rows="state.rows"
						:auto-grow="state.autoGrow"
						:max-rows="state.maxRows"
						:no-resize="state.noResize"
						:counter="state.counter"
						:placeholder="state.placeholder"
						:clearable="state.clearable"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstNumber   v-model="state.rows"     title="Rows"     :min="1" :max="20" :step="1"/>
					<HstNumber   v-model="state.maxRows"  title="Max Rows" :min="1" :max="40" :step="1"/>
					<HstCheckbox v-model="state.autoGrow"  title="Auto Grow"/>
					<HstCheckbox v-model="state.noResize"  title="No Resize"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText     v-model="state.placeholder" title="Placeholder"/>
					<HstCheckbox v-model="state.clearable"   title="Clearable"/>
				</StoryGroup>
				<StoryGroup title="Counter">
					<HstCheckbox v-model="state.counter" title="Counter (enable)"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind"     :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)" :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"   :min="12" :max="64"  :step="2"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional - Rich Mode"
				:init-state="() => useStoryInitState<{ mode: TTextareaMode, output: TTextareaOutput, toolbarPosition: TTextareaToolbarPosition, disabled: boolean, readonly: boolean }>({
					mode: 'plain',
					output: 'html',
					toolbarPosition: 'top',
					disabled: false,
					readonly: false
				})"
		>
			<template #default="{ state }">
				<origam-textarea-field
						v-model="richModel"
						:mode="state.mode"
						:output="state.output"
						:toolbar-position="state.toolbarPosition"
						:disabled="state.disabled"
						:readonly="state.readonly"
						label="Rich mode textarea"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode"   title="Mode"   :options="TEXTAREA_MODE_OPTIONS"/>
					<HstSelect v-model="state.output" title="Output" :options="TEXTAREA_OUTPUT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Toolbar">
					<HstSelect v-model="state.toolbarPosition" title="Toolbar Position" :options="TEXTAREA_TOOLBAR_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Mode — rich (HTML output)">
			<div data-cy="textarea-rich-html">
				<origam-textarea-field
						v-model="richHtmlModel"
						mode="rich"
						output="html"
						label="Rich editor (HTML)"
				/>
				<pre data-cy="textarea-rich-html-output" style="margin-top: 8px; padding: 8px; background: var(--origam-color__surface---subtle); border-radius: 4px; font-size: 0.75rem; white-space: pre-wrap;">{{ richHtmlModel }}</pre>
			</div>
		</Variant>

		<Variant title="Mode — rich (Markdown output)">
			<div data-cy="textarea-rich-markdown">
				<origam-textarea-field
						v-model="richMarkdownModel"
						mode="rich"
						output="markdown"
						label="Rich editor (Markdown)"
				/>
				<pre data-cy="textarea-rich-markdown-output" style="margin-top: 8px; padding: 8px; background: var(--origam-color__surface---subtle); border-radius: 4px; font-size: 0.75rem; white-space: pre-wrap;">{{ richMarkdownModel }}</pre>
			</div>
		</Variant>

		<Variant title="Prop — toolbar (filtered)">
			<div data-cy="textarea-rich-toolbar-filtered">
				<origam-textarea-field
						v-model="richFilteredModel"
						mode="rich"
						:toolbar="['bold', 'italic']"
						label="Filtered toolbar"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-textarea-field
					v-model="emitModel"
					label="Type here"
					data-cy="textarea-emit-update"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - focus">
			<origam-textarea-field
					v-model="emitFocusModel"
					label="Focus & blur"
					data-cy="textarea-emit-focus"
					@focus="logEvent('focus', $event)"
					@blur="logEvent('blur', $event)"
			/>
		</Variant>

		<Variant title="Events - click:control">
			<origam-textarea-field
					v-model="emitControlModel"
					label="Click the control"
					data-cy="textarea-emit-click-control"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-textarea-field
					v-model="emitMousedownModel"
					label="Mousedown on control"
					data-cy="textarea-emit-mousedown-control"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Events - update:height">
			<origam-textarea-field
					v-model="emitHeightModel"
					label="Auto-grow (watch height)"
					auto-grow
					data-cy="textarea-emit-height"
					@update:height="logEvent('update:height', $event)"
			/>
		</Variant>

		<Variant title="Events - format">
			<div data-cy="textarea-rich-emit-format">
				<origam-textarea-field
						v-model="emitFormatModel"
						mode="rich"
						label="Rich — format emit"
						@format="handleFormatEvent"
				/>
				<div style="margin-top: 8px; font-size: 0.75rem; font-family: monospace;">
					Count: <span data-cy="textarea-rich-emit-format-count">{{ formatEventCount }}</span>
					— Last: <span data-cy="textarea-rich-emit-format-last">{{ lastFormatName }}</span>
				</div>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-textarea-field label="Default slot" data-cy="textarea-slot-default">
				<span>Custom slot content</span>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-textarea-field v-model="slotOuterModel" label="Prepend slot" data-cy="textarea-slot-prepend">
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.TEXT_BOX"/>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-textarea-field v-model="slotOuterModel" label="Append slot" data-cy="textarea-slot-append">
				<template #append>
					<origam-icon :icon="MDI_ICONS.STAR"/>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-textarea-field v-model="slotInnerModel" label="Prepend inner slot" data-cy="textarea-slot-prepend-inner">
				<template #prependInner>
					<origam-icon :icon="MDI_ICONS.TEXT_BOX"/>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-textarea-field v-model="slotInnerModel" label="Append inner slot" data-cy="textarea-slot-append-inner">
				<template #appendInner>
					<origam-icon :icon="MDI_ICONS.CLOSE"/>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-textarea-field v-model="slotClearModel" label="Clearable" clearable data-cy="textarea-slot-clear">
				<template #clear>
					<origam-icon :icon="MDI_ICONS.CLOSE_CIRCLE"/>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Counter">
			<origam-textarea-field v-model="slotCounterModel" label="Custom counter" :counter="200" data-cy="textarea-slot-counter">
				<template #counter>
					<span>{{ slotCounterModel.length }} / 200</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-textarea-field v-model="slotDetailsModel" label="Custom details" data-cy="textarea-slot-details">
				<template #details>
					<span style="font-size: 0.75rem;">Custom hint text</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-textarea-field v-model="slotFloatingLabelModel" data-cy="textarea-slot-floating-label">
				<template #floatingLabel>
					<span style="font-style: italic;">Floating label</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-textarea-field v-model="slotLabelModel" data-cy="textarea-slot-label">
				<template #label>
					<span style="font-style: italic;">Custom label</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-textarea-field loading label="Loading textarea" data-cy="textarea-slot-loader">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-textarea-field v-model="slotMessageModel" label="Single message" :error="true" :error-messages="['Error']" data-cy="textarea-slot-message">
				<template #message="{ message }">
					<span style="font-style: italic;">{{ message }}</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-textarea-field v-model="slotMessagesModel" label="Custom messages" :error="true" :error-messages="['Error one', 'Error two']" data-cy="textarea-slot-messages">
				<template #messages>
					<span style="color: var(--origam-color__action--danger---bg);">Custom error display</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-textarea-field v-model="slotPrefixModel" label="With prefix" data-cy="textarea-slot-prefix">
				<template #prefix>
					<span>Note:</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-textarea-field v-model="slotSuffixModel" label="With suffix" data-cy="textarea-slot-suffix">
				<template #suffix>
					<span>chars</span>
				</template>
			</origam-textarea-field>
		</Variant>

		<Variant title="Slots - Toolbar">
			<div data-cy="textarea-rich-slot-toolbar">
				<origam-textarea-field v-model="slotToolbarModel" mode="rich" label="Custom toolbar slot">
					<template #toolbar="{ format, isFormat }">
						<div
								role="toolbar"
								aria-label="Custom toolbar"
								data-cy="textarea-rich-slot-toolbar-custom"
								style="display: flex; gap: 8px; padding: 8px;"
						>
							<button type="button" :aria-pressed="isFormat('bold') ? 'true' : 'false'" @click="format('bold')">B</button>
							<button type="button" :aria-pressed="isFormat('italic') ? 'true' : 'false'" @click="format('italic')">I</button>
							<button type="button" :aria-pressed="isFormat('list-bullet') ? 'true' : 'false'" @click="format('list-bullet')">UL</button>
						</div>
					</template>
				</origam-textarea-field>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITextareaFieldProps>({
					label: 'Message',
					color: 'primary',
					rows: 4,
					autoGrow: false,
					noResize: false,
					disabled: false,
					readonly: false,
					error: false,
				})"
		>
			<template #default="{ state }">
				<origam-textarea-field
						v-model="playgroundModel"
						v-bind="state"
						data-cy="textarea-playground"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText     v-model="state.label"       title="Label"/>
					<HstText     v-model="state.placeholder" title="Placeholder"/>
					<HstCheckbox v-model="state.clearable"   title="Clearable"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.rows"      title="Rows"      :min="1" :max="20" :step="1"/>
					<HstCheckbox v-model="state.autoGrow"  title="Auto Grow"/>
					<HstCheckbox v-model="state.noResize"  title="No Resize"/>
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
					<HstCheckbox v-model="state.error"     title="Error"/>
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

	import { OrigamIcon, OrigamTextareaField } from '@origam/components'
	import { MDI_ICONS, TEXTAREA_MODE, TEXTAREA_OUTPUT, TEXTAREA_TOOLBAR_POSITION } from '@origam/enums'
	import type { IHoverProps, ITextareaFieldProps } from '@origam/interfaces'
	import type { TLoadingValue, TTextareaMode, TTextareaOutput, TTextareaToolbarPosition } from '@origam/types'

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
		VARIANT_INPUT_OPTIONS
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

	const TEXTAREA_MODE_OPTIONS = [
		{ label: 'plain', value: TEXTAREA_MODE.PLAIN },
		{ label: 'rich', value: TEXTAREA_MODE.RICH }
	]

	const TEXTAREA_OUTPUT_OPTIONS = [
		{ label: 'html', value: TEXTAREA_OUTPUT.HTML },
		{ label: 'markdown', value: TEXTAREA_OUTPUT.MARKDOWN }
	]

	const TEXTAREA_TOOLBAR_POSITION_OPTIONS = [
		{ label: 'top', value: TEXTAREA_TOOLBAR_POSITION.TOP },
		{ label: 'bottom', value: TEXTAREA_TOOLBAR_POSITION.BOTTOM },
		{ label: 'floating', value: TEXTAREA_TOOLBAR_POSITION.FLOATING }
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

	const designModel           = ref('')
	const stateModel            = ref('')
	const functionalModel       = ref('')
	const richModel             = ref('')
	const richHtmlModel         = ref('')
	const richMarkdownModel     = ref('')
	const richFilteredModel     = ref('')
	const emitModel             = ref('')
	const emitFocusModel        = ref('')
	const emitControlModel      = ref('')
	const emitMousedownModel    = ref('')
	const emitHeightModel       = ref('')
	const emitFormatModel       = ref('')
	const formatEventCount      = ref(0)
	const lastFormatName        = ref('')

	function handleFormatEvent(name: string) {
		logEvent('format', name)
		formatEventCount.value++
		lastFormatName.value = name
	}

	const slotOuterModel        = ref('')
	const slotInnerModel        = ref('')
	const slotClearModel        = ref('')
	const slotCounterModel      = ref('')
	const slotDetailsModel      = ref('')
	const slotFloatingLabelModel = ref('')
	const slotLabelModel        = ref('')
	const slotMessageModel      = ref('')
	const slotMessagesModel     = ref('')
	const slotPrefixModel       = ref('')
	const slotSuffixModel       = ref('')
	const slotToolbarModel      = ref('')
	const playgroundModel       = ref('')
</script>

<docs lang="md" src="@docs/components/TextareaField/OrigamTextareaField.md"/>
