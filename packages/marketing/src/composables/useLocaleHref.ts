/**
 * Localises an INTERNAL site path, fragment included.
 *
 * The i18n strategy is `prefix_except_default` (nuxt.config.ts): a path
 * without a locale prefix resolves to the DEFAULT locale, whatever the
 * current one. So a raw `to="/support"` rendered on `/fr/roadmap` sends a
 * French visitor to the ENGLISH page — measured on the footer, 19 links,
 * see #760 (and #759 for the same defect on /contact).
 *
 * `localePath()` alone does not cover the two footer entries that carry a
 * fragment (`/components#charts`, `/#themes`): it is a route resolver, and
 * the fragment is not part of the route. The hash is therefore split off
 * before resolution and re-appended after.
 *
 * ⛔ Only for paths that are real Nuxt pages. `/stories/` and `/docs/` are
 * separate static sites (Histoire / VitePress) served next to the app, not
 * routes of it — localising them yields `/fr/stories/`, which 404s. They
 * are flagged `external: true` in NAV_SECTIONS and must keep a plain `<a>`.
 */
export function useLocaleHref () {
    const localePath = useLocalePath()

    const localeHref = (href: string): string => {
        const hashIndex = href.indexOf('#')

        if (hashIndex < 0) return localePath(href)

        const path = href.slice(0, hashIndex)
        const hash = href.slice(hashIndex)

        // `/#themes` — the fragment targets the home route.
        return `${ localePath(path || '/') }${ hash }`
    }

    return { localeHref }
}
