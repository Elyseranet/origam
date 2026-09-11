<template>
	<Story
			group="components"
			title="Select/OrigamSelect"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISelectProps>>({ label: 'Select', color: 'primary', items: stringItems })"
		>
			<template #default="{ state }">
				<origam-select
						v-model="designModel"
						:items="state.items || stringItems"
						:padding="state.padding"
						:margin="state.margin"
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
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-inner-icon="state.prependInnerIcon || undefined"
						:append-inner-icon="state.appendInnerIcon || undefined"
						:label="state.label"
						:prefix="state.prefix"
						:suffix="state.suffix"
						:width="state.width"
						:height="state.height"
						:reverse="state.reverse"
						:single-line="state.singleLine"
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
				<StoryGroup title="Label">
					<HstText     v-model="state.label"      title="Label"/>
					<HstText     v-model="state.prefix"     title="Prefix"/>
					<HstText     v-model="state.suffix"     title="Suffix"/>
					<HstCheckbox v-model="state.reverse"    title="Reverse"/>
					<HstCheckbox v-model="state.singleLine" title="Single Line"/>
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
				:init-state="() => useStoryInitState<Partial<ISelectProps> & ILoadingState>({
					label: 'Select',
					multiple: false,
					chips: false,
					closableChips: false,
					autocomplete: false,
					clearable: false,
					disabled: false,
					readonly: false,
					error: false,
					hideNoData: false,
					hideSelected: false,
					openOnClear: false,
					noDataText: '',
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24
				})"
		>
			<template #default="{ state }">
				<origam-select
						v-model="functionalModel"
						:items="stringItems"
						:label="state.label"
						:multiple="state.multiple"
						:chips="state.chips"
						:closable-chips="state.closableChips"
						:autocomplete="state.autocomplete"
						:clearable="state.clearable"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:error-messages="state.error ? ['Please select an option'] : []"
						:hide-no-data="state.hideNoData"
						:hide-selected="state.hideSelected"
						:open-on-clear="state.openOnClear"
						:no-data-text="state.noDataText || undefined"
						:loading="resolveLoading(state)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple"      title="Multiple"/>
					<HstCheckbox v-model="state.chips"         title="Chips"/>
					<HstCheckbox v-model="state.closableChips" title="Closable Chips"/>
					<HstCheckbox v-model="state.autocomplete"  title="Autocomplete"/>
					<HstCheckbox v-model="state.clearable"     title="Clearable"/>
					<HstCheckbox v-model="state.hideSelected"  title="Hide Selected"/>
					<HstCheckbox v-model="state.openOnClear"   title="Open On Clear"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText     v-model="state.noDataText" title="No Data Text"/>
					<HstCheckbox v-model="state.hideNoData" title="Hide No Data"/>
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
			<origam-select
					v-model="emitModel"
					:items="stringItems"
					label="Select one"
					data-cy="select-emit-update"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:menu">
			<origam-select
					v-model="emitMenuModel"
					:items="stringItems"
					label="Open / close dropdown"
					data-cy="select-emit-menu"
					@update:menu="logEvent('update:menu', $event)"
			/>
		</Variant>

		<Variant title="Events - click:clear">
			<origam-select
					v-model="emitClearModel"
					:items="stringItems"
					clearable
					label="Clearable select"
					data-cy="select-emit-clear"
					@click:clear="logEvent('click:clear', $event)"
			/>
		</Variant>

		<Variant title="Events - click:append">
			<origam-select
					:items="stringItems"
					:append-icon="appendIcon"
					label="Click append icon"
					data-cy="select-emit-click-append"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Events - click:appendInner">
			<origam-select
					:items="stringItems"
					:append-inner-icon="appendInnerIcon"
					label="Click append inner icon"
					data-cy="select-emit-click-append-inner"
					@click:appendInner="logEvent('click:appendInner', $event)"
			/>
		</Variant>

		<Variant title="Events - click:control">
			<origam-select
					:items="stringItems"
					label="Click control"
					data-cy="select-emit-click-control"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-select
					:items="stringItems"
					:prepend-icon="prependIcon"
					label="Click prepend icon"
					data-cy="select-emit-click-prepend"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prependInner">
			<origam-select
					:items="stringItems"
					:prepend-inner-icon="prependInnerIcon"
					label="Click prepend inner icon"
					data-cy="select-emit-click-prepend-inner"
					@click:prependInner="logEvent('click:prependInner', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-select
					:items="stringItems"
					label="Mousedown control"
					data-cy="select-emit-mousedown-control"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-select
					:items="stringItems"
					label="Focus the select"
					data-cy="select-emit-update-focused"
					@update:focused="logEvent('update:focused', $event)"
			/>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-select
					:items="stringItems"
					label="Prepend slot"
					data-cy="select-slot-prepend"
			>
				<template #prepend>
					<origam-icon :icon="prependIcon"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Append">
			<origam-select
					:items="stringItems"
					label="Append slot"
					data-cy="select-slot-append"
			>
				<template #append>
					<origam-icon :icon="appendIcon"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-select
					:items="stringItems"
					label="Prepend inner slot"
					data-cy="select-slot-prepend-inner"
			>
				<template #prependInner>
					<origam-icon :icon="prependInnerIcon"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-select
					:items="stringItems"
					label="Append inner slot"
					data-cy="select-slot-append-inner"
			>
				<template #appendInner>
					<origam-icon :icon="appendInnerIcon"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-select
					v-model="clearSlotModel"
					:items="stringItems"
					clearable
					label="Clear slot"
					data-cy="select-slot-clear"
			>
				<template #clear>
					<origam-icon :icon="clearIcon"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Label">
			<origam-select
					:items="stringItems"
					data-cy="select-slot-label"
			>
				<template #label>
					<span style="font-style: italic; color: var(--origam-color__action--primary---bg);">Custom label</span>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-select
					:items="stringItems"
					label="Floating label slot"
					data-cy="select-slot-floating-label"
			>
				<template #floatingLabel>
					<span style="font-style: italic;">Custom floating label</span>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-select
					:items="stringItems"
					label="Prefix slot"
					data-cy="select-slot-prefix"
			>
				<template #prefix>
					<span>+33</span>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-select
					:items="stringItems"
					label="Suffix slot"
					data-cy="select-slot-suffix"
			>
				<template #suffix>
					<span>kg</span>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-select
					:items="stringItems"
					loading
					label="Loading select"
					data-cy="select-slot-loader"
			>
				<template #loader>
					<span>Loading…</span>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - NoData">
			<origam-select
					:items="[]"
					label="No data slot"
					data-cy="select-slot-no-data"
			>
				<template #noData>
					<div style="padding: 16px; text-align: center; color: var(--origam-color__text---secondary);">
						Nothing to show here
					</div>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Chip">
			<origam-select
					v-model="chipSlotModel"
					:items="stringItems"
					multiple
					chips
					label="Chip slot"
					data-cy="select-slot-chip"
			>
				<template #chip="{ item }">
					<origam-chip :text="String(item.title ?? item.value ?? item)" color="primary" data-cy="select-slot-chip-item"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Selection">
			<origam-select
					v-model="selectionSlotModel"
					:items="stringItems"
					multiple
					label="Selection slot"
					data-cy="select-slot-selection"
			>
				<template #selection="{ item }">
					<origam-chip :text="String(item.title ?? item.value ?? item)" size="small" data-cy="select-slot-selection-chip"/>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Item">
			<origam-select
					v-model="itemSlotModel"
					:items="stringItems"
					label="Item slot"
					data-cy="select-slot-item"
			>
				<template #item="{ item, props: itemProps }">
					<li v-bind="itemProps" style="padding: 8px 16px; cursor: pointer; list-style: none;">
						<origam-icon :icon="prependIcon"/>
						{{ item.title ?? item.value ?? item }}
					</li>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Items.Prepend">
			<origam-select
					:items="stringItems"
					label="Items prepend slot"
					data-cy="select-slot-items-prepend"
			>
				<template #items.prepend>
					<div style="padding: 8px 16px; font-size: 0.75rem; color: var(--origam-color__text---secondary);">
						Start of list
					</div>
				</template>
			</origam-select>
		</Variant>

		<Variant title="Slots - Items.Append">
			<origam-select
					:items="stringItems"
					label="Items append slot"
					data-cy="select-slot-items-append"
			>
				<template #items.append>
					<div style="padding: 8px 16px; font-size: 0.75rem; color: var(--origam-color__text---secondary);">
						End of list
					</div>
				</template>
			</origam-select>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<ISelectProps>>({
					label: 'Select',
					color: 'primary',
					multiple: false,
					chips: false,
					closableChips: false,
					autocomplete: false,
					clearable: false,
					disabled: false,
					readonly: false,
					error: false
				})"
		>
			<template #default="{ state }">
				<origam-select
						v-model="playgroundModel"
						:items="stringItems"
						v-bind="state"
						data-cy="select-playground"
				/>
				<div data-cy="select-playground-status">value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.multiple"      title="Multiple"/>
					<HstCheckbox v-model="state.chips"         title="Chips"/>
					<HstCheckbox v-model="state.closableChips" title="Closable Chips"/>
					<HstCheckbox v-model="state.autocomplete"  title="Autocomplete"/>
					<HstCheckbox v-model="state.clearable"     title="Clearable"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.error"         title="Error"/>
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

	import { OrigamChip, OrigamIcon, OrigamSelect } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { ISelectProps } from '@origam/interfaces'
	import type { TLoadingValue } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
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

	const prependIcon      = MDI_ICONS.EARTH
	const appendIcon       = MDI_ICONS.STAR
	const prependInnerIcon = MDI_ICONS.MAGNIFY
	const appendInnerIcon  = MDI_ICONS.INFORMATION_OUTLINE
	const clearIcon        = MDI_ICONS.CLOSE_CIRCLE

	const stringItems = ['France', 'Germany', 'Spain', 'Italy', 'Portugal']

	const designModel        = ref<string | null>(null)
	const functionalModel    = ref<any>(null)
	const clearSlotModel     = ref<string | null>(null)
	const chipSlotModel      = ref<string[]>([])
	const selectionSlotModel = ref<string[]>([])
	const itemSlotModel      = ref<string | null>(null)
	const emitModel          = ref<string | null>(null)
	const emitMenuModel      = ref<string | null>(null)
	const emitClearModel     = ref<string | null>(null)
	const playgroundModel    = ref<any>(null)
</script>

<docs lang="md" src="@docs/components/Select/OrigamSelect.md"/>
