<template>
	<component
			:is="tag"
			:aria-busy="isLoading || undefined"
			:aria-label="isLoading ? 'Loading' : undefined"
			:class="loaderClasses"
			:style="loaderStyles"
	>
		<template v-if="isLoading">
			<slot name="loader">
				<origam-progress
						:color="color"
						:size="23"
						:type="PROGRESS_TYPE.CIRCULAR"
						:width="2"
						class="origam-loader__progress"
						indeterminate
				/>
			</slot>
		</template>
		<template v-else>
			<slot name="default"/>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'
	import { OrigamProgress } from '../../components'
	import { useProps , useStyle} from "../../composables"

	import { PROGRESS_TYPE } from '../../enums'

	import type { ILoaderProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composables.
	 ********************************************************/

	const props = withDefaults(defineProps<ILoaderProps>(), {tag: 'span'})

	const {filterProps} = useProps<ILoaderProps>(props)

	/*********************************************************
	 * Loader state
	 *
	 * @description
	 * Derived boolean indicating whether loading is active.
	 ********************************************************/

	const isLoading = computed(() => {
		return !!props.loading
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const loaderStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const loaderClasses = computed(() => {
		return [
			'origam-loader',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(loaderStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
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
	.origam-loader {
		height: var(--origam-loader---height, 100%);

		&--fullscreen {
			position: var(--origam-loader__fullscreen---position, fixed);
			top: var(--origam-loader__fullscreen---top, 0);
			left: var(--origam-loader__fullscreen---left, 0);
			height: var(--origam-loader__fullscreen---height, 100vh);
			width: var(--origam-loader__fullscreen---width, 100vw);
		}

		&__progress {
			margin: var(--origam-loader__progress---margin, auto);
		}
	}
</style>
