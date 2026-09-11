<template>
	<component
			:is="tag"
			:class="spacerClasses"
			:style="spacerStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'
	import { useProps , useStyle} from "../../composables"

	import type { ISpacerProps } from "../../interfaces"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<ISpacerProps>(), {tag: 'div'})

	const {filterProps} = useProps<ISpacerProps>(props)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const spacerStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const spacerClasses = computed(() => {
		return [
			'origam-spacer',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(spacerStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-spacer {
		flex-grow: var(--origam-spacer---flex-grow);
	}
</style>

<style>
	:root {
		--origam-spacer---flex-grow: 1;
	}
</style>
