// Fixtures pour le lecteur de signature du generateur de doc des composables
// (#605), `packages/ds/scripts/analysis/lib/signature.mjs`.
//
// POURQUOI CE SPEC EXISTE. Le generateur coupait la signature au PREMIER `{`
// ou `=>` rencontre, sans suivi d'imbrication : 56 des 179 signatures publiees
// s'arretaient en plein milieu, et 2 debordaient sur la bannière suivante.
// Personne ne l'avait vu pendant des mois, parce qu'une signature tronquee
// reste du markdown PLAUSIBLE — simplement amputee. Le remplacement est de
// l'analyse syntaxique (profondeur de parentheses, saut des chaines et des
// commentaires, arbitrage type/corps) : ca regresse au premier refactor, et ca
// regresse en silence de la meme facon.
//
// ⛔ CHAQUE CAS EST JOUE CONTRE LES DEUX IMPLEMENTATIONS. `legacySignatureAt`
// ci-dessous est la version d'avant #605, recopiee telle quelle. Un cas qui
// passerait des deux cotes ne protegerait de rien : le test assert donc AUSSI
// que l'ancienne implementation echoue. La seule exception est le temoin
// negatif, qui doit passer des deux cotes — c'est precisement son role.
//
// Les fixtures sont du source REEL du depot, et les valeurs attendues sont
// celles reellement publiees dans `packages/docs/composables/*.md`.

import { describe, expect, it } from 'vitest'

import { signatureAt } from '../../../ds/scripts/analysis/lib/signature.mjs'

/**
 * L'implementation d'AVANT #605, conservee comme fixture.
 *
 * ⛔ Ne pas «corriger» : sa raison d'etre est d'etre fausse. Elle coupe au
 * premier `{` ou `=>`, ce qui suffit tant qu'aucun des deux n'apparait a
 * l'interieur du prototype — et les trois motifs testes plus bas font
 * exactement cela.
 */
const legacySignatureAt = (source: string, index: number): string => {
    const rest = source.slice(index)
    const arrow = rest.indexOf('=>')
    const brace = rest.indexOf('{')
    const end = arrow > -1 && (brace === -1 || arrow < brace) ? arrow : brace

    return rest.slice(0, end === -1 ? 200 : end).replace(/\s+/g, ' ').trim()
}

/**
 * Rejoue le reperage du generateur : meme regex, meme groupe `kind`, meme
 * index. Le spec exerce donc la chaine complete, pas seulement le parseur.
 */
const read = (source: string): string => {
    const m = /^export (function|const) ([A-Za-z0-9_]+)/m.exec(source)
    if (!m) throw new Error('fixture sans declaration exportee')

    return signatureAt(source, m.index, m[1])
}

const readLegacy = (source: string): string => {
    const m = /^export (function|const) ([A-Za-z0-9_]+)/m.exec(source)
    if (!m) throw new Error('fixture sans declaration exportee')

    return legacySignatureAt(source, m.index)
}

