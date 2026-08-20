<template>
	<slot name="default"/>
</template>

<script
		lang="ts"
		setup
>
	import { computed } from 'vue'

	import { provideDefaults } from '../../composables/Commons/defaults.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import type { IDefaultProviderProps, IDefaultProviderSlots } from '../../interfaces/DefaultsProvider/defaults-provider.interface'

	/*********************************************************
	 * Global
	 *
	 * `<OrigamDefaultsProvider>` is structurally transparent — it renders
	 * only its `default` slot. Its job is to inject a defaults map (via
	 * `provideDefaults`) into the descendants' `useDefaults()` resolver.
	 *
	 * Behaviour matches `<v-defaults-provider>` from Vuetify and the
	 * origam-design-system equivalent:
	 *   - `defaults`   : the map (`{ global: {…}, 'origam-btn': {…}, … }`)
	 *   - `disabled`   : pass parent defaults through unchanged
	 *   - `scoped`     : do not inherit parent defaults
	 *   - `reset`      : same effect as `scoped`, with a discriminator value
	 *   - `root`       : same as `reset`, communicates "top of defaults tree"
	 ********************************************************/
	const props = withDefaults(defineProps<IDefaultProviderProps>(), {})

	defineSlots<IDefaultProviderSlots>()

	/*********************************************************
	 * Defaults
	 *
	 * Wraps the props' `defaults` in a computed so the provider re-evaluates
	 * if the host app mutates the map. `scoped`/`reset`/`root`/`disabled` are
	 * forwarded as GETTERS, not raw values — `provideDefaults()`'s internal
	 * `computed()` only re-tracks what it reads at evaluation time, so a raw
	 * `props.scoped` captured once here would freeze at its mount-time value
	 * and never react to a later `:scoped="someRef"` change (issue #438).
	 ********************************************************/
	provideDefaults(
			computed(() => props.defaults ?? {}),
			{
				scoped: () => props.scoped,
				reset: () => props.reset,
				root: () => props.root,
				disabled: () => props.disabled
			}
	)

	/*********************************************************
	 * Expose
	 *
	 * `filterProps` lets parent components forward only the props this
	 * component declares — used by Origam's auto-forwarding pattern.
	 ********************************************************/
	const {filterProps} = useProps<IDefaultProviderProps>(props)

	defineExpose({filterProps})
</script>
