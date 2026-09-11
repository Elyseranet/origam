<template>
	<Story
			group="components"
			title="Loader/OrigamLoader"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ILoaderComponentProps>>({ loading: true, color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-loader
						:loading="state.loading"
						:color="state.color"
						data-cy="loader-design"
				>
					<span>Idle content</span>
				</origam-loader>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ILoaderComponentProps>>({ loading: true, tag: 'span', loadingText: '', fullscreen: false })"
		>
			<template #default="{ state }">
				<origam-loader
						:loading="state.loading"
						:loading-text="state.loadingText || undefined"
						:tag="state.tag"
						:fullscreen="state.fullscreen"
						data-cy="loader-functional"
				>
					<span>Idle content</span>
				</origam-loader>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.loading"     title="Loading"/>
					<HstText     v-model="state.loadingText" title="Loading Text"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect   v-model="state.tag"         title="Tag" :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.fullscreen"  title="Fullscreen"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-loader data-cy="loader-slot-default">
				<span style="font-style: italic;">Custom idle content</span>
			</origam-loader>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-loader loading data-cy="loader-slot-loader">
				<template #loader>
					<span style="font-weight: 600;">Loading, please wait...</span>
				</template>
			</origam-loader>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ILoaderComponentProps>({ loading: true, color: 'primary', tag: 'span', loadingText: '', fullscreen: false })"
		>
			<template #default="{ state }">
				<origam-loader v-bind="state" data-cy="loader-playground">
					<span>Idle content</span>
				</origam-loader>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.loading"     title="Loading"/>
					<HstText     v-model="state.loadingText" title="Loading Text"/>
					<HstSelect   v-model="state.tag"         title="Tag" :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.fullscreen"  title="Fullscreen"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamLoader } from '@origam/components'
	import type { ILoaderComponentProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>

<docs lang="md" src="@docs/components/Loader/OrigamLoader.md"/>
