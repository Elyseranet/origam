<template>
	<Story
			group="components"
			title="RatingField/OrigamRatingFieldItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IRatingFieldItemProps>>({
					value: 3,
					name: 'rating',
					showStar: true,
					isFilled: true,
					color: 'warning',
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
					<origam-rating-field-item
							:value="state.value ?? 3"
							:padding="state.padding"
							:margin="state.margin"
							:name="state.name"
							:show-star="state.showStar"
							:is-filled="state.isFilled"
							:color="state.color"
							:size="state.size"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:full-icon="state.fullIcon || undefined"
							:empty-icon="state.emptyIcon || undefined"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
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
					<HstSelect v-model="state.fullIcon"  title="Full Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.emptyIcon" title="Empty Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IRatingFieldItemProps>>({
					value: 3,
					name: 'rating',
					length: 5,
					itemAriaLabel: 'origam.rating.aria_label.item',
					showStar: true,
					isFilled: true,
					isHovered: false,
					isHovering: false,
					disabled: false,
					readonly: false,
					halfIncrements: false,
					checked: false,
					ripple: true,
					tag: 'label',
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
					<origam-rating-field-item
							:value="state.value ?? 3"
							:length="state.length"
							:item-aria-label="state.itemAriaLabel"
							:name="state.name"
							:show-star="state.showStar"
							:is-filled="state.isFilled"
							:is-hovered="state.isHovered"
							:is-hovering="state.isHovering"
							:disabled="state.disabled"
							:readonly="state.readonly"
							:half-increments="state.halfIncrements"
							:checked="state.checked"
							:ripple="state.ripple"
							:tag="state.tag"
							color="warning"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstNumber v-model="state.value"  title="Value" :min="0" :max="10" :step="0.5"/>
					<HstText   v-model="state.name"   title="Name"/>
					<HstNumber v-model="state.length" title="Length (row size, read by the aria label)" :min="1" :max="20"/>
					<HstText   v-model="state.itemAriaLabel" title="Item Aria Label (locale key)"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.showStar"      title="Show Star"/>
					<HstCheckbox v-model="state.isFilled"      title="Is Filled"/>
					<HstCheckbox v-model="state.isHovered"     title="Is Hovered"/>
					<HstCheckbox v-model="state.isHovering"    title="Is Hovering"/>
					<HstCheckbox v-model="state.checked"       title="Checked"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.halfIncrements" title="Half Increments"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.ripple" title="Ripple"/>
					<HstSelect   v-model="state.tag"    title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
				<origam-rating-field-item
						:value="3"
						name="rating"
						:show-star="true"
						:is-filled="true"
						color="warning"
						@click="logEvent('click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - mouseenter">
			<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
				<origam-rating-field-item
						:value="3"
						name="rating"
						:show-star="true"
						:is-filled="true"
						color="warning"
						@mouseenter="logEvent('mouseenter', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - mouseleave">
			<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
				<origam-rating-field-item
						:value="3"
						name="rating"
						:show-star="true"
						:is-filled="true"
						color="warning"
						@mouseleave="logEvent('mouseleave', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Item">
			<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
				<origam-rating-field-item
						v-for="star in 5"
						:key="star"
						:value="star"
						:name="slotName"
						:is-filled="star <= slotValue"
						color="warning"
				>
					<template #item="{ props: itemProps, value }">
						<origam-btn
								v-bind="itemProps"
								:aria-label="`${value}`"
								@click="slotValue = value"
						/>
					</template>
				</origam-rating-field-item>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IRatingFieldItemProps>({
					value: 3,
					name: 'rating',
					length: 5,
					itemAriaLabel: 'origam.rating.aria_label.item',
					showStar: true,
					isFilled: true,
					isHovered: false,
					isHovering: false,
					color: 'warning',
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; display: flex; gap: 4px; align-items: center;">
					<origam-rating-field-item
							v-bind="state"
							@click="logEvent('click', $event)"
							@mouseenter="logEvent('mouseenter', $event)"
							@mouseleave="logEvent('mouseleave', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstNumber v-model="state.value"  title="Value" :min="0" :max="10" :step="0.5"/>
					<HstText   v-model="state.name"   title="Name"/>
					<HstNumber v-model="state.length" title="Length (row size, read by the aria label)" :min="1" :max="20"/>
					<HstText   v-model="state.itemAriaLabel" title="Item Aria Label (locale key)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showStar"      title="Show Star"/>
					<HstCheckbox v-model="state.isFilled"      title="Is Filled"/>
					<HstCheckbox v-model="state.isHovered"     title="Is Hovered"/>
					<HstCheckbox v-model="state.isHovering"    title="Is Hovering"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.halfIncrements" title="Half Increments"/>
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

	import { OrigamBtn, OrigamRatingFieldItem } from '@origam/components'
	import type { IRatingFieldItemProps } from '@origam/interfaces'

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
		TAG_OPTIONS,
	} from '@stories/const'

	const slotValue = ref(3)
	const slotName = 'rating-slot-demo'
</script>

<docs lang="md" src="@docs/components/RatingField/OrigamRatingFieldItem.md"/>