describe('signatureAt — les trois motifs qui tronquaient (#605)', () => {
    it('1. parametre destructure : le `{` du motif n\'est pas le corps', () => {
        // packages/ds/src/composables/Commons/sticky.composable.ts
        const source = [
            'export function useSticky ({rootEl, isSticky, layoutItemStyles}: ISticky) {',
            '    const isStuck = shallowRef<boolean | \'top\' | \'bottom\'>(false)',
            '}'
        ].join('\n')

        expect(read(source)).toBe('export function useSticky ({rootEl, isSticky, layoutItemStyles}: ISticky)')
        // L'ancienne coupait sur l'accolade ouvrante du motif de destructuration.
        expect(readLegacy(source)).toBe('export function useSticky (')
    })

    it('2. type de retour objet : le `{` du type n\'est pas le corps', () => {
        // packages/ds/src/composables/Commons/loader.composable.ts
        const source = [
            'export function useLoader (',
            '    props: ILoaderProps,',
            '    defaultKind: TLoaderKind = LOADER_KIND.CIRCULAR,',
            '    name = getCurrentInstanceName()',
            '): {',
            '    loaderClasses: ComputedRef<Record<string, boolean>>',
            '    isLoading: ComputedRef<boolean>',
            '    loaderConfig: ComputedRef<IResolvedLoader>',
            '} {',
            '    const isLoading = computed(() => false)',
            '}'
        ].join('\n')

        expect(read(source)).toBe(
            'export function useLoader ( props: ILoaderProps, defaultKind: TLoaderKind = LOADER_KIND.CIRCULAR,'
            + ' name = getCurrentInstanceName() ): { loaderClasses: ComputedRef<Record<string, boolean>>'
            + ' isLoading: ComputedRef<boolean> loaderConfig: ComputedRef<IResolvedLoader> }'
        )
        // L'ancienne perdait tout le type de retour, et finissait sur un `:` nu.
        expect(readLegacy(source)).toBe(
            'export function useLoader ( props: ILoaderProps, defaultKind: TLoaderKind = LOADER_KIND.CIRCULAR,'
            + ' name = getCurrentInstanceName() ):'
        )
    })

    it('3. type fonction en parametre : le `=>` interne n\'est pas la fleche du corps', () => {
        // packages/ds/src/composables/Commons/backButton.composable.ts
        const source = [
            'export function useBackButton (router: Router | undefined, cb: (next: NavigationGuardNext) => void) {',
            '    let popped = false',
            '}'
        ].join('\n')

        expect(read(source)).toBe(
            'export function useBackButton (router: Router | undefined, cb: (next: NavigationGuardNext) => void)'
        )
        // L'ancienne s'arretait sur le `=>` du type du callback : parentheses
        // desequilibrees, et un lecteur qui copie obtient du code invalide.
        expect(readLegacy(source)).toBe(
            'export function useBackButton (router: Router | undefined, cb: (next: NavigationGuardNext)'
        )
    })
})

describe('signatureAt — le piege qui a echappe a mes propres criteres', () => {
    // ⛔ Le cas le plus precieux du lot. `): ()` est EQUILIBRE et finit par
    // `)` : un controle par equilibrage de parentheses ou par «finit sur un
    // caractere de continuation» le declare conforme. Il est pourtant ampute
    // de son `=> void`. C'est ce qui a fait que mon premier decompte annoncait
    // 54 signatures fautives la ou il y en avait 58.

    it('useEventListener : le type de retour fonction survit', () => {
        // packages/ds/src/composables/Commons/eventListener.composable.ts
        const source = [
            'export function useEventListener (',
            '    events: TEventListenerEvents,',
            '    listeners: TEventListenerListeners,',
            '    options?: TEventListenerOptions',
            '): () => void',
            '/*********************************************************',
            ' * useEventListener (surcharge avec cible explicite)',
            ' ********************************************************/',
            'export function useEventListener (...args: Array<unknown>): () => void {',
            '}'
        ].join('\n')

        expect(read(source)).toBe(
            'export function useEventListener ( events: TEventListenerEvents, listeners: TEventListenerListeners,'
            + ' options?: TEventListenerOptions ): () => void'
        )

        const legacy = readLegacy(source)
        expect(legacy).toBe(
            'export function useEventListener ( events: TEventListenerEvents, listeners: TEventListenerListeners,'
            + ' options?: TEventListenerOptions ): ()'
        )
        // La demonstration du piege : equilibre, finissant par `)`, et faux.
        const balance = (s: string) => [ ...s ].reduce((d, c) => d + (c === '(' ? 1 : c === ')' ? -1 : 0), 0)
        expect(balance(legacy)).toBe(0)
        expect(legacy.endsWith(')')).toBe(true)
    })

    it('usePassedProps : meme piege sur un retour fonction generique', () => {
        // packages/ds/src/composables/Commons/passedProps.composable.ts
        const source = [
            'export function usePassedProps<T extends object> (',
            '    _props: T,',
            '    instanceLabel = \'usePassedProps\'',
            '): (key: Extract<keyof T, string> | string) => boolean {',
            '    return () => false',
            '}'
        ].join('\n')

        expect(read(source)).toBe(
            'export function usePassedProps<T extends object> ( _props: T, instanceLabel = \'usePassedProps\' ):'
            + ' (key: Extract<keyof T, string> | string) => boolean'
        )
        expect(readLegacy(source)).toBe(
            'export function usePassedProps<T extends object> ( _props: T, instanceLabel = \'usePassedProps\' ):'
            + ' (key: Extract<keyof T, string> | string)'
        )
    })
})

