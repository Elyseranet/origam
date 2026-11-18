import { LEGAL_DEFAULTS, LEGAL_HOST_FIELDS, LEGAL_PUBLISHER_FIELDS } from '../consts/legal.const'
import type { ILegalConfig, ILegalRow } from '../interfaces/legal.interface'
import { useT } from './useT'

/**
 * Publisher identity comes from runtimeConfig.public.legal, fed by the shared
 * Coolify server variables (NUXT_PUBLIC_LEGAL_* -> {{server.LEGAL_*}}).
 * An empty value reads "to complete" outside production and is omitted in
 * production (the pre-delivery check blocks a release with empty values).
 */
export function useLegal () {
    const { t } = useT()
    const config = useRuntimeConfig().public
    const legal: ILegalConfig = { ...LEGAL_DEFAULTS, ...(config.legal as Partial<ILegalConfig>) }
    const isProduction = !import.meta.dev

    const toRows = (fields: ReadonlyArray<keyof ILegalConfig>): ILegalRow[] => fields
        .map((key) => {
            const value = String(legal[key] ?? '').trim()

            return {
                key,
                label: t(`legal_notice.field_${key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)}`, key),
                value: value || t('legal_notice.to_complete', 'To complete'),
                isMissing: !value
            }
        })
        .filter(row => !(isProduction && row.isMissing))

    return {
        publisherRows: toRows(LEGAL_PUBLISHER_FIELDS),
        hostRows: toRows(LEGAL_HOST_FIELDS)
    }
}
