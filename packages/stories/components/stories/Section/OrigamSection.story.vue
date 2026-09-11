<template>
	<Story
			group="components"
			title="Section/OrigamSection"
	>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISectionState>({ content: 'Section content' })"
		>
			<template #default="{ state }">
				<origam-section>
					<p>{{ state.content }}</p>
				</origam-section>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.content" title="Content"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-section>
				<strong>Custom slot content</strong>
			</origam-section>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSection } from '@origam/components'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	interface ISectionState {
		content: string
	}
</script>

<docs lang="md" src="@docs/components/Section/OrigamSection.md"/>
