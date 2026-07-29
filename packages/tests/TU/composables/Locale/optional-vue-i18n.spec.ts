// `vue-i18n` est declare peer OPTIONNEL dans packages/ds/package.json
// (`peerDependenciesMeta.vue-i18n.optional = true`). Il a pourtant longtemps
// ete importe statiquement par `createLocale`, que `createOrigam()` appelle
// systematiquement — rendant le DS INUTILISABLE dans tout projet qui ne
// l'installe pas. Bug remonte par un consommateur.
//
// Ces specs verrouillent les deux niveaux du correctif : aucune instruction
// d'import a l'execution, et aucune dependance de TYPE non plus (un
// `import type` ne coute rien au runtime mais casse le type-check d'un
// projet sans le paquet des que `skipLibCheck` est a false — meme classe de
// bug, un cran plus loin).
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'

// Import du module PRECIS, pas du barrel `@origam/utils` : celui-ci tire tout
// le paquet et faisait depasser le timeout de 5 s.
import { createBuiltinAdapter } from '@origam/utils/Commons/locale.util'

const DS_SRC = resolve(process.cwd(), '../ds/src')

function walk (dir: string, acc: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) walk(full, acc)
        else if (/\.(ts|vue)$/.test(entry)) acc.push(full)
    }

    return acc
}

describe('vue-i18n reste un peer OPTIONNEL', () => {
    const files = walk(DS_SRC)

    it('aucune source du DS n\'importe vue-i18n, meme en type', () => {
        const offenders = files.filter((file) => {
            const src = readFileSync(file, 'utf-8')

            return /(^|\n)\s*import[^\n]*from\s*['"]vue-i18n['"]/.test(src)
                || /require\(['"]vue-i18n['"]\)/.test(src)
        })

        expect(offenders.map((f) => f.replace(DS_SRC, ''))).toEqual([])
    })

    it('createLocale n\'appelle pas createI18n', () => {
        const src = readFileSync(join(DS_SRC, 'composables/Commons/locale.composable.ts'), 'utf-8')

        // Le defaut doit passer par l'adaptateur natif. Un consommateur qui
        // veut vue-i18n construit son adaptateur et le passe en option — c'est
        // lui qui possede la dependance.
        expect(src).not.toMatch(/createI18n/)
        expect(src).toMatch(/createBuiltinAdapter/)
    })
})

describe('adaptateur natif', () => {
    it('resout une cle, retombe sur la cle absente, interpole', () => {
        const adapter = createBuiltinAdapter({
            current: ref('en'),
            fallback: ref('en'),
            messages: computed(() => ({
                en: { origam: { open: 'Open', rating: 'Rating {0} of {1}', named: 'Hello {value}' } }
            })) as never
        })

        expect(adapter.name).toBe('origam-builtin')
        expect(adapter.t('origam.open')).toBe('Open')
        expect(adapter.t('origam.rating', 3, 5)).toBe('Rating 3 of 5')
        expect(adapter.t('origam.named', { value: 'world' })).toBe('Hello world')

        // Une cle absente rend la CLE, jamais une chaine vide : un trou de
        // traduction doit se voir.
        expect(adapter.t('origam.absent')).toBe('origam.absent')

        // Un parametre nullish ne doit pas faire tomber le rendu.
        expect(adapter.t('origam.rating', null, undefined)).toBe('Rating  of ')
    })

    it('retombe sur la locale de secours', () => {
        const adapter = createBuiltinAdapter({
            current: ref('fr'),
            fallback: ref('en'),
            messages: computed(() => ({
                en: { origam: { open: 'Open' } },
                fr: { origam: {} }
            })) as never
        })

        expect(adapter.t('origam.open')).toBe('Open')
    })
})
