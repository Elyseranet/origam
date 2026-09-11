import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

import { useCssSupport } from '../CssSupport/cssSupport.composable'

import { PARALLAX_DIRECTION, PARALLAX_EASING } from '../../enums'

import type { IParallaxLayerRegistry } from '../../interfaces'
import type { TParallaxDirection, TParallaxEasing } from '../../types'

/*********************************************************
 * Internal options consumed by `useParallaxRuntime`.
 ********************************************************/
export interface IUseParallaxRuntimeOptions {
    target: Ref<HTMLElement | undefined>
    direction: Ref<TParallaxDirection>
    easing: Ref<TParallaxEasing | string>
    threshold: Ref<number>
    disabled: Ref<boolean>
    /**
     * Fallback speed used when `slot=default` carries raw content (no
     * `<OrigamParallaxLayer>`). Mirrors `IParallaxProps.speed`.
     */
    speed: Ref<number>
    onEnter?: () => void
    onLeave?: () => void
    onProgress?: (progress: number) => void
}

/**
 * Detect `prefers-reduced-motion: reduce` once at mount time. We watch the
 * media query so the runtime honours user OS-level changes without a page
 * reload. Returns a SSR-safe ref (defaults to `false` server-side).
 */
function usePrefersReducedMotion (): Ref<boolean> {
    const flag = ref(false)
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return flag
    }

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    flag.value = mql.matches

    const onChange = (ev: MediaQueryListEvent) => { flag.value = ev.matches }
    // Both API shapes (legacy addListener and modern addEventListener)
    if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange)
    } else if (typeof (mql as any).addListener === 'function') {
        (mql as any).addListener(onChange)
    }

    onBeforeUnmount(() => {
        if (typeof mql.removeEventListener === 'function') {
            mql.removeEventListener('change', onChange)
        } else if (typeof (mql as any).removeListener === 'function') {
            (mql as any).removeListener(onChange)
        }
    })

    return flag
}

/**
 * Compose the per-frame transform string for a single layer.
 *
 * @param progress    scroll progress in `[0, 1]` (clamped beyond viewport).
 * @param mouseRatio  current mouse-ratio (each axis in `[-1, 1]`); only used
 *                    when direction === 'both' and mouse mode is active.
 * @param direction   axis selector.
 * @param layer       registered layer descriptor (speed + static offsets).
 * @param hostHeight  host element height (px) — used to convert progress to
 *                    actual translate distance.
 * @param hostWidth   host element width (px).
 */
