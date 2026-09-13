<template>
	<div
			:id="id"
			ref="intersectionRef"
			:class="rootClasses"
			:style="rootStyles"
	>&nbsp;
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, watch } from 'vue'

	import { useIntersectionObserver } from '../../composables/Commons/intersectionObserver.composable'
	import { useProps } from '../../composables/Commons/props.composable'

	import type { IInfiniteScrollIntersectProps, IInfiniteScrollIntersectEmits, IInfiniteScrollIntersectSlots } from '../../interfaces/InfiniteScroll/infinite-scroll-intersect.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IInfiniteScrollIntersectProps>(), {})

	const emits = defineEmits<IInfiniteScrollIntersectEmits>()

	defineSlots<IInfiniteScrollIntersectSlots>()

	const {filterProps} = useProps<IInfiniteScrollIntersectProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	/*********************************************************
	 * observerOptions
	 *
	 * @description
	 * ⛔ `rootRef` etait declaree OBLIGATOIRE et n'etait lue nulle part :
	 * l'observateur restait sur le viewport quel que soit l'element passe.
	 * Un `<origam-infinite-scroll>` place dans un conteneur defilant ne
	 * declenchait donc jamais — le consommateur devait fournir un element
	 * pour rien.
	 *
	 * @description
	 * Les options sont transmises telles quelles a `IntersectionObserver`,
	 * qui accepte `root`. La sentinelle observe desormais le conteneur
	 * annonce. Issue #550, critere C1.
	 *
	 * @description
	 * ⛔ issue #684 / critere C4 — `observerOptions.value` etait deballe
	 * UNE FOIS ici, au corps de `setup()`, avant d'etre passe a
	 * `useIntersectionObserver`. Un theme visant `origam-infinite-scroll-
	 * intersect.margin` (resolu en `beforeCreate`, APRES `setup()`, cf.
	 * ADR-005) ne pouvait donc jamais l'atteindre — la valeur etait deja
	 * figee. Le computed lui-meme est desormais passe tel quel (pas son
	 * `.value`) : `useIntersectionObserver` le consomme via un `watch`
	 * reactif et recree l'observateur des que la valeur resolue change.
	 ********************************************************/
	const rootClasses = computed(() => [ 'origam-infinite-scroll-intersect', props.class ])
	const rootStyles = computed<StyleValue>(() => props.style as StyleValue)

	const observerOptions = computed<IntersectionObserverInit | undefined>(() => {
		const options: IntersectionObserverInit = {}

		if (props.rootRef) options.root = props.rootRef
		if (props.margin) options.rootMargin = props.margin

		return Object.keys(options).length ? options : undefined
	})

	const {intersectionRef, isIntersecting} = useIntersectionObserver(() => {
	}, observerOptions)

	watch(isIntersecting, async (val) => {
		if (!props.side) return
		emits('intersect', {isIntersecting: val, side: props.side})
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>
