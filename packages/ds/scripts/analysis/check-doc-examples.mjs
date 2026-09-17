#!/usr/bin/env node
/*********************************************************
 * Type-check des exemples de `packages/docs/composables/*.md` (#601)
 *
 * @description
 * Les deux lots precedents de la campagne #545 ont chacun livre DEUX
 * exemples faux, attrapes par le type-check et invisibles a la relecture.
 * Un exemple plausible n'est pas un exemple verifie : ce script extrait les
 * blocs appelants des pages, les ecrit dans un dossier temporaire sous
 * `packages/ds/`, et lance `vue-tsc` dessus avec le MEME programme que le
 * `type-check` du paquet.
 *
 * @description
 * Critere d'inclusion : un bloc ```vue, ou un bloc ```ts portant au moins une
 * clause `import`. Les autres blocs ```ts sont des CITATIONS de source ou des
 * sorties de mesure — les compiler n'aurait aucun sens.
 *
 * @description
 * Les imports `origam/xxx` des exemples sont reecrits en `@origam/xxx` : le
 * paquet publie expose `./dist`, qui n'existe pas tant que le build n'a pas
 * tourne, alors que l'alias vise les sources. Ce qui est verifie est donc la
 * signature reelle du code, pas celle d'un build peut-etre perime.
 *
 * Usage : node packages/ds/scripts/analysis/check-doc-examples.mjs [--keep]
 ********************************************************/
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DS = path.resolve(HERE, '../..')
const REPO = path.resolve(DS, '../..')
const PAGES_DIR = path.join(REPO, 'packages/docs/composables')
const OUT = path.join(DS, '.doc-examples')

const pages = readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(PAGES_DIR, f))

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

let kept = 0
let skipped = 0

for (const page of pages) {
    const src = readFileSync(page, 'utf8')
    const base = path.basename(page, '.md').replace(/[^A-Za-z0-9]/g, '')
    let i = 0

    for (const m of src.matchAll(/```(ts|vue)\n([\s\S]*?)```/g)) {
        const [ , lang, raw ] = m
        i++

        if (lang === 'ts' && !/^import\s/m.test(raw)) {
            skipped++
            continue
        }

        const body = raw.replace(/from 'origam\//g, "from '@origam/")
        writeFileSync(path.join(OUT, `${ base }${ i }.${ lang === 'vue' ? 'vue' : 'ts' }`), body)
        kept++
    }
}

// Meme programme que `packages/ds/tsconfig.json`, plus les exemples extraits.
// Sans les sources du paquet, les augmentations ambiantes (vite/client,
// IHTMLExpandElement, …) manquent et le type-check fabrique 53 faux rouges.
writeFileSync(path.join(OUT, 'tsconfig.json'), `${ JSON.stringify({
    extends: '../tsconfig.json',
    compilerOptions: {
        noEmit: true,
        rootDir: '..',
        outDir: './out',
        paths: {
            '#app': [ './src/nuxt/nuxt-app.shim.d.ts' ],
            '@origam': [ './src' ],
            '@origam/*': [ './src/*' ]
        }
    },
    include: [ '*.ts', '*.vue', '../src/**/*.ts', '../src/**/*.tsx', '../src/**/*.vue' ],
    exclude: [ '../dist', '../node_modules', '../src/**/*.spec.ts', '../src/**/*.story.vue' ]
}, null, 2) }\n`)

console.log(`${ kept } exemple(s) extrait(s), ${ skipped } bloc(s) non appelant(s) ignore(s)`)

const bin = path.join(DS, 'node_modules/.bin/vue-tsc')
const res = spawnSync(bin, [ '--noEmit', '-p', path.join(OUT, 'tsconfig.json') ], {
    stdio: 'inherit',
    cwd: REPO
})

if (!process.argv.includes('--keep')) rmSync(OUT, { recursive: true, force: true })

console.log(res.status === 0 ? 'PASS — tous les exemples compilent' : 'FAIL')
process.exit(res.status ?? 1)
