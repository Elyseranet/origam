import { inject } from "vue"
import { useLocale } from './locale.composable'

import { ORIGAM_DATE_OPTIONS_KEY } from '../../consts/Commons/date.const'

import type { IDateOptions } from '../../interfaces/Commons/date.interface'
import type { ILocaleInstance } from '../../interfaces/Commons/locale.interface'

import { DateAdapter } from '../../classes/Commons/date-adapter.class'

import { mergeDeep } from '../../utils/Commons/commons.util'
import { createInstance } from '../../utils/Commons/date.util'

/*********************************************************
 * createDate
 *
 * @description
 * Fabrique installee au niveau app (voir `createOrigam()`), pas un hook de
 * composant : fusionne les `options` fournies avec un adaptateur par
 * defaut (`DateAdapter`) et une table de locales BCP-47 par langue (`fr`,
 * `es`, `ar` en sont deliberement absents, commentes en code — leur valeur
 * differe selon la variante regionale), puis construit l'instance
 * d'adaptateur via `createInstance`. `useDate()` consomme ce resultat, il
 * ne le recree pas.
 ********************************************************/
export function createDate (options: IDateOptions | undefined, locale: ILocaleInstance) {
    const _options = mergeDeep({
        adapter: DateAdapter,
        locale: {
            af: 'af-ZA',
            // ar: '', # not the same value for all variants
            bg: 'bg-BG',
            ca: 'ca-ES',
            ckb: '',
            cs: 'cs-CZ',
            de: 'de-DE',
            el: 'el-GR',
            en: 'en-US',
            // es: '', # not the same value for all variants
            et: 'et-EE',
            fa: 'fa-IR',
            fi: 'fi-FI',
            // fr: '', #not the same value for all variants
            hr: 'hr-HR',
            hu: 'hu-HU',
            he: 'he-IL',
            id: 'id-ID',
            it: 'it-IT',
            ja: 'ja-JP',
            ko: 'ko-KR',
            lv: 'lv-LV',
            lt: 'lt-LT',
            nl: 'nl-NL',
            no: 'no-NO',
            pl: 'pl-PL',
            pt: 'pt-PT',
            ro: 'ro-RO',
            ru: 'ru-RU',
            sk: 'sk-SK',
            sl: 'sl-SI',
            srCyrl: 'sr-SP',
            srLatn: 'sr-SP',
            sv: 'sv-SE',
            th: 'th-TH',
            tr: 'tr-TR',
            az: 'az-AZ',
            uk: 'uk-UA',
            vi: 'vi-VN',
            zhHans: 'zh-CN',
            zhHant: 'zh-TW'
        }
    }, options as unknown as Record<string, unknown>) as unknown as IDateOptions

    return {
        options: _options,
        instance: createInstance(_options, locale)
    }
}

/*********************************************************
 * useDate
 *
 * @description
 * Recupere les options de date injectees par `createDate()` (cle
 * `ORIGAM_DATE_OPTIONS_KEY`) et la locale active (`useLocale()`), puis
 * retourne l'instance d'adaptateur de date (`createInstance`) que les
 * composants Date/DatePicker consomment pour toute arithmetique de date.
 *
 * @description
 * Leve une erreur explicite si les options ne sont pas injectees — signe
 * que l'app n'a pas ete initialisee via `createOrigam()`. Ce n'est pas une
 * valeur par defaut silencieuse : sans adaptateur enregistre, aucune
 * hypothese de locale/format n'est fiable.
 ********************************************************/
export function useDate () {
    const options = inject(ORIGAM_DATE_OPTIONS_KEY)

    if (!options) throw new Error('[Origam] Could not find injected date options')

    const locale = useLocale()

    return createInstance(options, locale)
}
