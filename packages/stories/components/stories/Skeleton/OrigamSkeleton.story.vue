<template>
	<Story
			group="components"
			title="Skeleton/OrigamSkeleton"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISkeletonProps>>({ variant: 'rectangular', width: '200', height: '80', bgColor: undefined, color: undefined, rounded: undefined, size: undefined })"
		>
			<template #default="{ state }">
				<origam-skeleton
						:variant="state.variant"
						:bg-color="state.bgColor"
						:color="state.color"
						:size="state.size"
						:rounded="state.rounded"
						:width="state.width"
						:height="state.height"
						loading
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="SKELETON_VARIANT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size" title="Size" :options="SIZE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISkeletonProps>>({ loading: true, pulse: true, variant: 'text', width: '200' })"
		>
			<template #default="{ state }">
				<origam-skeleton
						:loading="state.loading"
						:pulse="state.pulse"
						:variant="state.variant"
						:width="state.width"
				>
					<p>Content loaded</p>
				</origam-skeleton>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.loading" title="Loading"/>
					<HstCheckbox v-model="state.pulse"   title="Pulse"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstSelect v-model="state.variant" title="Variant" :options="SKELETON_VARIANT_OPTIONS"/>
					<HstText   v-model="state.width"   title="Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-skeleton :loading="false" variant="text" width="200">
				<span>Custom slot content visible when not loading</span>
			</origam-skeleton>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISkeletonProps>({ variant: 'text', width: '200', loading: true, pulse: true })"
		>
			<template #default="{ state }">
				<origam-skeleton v-bind="state">
					<p>Content loaded</p>
				</origam-skeleton>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.variant" title="Variant" :options="SKELETON_VARIANT_OPTIONS"/>
					<HstSelect   v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.loading" title="Loading"/>
					<HstCheckbox v-model="state.pulse"   title="Pulse"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSkeleton } from '@origam/components'
	import type { ISkeletonProps } from '@origam/interfaces'
	import type { TSkeletonVariant } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	const SKELETON_VARIANT_OPTIONS: Array<{ label: string; value: TSkeletonVariant }> = [
		{ label: 'text', value: 'text' },
		{ label: 'rectangular', value: 'rectangular' },
		{ label: 'circular', value: 'circular' },
		{ label: 'card', value: 'card' },
		{ label: 'list-item', value: 'list-item' }
	]
</script>

<docs lang="md" src="@docs/components/Skeleton/OrigamSkeleton.md"/>
