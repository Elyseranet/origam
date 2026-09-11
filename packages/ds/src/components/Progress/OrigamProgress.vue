<template>
	<component
			:is="progressComponent"
			:id="id"
			ref="origamProgressRef"
			:class="progressClasses"
			:style="progressStyles"
			v-bind="progressProps"
	>
		<template
				v-if="hasContent"
				#default
		>
			<slot name="default"/>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue } from 'vue'
	import OrigamProgressCircular from './OrigamProgressCircular.vue'
	import OrigamProgressLinear from './OrigamProgressLinear.vue'

	import { useProgress } from '../../composables/Progress/progress.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'
	import { SIZES } from '../../enums/Commons/size.enum'

	import type { IProgressEmits, IProgressProps, IProgressSlots } from '../../interfaces/Progress/progress.interface'

	import type { TOrigamProgressCircular } from '../../types/Progress/progress-circular.type'
	import type { TOrigamProgressLinear } from '../../types/Progress/progress-linear.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the Progress wrapper component.
	 ********************************************************/
	const props = withDefaults(defineProps<IProgressProps>(), {
		tag: 'div',
		modelValue: 0,
		max: 100,
		thickness: 4,
		size: SIZES.DEFAULT,
		label: 'origam.loading',
		active: true
	})

	const {filterProps} = useProps<IProgressProps>(props)

	defineEmits<IProgressEmits>()

	defineSlots<IProgressSlots>()

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Ref to the rendered circular or linear sub-component
	 * so we can forward filterProps.
	 ********************************************************/
	const origamProgressRef = ref<TOrigamProgressCircular | TOrigamProgressLinear>()

	/*********************************************************
	 * Decorators & progress state
	 *
	 * @description
	 * Size utilities and hasContent flag (used to render the
	 * default slot as an overlay on top of the dispatched bar).
	 *
	 * #500 — this wrapper no longer carries any ARIA semantics
	 * (role, aria-value*, aria-busy, aria-label, aria-hidden). It
	 * delegates its ENTIRE render to whichever concrete component
	 * `type` selects (`<component :is="progressComponent">` — a
	 * single root, never an extra wrapping DOM node), and both
	 * `OrigamProgressCircular` and `OrigamProgressLinear` now own
	 * their own ARIA contract so they stay accessible when mounted
	 * standalone. Re-declaring it here would either be dead code or,
	 * worse, a second conflicting `role="progressbar"` on the same
	 * element — see the anti-duplication tests in
	 * OrigamProgress.aria.spec.ts.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {sizeClasses, sizeStyles} = useSize(props)
	const {hasContent} = useProgress(props)

	/*********************************************************
	 * Component selection
	 *
	 * @description
	 * Switch between circular and linear sub-component based
	 * on the `type` prop.
	 ********************************************************/
	const isCircular = computed(() => {
		return props.type === PROGRESS_TYPE.CIRCULAR
	})
	const progressComponent = computed(() => {
		return isCircular.value ? OrigamProgressCircular : OrigamProgressLinear
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const progressProps = computed(() => {
		return (origamProgressRef.value as any)?.filterProps(props)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * progressStyles and progressClasses compose the BEM block.
	 ********************************************************/
	const progressStyles = computed(() => {
		return [
			sizeStyles.value,
			props.style
		] as StyleValue
	})
	const progressClasses = computed(() => {
		return [
			sizeClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(progressStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
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
