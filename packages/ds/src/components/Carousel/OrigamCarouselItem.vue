<template>
	<origam-window-item
			:id="id"
			ref="origamWindowItemRef"
			:class="carouselItemClasses"
			:style="carouselItemStyles"
			v-bind="windowItemProps"
	>
		<template #default>
			<slot name="default">
				<origam-img
						ref="origamImgRef"
						v-bind="({...attrs , ...imgProps} as any)"
				>
					<template
							v-if="slots.content"
							#default
					>
						<slot name="content"/>
					</template>

					<template
							v-if="slots.error"
							#error
					>
						<slot name="error"/>
					</template>

					<template
							v-if="slots.placeholder"
							#placeholder
					>
						<slot name="placeholder"/>
					</template>
				</origam-img>
			</slot>
		</template>
	</origam-window-item>
</template>

<script
		lang="ts"
		setup
>
	import OrigamImg from '../Img/OrigamImg.vue'
	import OrigamWindowItem from '../Window/OrigamWindowItem.vue'

	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { omitUndefined } from '../../utils/Commons/commons.util'

	import type { ICarouselItemEmits, ICarouselItemProps, ICarouselItemSlots } from '../../interfaces/Carousel/carousel-item.interface'

	import type { TOrigamImg } from '../../types/Img/img.type'
	import type { TOrigamWindowItem } from '../../types/Window/window-item.type'

	import { computed, ref, StyleValue, useAttrs, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, child refs and delegated prop filtering.
	 ********************************************************/

	const props = withDefaults(defineProps<ICarouselItemProps>(), {
		transition: undefined,
		reverseTransition: undefined
	})

	const {filterProps} = useProps<ICarouselItemProps>(props)

	defineEmits<ICarouselItemEmits>()

	defineSlots<ICarouselItemSlots>()

	const attrs = useAttrs()

	const origamWindowItemRef = ref<TOrigamWindowItem>()
	const origamImgRef = ref<TOrigamImg>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const windowItemProps = computed(() => {
		return origamWindowItemRef.value?.filterProps(props)
	})

	/*********************************************************
	 * imgProps (#428)
	 *
	 * @description
	 * `ICarouselItemProps` extends `IImgProps` (→ `IResponsiveProps` →
	 * `IBorderProps` / `IRoundedProps`) and `IBgColorProps` / `IColorProps`
	 * — `rounded`, `border`, `bgColor` and `color` all accept a `boolean`
	 * (or `false`) member in their union. Vue resolves an UNSET prop of
	 * that shape to the concrete value `false`, never to `undefined` — so
	 * a plain `filterProps(props)` (which only strips STRICT `undefined`)
	 * forwarded an explicit `false` for all four onto `<origam-img>`
	 * whenever THIS component's own consumer never set them, permanently
	 * outranking `theme.components['origam-img']`. Measured with a real
	 * `createOrigam()` under `{'origam-img': {rounded: 'lg'}}` and no
	 * consumer props at all: `imgVm.vm.$.props.rounded` resolved `false`,
	 * not `'lg'` — reproduced identically for `bgColor` and `border`.
	 * `usePassedProps` sees past the coercion (it reads `vnode.props`,
	 * the raw value the parent template actually wrote) — only an
	 * explicitly passed value survives the strip-and-reapply below; an
	 * unset one is genuinely ABSENT from the object bound onto
	 * `<origam-img>`, letting its own theme/default resolve.
	 ********************************************************/
	const wasPropPassed = usePassedProps(props)
	const imgProps = computed(() => {
		const base = origamImgRef.value?.filterProps(props) ?? {}
		const {rounded: _rounded, border: _border, bgColor: _bgColor, color: _color, ...rest} = base as Record<string, unknown>

		return {
			...rest,
			...omitUndefined({
				rounded: wasPropPassed('rounded') ? props.rounded : undefined,
				border: wasPropPassed('border') ? props.border : undefined,
				bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
				color: wasPropPassed('color') ? props.color : undefined
			})
		}
	})

	const slots = useSlots()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM classes and passes through host styles.
	 ********************************************************/

	const carouselItemStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const carouselItemClasses = computed(() => {
		return [
			'origam-carousel-item',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(carouselItemStyles, () => props.id)


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
	.origam-carousel-item {
		display: block;
		height: inherit;
		text-decoration: none;

		> .origam-img {
			height: inherit;
		}
	}
</style>

