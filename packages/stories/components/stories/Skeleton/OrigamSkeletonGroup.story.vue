<template>
	<Story
			group="components"
			title="Skeleton/OrigamSkeletonGroup"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISkeletonGroupProps>>({ animation: 'pulse' })"
		>
			<template #default="{ state }">
				<origam-skeleton-group
						:animation="state.animation"
						style="width: 320px;"
						data-cy="skeleton-group-card"
				>
					<origam-skeleton variant="rectangular" height="120"/>
					<origam-skeleton variant="text" width="70%"/>
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text" width="50%"/>
					<origam-skeleton variant="pill"/>
				</origam-skeleton-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Motion">
					<HstSelect v-model="state.animation" title="Animation" :options="SKELETON_ANIMATION_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISkeletonGroupProps>>({ label: 'origam.loading' })"
		>
			<template #default="{ state }">
				<origam-skeleton-group
						:label="state.label"
						style="width: 320px;"
						data-cy="skeleton-group-announce"
				>
					<origam-skeleton variant="circular"/>
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text" width="60%"/>
				</origam-skeleton-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Accessibility">
					<HstText v-model="state.label" title="Label (locale key)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-skeleton-group style="width: 320px;" data-cy="skeleton-group-slot">
				<origam-skeleton variant="text"/>
				<origam-skeleton variant="text" width="40%"/>
			</origam-skeleton-group>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISkeletonGroupProps>({ animation: 'pulse', label: 'origam.loading' })"
		>
			<template #default="{ state }">
				<origam-skeleton-group
						v-bind="state"
						style="width: 320px;"
				>
					<origam-skeleton variant="text"/>
					<origam-skeleton variant="text" width="60%"/>
				</origam-skeleton-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.animation" title="Animation" :options="SKELETON_ANIMATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText v-model="state.label" title="Label (locale key)"/>
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
	import { SKELETON_ANIMATION } from '@origam/enums'
	import type { ISkeletonGroupProps } from '@origam/interfaces'
	import type { TSkeletonAnimation } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const SKELETON_ANIMATION_OPTIONS: Array<{ label: string; value: TSkeletonAnimation }> = Object.values(SKELETON_ANIMATION)
		.map((value) => ({ label: value, value }))
</script>

<docs lang="md" src="@docs/components/Skeleton/OrigamSkeletonGroup.md"/>
