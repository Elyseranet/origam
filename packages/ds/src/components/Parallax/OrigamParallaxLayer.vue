<template>
	<component
			:is="tag"
			:id="id"
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
	import { computed, inject, onBeforeUnmount, onMounted, ref, StyleValue, watch } from 'vue'

	import { useProps } from '../../composables/Commons/props.composable'

	import { ORIGAM_PARALLAX_LAYER_KEY } from '../../consts/Parallax/parallax-layer.const'

	import type { IParallaxLayerEmits, IParallaxLayerProps, IParallaxLayerRegistry, IParallaxLayerSlots } from '../../interfaces/Parallax/parallax-layer.interface'

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

	defineEmits<IParallaxLayerEmits>()

	defineSlots<IParallaxLayerSlots>()

	const parallax = inject(ORIGAM_PARALLAX_LAYER_KEY)

	if (!parallax) {
		throw new Error('[Origam] OrigamParallaxLayer must be nested inside OrigamParallax (use direction/easing/disabled props on the host).')
	}

	const layerRef = ref<HTMLElement>()

	/*********************************************************
	 * registryToken — jeton d'enregistrement auprès du parent
	 *
	 * @description
	 * ⛔ NE PAS RENOMMER EN `id`. Ce Symbol identifie la couche dans le
	 * registre du host ; ce n'est PAS l'attribut DOM. Il s'est appelé `id`
	 * jusqu'à la campagne #372, qui a ajouté `:id="id"` sur la racine de 136
	 * composants en supposant partout que `id` désignait la prop héritée de
	 * `ICommonsComponentProps`. Ici le local masquait la prop : Vue a tenté
	 * de poser un Symbol en attribut, `TypeError: Cannot convert a Symbol
	 * value to a string`, et le rendu de TOUT le sous-arbre `<origam-parallax>`
	 * a sauté — plus aucune couche affichée.
	 *
	 * @description
	 * Le nom distinct est la protection : un `const id` local dans un
	 * composant qui binde `:id="id"` est indétectable à la lecture du
	 * template seul.
	 ********************************************************/
	const registryToken = Symbol('origam:parallax-layer')

	onMounted(() => {
		if (!layerRef.value) return
		const registry: IParallaxLayerRegistry = {
			id: registryToken,
			speed: props.speed ?? 1,
			offsetX: props.offsetX ?? 0,
			offsetY: props.offsetY ?? 0,
			target: layerRef.value
		}
		parallax.register(registry)
	})

	onBeforeUnmount(() => {
		parallax.unregister(registryToken)
	})

	/*********************************************************
	 * Reactive speed / offset — see #449
	 *
	 * @description
	 * `register()` above only runs once, at mount. The parent's rAF loop
	 * and CSS scroll-driven path both read `speed`/`offsetX`/`offsetY`
	 * straight off that ONE registry object on every frame — a later
	 * change to these props was captured nowhere, so it had zero effect
	 * on the ongoing animation. Only `layerStyles` (the layer's own
	 * first-paint style, below) reacted, and got overwritten by the very
	 * next frame the runtime painted.
	 * @description
	 * `parallax.update` patches the SAME registry entry in place —
	 * `register()` already ran by the time any of these props can change,
	 * so there's no ADR-005 ordering concern here to defer against.
	 ********************************************************/
	watch(
		() => [props.speed, props.offsetX, props.offsetY] as const,
		([speed, offsetX, offsetY]) => {
			parallax.update(registryToken, {
				speed: speed ?? 1,
				offsetX: offsetX ?? 0,
				offsetY: offsetY ?? 0
			})
		}
	)

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
