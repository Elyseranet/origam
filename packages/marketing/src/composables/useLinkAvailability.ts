import { onMounted, reactive, ref } from 'vue'
import type { TAvailabilityMap } from '~/types/link-availability.type'

/**
 * Probes a list of hrefs to determine which ones are actually reachable.
 *
 * Rules:
 * - SSR-safe: no fetch happens during server-side rendering; probing is
 *   deferred to `onMounted` (client only).
 * - Same-origin relative links (starting with `/`) are probed with HEAD
 *   (falling back to GET on 405). `available` is `true` when the server
 *   responds with a 2xx/3xx status (res.ok).
 * - External links (starting with `http`, `https`, `mailto`, or `#`) are
 *   always considered available (CORS would block the probe and external
 *   404s are not our concern).
 * - Results are cached in a module-level map so the same href is never
 *   probed twice across component instances.
 */

const CACHE: TAvailabilityMap = {}

function isExternal (href: string): boolean {
    return (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('#')
    )
}

async function probeHref (href: string): Promise<boolean> {
    if (href in CACHE) {
        return CACHE[href] as boolean
    }

    try {
        const headRes = await fetch(href, { method: 'HEAD' })
        if (headRes.status !== 405) {
            CACHE[href] = headRes.ok
            return headRes.ok
        }

        const getRes = await fetch(href, { method: 'GET' })
        CACHE[href] = getRes.ok
        return getRes.ok
    } catch {
        CACHE[href] = false
        return false
    }
}

export function useLinkAvailability (hrefs: string[]) {
    const availability = reactive<TAvailabilityMap>(
        Object.fromEntries(hrefs.map(href => [href, undefined]))
    )
    const ready = ref(false)

    onMounted(async () => {
        await Promise.all(
            hrefs.map(async href => {
                if (isExternal(href)) {
                    availability[href] = true
                    return
                }

                const result = await probeHref(href)
                availability[href] = result
            })
        )
        ready.value = true
    })

    return { availability, ready }
}
