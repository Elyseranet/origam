<template>
	<origam-layout
			:id="id"
			ref="origamAppRef"
			:class="appClasses"
			:style="appStyles"
			:color="props.color"
			:bg-color="props.bgColor"
			:full-height="props.fullHeight"
			:overlaps="props.overlaps"
	>
		<template #default>
			<slot name="default"/>
		</template>
	</origam-layout>
</template>

<script
		lang="ts"
		setup
>
	import OrigamLayout from '../Layout/OrigamLayout.vue'

	import { useProps } from '../../composables/Commons/props.composable'
	import { useRtl } from '../../composables/Commons/rtl.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { IAppProps, IAppSlots } from '../../interfaces/App/app.interface'

	import type { TOrigamApp } from '../../types/App/app.type'

	import { computed, ref, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and utility hooks for the App root component.
	 ********************************************************/
	const props = withDefaults(defineProps<IAppProps>(), {fullHeight: true})

	const {filterProps} = useProps<IAppProps>(props)

	defineSlots<IAppSlots>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {rtlClasses} = useRtl()

	const origamAppRef = ref<TOrigamApp>()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes RTL and consumer classes onto the root layout.
	 ********************************************************/
	const appStyles = computed(() => {
		return [props.style] as StyleValue
	})
	const appClasses = computed(() => {
		return [
			'origam-app',
			rtlClasses.value,
			props.class
		]
	})
	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #381 — the `id` returned by useStyle is a GENERATED identifier,
	 * only meant for the scoped stylesheet selector. Without
	 * `() => props.id` here, it shadowed the `id` PROP of the same
	 * name: the template's `:id="id"` on the root rendered the
	 * generated id, never the consumer's.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(appStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
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
	.origam-app {
		color: var(--origam-app---color, var(--origam-color__text---primary));
		background-color: var(--origam-app---background-color, var(--origam-color__surface---default));

    &--is-rtl {
      direction: rtl;
    }

    &--is-ltr {
      direction: ltr;
    }
	}
</style>
