/*
 * RUNTIME SWEEP — l'`id` fourni par le consommateur atteint-il le DOM ?
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * La garde 15 (`packages/ds/scripts/guards/id-forwarding.mjs`) couvre UN des
 * quatre mecanismes de #381/#421 : `const {id} = useStyle(xxxStyles)` sans
 * `() => props.id`, COMBINE a un `:id="id"` dans le template. Elle documente
 * elle-meme les trois autres comme hors de sa portee — dont celui-ci :
 *
 *     « a real control with NO `:id` binding at all »
 *
 * Ce mecanisme n'a aucune forme textuelle : il se caracterise par l'ABSENCE
 * d'un binding. Aucune analyse statique ne peut le voir. Seul un montage le
 * peut. L'en-tete de la garde renvoyait deja vers ce fichier — qui n'avait
 * jamais ete ecrit.
 *
 * CRITERE
 * -------
 * Monter chaque composant qui DECLARE une prop `id`, lui passer une sentinelle,
 * puis chercher cette sentinelle dans le DOM rendu. Trois verdicts utiles :
 *
 *   root       — la sentinelle est l'id de l'element racine. Ideal.
 *   descendant — elle est l'id d'un autre noeud de l'arbre. Legitime pour les
 *                champs : l'id appartient a l'`<input>`, c'est lui que vise un
 *                `<label for>`. Pas un defaut.
 *   lost       — aucun noeud ne porte cet id. DEFAUT : la prop est acceptee et
 *                jetee. Inclut le cas ou seule une valeur DERIVEE
 *                (`<id>-messages`) est rendue — voir la comparaison exacte
 *                plus bas (#633).
 *
 * ⛔ LE PIEGE QUI REND CE FICHIER NECESSAIRE PLUTOT QU'UN SIMPLE SWEEP_PROPS=id
 * ---------------------------------------------------------------------------
 * L'audit inert-props sait deja sonder `id` — mais son `render()` lit
 * `wrapper.html()` SYNCHRONEMENT apres `mount()`. Or plusieurs composants font
 * transiter l'id par un `computed` qui depend d'une template-ref, indefinie au
 * premier rendu. Mesure faite : sur les 14 composants qu'il classe `inert` pour
 * `id`, CINQ (FileField, PasswordField, SliderField, TextField, TextareaField)
 * recoivent bien l'id — apres deux ticks. Lire trop tot les declare morts.
 *
 * D'ou l'`await nextTick()` ci-dessous, et le fait qu'on rapporte AUSSI la
 * valeur lue immediatement : la difference entre les deux colonnes est la
 * mesure de ce piege, pas un detail d'implementation.
 *
 * Sortie machine : `ID_FORWARDING_REPORT=<path>`.
 * Point d'entree : `pnpm -F @origam/tests audit:id-forwarding`.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createOrigam } from '@origam/origam'
import { writeFileSync } from 'node:fs'

import { ID_FORWARDING_FIXTURES } from './id-forwarding-fixtures'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

/*
 * jsdom n'implemente pas `scrollIntoView`. Plusieurs composants l'appellent
 * depuis un `onMounted` ASYNCHRONE (OrigamDatePickerYears:139) : le rejet
 * arrive donc APRES le montage, hors de portee du try/catch, et fait tomber
 * toute la passe en « unhandled rejection ». C'est un manque de
 * l'environnement, pas un defaut de composant — on le comble.
 */
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn()

global.ResizeObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as any
global.IntersectionObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as any

const modules = import.meta.glob('../../ds/src/components/**/*.vue', { eager: true }) as Record<
    string,
    { default: any }
>

/*
 * Sentinelle. Ni de la forme `origam-xxx-N` (qu'un id genere pourrait
 * imiter), ni un mot susceptible d'apparaitre dans du contenu par defaut.
 */
const SENTINEL = 'origam-audit-sentinel-id'

type Verdict = 'root' | 'descendant' | 'lost' | 'unmountable' | 'not-rendered'

type Row = {
    component: string
    verdict: Verdict
    /** Vrai si la sentinelle etait deja la AVANT stabilisation. */
    immediate: boolean
    detail?: string
}

const rows: Row[] = []
const origam = createOrigam()

