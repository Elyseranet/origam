<template>
	<Story
			group="components"
			title="FileField/OrigamFileFieldListItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IFileFieldListItemProps>>({ color: 'primary', showSize: true })"
		>
			<template #default="{ state }">
				<div style="padding: 24px; max-width: 480px;">
					<origam-file-field-list-item
							:file="mockFile('design.pdf', 'application/pdf', 256000)"
							:index="0"
							:color="state.color"
							:file-icon="state.fileIcon || undefined"
							:remove-icon="state.removeIcon || undefined"
							:show-size="state.showSize"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.fileIcon"   title="File Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.removeIcon" title="Remove Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstSelect v-model="state.showSize" title="Show Size" :options="SHOW_SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IFileFieldListItemProps>>({ progress: 0, disabled: false, readonly: false, showSize: true })"
		>
			<template #default="{ state }">
				<div style="padding: 24px; max-width: 480px;">
					<origam-file-field-list-item
							:file="mockFile('functional.pdf', 'application/pdf', 524288)"
							:index="0"
							:progress="state.progress"
							:disabled="state.disabled"
							:readonly="state.readonly"
							:show-size="state.showSize"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
				<StoryGroup title="Progress">
					<HstNumber v-model="state.progress" title="Progress" :min="0" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstSelect v-model="state.showSize" title="Show Size" :options="SHOW_SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:remove">
			<div style="padding: 24px; max-width: 480px;">
				<origam-file-field-list-item
						:file="mockFile('removable.pdf', 'application/pdf', 65536)"
						:index="0"
						@click:remove="logEvent('click:remove', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 24px; max-width: 480px;">
				<origam-file-field-list-item
						:file="mockFile('custom.pdf', 'application/pdf', 102400)"
						:index="0"
				>
					<span>Custom slot content</span>
				</origam-file-field-list-item>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IFileFieldListItemProps>>({ color: 'primary', progress: 0, disabled: false, readonly: false, showSize: true })"
		>
			<template #default="{ state }">
				<div style="padding: 24px; max-width: 480px;">
					<origam-file-field-list-item
							v-bind="state"
							:file="mockFile('playground.pdf', 'application/pdf', 256000)"
							:index="0"
							@click:remove="logEvent('click:remove', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.fileIcon"   title="File Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.removeIcon" title="Remove Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"    title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.showSize" title="Show Size" :options="SHOW_SIZE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstNumber   v-model="state.progress" title="Progress" :min="0" :max="100" :step="1"/>
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

	import { OrigamFileFieldListItem } from '@origam/components'
	import type { IFileFieldListItemProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ICON_OPTIONS
	} from '@stories/const'

	const SHOW_SIZE_OPTIONS = [
		{ label: 'true (auto unit)', value: true },
		{ label: 'false (hidden)', value: false },
		{ label: '1000 (SI — kB)', value: 1000 },
		{ label: '1024 (IEC — KiB)', value: 1024 }
	]

	const mockFile = (name: string, type: string, size: number): File => {
		const blob = new Blob([new Uint8Array(Math.min(size, 64))], { type })
		const file = new File([blob], name, { type })
		Object.defineProperty(file, 'size', { value: size })
		return file
	}
</script>

<docs lang="md" src="@docs/components/FileField/OrigamFileFieldListItem.md"/>
