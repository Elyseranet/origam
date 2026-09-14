<template>
	<component
			:is="tag"
			:id="id"
			:aria-busy="isLoading || undefined"
			:aria-label="isLoading ? t(loadingText) : undefined"
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
	import OrigamProgress from '../Progress/OrigamProgress.vue'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'

	import type { ILoaderComponentProps, ILoaderEmits, ILoaderSlots } from '../../interfaces/Loader/loader.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composables.
	 *
	 * @description
	 * #444 — `loadingText` defaults to the shared `'origam.loading'` key,
	 * matching the default already used by OrigamProgress(Circular/Linear)/
	 * OrigamSkeleton/OrigamSwitch/OrigamAudio/OrigamVideo for the exact
	 * same aria-label role.
	 ********************************************************/

	const props = withDefaults(defineProps<ILoaderComponentProps>(), {
		tag: 'span',
		loadingText: 'origam.loading'
	})

	/*********************************************************
	 * Locale — non-strict (issue #444)
	 *
	 * @description
	 * `<OrigamLoader>` sits unconditionally in `<OrigamBtn>`'s render tree
	 * (`origam-btn__loader`, no `v-if`), so simply MOUNTING a button must
	 * not hard-fail when no `createOrigam()` plugin is installed.
	 *
	 * @description
	 * Falls back to the raw translation key (still not a hardcoded
	 * literal) when there is no locale instance to resolve it.
	 ********************************************************/
	const locale = useLocale(false)
	const t = (key: string) => locale?.t(key) ?? key

	defineEmits<ILoaderEmits>()

	defineSlots<ILoaderSlots>()

	const {filterProps} = useProps<ILoaderComponentProps>(props)

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
			{
				'origam-loader--fullscreen': props.fullscreen
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(loaderStyles, () => props.id)


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
