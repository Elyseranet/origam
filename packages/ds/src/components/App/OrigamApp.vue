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
	import { OrigamLayout } from '../../components'

	import { useDefaults, useProps, useRtl , useStyle} from "../../composables"

	import type { IAppProps } from '../../interfaces'

	import type { TOrigamApp } from "../../types"

	import { computed, ref, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and utility hooks for the App root component.
	 ********************************************************/
	const _props = withDefaults(defineProps<IAppProps>(), {fullHeight: true})

	// `useDefaults` resolves each prop against theme.components['origam-app']
	// (OrigamBtn / #242 pattern) — without this, a theme's
	// `components: { 'origam-app': { bgColor: 'transparent', fullHeight: … } }`
	// block was a silent no-op (#289).
	//
	// NOTE: `<script setup>` auto-exposes every `defineProps()` key to the
	// template as a bare binding pointing at the raw, UNRESOLVED `$props` —
	// independent of this `props` variable. The root `<origam-layout>` above
	// therefore reads `props.color` / `props.bgColor` / `props.fullHeight` /
	// `props.overlaps` explicitly (see OrigamTable.vue / OrigamAlert.vue for
	// the full writeup of this footgun).
	const props = useDefaults(_props)

	const {filterProps} = useProps<IAppProps>(props)

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
	const {id, css, load, isLoaded, unload} = useStyle(appStyles)


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
	}
</style>
