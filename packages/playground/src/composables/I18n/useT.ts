import EN from '../../assets/locales/en.json'

/*********************************************************
 * useT
 *
 * @description
 * A dependency-free `t(key, fallback)` lookup for this package. No
 * `vue-i18n` / `@intlify` import — the embeddable playground ships as a
 * small workspace package consumed by `packages/marketing`, and a flat JSON
 * lookup covers the one contract the repo-wide convention requires
 * (`t('key', 'fallback')`, keys in snake_case) without pulling a localeâ€‘
 * negotiation runtime into a library whose host may already own one.
 *
 * @description
 * Flat dictionary, dotted-path lookup (`playground.topbar.catalog_button`),
 * `{param}` interpolation via `replaceAll` — the same shape the other
 * origam packages' own `useT.ts` implement.
 ********************************************************/
const DICTIONARY: Record<string, string> = EN

export function useT () {
    const t = (key: string, fallback?: string, named?: Record<string, string | number>): string => {
        const value = DICTIONARY[key]
        let out = value ?? fallback ?? key

        if (named) {
            for (const [paramName, paramValue] of Object.entries(named)) {
                out = out.replaceAll(`{${paramName}}`, String(paramValue))
            }
        }

        return out
    }

    return { t }
}
