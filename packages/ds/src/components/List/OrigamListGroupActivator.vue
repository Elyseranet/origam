<template>
	<component
			:is="tag"
			:id="id"
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
	import { useNestedGroupActivator } from '../../composables/Commons/nestedGroupActivator.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { IListActivatorProps, IListActivatorSlots } from '../../interfaces/List/list-group.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListActivatorProps>(), {tag: 'div'})

	defineSlots<IListActivatorSlots>()

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
	const {id, css, load, isLoaded, unload} = useStyle(activatorStyles, () => props.id)


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
