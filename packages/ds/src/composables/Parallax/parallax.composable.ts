import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

import { useCssSupport } from '../Commons/cssSupport.composable'

import {
    PARALLAX_FINE_POINTER_QUERY,
    PARALLAX_MOUSE_AMPLITUDE_FACTOR,
    PARALLAX_MOUSE_SMOOTHING,
    PARALLAX_SPRING_DAMPING,
    PARALLAX_TRANSFORM_PRECISION
} from '../../consts/Parallax/parallax.const'
import {
    PARALLAX_LAYER_VAR_OFFSET_X,
    PARALLAX_LAYER_VAR_OFFSET_Y,
    PARALLAX_LAYER_VAR_SPEED
} from '../../consts/Parallax/parallax-layer.const'

import { PARALLAX_DIRECTION, PARALLAX_EASING, PARALLAX_ORIGIN } from '../../enums/Parallax/parallax.enum'

import type { IParallaxLayerRegistry } from '../../interfaces/Parallax/parallax-layer.interface'
import type { IUseParallaxRuntimeOptions } from '../../interfaces/Parallax/parallax.interface'
import type { TParallaxDirection } from '../../types/Parallax/parallax.type'

export type { IUseParallaxRuntimeOptions } from '../../interfaces/Parallax/parallax.interface'

/*********************************************************
 * useMediaQuery
 *
 * @description
 * Tracks a media query so the runtime honours OS-level changes (reduced
 * motion, pointer capabilities) without a page reload.
 * @description
 * #1603 — the query is read AFTER mount, never at setup: a server render has
 * no `matchMedia`, so reading it during the client's first render produced a
 * tree (`--reduced-motion` classes) the server HTML did not contain — a
 * hydration mismatch. `false` until mounted keeps both renders identical.
 ********************************************************/
function useMediaQuery (query: string): Ref<boolean> {
    const flag = ref(false)
    let mql: MediaQueryList | null = null
    const onChange = (ev: MediaQueryListEvent) => { flag.value = ev.matches }

    onMounted(() => {
        if (typeof window.matchMedia !== 'function') return
        mql = window.matchMedia(query)
        flag.value = mql.matches
        mql.addEventListener('change', onChange)
    })

    onBeforeUnmount(() => {
        mql?.removeEventListener('change', onChange)
    })

    return flag
}

/*********************************************************
 * hasScrollContainerAncestor (#1603)
 *
 * @description
 * Does an ancestor of `host` act as a scroll container? A `view()` timeline
 * binds to the NEAREST one (CSS offers no way to pick another), so an
 * `overflow: hidden | auto | scroll` ancestor freezes the progress. The host
 * itself is `overflow: clip` (not a scroller). `html` / `body` are skipped:
 * their overflow propagates to the viewport.
 ********************************************************/
function hasScrollContainerAncestor (host: HTMLElement): boolean {
    for (let el = host.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        const { overflowX, overflowY } = getComputedStyle(el)
        if (/hidden|auto|scroll/.test(overflowX + overflowY)) return true
    }
    return false
}

/**
 * Compose the per-frame transform string for a single layer.
 *
 * @param progress    scroll progress in `[0, 1]` (clamped beyond viewport).
 * @param direction   axis selector.
 * @param layer       registered layer descriptor (speed + static offsets).
 * @param hostHeight  host element height (px) — used to convert progress to
 *                    actual translate distance.
 * @param hostWidth   host element width (px).
 */
