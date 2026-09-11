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
	import type { IDefault } from '../../interfaces'
	import type { TMode, TModeResolved, TTheme } from '../../types'

	defineOptions({ inheritAttrs: false })

	interface Props {
		/**
		 * Theme (brand) to apply to this sub-tree. Children that read CSS vars
		 * resolve them against this `data-theme` instead of the document root.
		 *
		 * Use `'auto'` to defer to the closest ancestor (no `data-theme`
		 * attribute is rendered).
		 */
		theme?: TTheme
		/**
		 * Color mode to force on this sub-tree, applied as `data-mode`.
		 * Orthogonal to `theme`: a branded sub-tree can be pinned to light
		 * or dark independently of the document mode.
		 *
		 * Use `'auto'` to defer to the closest ancestor (no `data-mode`
		 * attribute is rendered).
		 */
		mode?: TMode
		/**
		 * HTML tag for the wrapper. Default `div`. Use `section`/`article`/etc.
		 * when the wrapper carries semantic meaning.
		 */
		tag?: string
	}

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<Props>(), {
		theme: 'auto',
		mode: 'auto',
		tag: 'div'
	})

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
