<template>
	<Story
			group="components"
			title="Kbd/OrigamKbd"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IKbdProps>>({ variant: 'outlined', color: undefined, bgColor: undefined, size: undefined, rounded: undefined, border: undefined, fontFamily: undefined, fontSize: undefined, fontWeight: undefined })"
		>
			<template #default="{ state }">
				<origam-kbd
						:variant="state.variant"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:rounded="state.rounded"
						:border="state.border"
						:font-family="state.fontFamily"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:combination="['⌘', 'S']"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="KBD_VARIANT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"   :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size" title="Size" :options="SIZE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border" title="Border" :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily" title="Font Family" :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IKbdProps>>({ text: '⌘', combination: undefined, separator: '+' })"
		>
			<template #default="{ state }">
				<origam-kbd
						:text="state.text"
						:combination="state.combination"
						:separator="state.separator"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text"      title="Text (single key)"/>
					<HstText v-model="state.separator" title="Separator"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-kbd>
				<origam-icon :icon="MDI_ICONS.APPLE_KEYBOARD_COMMAND" size="x-small"/>
			</origam-kbd>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IKbdProps>({ text: '⌘', variant: 'outlined', separator: '+' })"
		>
			<template #default="{ state }">
				<origam-kbd v-bind="state"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text"      title="Text (single key)"/>
					<HstText v-model="state.separator" title="Separator"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant" title="Variant"  :options="KBD_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"   :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily" title="Font Family" :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamIcon, OrigamKbd } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IKbdProps, IOptions } from '@origam/interfaces'
	import type { TKbdVariant } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		COLOR_OPTIONS,
		FONT_FAMILY_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
	} from '@stories/const'

	const KBD_VARIANT_OPTIONS: Array<IOptions<TKbdVariant | undefined>> = [
		{ label: '(none)', value: undefined },
		{ label: 'Outlined', value: 'outlined' },
		{ label: 'Filled', value: 'filled' },
		{ label: 'Tonal', value: 'tonal' },
	]
</script>

<docs lang="md" src="@docs/components/Kbd/OrigamKbd.md"/>
