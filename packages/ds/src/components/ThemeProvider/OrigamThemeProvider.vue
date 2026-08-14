<template>
	<component
			:is="tag"
			:class="themeProviderClasses"
			:data-theme="dataTheme"
			:data-mode="dataMode"
	>
		<slot/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, ref, useAttrs } from 'vue'
	import { provideDefaults } from '../../composables'
	import { ORIGAM_DEFAULTS_KEY, ORIGAM_THEME_DEFAULTS_KEY } from '../../consts'
	import type { IDefault, IThemeProviderProps, IThemeProviderSlots } from '../../interfaces'
	import type { TModeResolved } from '../../types'

	defineOptions({ inheritAttrs: false })

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IThemeProviderProps>(), {
		theme: 'auto',
		mode: 'auto',
		tag: 'div'
	})

	defineSlots<IThemeProviderSlots>()

	const attrs = useAttrs()

	const dataTheme = computed(() => (props.theme === 'auto' ? undefined : props.theme))
	const dataMode = computed(() => (props.mode === 'auto' ? undefined : props.mode))
	const themeProviderClasses = computed(() => {
		return ['origam-theme-provider', attrs.class]
	})

	// Re-apply the named brand's per-component DEFAULT PROPS (`theme.components`)
	// to this sub-tree, so props-first theming works in a scoped sub-tree — not
	// only the CSS-variable re-scoping done by `data-theme`. When `theme="auto"`
	// (no brand) or the resolver is unavailable (component used outside
	// `createOrigam`), fall back to the inherited parent defaults (no-op).
	const resolveThemeDefaults = inject(ORIGAM_THEME_DEFAULTS_KEY, null)
	const parentDefaults = inject(ORIGAM_DEFAULTS_KEY, ref<IDefault>({}))
	const scopedDefaults = computed<IDefault>(() => {
		if (props.theme === 'auto' || !resolveThemeDefaults) return parentDefaults.value
		const mode = props.mode === 'auto' ? undefined : (props.mode as TModeResolved)
		return resolveThemeDefaults(props.theme, mode)
	})
	provideDefaults(scopedDefaults, { scoped: true })
</script>

<style
		lang="scss"
		scoped
>
	.origam-theme-provider {
		display: contents;
		// Base text color for the sub-tree (#201): `color` is inherited and passes
		// through `display: contents`, so a local `data-mode="dark"` sub-tree gets
		// readable default text (and currentColor icons) without painting a box.
		// No background here — a provider is not a surface.
		color: var(--origam-color__text---primary);
	}
</style>