describe('signatureAt — les surcharges qui DEBORDAIENT', () => {
    // Une surcharge TypeScript n'a pas de corps, et celles de ce depot ne
    // portent pas de `;` final : elles s'arretent sur un retour a la ligne,
    // suivi de la bannière de la surcharge suivante. L'ancienne lecture
    // traversait le commentaire jusqu'a l'accolade du corps de
    // l'implementation, et publiait la bannière ENTIERE dans le bloc ```ts.
    // Defaut pre-existant, absent du ticket, trouve en verifiant la correction.

    const locale = [
        'export function useLocale (strict?: true): ILocaleInstance',
        '/*********************************************************',
        ' * useLocale (surcharge `strict: false`)',
        ' *',
        ' * @description',
        ' * Variante non stricte : retourne `null` plutot que de lever.',
        ' ********************************************************/',
        'export function useLocale (strict: false): ILocaleInstance | null',
        '/*********************************************************',
        ' * useLocale (implementation)',
        ' ********************************************************/',
        'export function useLocale (strict: boolean = true): ILocaleInstance | null {',
        '    return null',
        '}'
    ].join('\n')

    it('la premiere surcharge s\'arrete avant la bannière suivante', () => {
        expect(read(locale)).toBe('export function useLocale (strict?: true): ILocaleInstance')

        const legacy = readLegacy(locale)
        expect(legacy).toContain('*****')
        expect(legacy).toContain('@description')
        // Elle avalait les DEUX declarations suivantes en prime.
        expect(legacy).toContain('export function useLocale (strict: false)')
    })

    it('la seconde surcharge s\'arrete avant la bannière suivante', () => {
        const from = locale.indexOf('export function useLocale (strict: false)')
        expect(signatureAt(locale, from, 'function'))
            .toBe('export function useLocale (strict: false): ILocaleInstance | null')
        expect(legacySignatureAt(locale, from)).toContain('*****')
    })

    it('l\'implementation, elle, s\'arrete bien sur son corps', () => {
        const from = locale.indexOf('export function useLocale (strict: boolean = true)')
        expect(signatureAt(locale, from, 'function'))
            .toBe('export function useLocale (strict: boolean = true): ILocaleInstance | null')
    })
})

