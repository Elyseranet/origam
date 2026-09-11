<template>
	<Story
			group="components"
			title="RatingField/OrigamRatingField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IRatingFieldProps>>({
					color: 'primary',
					length: 5,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined
				})"
		>
			<template #default="{ state }">
				<origam-rating-field
						v-model="ratingDesign"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:empty-icon="state.emptyIcon || undefined"
						:full-icon="state.fullIcon || undefined"
						:width="state.width"
						:height="state.height"
						:length="state.length"
						:item-label-position="state.itemLabelPosition"
						label="Rating"
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
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.emptyIcon" title="Empty Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.fullIcon"  title="Full Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Label">
					<HstSelect v-model="state.itemLabelPosition" title="Item Label Position" :options="ITEM_LABEL_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.length" title="Length" :min="1" :max="20"/>
					<HstText   v-model="state.width"  title="Width"/>
					<HstText   v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IRatingFieldProps>>({
					length: 5,
					halfIncrements: false,
					hover: false,
					clearable: false,
					disabled: false,
					readonly: false,
					ripple: true,
					label: 'Rating',
					hint: '',
					persistentHint: false,
					hideDetails: false,
					error: false
				})"
		>
			<template #default="{ state }">
				<origam-rating-field
						v-model="ratingFunctional"
						:length="state.length"
						:half-increments="state.halfIncrements"
						:hover="state.hover"
						:clearable="state.clearable"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:ripple="state.ripple"
						:label="state.label"
						:hint="state.hint"
						:persistent-hint="state.persistentHint"
						:hide-details="state.hideDetails"
						:error="state.error"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
					<HstCheckbox v-model="state.error"     title="Error"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstNumber   v-model="state.length"         title="Length" :min="1" :max="20"/>
					<HstCheckbox v-model="state.halfIncrements" title="Half Increments"/>
					<HstCheckbox v-model="state.hover"          title="Hover highlight"/>
					<HstCheckbox v-model="state.clearable"      title="Clearable"/>
					<HstCheckbox v-model="state.ripple"         title="Ripple"/>
				</StoryGroup>
				<StoryGroup title="Label / Hint">
					<HstText     v-model="state.label"          title="Label"/>
					<HstText     v-model="state.hint"           title="Hint"/>
					<HstCheckbox v-model="state.persistentHint" title="Persistent Hint"/>
					<HstCheckbox v-model="state.hideDetails"    title="Hide Details"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-rating-field
					v-model="ratingEmit"
					label="Rate this"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-rating-field v-model="ratingSlot">
				<span>Custom default slot content</span>
			</origam-rating-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-rating-field v-model="ratingSlot" label="Rating">
				<template #prepend>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-rating-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-rating-field v-model="ratingSlot" label="Rating">
				<template #append>
					<origam-icon :icon="starIcon"/>
				</template>
			</origam-rating-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-rating-field v-model="ratingSlot">
				<template #label>
					<strong>Rate this product</strong>
				</template>
			</origam-rating-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-rating-field v-model="ratingSlot" label="Rating">
				<template #details>
					<span>Custom details area</span>
				</template>
			</origam-rating-field>
		</Variant>

		<Variant title="Slots - ItemLabel">
			<origam-rating-field
					v-model="ratingSlot"
					:item-labels="itemLabels"
					item-label-position="top"
			>
				<template #itemLabel="{ label }">
					<strong>{{ label }}</strong>
				</template>
			</origam-rating-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IRatingFieldProps>({
					color: 'primary',
					length: 5,
					label: 'Rating',
					modelValue: 3
				})"
		>
			<template #default="{ state }">
				<origam-rating-field
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstNumber   v-model="state.length"         title="Length" :min="1" :max="20"/>
					<HstText     v-model="state.label"          title="Label"/>
					<HstCheckbox v-model="state.halfIncrements" title="Half Increments"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.hover"      title="Hover highlight"/>
					<HstCheckbox v-model="state.clearable"  title="Clearable"/>
					<HstCheckbox v-model="state.disabled"   title="Disabled"/>
					<HstCheckbox v-model="state.readonly"   title="Readonly"/>
					<HstCheckbox v-model="state.ripple"     title="Ripple"/>
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
	import { ref } from 'vue'

	import { OrigamIcon, OrigamRatingField } from '@origam/components'
	import { BLOCK, MDI_ICONS } from '@origam/enums'
	import type { IRatingFieldProps } from '@origam/interfaces'

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
		SIZE_OPTIONS
	} from '@stories/const'

	const ratingDesign = ref(3)
	const ratingFunctional = ref(3)
	const ratingEmit = ref(3)
	const ratingSlot = ref(3)

	const heartIcon = MDI_ICONS.HEART
	const starIcon = MDI_ICONS.STAR

	const itemLabels = ['Terrible', 'Bad', 'OK', 'Good', 'Excellent']

	const ITEM_LABEL_POSITION_OPTIONS = [
		{ label: 'Top', value: BLOCK.TOP },
		{ label: 'Bottom', value: BLOCK.BOTTOM }
	]
</script>

<docs lang="md" src="@docs/components/RatingField/OrigamRatingField.md"/>