for (const [path, mod] of Object.entries(modules)) {
    const Cmp = mod?.default
    if (!Cmp || typeof Cmp !== 'object') continue

    const name: string = Cmp.__name || path.split('/').pop()!.replace('.vue', '')
    const declared: string[] = Cmp.props ? Object.keys(Cmp.props) : []

    // Pas de prop `id` declaree : rien a transmettre, hors perimetre.
    // (Sans prop declaree, Vue laisse l'attribut passer en fallthrough et il
    // atterrit tout seul — c'est le cas SAIN, pas un cas a auditer.)
    if (!declared.includes('id')) continue

    it(`${name} — l'id du consommateur atteint le DOM`, async () => {
        // Harnais — voir id-forwarding-fixtures.ts. Sans entrée pour `name`,
        // le montage est strictement identique à avant (juste `{ id }`).
        const fixture = ID_FORWARDING_FIXTURES[name]

        let wrapper: any
        try {
            wrapper = mount(Cmp, {
                props: { id: SENTINEL, ...fixture?.props },
                slots: fixture?.slots,
                global: {
                    plugins: [origam],
                    stubs: { teleport: true, transition: false },
                    provide: fixture?.provide?.()
                }
            })
        } catch (err) {
            rows.push({
                component: name,
                verdict: 'unmountable',
                immediate: false,
                detail: String((err as Error).message).slice(0, 120)
            })
            return
        }

        const immediate = wrapper.html().includes(SENTINEL)

        // Stabilisation — voir l'en-tete. Deux ticks suffisent a resoudre les
        // computed qui dependent d'une template-ref ; un troisieme ne change
        // rien (verifie).
        await nextTick()
        await nextTick()

        const html: string = wrapper.html()
        const root = wrapper.element as HTMLElement

        /*
         * ⛔ COMPARAISON EXACTE D'ATTRIBUT, PAS `html.includes()` — #633.
         *
         * Le verdict `descendant` reposait sur `html.includes(SENTINEL)`, un
         * test de SOUS-CHAINE. Toute DERIVATION le satisfait :
         * `origam-snackbar-group-<sentinelle>` contient la sentinelle, donc
         * un composant dont l'id du consommateur n'atteint AUCUN noeud etait
         * compte sain. L'instrument creditait exactement le defaut qu'il
         * etait cense trouver.
         *
         * Mesure du changement, meme commit, meme machine :
         *   sous-chaine : root 154 / descendant 38 / lost 0
         *   exact       : root 154 / descendant 33 / lost 5
         *
         * Les 5 : OrigamInput, OrigamOtpInputField, OrigamSnackbarGroup,
         * OrigamRatingField (consequence d'OrigamInput, a qui il transmet
         * correctement son id), OrigamDataTableHeadersCell. `detail` conserve
         * les id REELLEMENT rendus, pour que le rapport dise ou est parti
         * l'id plutot que seulement qu'il est parti.
         */
        const renderedIds = [
            root?.getAttribute?.('id') ?? null,
            ...wrapper.findAll('[id]').map((e) => (e.element as HTMLElement).getAttribute('id'))
        ].filter((v): v is string => Boolean(v))
        const exact = renderedIds.includes(SENTINEL)

        let verdict: Verdict
        if (html.trim() === '' || html.startsWith('<!--')) verdict = 'not-rendered'
        else if (root?.getAttribute?.('id') === SENTINEL) verdict = 'root'
        else if (exact) verdict = 'descendant'
        else verdict = 'lost'

        rows.push({
            component: name,
            verdict,
            immediate,
            detail: verdict === 'lost' && html.includes(SENTINEL)
                ? `la sentinelle n'apparait que DERIVEE — id rendus : ${[...new Set(renderedIds)].join(' | ')}`
                : undefined
        })

        wrapper.unmount()
        // jsdom garde chaque <style> injecte vivant ; on nettoie comme le fait
        // l'audit inert-props, pour la meme raison.
        document.head.innerHTML = ''

        expect(true).toBe(true)
    })
}

describe('rapport', () => {
    it('resume et export', () => {
        const by = (v: Verdict) => rows.filter((r) => r.verdict === v).map((r) => r.component).sort()

        const lost = by('lost')
        const timingTrap = rows.filter((r) => !r.immediate && (r.verdict === 'root' || r.verdict === 'descendant'))

        console.log('')
        console.log(`composants declarant une prop id : ${rows.length}`)
        for (const v of ['root', 'descendant', 'lost', 'unmountable', 'not-rendered'] as Verdict[]) {
            console.log(`  ${v.padEnd(14)} ${by(v).length}`)
        }
        console.log('')
        console.log('=== LOST — la prop id est acceptee puis jetee ===')
        for (const c of lost) console.log(`  ${c}`)
        console.log('')
        console.log(`=== PIEGE DE TIMING — id absent au 1er rendu, present apres stabilisation : ${timingTrap.length} ===`)
        console.log('(un audit qui lit le DOM sans attendre les declare morts a tort)')
        for (const r of timingTrap) console.log(`  ${r.component}`)

        const out = process.env.ID_FORWARDING_REPORT
        if (out) writeFileSync(out, JSON.stringify({ rows }, null, 2))

        expect(rows.length).toBeGreaterThan(0)
    })
})
