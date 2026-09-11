<template>
	<Story
			group="components"
			title="FileField/OrigamFileFieldDragNDropItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IFileFieldDragNDropItemProps>>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-file-field-drag-n-drop-item
						:file="mockFile('design.pdf', 'application/pdf', 256000)"
						:index="0"
						:color="state.color"
						:file-icon="state.fileIcon || undefined"
						:remove-icon="state.removeIcon || undefined"
						:font-size="state.fontSize || undefined"
						:font-weight="state.fontWeight || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.fileIcon"   title="File Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.removeIcon" title="Remove Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IFileFieldDragNDropItemProps>>({ progress: 0, showSize: true, disabled: false, readonly: false })"
		>
			<template #default="{ state }">
				<origam-file-field-drag-n-drop-item
						:file="mockFile('functional.pdf', 'application/pdf', 184320)"
						:index="0"
						:progress="state.progress"
						:show-size="state.showSize"
						:disabled="state.disabled"
						:readonly="state.readonly"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
				<StoryGroup title="Progress">
					<HstNumber v-model="state.progress" title="Progress" :min="0" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstSelect v-model="state.showSize" title="Show Size" :options="SHOW_SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:remove">
			<origam-file-field-drag-n-drop-item
					:file="mockFile('removable.pdf', 'application/pdf', 32768)"
					:index="0"
					@click:remove="logEvent('click:remove', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-file-field-drag-n-drop-item
					:file="mockFile('slot-demo.pdf', 'application/pdf', 32768)"
					:index="0"
			>
				<span>Custom slot content</span>
			</origam-file-field-drag-n-drop-item>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IFileFieldDragNDropItemProps>>({ color: 'primary', progress: 0, showSize: true, disabled: false, readonly: false })"
		>
			<template #default="{ state }">
				<origam-file-field-drag-n-drop-item
						v-bind="state"
						:file="mockFile('playground.pdf', 'application/pdf', 256000)"
						:index="0"
						@click:remove="logEvent('click:remove', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"      title="Color"       :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.fileIcon"   title="File Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.removeIcon" title="Remove Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstNumber   v-model="state.progress" title="Progress" :min="0" :max="100" :step="1"/>
					<HstSelect   v-model="state.showSize" title="Show Size" :options="SHOW_SIZE_OPTIONS"/>
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

	import { OrigamFileFieldDragNDropItem } from '@origam/components'
	import type { IFileFieldDragNDropItemProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ICON_OPTIONS
	} from '@stories/const'

	const SHOW_SIZE_OPTIONS = [
		{ label: 'true (auto)', value: true },
		{ label: 'false (hidden)', value: false },
		{ label: '1000 (SI)', value: 1000 },
		{ label: '1024 (binary)', value: 1024 }
	]

	const mockFile = (name: string, type: string, size: number): File => {
		const blob = new Blob([new Uint8Array(Math.min(size, 64))], { type })
		const file = new File([blob], name, { type })
		Object.defineProperty(file, 'size', { value: size })
		return file
	}
</script>

<docs lang="md" src="@docs/components/FileField/OrigamFileFieldDragNDropItem.md"/>