describe('signatureAt — formes que le parseur doit aussi tenir', () => {
    it('`export const` fleche : s\'arrete sur la fleche, PAS sur le type de retour objet', () => {
        // packages/ds/src/composables/Chart/chart-gauge.composable.ts
        const source = [
            'export const useChartGauge = (options: IUseChartGaugeOptions): {',
            '    geometry: ComputedRef<IChartGaugeGeometry>',
            '} => {',
            '    const geometry = computed(() => ({}))',
            '}'
        ].join('\n')

        expect(read(source)).toBe(
            'export const useChartGauge = (options: IUseChartGaugeOptions): { geometry: ComputedRef<IChartGaugeGeometry> }'
        )
        expect(readLegacy(source)).toBe('export const useChartGauge = (options: IUseChartGaugeOptions):')
    })

    it('generique portant un gabarit `${}` : l\'accolade du gabarit n\'est pas le corps', () => {
        // packages/ds/src/composables/Commons/vModel.composable.ts — le cas le
        // plus dur du dossier : chevrons, `&`, motif indexe, ET une chaine
        // gabarit dont le `${Prop}` porte une accolade fantome.
        const source = [
            'export function useVModel<',
            '    Props extends object & { [key in Prop as `onUpdate:${Prop}`]?: TEventProp | undefined },',
            '    Prop extends Extract<keyof Props, string>,',
            '> (',
            '    props: Props,',
            '    prop: Prop',
            '): TVModel<Props, Prop, Inner> {',
            '    return null as never',
            '}'
        ].join('\n')

        expect(read(source)).toBe(
            'export function useVModel< Props extends object & { [key in Prop as `onUpdate:${Prop}`]?:'
            + ' TEventProp | undefined }, Prop extends Extract<keyof Props, string>, > ( props: Props, prop: Prop'
            + ' ): TVModel<Props, Prop, Inner>'
        )
        // Valeur MESUREE, pas devinee : c'est exactement ce que publiait
        // `Commons.md` avant le correctif — l'ancienne coupait sur le `{` du
        // motif indexe, a l'interieur meme de la liste de generiques.
        expect(readLegacy(source)).toBe('export function useVModel< Props extends object &')
    })

    it('commentaire INTERNE a la liste de parametres : retire, virgule orpheline recollee', () => {
        // packages/ds/src/composables/Commons/stateEffect.composable.ts
        const source = [
            'export function useStateEffect (',
            '    props: TStateEffectProps,',
            '    /**',
            '     * Flat flag — when `true`, elevation resolves to empty.',
            '     */',
            '    flat: Ref<boolean> = noopRef,',
            ') {',
            '}'
        ].join('\n')

        const sig = read(source)
        expect(sig).toBe('export function useStateEffect ( props: TStateEffectProps, flat: Ref<boolean> = noopRef )')
        // Le bloc JSDoc ne fait pas partie du contrat de type : il ne doit pas
        // se retrouver recopie au milieu du bloc ```ts de la page.
        expect(sig).not.toContain('Flat flag')
        expect(sig).not.toContain('/**')
    })
})

describe('signatureAt — temoin negatif', () => {
    // ⛔ SANS CE BLOC, un parseur qui renverrait toujours l'entree entiere
    // passerait tous les cas ci-dessus. Ces signatures n'ont JAMAIS ete
    // fautives : elles ne contiennent ni `{` ni `=>` avant le corps, donc les
    // deux implementations doivent rendre le meme resultat, inchange.

    const temoins: Array<[string, string, string]> = [
        [
            'sans parametre',
            'export function _resetCssSupportCache () {\n    _flags = {}\n}',
            'export function _resetCssSupportCache ()'
        ],
        [
            'parametres simples et optionnels',
            'export function useAdjacent (props: IAdjacentProps, prependIcon?: Ref | ComputedRef,'
            + ' appendIcon?: Ref | ComputedRef) {\n    return {}\n}',
            'export function useAdjacent (props: IAdjacentProps, prependIcon?: Ref | ComputedRef,'
            + ' appendIcon?: Ref | ComputedRef)'
        ],
        [
            'const fleche sans type de retour',
            'export const useNested = (props: INestedProps) => {\n    return {}\n}',
            'export const useNested = (props: INestedProps)'
        ]
    ]

    it.each(temoins)('%s : inchange, et identique a l\'ancienne implementation', (_label, source, expected) => {
        expect(read(source)).toBe(expected)
        // Le temoin est le SEUL cas ou les deux implementations concordent.
        // C'est ce qui prouve que le correctif n'a pas reecrit la sortie
        // entiere pour faire passer les autres tests.
        expect(readLegacy(source)).toBe(expected)
    })

    it('le correctif n\'a pas elargi la sortie : le corps n\'est jamais inclus', () => {
        const source = 'export function useAdjacent (props: IAdjacentProps) {\n    const secret = 42\n}'

        expect(read(source)).not.toContain('secret')
        expect(read(source)).not.toContain('{')
    })
})
