/*
 * SONDE DE RAYON DE SOUFFLE — #790.
 *
 * Le sweep `id-forwarding-sweep.spec.ts` repond a UNE question : l'id du
 * consommateur atteint-il un noeud ? Il ne dit pas CE QUE cet id sert a faire.
 * Le ticket #790 demande explicitement de chiffrer l'impact a11y avant toute
 * correction — `<label for>`, `aria-describedby`, `getElementById`. Cette
 * sonde le mesure, composant par composant.
 *
 * ⛔ COMPARAISON EXACTE D'ATTRIBUT, JAMAIS DE SOUS-CHAINE.
 * C'est l'erreur qui a rendu ce lot invisible pendant des mois
 * (`html.includes(SENTINEL)` est satisfait par toute derivation).
 *
 * ⛔ CONTROLE POSITIF OBLIGATOIRE. Sans temoin qui transmet correctement,
 * « l'id n'arrive pas » et « ma sonde regarde le mauvais noeud » sont
 * indiscernables. `OrigamTextField` et `OrigamCheckbox` jouent ce role : ils
 * consomment le MEME `OrigamInput` et doivent rester verts avant ET apres.
 *
 * Sortie machine : ID_REACH_BLAST_REPORT=<path>.
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

const SENTINEL = 'origam-audit-sentinel-id'

/*
 * Elements que HTML autorise comme cible d'un `<label for>` (content model
 * W3C : « labelable elements »). Un `for` pointant vers un `<div>` resout un
 * noeud mais n'etablit AUCUNE relation d'accessibilite — c'est la difference
 * que cette sonde doit voir, et que `getElementById() !== null` masquerait.
 */
const LABELABLE = new Set([
    'BUTTON', 'INPUT', 'METER', 'OUTPUT', 'PROGRESS', 'SELECT', 'TEXTAREA'
])

type Row = {
    component: string
    /** Un noeud porte-t-il EXACTEMENT la sentinelle ? */
    exact: boolean
    /** Description du noeud porteur (tag + classe), s'il existe. */
    carrier: string | null
    /** Le porteur est-il un element labelable (cible valide d'un <label for>) ? */
    carrierLabelable: boolean
    /** `for=` presents dans l'arbre qui ne resolvent AUCUN noeud. */
    orphanFor: string[]
    /** `for=` qui resolvent un noeud NON labelable (relation a11y morte). */
    nonLabelableFor: string[]
    /** aria-describedby / aria-labelledby qui ne resolvent aucun noeud. */
    orphanAria: string[]
    /** ids rendus en double (un id doit etre unique dans le document). */
    duplicateIds: string[]
    /** tous les ids rendus, pour lecture humaine. */
    renderedIds: string[]
    /**
     * Selecteurs `#id` des regles generees par `useStyle()` et injectees dans
     * <head> qui ne matchent AUCUN noeud rendu. C'est la SECONDE contrainte de
     * #790 : « les styles generes continuent de s'appliquer ». Une regle
     * orpheline est un style mort, silencieux.
     */
    orphanStyleRules: string[]
    error?: string
}

const rows: Row[] = []
const origam = createOrigam()

/*
 * Perimetre : les 5 « lost » de #790, plus les temoins positifs. Les temoins
 * consomment le MEME OrigamInput que les cas defectueux — c'est ce qui rend
 * le relevé interpretable.
 */
const SUBJECTS = [
    // --- les 5 declares perdus par le sweep exact ---
    'OrigamInput',
    'OrigamOtpInputField',
    'OrigamSnackbarGroup',
    'OrigamRatingField',
    'OrigamDataTableHeadersCell',
    // --- temoins positifs : consommateurs d'OrigamInput declares sains ---
    'OrigamTextField',
    'OrigamTextareaField',
    'OrigamCheckbox',
    'OrigamRadio',
    'OrigamSwitch',
    'OrigamNumberField',
    'OrigamPasswordField',
    'OrigamFileField',
    'OrigamSliderField',
    'OrigamCheckboxGroup',
    'OrigamRadioGroup',
    // --- temoin positif hors famille champ ---
    'OrigamField'
]

