<template>
	<component
			:is="tag"
			ref="layerRef"
			:class="layerClasses"
			:style="layerStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, onBeforeUnmount, onMounted, ref, StyleValue } from 'vue'

	import { useProps } from '../../composables'

	import { ORIGAM_PARALLAX_LAYER_KEY } from '../../consts'

	import type { IParallaxLayerProps, IParallaxLayerRegistry } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Single layer registered against the parent OrigamParallax. The parent
	 * owns the rAF loop and mutates this layer's `transform` directly via
	 * the registry — keeping the per-frame work outside Vue reactivity so
	 * we never trigger a render loop for the animation itself.
	 ********************************************************/
	const props = withDefaults(defineProps<IParallaxLayerProps>(), {
		tag: 'div',
		speed: 1,
		offsetX: 0,
		offsetY: 0
	})

	const { filterProps } = useProps<IParallaxLayerProps>(props)

	const parallax = inject(ORIGAM_PARALLAX_LAYER_KEY)

	if (!parallax) {
		throw new Error('[Origam] OrigamParallaxLayer must be nested inside OrigamParallax (use direction/easing/disabled props on the host).')
	}

	const layerRef = ref<HTMLElement>()
	const id = Symbol('origam:parallax-layer')

	onMounted(() => {
		if (!layerRef.value) return
		const registry: IParallaxLayerRegistry = {
			id,
			speed: props.speed ?? 1,
			offsetX: props.offsetX ?? 0,
			offsetY: props.offsetY ?? 0,
			target: layerRef.value
		}
		parallax.register(registry)
	})

	onBeforeUnmount(() => {
		parallax.unregister(id)
	})

	const layerStyles = computed(() => {
		const styles: Record<string, string> = {
			willChange: 'var(--origam-parallax__layer---will-change, transform)',
			transformOrigin: 'var(--origam-parallax__layer---transform-origin, center center)'
		}

		if (props.zIndex !== undefined) {
			styles.zIndex = String(props.zIndex)
		}

		// Initial paint — `translate3d(offsetX, offsetY, 0)` so the layer
		// sits at its static offset before the runtime takes over.
		styles.transform = `translate3d(${props.offsetX ?? 0}px, ${props.offsetY ?? 0}px, 0)`

		return [styles, props.style] as StyleValue
	})

	const layerClasses = computed(() => {
		return [
			'origam-parallax__layer',
			{
				'origam-parallax__layer--css-driven': parallax.cssScrollDriven.value,
				'origam-parallax__layer--reduced-motion': parallax.reducedMotion.value
			},
			props.class
		]
	})

	defineExpose({ filterProps })
</script>

<style
		lang="scss"
		scoped
>
	.origam-parallax__layer {
		position: absolute;
		inset: 0;
		display: block;
		will-change: var(--origam-parallax__layer---will-change, transform);
		transform-origin: var(--origam-parallax__layer---transform-origin, center center);
	}

	.origam-parallax__layer--reduced-motion {
		transform: translate3d(
			var(--origam-parallax__layer---offset-x, 0),
			var(--origam-parallax__layer---offset-y, 0),
			0
		) !important;
	}

	@supports (animation-timeline: scroll()) {
		.origam-parallax__layer--css-driven {
			animation: origam-parallax-layer linear both;
			animation-timeline: view();
			animation-range: cover 0% cover 100%;
		}

		@keyframes origam-parallax-layer {
			from {
				transform: translate3d(
					calc(var(--origam-parallax__layer---offset-x, 0px) + var(--origam-parallax__layer---speed, 1) * -50%),
					calc(var(--origam-parallax__layer---offset-y, 0px) + var(--origam-parallax__layer---speed, 1) * -50%),
					0
				);
			}
			to {
				transform: translate3d(
					calc(var(--origam-parallax__layer---offset-x, 0px) + var(--origam-parallax__layer---speed, 1) * 50%),
					calc(var(--origam-parallax__layer---offset-y, 0px) + var(--origam-parallax__layer---speed, 1) * 50%),
					0
				);
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-parallax__layer {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