function composeLayerTransform (
    progress: number,
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
            // The pointer is applied separately (`translate`, see
            // `applyMouse`): here "both" scrolls on Y like "vertical".
            ty += centred * hostHeight * layer.speed
            break
        case PARALLAX_DIRECTION.VERTICAL:
        default:
            ty += centred * hostHeight * layer.speed
            break
    }

    return `translate3d(${tx.toFixed(PARALLAX_TRANSFORM_PRECISION)}px, ${ty.toFixed(PARALLAX_TRANSFORM_PRECISION)}px, 0)`
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

    /*********************************************************
     * cssEligible / cssScrollDriven (#1603)
     *
     * @description
     * The CSS scroll-driven path needs a linear easing (the only timing function
     * that maps cleanly to the timeline), the viewport origin (the `view()`
     * timeline has no "page top" geometry) and no scroll-container ancestor.
     * @description
     * `cssEligible` is the SSR-SAFE half of that decision: it depends on props
     * only, so the `--css-driven` classes are identical on the server and on the
     * first client render, and the stylesheet's `@supports (animation-timeline)`
     * does the feature test (no hydration mismatch, and the animation runs before
     * hydration). `cssScrollDriven` adds the client-only check and drives the JS
     * fallback.
     ********************************************************/
    const scrollAncestor = ref(false)
    const cssEligible = computed(() =>
        options.easing.value === PARALLAX_EASING.LINEAR
        && (options.origin?.value ?? PARALLAX_ORIGIN.VIEWPORT) === PARALLAX_ORIGIN.VIEWPORT
        && !scrollAncestor.value
    )
    // `animation-timeline: scroll()` — Chromium-first feature (Chrome 115+,
    // Edge 115+, Safari TP).
    const cssScrollDriven = computed(() =>
        cssEligible.value && supports('animation-timeline: scroll()')
    )

    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
    const finePointer = useMediaQuery(PARALLAX_FINE_POINTER_QUERY)

    const layers = ref<IParallaxLayerRegistry[]>([])
    const progress = ref(0)
    const mouseRatio = ref({ x: 0, y: 0 })

    let isInViewport = false
    let rafId: number | null = null
    let progressRafId: number | null = null
    let observer: IntersectionObserver | null = null
    // Per-layer current (smoothed) position for the spring easing.
    const layerLerp = new WeakMap<HTMLElement, { tx: number, ty: number }>()

    /**
     * Publish the three per-layer custom properties the CSS scroll-driven
     * path animates against. Shared by `startCss` (viewport-enter) and
     * `update` (live prop change while that path is already running).
     */
    const publishLayerVars = (layer: IParallaxLayerRegistry) => {
        layer.target.style.setProperty(PARALLAX_LAYER_VAR_SPEED, String(layer.speed))
        layer.target.style.setProperty(PARALLAX_LAYER_VAR_OFFSET_X, `${layer.offsetX}px`)
        layer.target.style.setProperty(PARALLAX_LAYER_VAR_OFFSET_Y, `${layer.offsetY}px`)
    }

    const register = (layer: IParallaxLayerRegistry) => {
        layers.value.push(layer)
    }
    const unregister = (id: symbol) => {
        layers.value = layers.value.filter(l => l.id !== id)
    }

    /*********************************************************
     * update — reactive prop → running registry (#449)
     *
     * @description
     * `register()` stores a PLAIN SNAPSHOT of `speed`/`offsetX`/`offsetY`
     * read once at the layer's `onMounted`. `applyLayerTransforms` (rAF
     * loop) and `startCss` (CSS scroll-driven path) both read those three
     * fields straight off that same object on every frame / re-publish —
     * neither is a Vue effect, so nothing re-runs them when the layer's
     * props change later. `<OrigamParallaxLayer>` calls this from a
     * `watch()` on its own props so a live speed/offset change reaches the
     * animation that is already running, instead of only affecting the
     * layer's own first-paint `layerStyles` computed (which the next
     * frame overwrites anyway).
     * @description
     * Mutates the registry entry IN PLACE rather than replacing it — the
     * rAF loop and `layerLerp` WeakMap key off the same object/`target`
     * identity, so a fresh object would silently reset the spring-easing
     * state on every prop change.
     * @description
     * The CSS scroll-driven path does not repaint every frame like the JS
     * path does — it publishes custom properties once (`startCss`, on
     * viewport-enter) and lets the browser's own scroll-driven animation
     * timeline read them continuously. If a change lands while that path
     * is active, the custom properties on `layer.target` must be
     * re-published here too, or the CSS animation keeps interpolating
     * against the stale amplitude until the layer re-enters the viewport.
     ********************************************************/
    const update = (id: symbol, patch: Pick<IParallaxLayerRegistry, 'speed' | 'offsetX' | 'offsetY' | 'mouseX' | 'mouseY'>) => {
        const layer = layers.value.find(l => l.id === id)
        if (!layer) return

        layer.speed = patch.speed
        layer.offsetX = patch.offsetX
        layer.offsetY = patch.offsetY
        layer.mouseX = patch.mouseX
        layer.mouseY = patch.mouseY

        if (cssScrollDriven.value) {
            publishLayerVars(layer)
        }
    }

    /*********************************************************
     * progressAt
     *
     * @description
     * Raw progress: 0 = host top reached viewport bottom, 1 = host bottom passed
     * viewport top. Cleaner than scrollY math for nested scroll containers.
     ********************************************************/
    const progressAt = (top: number, height: number, vh: number) => {
        let p = (vh - top) / (height + vh)
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
        return p
    }

    const viewportHeight = () => window.innerHeight || document.documentElement.clientHeight

    const updateProgress = () => {
        const host = options.target.value
        if (!host) return
        const rect = host.getBoundingClientRect()
        progress.value = progressAt(rect.top, rect.height, viewportHeight())
        options.onProgress?.(progress.value)
    }

    const applyLayerTransforms = () => {
        const host = options.target.value
        if (!host) return
        const rect = host.getBoundingClientRect()
        const dir = options.direction.value
        const easing = options.easing.value
        const isSpring = easing === PARALLAX_EASING.SPRING

        /*********************************************************
         * page-top origin (#1603)
         *
         * @description
         * Measures from the host's position at `scrollY = 0`, so the offset is zero
         * at rest whatever the window height, and identical to the server render (no
         * offset, no jump).
         ********************************************************/
        const pageTop = options.origin?.value === PARALLAX_ORIGIN.PAGE_TOP
        const effective = pageTop
            ? progress.value - progressAt(rect.top + window.scrollY, rect.height, viewportHeight()) + 0.5
            : progress.value

        for (const layer of layers.value) {
            // Disabled / reduced-motion → snap to offset only, no movement.
            if (options.disabled.value || reducedMotion.value) {
                layer.target.style.transform = `translate3d(${layer.offsetX}px, ${layer.offsetY}px, 0)`
                continue
            }

            const target = composeLayerTransform(
                effective,
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
            current.tx += (targetTx - current.tx) * PARALLAX_SPRING_DAMPING
            current.ty += (targetTy - current.ty) * PARALLAX_SPRING_DAMPING
            layerLerp.set(layer.target, current)

            layer.target.style.transform = `translate3d(${current.tx.toFixed(PARALLAX_TRANSFORM_PRECISION)}px, ${current.ty.toFixed(PARALLAX_TRANSFORM_PRECISION)}px, 0)`
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

    /*********************************************************
     * onScroll — #432 : le chemin CSS n'emettait jamais scroll-progress
     *
     * @description
     * `updateProgress()` est le SEUL appelant de `options.onProgress`, et il
     * n'etait joignable que par `tick()`, la boucle rAF du chemin JS. Les
     * ecouteurs `scroll` / `resize` n'etaient d'ailleurs installes que dans
     * la branche `if (!cssScrollDriven.value)`. Consequence : sur Chrome
     * 115+ avec un easing lineaire — exactement la configuration par defaut
     * — le runtime basculait sur le chemin CSS et `@scroll-progress` ne
     * partait JAMAIS. Le defaut etait connu du depot depuis le 2026-08-17
     * (`e2e/parallax.spec.ts`, test desactive) sans ticket derriere.
     * @description
     * Les couches, elles, restent animees par le navigateur via
     * `animation-timeline: scroll()` : il ne faut donc SURTOUT PAS relancer
     * `tick()` ici, qui repeindrait les transforms en JS et annulerait tout
     * l'interet du chemin CSS. Seule la PROGRESSION est rapportee.
     * @description
     * Le calcul est differe d'une frame parce qu'`updateProgress()` appelle
     * `getBoundingClientRect()` : l'executer a chaque evenement de
     * defilement forcerait un reflow synchrone. C'est la meme raison qui
     * fait passer le chemin JS par rAF.
     * @description
     * `progressRafId` est la frame en attente de ce rapport. Elle est
     * distincte de `rafId` : celle-la ne repeint aucune couche, et les
     * confondre ferait annuler la boucle de rendu en annulant le rapport.
     * @description
     * `scroll` et `resize` sont pour cette raison installes DANS LES DEUX
     * CAS dans `onMounted`, et c'est `onScroll` qui choisit quoi faire.
     * Le suivi de souris et le premier paint JS, eux, restent propres au
     * chemin de repli : sur le chemin CSS c'est le navigateur qui
     * positionne les couches.
     ********************************************************/
    const onScroll = () => {
        if (!isInViewport) return

        if (cssScrollDriven.value) {
            if (progressRafId != null) return

            progressRafId = requestAnimationFrame(() => {
                progressRafId = null
                updateProgress()
            })

            return
        }

        if (rafId == null) {
            rafId = requestAnimationFrame(tick)
        }
    }

    /*********************************************************
     * Pointer — #1591
     *
     * @description
     * The pointer drives the CSS `translate` property, NOT `transform`: it
     * composes with the scroll movement (JS `transform` or CSS keyframes)
     * without either overwriting the other, so the pointer works on both
     * paths — including `easing="linear"` where the browser owns
     * `transform`. A CSS `transition` on `translate` does the smoothing.
     * @description
     * Per-layer amplitude (px at the host edge): `mouseX` / `mouseY` when
     * set; otherwise the legacy rule — `direction="both"` slides X by
     * `host width × 0.5 × speed`, Y stays still.
     * @description
     * `syncMouse` installs / removes the single `mousemove` listener and
     * resets the layers when it goes away.
     ********************************************************/
    const mouseAmplitude = (layer: IParallaxLayerRegistry, hostWidth: number) => ({
        x: layer.mouseX ?? (options.direction.value === PARALLAX_DIRECTION.BOTH
            ? hostWidth * PARALLAX_MOUSE_AMPLITUDE_FACTOR * layer.speed
            : 0),
        y: layer.mouseY ?? 0
    })

    const mouseEnabled = computed(() =>
        !options.disabled.value
        && !reducedMotion.value
        && finePointer.value
        && (options.direction.value === PARALLAX_DIRECTION.BOTH
            || layers.value.some(l => l.mouseX != null || l.mouseY != null))
    )

    const onMouseMove = (event: MouseEvent) => {
        const host = options.target.value
        if (!host) return
        const rect = host.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        // mouseRatio expressed in [-1, 1] from the centre.
        const x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)))
        const y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)))
        mouseRatio.value = { x, y }
        for (const layer of layers.value) {
            const amp = mouseAmplitude(layer, rect.width)
            layer.target.style.translate = `${(x * amp.x).toFixed(PARALLAX_TRANSFORM_PRECISION)}px ${(y * amp.y).toFixed(PARALLAX_TRANSFORM_PRECISION)}px`
        }
    }

    const syncMouse = () => {
        const host = options.target.value
        if (!host) return
        host.removeEventListener('mousemove', onMouseMove)
        if (mouseEnabled.value) {
            host.addEventListener('mousemove', onMouseMove, { passive: true })
            for (const layer of layers.value) {
                layer.target.style.transition = `translate ${PARALLAX_MOUSE_SMOOTHING}ms ease-out`
            }
            return
        }
        mouseRatio.value = { x: 0, y: 0 }
        for (const layer of layers.value) {
            layer.target.style.translate = ''
            layer.target.style.transition = ''
        }
    }

    /*********************************************************
     * syncScroll (#1603)
     *
     * @description
     * Under `prefers-reduced-motion` the layers never move, so the `scroll` /
     * `resize` listeners only matter when someone listens to `@scroll-progress`
     * (the progress is still reported).
     ********************************************************/
    const syncScroll = () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        if (reducedMotion.value && !options.wantsProgress?.()) return
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
    }

    const startCss = () => {
        // CSS scroll-driven path: layers carry their own animation, the
        // runtime only needs to publish the per-layer custom properties.
        const host = options.target.value
        if (!host) return
        for (const layer of layers.value) {
            publishLayerVars(layer)
        }
    }

    onMounted(() => {
        const host = options.target.value
        if (!host) return

        scrollAncestor.value = hasScrollContainerAncestor(host)

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

        syncScroll()
        syncMouse()

        if (!cssScrollDriven.value) {
            /*********************************************************
             * Premier rendu a progress=0 — handle desormais capture (#753)
             *
             * @description
             * Hors releve du ticket, trouve par mon propre balayage. Le
             * handle de CETTE frame n'etait pas capture, alors que les
             * cinq autres appels de `tick` du fichier le sont. `tick`
             * remet `rafId` a `null` en premiere instruction, donc au
             * demontage le `cancelAnimationFrame(rafId)` d'
             * `onBeforeUnmount` ne voyait rien a annuler : la toute
             * premiere frame etait la seule du fichier a pouvoir
             * survivre. Une affectation suffit a la rattacher au meme
             * mecanisme que les autres.
             ********************************************************/
            rafId = requestAnimationFrame(tick)
        }
    })

    onBeforeUnmount(() => {
        if (rafId != null) cancelAnimationFrame(rafId)
        if (progressRafId != null) {
            cancelAnimationFrame(progressRafId)
            progressRafId = null
        }
        observer?.disconnect()
        observer = null
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
        const host = options.target.value
        host?.removeEventListener('mousemove', onMouseMove)
    })

    watch([mouseEnabled, () => layers.value.length], syncMouse)
    watch(reducedMotion, syncScroll)

    // Watch the direction / easing — if the CSS branch flips at runtime
    // (very unlikely but possible if a layer is added late), re-publish the
    // CSS variables and stop the rAF loop.
    watch(cssScrollDriven, () => {
        if (cssScrollDriven.value) {
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
        cssEligible,
        reducedMotion,
        register,
        unregister,
        update
    }
}
