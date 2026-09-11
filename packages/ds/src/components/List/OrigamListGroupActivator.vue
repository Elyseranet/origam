<template>
	<component
			:is="tag"
			:class="activatorClasses"
			:style="activatorStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'
	import {
	useNestedGroupActivator,
	useProps,
	useStyle
} from '../../composables'

	import type { IListActivatorProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListActivatorProps>(), {tag: 'div'})

	const {filterProps} = useProps<IListActivatorProps>(props)

	useNestedGroupActivator()

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const activatorStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const activatorClasses = computed(() => {
		return [
			'origam-list-group-activator',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(activatorStyles)


	/*********************************************************
	 * Expose
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
