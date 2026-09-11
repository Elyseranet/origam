<template>
	<Story
			group="components"
			title="Tabs/OrigamTabs"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITabsProps & ITabProps>>({ variant: TAB_VARIANT.DEFAULT, color: undefined, bgColor: undefined, rounded: undefined, density: undefined, direction: DIRECTION.HORIZONTAL, fontSize: undefined, fontWeight: undefined, letterSpacing: undefined })"
		>
			<template #default="{ state }">
				<origam-tabs
						:variant="state.variant"
						:color="state.color"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:density="state.density"
						:direction="state.direction"
						v-model="designValue"
				>
					<origam-tab :value="0" :font-size="state.fontSize" :font-weight="state.fontWeight" :letter-spacing="state.letterSpacing">Profile</origam-tab>
					<origam-tab :value="1" :font-size="state.fontSize" :font-weight="state.fontWeight" :letter-spacing="state.letterSpacing">Settings</origam-tab>
					<origam-tab :value="2" :font-size="state.fontSize" :font-weight="state.fontWeight" :letter-spacing="state.letterSpacing">Billing</origam-tab>
				</origam-tabs>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="TAB_VARIANT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography (per tab)">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITabsProps>>({ mandatory: true, disabled: false, fixed: false, centered: false, multiple: false })"
		>
			<template #default="{ state }">
				<origam-tabs
						:mandatory="state.mandatory"
						:disabled="state.disabled"
						:fixed="state.fixed"
						:centered="state.centered"
						:multiple="state.multiple"
						v-model="functionalValue"
				>
					<origam-tab :value="0">Profile</origam-tab>
					<origam-tab :value="1">Settings</origam-tab>
					<origam-tab :value="2">Billing</origam-tab>
				</origam-tabs>
				<div class="story-status">selected = <strong>{{ functionalValue }}</strong></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.fixed"    title="Fixed"/>
					<HstCheckbox v-model="state.centered" title="Centered"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-tabs
					v-model="emitValue"
					@update:model-value="logEvent('update:modelValue', $event)"
			>
				<origam-tab :value="0">One</origam-tab>
				<origam-tab :value="1">Two</origam-tab>
				<origam-tab :value="2">Three</origam-tab>
			</origam-tabs>
			<div class="story-status">selected = <strong>{{ emitValue }}</strong></div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-tabs v-model="slotDefaultValue">
				<origam-tab :value="'inbox'">
					<template #default>
						<span class="story-badge">Inbox <em>42</em></span>
					</template>
				</origam-tab>
				<origam-tab :value="'archive'">Archive</origam-tab>
				<origam-tab :value="'spam'">Spam</origam-tab>
			</origam-tabs>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITabsProps>({ variant: TAB_VARIANT.DEFAULT, direction: DIRECTION.HORIZONTAL, mandatory: true })"
		>
			<template #default="{ state }">
				<origam-tabs v-bind="state" v-model="playgroundValue" @update:model-value="logEvent('update:modelValue', $event)">
					<origam-tab :value="0">Profile</origam-tab>
					<origam-tab :value="1">Settings</origam-tab>
					<origam-tab :value="2">Billing</origam-tab>
				</origam-tabs>

				<origam-tab-panels v-model="playgroundValue">
					<origam-tab-panel :value="0">Profile details panel.</origam-tab-panel>
					<origam-tab-panel :value="1">Settings panel.</origam-tab-panel>
					<origam-tab-panel :value="2">Billing panel.</origam-tab-panel>
				</origam-tab-panels>

				<div class="story-status">selected = <strong>{{ playgroundValue }}</strong></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="TAB_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.fixed"     title="Fixed"/>
					<HstCheckbox v-model="state.centered"  title="Centered"/>
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

	import { OrigamTab, OrigamTabPanel, OrigamTabPanels, OrigamTabs } from '@origam/components'
	import { DENSITY, DIRECTION, TAB_VARIANT } from '@origam/enums'
	import type { ITabProps, ITabsProps } from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'
	import type { TTabVariant } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const TAB_VARIANT_OPTIONS: Array<IOptions<TTabVariant>> = [
		{ label: '(none)', value: undefined },
		{ label: 'Default', value: TAB_VARIANT.DEFAULT },
		{ label: 'Pills', value: TAB_VARIANT.PILLS },
		{ label: 'Underline', value: TAB_VARIANT.UNDERLINE }
	]

	const DIRECTION_OPTIONS: Array<IOptions<'horizontal' | 'vertical'>> = [
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'Vertical', value: DIRECTION.VERTICAL }
	]

	const designValue = ref<number>(0)
	const functionalValue = ref<number>(0)
	const emitValue = ref<number>(0)
	const slotDefaultValue = ref<string>('inbox')
	const playgroundValue = ref<number>(0)
</script>

<style scoped>
	.story-status {
		font: 0.875rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66));
		padding: 8px 0;
	}

	.story-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.story-badge em {
		font-style: normal;
		font-size: 0.75rem;
		padding: 2px 6px;
		border-radius: 9999px;
		background: var(--origam-color__action--primary---bg, #1976d2);
		color: var(--origam-color__action--primary---fg, white);
	}
</style>

<docs lang="md" src="@docs/components/Tabs/OrigamTabs.md"/>
