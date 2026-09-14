<template>
	<component
			:is="tag"
			:class="themeProviderClasses"
			:data-theme="dataTheme"
			:data-mode="dataMode"
			v-bind="restAttrs"
	>
		<slot/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, ref, useAttrs } from 'vue'
	import { provideDefaults } from '../../composables/Commons/defaults.composable'
	import { ORIGAM_DEFAULTS_KEY } from '../../consts/Commons/defaults.const'
	import { ORIGAM_THEME_DEFAULTS_KEY } from '../../consts/Commons/theme.const'
	import type { IDefault } from '../../interfaces/DefaultsProvider/defaults-provider.interface'
	import type {
		IThemeProviderEmits,
		IThemeProviderProps,
		IThemeProviderSlots
	} from '../../interfaces/ThemeProvider/theme-provider.interface'
	import type { TModeResolved } from '../../types/Commons/theme.type'
	import { omit } from '../../utils/Commons/commons.util'

	defineOptions({ inheritAttrs: false })

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IThemeProviderProps>(), {
		theme: 'auto',
		mode: 'auto',
		tag: 'div'
	})

	defineEmits<IThemeProviderEmits>()

	defineSlots<IThemeProviderSlots>()

	const attrs = useAttrs()

	const dataTheme = computed(() => (props.theme === 'auto' ? undefined : props.theme))
	const dataMode = computed(() => (props.mode === 'auto' ? undefined : props.mode))
	const themeProviderClasses = computed(() => {
		return ['origam-theme-provider', attrs.class]
	})
	/*********************************************************
	 * restAttrs
	 *
	 * @description
	 * `class` is merged explicitly into `themeProviderClasses` above — strip it
	 * from the raw `$attrs` fallthrough so it isn't applied twice. Everything
	 * else (`id`, `style`, `data-cy`, event listeners, …) reaches the root
	 * unmodified. Issue #492: `inheritAttrs: false` was set with no fallthrough
	 * binding at all, so every non-`class` attribute was silently dropped.
	 ********************************************************/
	const restAttrs = computed(() => omit(attrs as Record<string, unknown>, ['class']))

	/*********************************************************
	 * resolveThemeDefaults
	 *
	 * @description
	 * Re-apply the named brand's per-component DEFAULT PROPS (`theme.components`)
	 * to this sub-tree, so props-first theming works in a scoped sub-tree — not
	 * only the CSS-variable re-scoping done by `data-theme`. When `theme="auto"`
	 * (no brand) or the resolver is unavailable (component used outside
	 * `createOrigam`), fall back to the inherited parent defaults (no-op).
	 ********************************************************/
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
		/*********************************************************
		 * color
		 *
		 * @description
		 * Base text color for the sub-tree (#201): `color` is inherited and passes
		 * through `display: contents`, so a local `data-mode="dark"` sub-tree gets
		 * readable default text (and currentColor icons) without painting a box.
		 * No background here — a provider is not a surface.
		 ********************************************************/
		color: var(--origam-color__text---primary);
	}
</style>