function composeLayerTransform (
    progress: number,
    mouseRatio: { x: number, y: number },
    direction: TParallaxDirection,
    layer: IParallaxLayerRegistry,
    hostHeight: number,
    hostWidth: number
): string {
    // Map progress [0, 1] → [-1, 1] so the layer drifts symmetrically across
    // the viewport (centred at 0 when progress = 0.5).
    const centred = (progress * 2) - 1
    let tx = layer.offsetX
    let ty = layer.offsetY

    switch (direction) {
        case PARALLAX_DIRECTION.HORIZONTAL:
            tx += centred * hostWidth * layer.speed
            break
        case PARALLAX_DIRECTION.BOTH:
            // For "both" we mix scroll-progress on Y and mouse-ratio on X
            // when available. mouseRatio.x defaults to 0 (no mouse data).
            tx += mouseRatio.x * hostWidth * 0.5 * layer.speed
            ty += centred * hostHeight * layer.speed
            break
        case PARALLAX_DIRECTION.VERTICAL:
        default:
            ty += centred * hostHeight * layer.speed
            break
    }

    return `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
}

/*********************************************************
 * useParallaxRuntime
 *
 * Headless runtime for the enriched OrigamParallax. Maintains a registry
 * of layers, tracks scroll progress / mouse-ratio, decides between the
 * CSS-first scroll-driven path and a JS rAF fallback, honours
 * `prefers-reduced-motion`, and emits enter / leave / progress hooks via
 * the options bag.
 ********************************************************/
export function useParallaxRuntime (options: IUseParallaxRuntimeOptions) {
    const { supports } = useCssSupport()

    // `animation-timeline: scroll()` — Chromium-first feature (Chrome 115+,
    // Edge 115+, Safari TP). We branch to CSS when supported AND the easing
    // is "linear" (the only timing function that maps cleanly to the
    // scroll-driven animation timeline without a JS interpolation step).
    const cssScrollDriven = computed(() =>
        supports('animation-timeline: scroll()') && options.easing.value === PARALLAX_EASING.LINEAR
    )

    const reducedMotion = usePrefersReducedMotion()

    const layers = ref<IParallaxLayerRegistry[]>([])
    const progress = ref(0)
    const mouseRatio = ref({ x: 0, y: 0 })

    let isInViewport = false
    let rafId: number | null = null
    let observer: IntersectionObserver | null = null
    // Per-layer current (smoothed) position for the spring easing.
    const layerLerp = new WeakMap<HTMLElement, { tx: number, ty: number }>()

    const register = (layer: IParallaxLayerRegistry) => {
        layers.value.push(layer)
    }
    const unregister = (id: symbol) => {
        layers.value = layers.value.filter(l => l.id !== id)
    }

    const updateProgress = () => {
        const host = options.target.value
        if (!host) return
        const rect = host.getBoundingClientRect()
        const vh = window.innerHeight || document.documentElement.clientHeight
        // Raw progress: 0 = host top reached viewport bottom, 1 = host
        // bottom passed viewport top. Cleaner than scrollY math for nested
        // scroll containers.
        const total = rect.height + vh
        const distanceFromTop = vh - rect.top
        let p = distanceFromTop / total
        if (p < 0) p = 0
        if (p > 1) p = 1

        // Honour the `threshold` prop — clamp progress to 0 until at least
        // `threshold` of the host has entered the viewport.
        const t = options.threshold.value
        if (t > 0 && p < t) {
            p = 0
        } else if (t > 0) {
            // Re-normalise the remaining range to [0, 1].
            p = (p - t) / (1 - t)
        }

        progress.value = p
        options.onProgress?.(p)
    }

    const applyLayerTransforms = () => {
        const host = options.target.value
        if (!host) return
        const rect = host.getBoundingClientRect()
        const dir = options.direction.value
        const easing = options.easing.value
        const isSpring = easing === PARALLAX_EASING.SPRING

        for (const layer of layers.value) {
            // Disabled / reduced-motion → snap to offset only, no movement.
            if (options.disabled.value || reducedMotion.value) {
                layer.target.style.transform = `translate3d(${layer.offsetX}px, ${layer.offsetY}px, 0)`
                continue
            }

            const target = composeLayerTransform(
                progress.value,
                mouseRatio.value,
                dir,
                layer,
                rect.height,
                rect.width
            )

            if (!isSpring) {
                layer.target.style.transform = target
                continue
            }

            // Spring easing: lerp the actual position towards the target each
            // frame with a damping factor. Smooths step changes into a
            // perceptual spring motion. We re-parse the target translate3d
            // string here rather than recomputing — keep one source of truth.
            const match = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(target)
            if (!match) {
                layer.target.style.transform = target
                continue
            }
            const targetTx = parseFloat(match[1])
            const targetTy = parseFloat(match[2])

            const current = layerLerp.get(layer.target) ?? { tx: targetTx, ty: targetTy }
            const damping = 0.12  // tighter = faster spring; 0.08-0.15 feels natural
            current.tx += (targetTx - current.tx) * damping
            current.ty += (targetTy - current.ty) * damping
            layerLerp.set(layer.target, current)

            layer.target.style.transform = `translate3d(${current.tx.toFixed(2)}px, ${current.ty.toFixed(2)}px, 0)`
        }
    }

    const tick = () => {
        rafId = null
        updateProgress()
        applyLayerTransforms()
        if (isInViewport && !options.disabled.value && !reducedMotion.value) {
            rafId = requestAnimationFrame(tick)
        }
    }

    const onScroll = () => {
        if (rafId == null && isInViewport) {
            rafId = requestAnimationFrame(tick)
        }
    }

    const onMouseMove = (event: MouseEvent) => {
        if (options.direction.value !== PARALLAX_DIRECTION.BOTH) return
        const host = options.target.value
        if (!host) return
        const rect = host.getBoundingClientRect()
        // mouseRatio expressed in [-1, 1] from the centre.
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        mouseRatio.value = {
            x: (event.clientX - cx) / (rect.width / 2),
            y: (event.clientY - cy) / (rect.height / 2)
        }
        if (rafId == null && isInViewport) {
            rafId = requestAnimationFrame(tick)
        }
    }

    const startCss = () => {
        // CSS scroll-driven path: layers carry their own animation, the
        // runtime only needs to publish the per-layer custom properties.
        const host = options.target.value
        if (!host) return
        for (const layer of layers.value) {
            layer.target.style.setProperty('--origam-parallax__layer---speed', String(layer.speed))
            layer.target.style.setProperty('--origam-parallax__layer---offset-x', `${layer.offsetX}px`)
            layer.target.style.setProperty('--origam-parallax__layer---offset-y', `${layer.offsetY}px`)
        }
    }

    onMounted(() => {
        const host = options.target.value
        if (!host) return

        // Intersection observer — fires enter / leave + toggles the rAF loop.
        observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !isInViewport) {
                    isInViewport = true
                    options.onEnter?.()
                    if (!cssScrollDriven.value) {
                        if (rafId == null) rafId = requestAnimationFrame(tick)
                    } else {
                        startCss()
                    }
                } else if (!entry.isIntersecting && isInViewport) {
                    isInViewport = false
                    options.onLeave?.()
                }
            }
        }, { threshold: 0 })
        observer.observe(host)

        // JS fallback listeners.
        if (!cssScrollDriven.value) {
            window.addEventListener('scroll', onScroll, { passive: true })
            window.addEventListener('resize', onScroll, { passive: true })
            host.addEventListener('mousemove', onMouseMove, { passive: true })
            // First paint with progress=0 so layers are positioned at offsets.
            requestAnimationFrame(tick)
        }
    })

    onBeforeUnmount(() => {
        if (rafId != null) cancelAnimationFrame(rafId)
        observer?.disconnect()
        observer = null
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
        const host = options.target.value
        host?.removeEventListener('mousemove', onMouseMove)
    })

    // Watch the direction / easing — if the CSS branch flips at runtime
    // (very unlikely but possible if a layer is added late), re-publish the
    // CSS variables and stop the rAF loop.
    watch(cssScrollDriven, (v) => {
        if (v) {
            if (rafId != null) {
                cancelAnimationFrame(rafId)
                rafId = null
            }
            startCss()
        } else if (isInViewport && rafId == null) {
            rafId = requestAnimationFrame(tick)
        }
    })

    return {
        layers,
        progress,
        mouseRatio,
        cssScrollDriven,
        reducedMotion,
        register,
        unregister
    }
}
