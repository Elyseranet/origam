<template>
	<origam-responsive
			v-intersect="intersect"
			:aria-label="alt"
			:class="imgClasses"
			:role="alt ? 'img' : undefined"
			:style="imgStyles"
			v-bind="responsiveProps"
	>
		<template #additional>
			<origam-transition
					:transition="transition"
					appear
			>
				<img
						v-show="isLoaded"
						ref="image"
						:alt="alt"
						:class="imgPictureClasses"
						:crossorigin="crossorigin"
						:draggable="draggable"
						:referrerpolicy="referrerpolicy"
						:sizes="sizes"
						:src="normalisedSrc.src"
						:srcset="normalisedSrc.srcset"
						:style="imgContentStyles"
						@error="handleError"
						@load="handleLoad"
				/>
			</origam-transition>
			<origam-transition :transition="transition">
				<img
						v-if="normalisedSrc.lazySrc && !isLoaded"
						:alt="alt"
						:class="imgPictureClasses"
						:crossorigin="crossorigin"
						:draggable="draggable"
						:referrerpolicy="referrerpolicy"
						:src="normalisedSrc.lazySrc"
						:style="imgContentStyles"
				/>
			</origam-transition>
			<origam-transition
					:transition="transition"
					appear
			>
				<div
						v-if="(isLoading || (isError && !slots.error)) && slots.placeholder"
						class="origam-img__placeholder"
				>
					<slot name="placeholder"/>
				</div>
			</origam-transition>
			<origam-transition
					:transition="transition"
					appear
			>
				<div
						v-if="isError && slots.error"
						class="origam-img__error"
				>
					<slot name="error"/>
				</div>
			</origam-transition>
			<div
					v-if="gradient"
					:style="imgGradientStyles"
					class="origam-img__gradient"
			/>
		</template>

		<template
				v-if="hasContent"
				#default
		>
			<slot name="default"/>
		</template>
	</origam-responsive>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		nextTick,
		onBeforeMount,
		onBeforeUnmount,
		ref,
		shallowRef,
		StyleValue,
		toRef,
		useSlots,
		watch
	} from 'vue'
	import { OrigamResponsive, OrigamTransition } from '../../components'

	import {
	useBorder,
	useBothColor,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useStyle
} from '../../composables'

	import { IN_BROWSER, SUPPORTS_INTERSECTION } from '../../consts'

	import { vIntersect } from '../../directives'

	import { IMG_STATE } from '../../enums'

	import type { IImgProps, ISrcObject} from '../../interfaces'

	import type { IImgEmits } from '../../interfaces/Img/img.interface'

	import type { TImgState } from '../../types'

	import { convertToUnit, getCurrentInstance, pick } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, composables, and image load lifecycle setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IImgProps>(), {})

	const emits = defineEmits<IImgEmits>()

	const {filterProps} = useProps<IImgProps>(props)

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const slots = useSlots()

	const vm = getCurrentInstance('OrigamImg')
	const currentSrc = shallowRef('') // Set from srcset
	const image = ref<HTMLImageElement>()
	const state = shallowRef<TImgState>(props.eager ? IMG_STATE.LOADING : IMG_STATE.IDLE)
	const naturalWidth = shallowRef<number>()
	const naturalHeight = shallowRef<number>()

	const normalisedSrc = computed<ISrcObject>(() => {
		return props.src && typeof props.src === 'object'
				? {
					src: props.src.src,
					srcset: props.srcset || props.src.srcset,
					lazySrc: props.lazySrc || props.src.lazySrc,
					aspectRatio: Number(props.aspectRatio || props.src.aspectRatio || 0)
				} : {
					src: props.src,
					srcset: props.srcset,
					lazySrc: props.lazySrc,
					aspectRatio: Number(props.aspectRatio || 0)
				}
	})
	const aspectRatio = computed(() => {
		return normalisedSrc.value.aspectRatio || naturalWidth.value! / naturalHeight.value! || 0
	})

	const responsiveProps = pick(props, ['aspectRatio', 'contentClass', 'inline', 'height', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'width', 'class', 'style'])

	watch(() => props.src, () => {
		init(state.value !== IMG_STATE.IDLE)
	})
	watch(aspectRatio, (val, oldVal) => {
		if (!val && oldVal && image.value) {
			pollForSize(image.value)
		}
	})

	onBeforeMount(() => init())

	const init = (isIntersecting?: boolean) => {
		if (props.eager && isIntersecting) return
		if (SUPPORTS_INTERSECTION && !isIntersecting && !props.eager) return

		state.value = IMG_STATE.LOADING

		if (normalisedSrc.value.lazySrc) {
			const lazyImg = new Image()
			lazyImg.src = normalisedSrc.value.lazySrc
			pollForSize(lazyImg, null)
		}

		if (!normalisedSrc.value.src) return

		nextTick(() => {
			emits('loadstart', {src: image.value?.currentSrc || normalisedSrc.value.src || ''})

			setTimeout(() => {
				if (vm.isUnmounted) return

				if (image.value?.complete) {
					if (!image.value.naturalWidth) {
						onError()
					}

					if (state.value === IMG_STATE.ERROR) return

					if (!aspectRatio.value) pollForSize(image.value, null)
					if (state.value === IMG_STATE.LOADING) onLoad()
				} else {
					if (!aspectRatio.value) pollForSize(image.value!)
					getSrc()
				}
			})
		})
	}

	const onLoad = () => {
		if (vm.isUnmounted) return

		getSrc()
		pollForSize(image.value!)

		state.value = 'loaded'

		emits('load', {src: image.value?.currentSrc || normalisedSrc.value.src || ''})
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleLoad = () => {
		onLoad()
	}

	const onError = () => {
		if (vm.isUnmounted) return

		state.value = 'error'

		emits('error', {src: image.value?.currentSrc || normalisedSrc.value.src || ''})
	}

	const handleError = () => {
		onError()
	}

	const getSrc = () => {
		const img = image.value

		if (img) currentSrc.value = img.currentSrc || img.src
	}

	let timer = -1

	onBeforeUnmount(() => {
		clearTimeout(timer)
	})

	const pollForSize = (img: HTMLImageElement, timeout: number | null = 100) => {
		const poll = () => {
			clearTimeout(timer)
			if (vm.isUnmounted) return

			const {naturalHeight: imgHeight, naturalWidth: imgWidth} = img

			if (imgHeight || imgWidth) {
				naturalWidth.value = imgWidth
				naturalHeight.value = imgHeight
			} else if (!img.complete && state.value === IMG_STATE.LOADING && timeout != null) {
				timer = window.setTimeout(poll, timeout)
			} else if (img.currentSrc.endsWith('.svg') || img.currentSrc.startsWith('data:image/svg+xml')) {
				naturalWidth.value = 1
				naturalHeight.value = 1
			}
		}

		poll()
	}

	const isBooted = shallowRef(false)

	// When the consumer already passes an explicit `aspect-ratio` (e.g.
	// OrigamAvatar binds `aspectRatio: 1`), the computed starts truthy
	// on mount. Vue's default watch semantic (fire-on-change only)
	// missed the initial value → isBooted stayed false forever →
	// `origam-img--booting` class kept the image hidden behind its
	// placeholder.
	//
	// We can't simply pass `{ immediate: true }` because the watcher
	// body calls `stop()` — referenced via the same `const`, which
	// triggers a TDZ error when `immediate` fires the watcher before
	// the assignment completes. Wrap stop() in a guard instead.
	let stop: (() => void) | null = null
	const markBooted = (val: number | null | undefined) => {
		if (val) {
			// `requestAnimationFrame` is browser-only. When `aspectRatio` is
			// already truthy at setup (consumer passed an explicit
			// `aspect-ratio`, e.g. a fixed logo), this runs during SSR and
			// crashes Node with "requestAnimationFrame is not defined". Guard
			// it: on the server `isBooted` stays false (the `--booting` class
			// is rendered), which matches the client's initial hydration
			// render — the rAF then flips it post-hydration with no mismatch.
			if (IN_BROWSER) {
				// Doesn't work with nextTick, idk why
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						isBooted.value = true
					})
				})
			}
			stop?.()
		}
	}
	stop = watch(aspectRatio, markBooted)
	// Cover the case where aspectRatio is ALREADY truthy on mount.
	markBooted(aspectRatio.value)

	const intersect = ref([{
		handler: init,
		options: props.options
	}, null, ['once']])

	/*********************************************************
	 * State
	 *
	 * @description
	 * Computed booleans derived from the image load state machine.
	 ********************************************************/
	const isLoaded = computed(() => {
		return state.value === IMG_STATE.LOADED
	})
	const isLoading = computed(() => {
		return state.value === IMG_STATE.LOADING
	})
	const isError = computed(() => {
		return state.value === IMG_STATE.ERROR
	})
	const hasContent = computed(() => {
		return slots.default
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const imgStyles = computed(() => {
		return [
			{'width': convertToUnit(props.width === 'auto' ? naturalWidth.value : props.width)},
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const imgClasses = computed(() => {
		return [
			'origam-img',
			{'origam-img--booting': !isBooted.value},
			colorClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const imgPictureClasses = computed(() => {
		return [
			'origam-img__picture',
			{
				'origam-img__picture--cover': props.cover,
				'origam-img__picture--contain': !props.cover,
				'origam-img__picture--preload': normalisedSrc.value.lazySrc && !isLoaded.value
			}
		]
	})
	const imgContentStyles = computed(() => {
		return [
			{objectPosition: props.position}
		]
	})
	const imgGradientStyles = computed(() => {
		return [
			`backgroundImage: linear-gradient(${props.gradient})`
		]
	})
	const {id, css, load, isLoaded: styleIsLoaded, unload} = useStyle(imgStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded,
		styleIsLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-img {
		$this: &;

		z-index: var(--origam-img---z-index);

		&--booting {
			&:deep(.origam-responsive__sizer) {
				transition: var(--origam-img--booting---transition);
			}
		}

		&--rounded {
			border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			border-radius: var(--origam-radius---2xl, 24px);
		}

		&__picture {
			z-index: var(--origam-img__picture---z-index);
			position: var(--origam-img__picture---position);
			top: var(--origam-img__picture---top);
			left: var(--origam-img__picture---left);
			width: var(--origam-img__picture---width);
			height: var(--origam-img__picture---height);

			&--preload {
				filter: var(--origam-img__picture--preload---filter);
			}

			&--contain {
				object-fit: var(--origam-img__picture--contain---object-fit);
			}

			&--cover {
				object-fit: var(--origam-img__picture--cover---object-fit);
			}
		}

		&__gradient {
			z-index: var(--origam-img__gradient---z-index);
			position: var(--origam-img__gradient---position);
			top: var(--origam-img__gradient---top);
			left: var(--origam-img__gradient---left);
			width: var(--origam-img__gradient---width);
			height: var(--origam-img__gradient---height);
			background-repeat: var(--origam-img__gradient---background-repeat);
		}

		&__placeholder {
			z-index: var(--origam-img__placeholder---z-index);
			position: var(--origam-img__placeholder---position);
			top: var(--origam-img__placeholder---top);
			left: var(--origam-img__placeholder---left);
			width: var(--origam-img__placeholder---width);
			height: var(--origam-img__placeholder---height);
		}

		&__error {
			z-index: var(--origam-img__error---z-index);
			position: var(--origam-img__error---position);
			top: var(--origam-img__error---top);
			left: var(--origam-img__error---left);
			width: var(--origam-img__error---width);
			height: var(--origam-img__error---height);
		}
	}
</style>

<style>
	:root {
		--origam-img---z-index: 0;

		--origam-img--booting---transition: none;

		--origam-img--rounded---border-radius: 4px;

		--origam-img__content---z-index: -1;
		--origam-img__content---position: absolute;
		--origam-img__content---top: 0;
		--origam-img__content---left: 0;
		--origam-img__content---width: 100%;
		--origam-img__content---height: 100%;

		--origam-img__picture---z-index: -1;
		--origam-img__picture---position: absolute;
		--origam-img__picture---top: 0;
		--origam-img__picture---left: 0;
		--origam-img__picture---width: 100%;
		--origam-img__picture---height: 100%;

		--origam-img__picture--preload---filter: blur(4px);

		--origam-img__picture--contain---object-fit: contain;

		--origam-img__picture--cover---object-fit: cover;

		--origam-img__gradient---z-index: -1;
		--origam-img__gradient---position: absolute;
		--origam-img__gradient---top: 0;
		--origam-img__gradient---left: 0;
		--origam-img__gradient---width: 100%;
		--origam-img__gradient---height: 100%;
		--origam-img__gradient---background-repeat: no-repeat;

		--origam-img__placeholder---z-index: -1;
		--origam-img__placeholder---position: absolute;
		--origam-img__placeholder---top: 0;
		--origam-img__placeholder---left: 0;
		--origam-img__placeholder---width: 100%;
		--origam-img__placeholder---height: 100%;

		--origam-img__error---z-index: -1;
		--origam-img__error---position: absolute;
		--origam-img__error---top: 0;
		--origam-img__error---left: 0;
		--origam-img__error---width: 100%;
		--origam-img__error---height: 100%;
	}
</style>
