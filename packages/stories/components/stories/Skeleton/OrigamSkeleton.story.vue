<template>
	<Story
			group="components"
			title="Skeleton/OrigamSkeleton"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISkeletonProps>>({ variant: 'rectangular', animation: 'pulse', width: '200', height: '80', bgColor: undefined, color: undefined, rounded: undefined, size: undefined })"
		>
			<template #default="{ state }">
				<origam-skeleton
						:variant="state.variant"
						:animation="state.animation"
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
				<StoryGroup title="Motion">
					<HstSelect v-model="state.animation" title="Animation" :options="SKELETON_ANIMATION_OPTIONS"/>
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

		<Variant title="Design - Shapes (primitives)">
			<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;" data-cy="skeleton-shapes">
				<origam-skeleton variant="text" width="160" animation="none" data-cy="skeleton-shape-text"/>
				<origam-skeleton variant="rectangular" width="120" height="60" animation="none" data-cy="skeleton-shape-rectangular"/>
				<origam-skeleton variant="circular" data-cy="skeleton-shape-circular"/>
				<origam-skeleton variant="circular" width="48" animation="none" data-cy="skeleton-shape-circular-sized"/>
				<origam-skeleton variant="pill" animation="none" data-cy="skeleton-shape-pill"/>
			</div>
		</Variant>

		<Variant title="Design - Animations (one group each)">
			<div style="display: grid; gap: 24px; width: 260px;" data-cy="skeleton-animations">
				<origam-skeleton-group animation="pulse" data-cy="skeleton-group-pulse">
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text"/>
				</origam-skeleton-group>
				<origam-skeleton-group animation="wave" data-cy="skeleton-group-wave">
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text"/>
				</origam-skeleton-group>
				<origam-skeleton-group animation="none" data-cy="skeleton-group-none">
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text"/>
				</origam-skeleton-group>
			</div>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISkeletonProps>>({ loading: true, variant: 'text', width: '200', label: 'origam.loading' })"
		>
			<template #default="{ state }">
				<origam-skeleton
						:label="state.label"
						:loading="state.loading"
						:variant="state.variant"
						:width="state.width"
				>
					<p>Content loaded</p>
				</origam-skeleton>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.loading" title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Accessibility">
					<HstText v-model="state.label" title="Label (locale key)"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstSelect v-model="state.variant" title="Variant" :options="SKELETON_VARIANT_OPTIONS"/>
					<HstText   v-model="state.width"   title="Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Functional - Host state (.origam--skeleton)">
			<div style="display: grid; gap: 16px; width: 280px;" data-cy="skeleton-host">
				<div class="origam--skeleton" style="padding: 12px; border-radius: 8px;" data-cy="skeleton-host-div">
					A card title that is still loading
					<span>and a child that must disappear</span>
				</div>
				<button type="button" class="origam--skeleton" aria-busy="true" aria-disabled="true" style="padding: 8px 16px;" data-cy="skeleton-host-button">
					Save
				</button>
				<div class="origam--skeleton origam--skeleton-wave" style="padding: 12px; border-radius: 8px;" data-cy="skeleton-host-wave">
					Shimmer host
				</div>
				<div class="origam--skeleton origam--skeleton-none" style="padding: 12px; border-radius: 8px;" data-cy="skeleton-host-none">
					Static host
				</div>
				<input class="origam--skeleton" value="Not a valid host" aria-label="Not a valid host" data-cy="skeleton-host-input">
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-skeleton :loading="false" variant="text" width="200">
				<span>Custom slot content visible when not loading</span>
			</origam-skeleton>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISkeletonProps>({ variant: 'text', width: '200', loading: true, animation: 'pulse', label: 'origam.loading' })"
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
					<HstSelect   v-model="state.variant"   title="Variant"   :options="SKELETON_VARIANT_OPTIONS"/>
					<HstSelect   v-model="state.animation" title="Animation" :options="SKELETON_ANIMATION_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.loading" title="Loading"/>
					<HstText     v-model="state.label"   title="Label (locale key)"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSkeleton, OrigamSkeletonGroup } from '@origam/components'
	import { SKELETON_ANIMATION, SKELETON_VARIANT } from '@origam/enums'
	import type { ISkeletonProps } from '@origam/interfaces'
	import type { TSkeletonAnimation, TSkeletonVariant } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	const SKELETON_VARIANT_OPTIONS: Array<{ label: string; value: TSkeletonVariant }> = Object.values(SKELETON_VARIANT)
		.map((value) => ({ label: value, value }))

	const SKELETON_ANIMATION_OPTIONS: Array<{ label: string; value: TSkeletonAnimation }> = Object.values(SKELETON_ANIMATION)
		.map((value) => ({ label: value, value }))
</script>

<docs lang="md" src="@docs/components/Skeleton/OrigamSkeleton.md"/>
