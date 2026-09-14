#!/usr/bin/env node
/*********************************************************
 * Auto-test du scanner de commentaires
 *
 * @description
 * Un garde sans mesure de précision ET de rappel n'a aucune valeur : il
 * se contente de produire un nombre que personne ne peut contester. Ce
 * fichier fixe les deux sur des cas écrits à la main.
 *
 * @description
 * Les cas de PRÉCISION sont les vrais pièges — ce qui ressemble à un
 * commentaire sans en être. Ils viennent de constructions réellement
 * présentes dans ce dépôt : URL dans une chaîne de thème, littéral
 * d'expression régulière dans les utils de masque, gabarit contenant du
 * CSS. Un faux positif sur l'un d'eux et le garde devient du bruit qu'on
 * désactive — ce qui est pire que pas de garde du tout.
 ********************************************************/

import { isToolDirective, scanComments, scriptOf } from './lib/comment-scan.mjs'

let failed = 0

function check (label, source, expected) {
    const found = scanComments(source)
    const got = {
        canonical: found.filter((c) => c.kind === 'canonical').length,
        jsdoc: found.filter((c) => c.kind === 'jsdoc').length,
        line: found.filter((c) => c.kind === 'line').length
    }
    const ok = ['canonical', 'jsdoc', 'line'].every((k) => (expected[k] ?? 0) === got[k])

    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}`)

    if (!ok) {
        failed++
        console.log(`          attendu ${JSON.stringify(expected)}  obtenu ${JSON.stringify(got)}`)
    }
}

console.log('\nRAPPEL — doit trouver :')

check('bloc canonique', '/*********\n * T\n ********/\nconst a = 1', { canonical: 1 })
check('JSDoc simple', '/** doc */\nexport const a = 1', { jsdoc: 1 })
check('commentaire ligne', 'const a = 1 // note', { line: 1 })
check('ligne seule', '// note\nconst a = 1', { line: 1 })
check('plusieurs formes mêlées', '/** a */\n// b\n/***** c\n *****/\n', { jsdoc: 1, line: 1, canonical: 1 })
check('JSDoc multi-lignes', '/**\n * a\n * b\n */\nconst x = 1', { jsdoc: 1 })
check('commentaire après du code sur la même ligne', 'foo(bar) // trailing', { line: 1 })
check('deux blocs canoniques', '/***** A\n****/\n/***** B\n****/', { canonical: 2 })

console.log('\nPRÉCISION — ne doit RIEN trouver :')

check('URL dans une chaîne simple', "const u = 'https://exemple.fr/a'", {})
check('URL dans une chaîne double', 'const u = "https://exemple.fr/a"', {})
check('URL dans un gabarit', 'const u = `https://exemple.fr/${x}`', {})
check('littéral regex contenant //', 'const r = /https:\\/\\//g', {})
check('regex avec classe contenant un slash', 'const r = /[/*]+/g', {})
check('division, pas une regex', 'const a = b / c\nconst d = e / f', {})
check('slash-étoile dans une chaîne', "const s = '/* pas un commentaire */'", {})
check('slash-slash dans une chaîne', "const s = '// pas un commentaire'", {})
check('gabarit contenant du CSS commenté', 'const css = `a { /* x */ }`', {})
check('protocole-relatif dans une chaîne', "const u = '//cdn.exemple.fr/x.js'", {})
check('interpolation imbriquée', 'const t = `a${`b${c}`}d`', {})
check('apostrophe échappée', "const s = 'l\\'un // deux'", {})

console.log('\nRAPPEL APRÈS UNE CONSTRUCTION PIÉGEUSE — le cas qui manquait :')

check('commentaire APRÈS un gabarit interpolé',
    'push(`a-${t}: ${v[0]}`)\n// vu ?', { line: 1 })
check('commentaire APRÈS deux gabarits successifs',
    'a(`x${y}`)\nb(`z${w}`)\n/** vu ? */', { jsdoc: 1 })
check('commentaire APRÈS une interpolation imbriquée',
    'const t = `a${`b${c}`}d`\n// vu ?', { line: 1 })
check('commentaire APRÈS une regex',
    'const r = /a\\/b/g\n// vu ?', { line: 1 })
check('commentaire APRÈS une chaîne contenant un backtick',
    "const s = 'il a dit `bonjour`'\n// vu ?", { line: 1 })
check('DEUX blocs séparés par du code piégeux',
    '/** un */\npush(`a-${t}: ${v[0]}`)\n/** deux */', { jsdoc: 2 })

console.log('\nBLOCS .vue :')

const vue = '<template>\n<!-- html -->\n</template>\n<script setup>\n// un\n</script>\n<style>\n/* css */\n</style>'

check('seul le <script> est lu', scriptOf('X.vue', vue), { line: 1 })

const twoScripts = '<script>\n// un\n</script>\n<script setup>\n// deux\n</script>'

check('les DEUX blocs <script> sont lus', scriptOf('X.vue', twoScripts), { line: 2 })

console.log('\nDIRECTIVES D\'OUTIL — restent en // par nécessité :')

for (const [text, expected] of [
    ['// eslint-disable-next-line no-console', true],
    ['// @ts-expect-error legacy', true],
    ['// prettier-ignore', true],
    ['/// <reference types="vite/client" />', true],
    ['// note humaine ordinaire', false],
    ['// eslintique — faux ami', false]
]) {
    const got = isToolDirective(text)
    const ok = got === expected

    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${expected ? 'directive' : 'humain   '} : ${text}`)

    if (!ok) failed++
}

const total = 8 + 12 + 6 + 2 + 6

console.log(failed === 0
    ? `\nPASS — ${total} cas (8 rappel, 12 précision, 6 rappel-après-piège, 2 blocs .vue, 6 directives).\n`
    : `\nFAIL — ${failed} cas en échec sur ${total}.\n`)

process.exit(failed === 0 ? 0 : 1)