for (const [path, mod] of Object.entries(modules)) {
    const Cmp = mod?.default
    if (!Cmp || typeof Cmp !== 'object') continue

    const name: string = Cmp.__name || path.split('/').pop()!.replace('.vue', '')
    if (!SUBJECTS.includes(name)) continue

    it(`${name} — rayon de souffle de l'id consommateur`, async () => {
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
                },
                attachTo: document.body
            })
        } catch (err) {
            rows.push({
                component: name,
                exact: false,
                carrier: null,
                carrierLabelable: false,
                orphanFor: [],
                nonLabelableFor: [],
                orphanAria: [],
                duplicateIds: [],
                renderedIds: [],
                orphanStyleRules: [],
                error: String((err as Error).message).slice(0, 160)
            })
            return
        }

        await nextTick()
        await nextTick()

        const rootEl = wrapper.element as HTMLElement
        const scope: HTMLElement = rootEl?.nodeType === 1 ? rootEl : document.body

        const all: HTMLElement[] = [
            ...(scope.hasAttribute?.('id') ? [scope] : []),
            ...Array.from(scope.querySelectorAll<HTMLElement>('[id]'))
        ]
        const renderedIds = all.map((e) => e.getAttribute('id')!).filter(Boolean)

        // ⛔ EXACT, pas includes().
        const carrierEl = all.find((e) => e.getAttribute('id') === SENTINEL) ?? null

        const seen = new Set<string>()
        const duplicateIds = [...new Set(renderedIds.filter((v) => (seen.has(v) ? true : (seen.add(v), false))))]

        const resolve = (candidateId: string): HTMLElement | null =>
            all.find((e) => e.getAttribute('id') === candidateId) ?? null

        const forAttrs = Array.from(scope.querySelectorAll<HTMLElement>('[for]'))
            .map((e) => e.getAttribute('for')!)
            .filter(Boolean)

        const orphanFor = [...new Set(forAttrs.filter((f) => !resolve(f)))]
        const nonLabelableFor = [...new Set(
            forAttrs.filter((f) => {
                const target = resolve(f)
                return Boolean(target) && !LABELABLE.has(target!.tagName)
            })
        )]

        const ariaRefs = Array.from(
            scope.querySelectorAll<HTMLElement>('[aria-describedby],[aria-labelledby]')
        ).flatMap((e) => [
            ...(e.getAttribute('aria-describedby') ?? '').split(/\s+/),
            ...(e.getAttribute('aria-labelledby') ?? '').split(/\s+/)
        ]).filter(Boolean)

        const orphanAria = [...new Set(ariaRefs.filter((a) => !resolve(a)))]

        /*
         * SECONDE CONTRAINTE DE #790 — « les styles generes continuent de
         * s'appliquer ». `useStyle()` injecte une regle `#<id> { … }` dans
         * <head>. Si aucun noeud ne porte cet id, la regle est MORTE.
         * On lit le texte des <style> injectes (seule methode fiable sous
         * jsdom — cf. CLAUDE.md #398 : getComputedStyle n'y resout pas var()).
         */
        const injected = Array.from(document.head.querySelectorAll('style'))
            .map((s) => s.textContent ?? '')
            .join('\n')
        const selectors = [...injected.matchAll(/#([A-Za-z0-9_\-\\]+)\s*\{/g)]
            .map((m) => m[1].replace(/\\/g, ''))
        const orphanStyleRules = [...new Set(selectors.filter((s) => !resolve(s)))]

        rows.push({
            component: name,
            exact: Boolean(carrierEl),
            carrier: carrierEl
                ? `<${carrierEl.tagName.toLowerCase()}${carrierEl.className ? ` class="${String(carrierEl.className).split(' ')[0]}"` : ''}>`
                : null,
            carrierLabelable: Boolean(carrierEl) && LABELABLE.has(carrierEl!.tagName),
            orphanFor,
            nonLabelableFor,
            orphanAria,
            duplicateIds,
            renderedIds: [...new Set(renderedIds)],
            orphanStyleRules
        })

        wrapper.unmount()
        document.body.innerHTML = ''
        document.head.innerHTML = ''

        expect(true).toBe(true)
    })
}

describe('rayon de souffle', () => {
    it('rapport', () => {
        const pad = (s: string, n: number) => s.padEnd(n)
        console.log('')
        console.log('=== #790 — RAYON DE SOUFFLE DE L ID CONSOMMATEUR (comparaison EXACTE) ===')
        console.log('')
        console.log(
            pad('composant', 28) + pad('exact', 7) + pad('porteur', 34) +
            pad('labelable', 11) + pad('for orphelin', 14) + pad('for non-labelable', 19) + 'aria orphelin'
        )
        for (const r of rows.sort((a, b) => a.component.localeCompare(b.component))) {
            console.log(
                pad(r.component, 28) +
                pad(r.exact ? 'OUI' : 'NON', 7) +
                pad(r.carrier ?? '—', 34) +
                pad(r.carrierLabelable ? 'oui' : (r.exact ? 'NON' : '—'), 11) +
                pad(String(r.orphanFor.length || '—'), 14) +
                pad(String(r.nonLabelableFor.length || '—'), 19) +
                String(r.orphanAria.length || '—')
            )
        }
        console.log('')
        for (const r of rows) {
            if (r.orphanFor.length || r.orphanAria.length || r.duplicateIds.length) {
                console.log(`--- ${r.component}`)
                if (r.orphanFor.length) console.log(`    <label for> ne resolvant RIEN : ${r.orphanFor.join(' | ')}`)
                if (r.orphanAria.length) console.log(`    aria-*by ne resolvant RIEN  : ${r.orphanAria.join(' | ')}`)
                if (r.duplicateIds.length) console.log(`    ids EN DOUBLE               : ${r.duplicateIds.join(' | ')}`)
                console.log(`    ids rendus                  : ${r.renderedIds.join(' | ')}`)
            }
        }

        const out = process.env.ID_REACH_BLAST_REPORT
        if (out) writeFileSync(out, JSON.stringify({ rows }, null, 2))

        expect(rows.length).toBeGreaterThan(0)
    })
})
