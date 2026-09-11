<template>
	<slot name="default"/>
</template>

<script
		lang="ts"
		setup
>
	import { computed } from 'vue'

	import { provideDefaults, useProps } from '../../composables'
	import type { IDefaultProviderProps, IDefaultProviderSlots } from '../../interfaces'

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
	 * if the host app mutates the map.
	 ********************************************************/
	provideDefaults(
			computed(() => props.defaults ?? {}),
			{
				scoped: props.scoped,
				reset: props.reset,
				root: props.root,
				disabled: props.disabled
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
