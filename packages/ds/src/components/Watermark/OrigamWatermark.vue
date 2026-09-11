<template>
	<component
			:is="tag"
			ref="rootEl"
			class="origam-watermark"
			:class="rootClasses"
			:style="rootStyles"
			data-cy="origam-watermark"
	>
		<slot/>
		<div
				ref="layerEl"
				class="origam-watermark__layer"
				:style="layerStyles"
				aria-hidden="true"
				data-cy="origam-watermark-layer"
				:data-origam-watermark="''"
		/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		onBeforeUnmount,
		onMounted,
		ref,
		type StyleValue,
		watch
	} from 'vue'

	import { useWatermark } from '../../composables'

	import type {
		IWatermarkProps
	} from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamWatermark>`. The component wraps its
	 * `#default` slot and paints a diagonally-repeated overlay on top via
	 * an absolutely-positioned `__layer` whose `background-image` is a
	 * data-URL SVG produced by the `useWatermark` composable.
	 *
	 * The layer carries `pointer-events: none` by default so the wrapped
	 * content stays interactive. Optionally, an anti-tamper MutationObserver
	 * re-injects the layer when it is removed from the DOM — dissuasion
	 * only, not a security feature (a user with DevTools can disable JS).
	 *
	 * Defaults are inlined here (not pulled from a `WATERMARK_DEFAULTS`
	 * const) because the Vue SFC compiler analyses `withDefaults`
	 * statically and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const props = withDefaults(defineProps<IWatermarkProps>(), {
		tag: 'div',
		text: undefined,
		image: undefined,
		opacity: 0.1,
		angle: -30,
		gap: 120,
		fontSize: 16,
		fontFamily: 'inherit',
		color: 'currentColor',
		fontWeight: 400,
		zIndex: 1,
		antiTamper: false,
		pointerEvents: 'none'
	})

	/*********************************************************
	 * Resolved option snapshot — fed to the composable as a getter so
	 * reactive prop changes invalidate the data-URL.
	 ********************************************************/
	const resolvedOptions = computed(() => ({
		text: props.text,
		image: props.image,
		opacity: props.opacity,
		angle: props.angle,
		gap: props.gap,
		fontSize: props.fontSize,
		fontFamily: props.fontFamily,
		color: props.color,
		fontWeight: props.fontWeight,
		pointerEvents: props.pointerEvents,
		zIndex: props.zIndex
	}))

	const { patternUrl } = useWatermark(resolvedOptions)

	/*********************************************************
	 * Anti-tamper — local MutationObserver scoped to the component's
	 * own DOM. The composable-level observer is not used here because
	 * the layer is already part of the component's template (managed
	 * by Vue), so we only need to watch for foreign mutations.
	 ********************************************************/
	const rootEl = ref<HTMLElement | null>(null)
	const layerEl = ref<HTMLElement | null>(null)
	let observer: MutationObserver | null = null
	let reinjectScheduled = false

	const reinject = () => {
		if (reinjectScheduled) return
		reinjectScheduled = true
		Promise.resolve().then(() => {
			reinjectScheduled = false
			const root = rootEl.value
			if (!root) return
			// If the layer was removed entirely, re-create a div with
			// the same shape Vue would have produced. We keep the new
			// node identity in `layerEl` so the observer keeps watching
			// the right target.
			if (!layerEl.value || !root.contains(layerEl.value)) {
				const fresh = document.createElement('div')
				fresh.className = 'origam-watermark__layer'
				fresh.setAttribute('aria-hidden', 'true')
				fresh.setAttribute('data-cy', 'origam-watermark-layer')
				fresh.setAttribute('data-origam-watermark', '')
				Object.assign(fresh.style, {
					position: 'absolute',
					top: '0',
					right: '0',
					bottom: '0',
					left: '0',
					backgroundImage: patternUrl.value,
					backgroundRepeat: 'repeat',
					pointerEvents: props.pointerEvents,
					zIndex: String(props.zIndex),
					userSelect: 'none'
				})
				root.appendChild(fresh)
				layerEl.value = fresh
			} else {
				// Layer is still there but its style was tampered with —
				// re-apply the canonical inline declarations.
				const layer = layerEl.value
				layer.style.backgroundImage = patternUrl.value
				layer.style.backgroundRepeat = 'repeat'
				layer.style.pointerEvents = props.pointerEvents
				layer.style.zIndex = String(props.zIndex)
			}
		})
	}

	const installObserver = () => {
		const root = rootEl.value
		if (!root || observer) return
		observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					let removed = false
					mutation.removedNodes.forEach((node) => {
						if (node === layerEl.value) removed = true
					})
					if (removed) {
						reinject()
						return
					}
				} else if (mutation.type === 'attributes' && mutation.target === layerEl.value) {
					reinject()
					return
				}
			}
		})
		observer.observe(root, {
			childList: true,
			attributes: true,
			attributeFilter: ['style', 'class', 'data-origam-watermark'],
			subtree: false
		})
	}

	const teardownObserver = () => {
		if (observer) {
			observer.disconnect()
			observer = null
		}
	}

	onMounted(() => {
		if (props.antiTamper) {
			installObserver()
		}
	})

	onBeforeUnmount(() => {
		teardownObserver()
	})

	watch(() => props.antiTamper, (value) => {
		if (value) {
			installObserver()
		} else {
			teardownObserver()
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-watermark--anti-tamper': props.antiTamper
		},
		props.class
	])

	const rootStyles = computed<StyleValue>(() => [
		{
			position: 'relative'
		},
		props.style
	] as StyleValue)

	const layerStyles = computed<StyleValue>(() => ({
		backgroundImage: patternUrl.value,
		pointerEvents: props.pointerEvents,
		zIndex: props.zIndex
	}))

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		patternUrl,
		rootEl,
		layerEl
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-watermark {
		position: relative;
		display: block;
	}

	.origam-watermark__layer {
		position: absolute;
		inset: 0;
		background-repeat: repeat;
		user-select: none;
	}
</style>
