/*********************************************************
 * setup-template-exposure — un template qui appelle un
 * symbole que son `<script setup>` ne fournit pas.
 *
 * @description
 * La sonde reproduit le pipeline reel du consommateur
 * (`@vitejs/plugin-vue` en mode dev, `inlineTemplate: false`) :
 *   1. `compileScript(..., { inlineTemplate: false })`
 *   2. `compileTemplate(..., { compilerOptions: { bindingMetadata } })`
 *   3. comparaison des deux sorties du compilateur.
 * Elle ne devine rien : les deux cotes sortent du
 * compilateur lui-meme.
 *
 * @description
 * Le compilateur emet DEUX formes distinctes, et la
 * difference est ce qui compte :
 *
 * | forme emise | ce que ca veut dire |
 * |---|---|
 * | `$setup.X` | X EST un binding de `<script setup>` |
 * | `_ctx.X`   | le compilateur n'a trouve AUCUN X |
 *
 * ⛔ CE QUE #734 A ETABLI, ET QUI CONTREDIT SON PROPRE
 * ENONCE : un import manquant — le patron que le ticket
 * decrivait — produit `_ctx.X is not a function`, JAMAIS
 * `$setup.X`. Mesure en retirant l'import de `convertToUnit`
 * de `OrigamVirtualScroll` et en lisant le rendu compile :
 *   `_ctx.convertToUnit($setup.paddingTop)`
 * Le message reellement observe dans le navigateur disait
 * `$setup.convertToUnit`, ce qui PROUVE l'inverse : le
 * symbole etait bien importe et bien expose. Il manquait
 * parce que le `setup()` avait leve AVANT d'assembler son
 * objet `__returned__` — Vue rend alors avec un `$setup`
 * vide, et le message designe le premier symbole cherche
 * dedans. La vraie cause etait une prop `items` declaree
 * optionnelle mais lue sans garde par `useVirtual`.
 *
 * @description
 * La sonde couvre donc les deux formes. L'arme `$setup` est
 * structurellement vide sur un code compile depuis les
 * sources (le compilateur renvoie toujours les bindings que
 * le template utilise) ; elle est gardee parce qu'elle
 * couvre un dist reecrit apres coup. L'arme `_ctx` est celle
 * qui peut reellement trouver quelque chose.
 ********************************************************/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc'

/**
 * Liste récursivement les SFC d'un répertoire.
 *
 * @param {string} dir - racine à parcourir
 * @param {(f: string) => boolean} [filter] - filtre optionnel sur le chemin
 * @returns {string[]} chemins absolus des `.vue` trouvés
 */
export function listSfc (dir, filter = () => true) {
    /** @type {string[]} */
    const out = []

    if (!fs.existsSync(dir)) return out

    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            out.push(...listSfc(full, filter))
            continue
        }

        if (!entry.name.endsWith('.vue')) continue
        if (entry.name.endsWith('.story.vue')) continue
        if (!filter(full)) continue

        out.push(full)
    }

    return out
}

/**
 * Extrait les clés du littéral `__returned__` émis par
 * `compileScript` en mode non-inline.
 *
 * @param {string} content - code JS produit par `compileScript`
 * @returns {Set<string>} noms renvoyés par `setup()`
 */
function returnedKeys (content) {
    const match = content.match(/const __returned__ = \{([\s\S]*?)\}\nObject\.defineProperty\(__returned__/)

    if (!match) return null

    /** @type {Set<string>} */
    const keys = new Set()
    const body = match[1]

    // Découpe aux virgules de PREMIER niveau : un accesseur
    // `get x() { return x }` contient des accolades et, dans
    // d'autres formes, des virgules internes.
    let depth = 0
    let current = ''
    const parts = []

    for (const char of body) {
        if (char === '{' || char === '(' || char === '[') depth++
        if (char === '}' || char === ')' || char === ']') depth--

        if (char === ',' && depth === 0) {
            parts.push(current)
            current = ''
            continue
        }

        current += char
    }
    parts.push(current)

    for (const part of parts) {
        const name = part.trim().match(/^(?:get\s+|set\s+)?([A-Za-z_$][\w$]*)/)

        if (name) keys.add(name[1])
    }

    return keys
}

/**
 * Analyse un SFC et renvoie les symboles référencés par le
 * template via `$setup.` mais absents du retour de `setup()`.
 *
 * @param {string} file - chemin absolu du `.vue`
 * @returns {{ file: string, missing: string[], error?: string }}
 */
export function auditSfc (file) {
    const source = fs.readFileSync(file, 'utf-8')

    try {
        const {descriptor} = parse(source, {filename: file})

        if (!descriptor.scriptSetup || !descriptor.template) {
            return {file, missing: []}
        }

        const id = path.basename(file)
        const script = compileScript(descriptor, {id, inlineTemplate: false})
        const rendered = compileTemplate({
            source: descriptor.template.content,
            filename: file,
            id,
            compilerOptions: {
                bindingMetadata: script.bindings,
                prefixIdentifiers: true
            }
        })

        const exposed = returnedKeys(script.content)

        // Forme de sortie non reconnue : on le dit, plutôt que de
        // tout signaler (faux positifs) ou rien (faux négatifs).
        if (!exposed) return {file, missing: [], error: 'shape: no __returned__ literal found'}

        /** @type {Set<string>} */
        const missing = new Set()

        // Arme 1 — `$setup.X` : le compilateur a classé X comme binding
        // de `<script setup>`, mais `setup()` ne le renvoie pas.
        for (const m of rendered.code.matchAll(/\$setup\.([A-Za-z_$][\w$]*)/g)) {
            if (!exposed.has(m[1])) missing.add(m[1])
        }

        // Arme 2 — `_ctx.X` : le compilateur n'a RIEN trouvé qui porte ce
        // nom (ni binding de setup, ni prop). C'est la forme que prend le
        // patron décrit dans #734 — un import manquant. Les noms préfixés
        // `$` sont les API d'instance de Vue (`$slots`, `$attrs`, …) et
        // sont légitimes.
        for (const m of rendered.code.matchAll(/\b_ctx\.([A-Za-z_][\w$]*)/g)) {
            missing.add(m[1])
        }

        return {file, missing: [...missing].sort()}
    } catch (error) {
        return {file, missing: [], error: String(error?.message ?? error)}
    }
}

/*********************************************************
 * CLI
 *
 * @description
 * `node packages/ds/scripts/guards/lib/setup-template-exposure.mjs [racine]`
 * Racine par defaut : `packages/ds/src/components`. Passer
 * `packages/ds/dist/src/components` mesure ce que le
 * consommateur compile REELLEMENT (le site marketing lit le
 * dist, pas les sources).
 *
 * @description
 * Detecteur autonome, sur le modele de `setup-reads.mjs` :
 * il n'est PAS branche dans la suite `guards`, qui reste a
 * 21/21.
 ********************************************************/
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const root = path.resolve(process.argv[2] ?? 'packages/ds/src/components')
    const files = listSfc(root)
    let flagged = 0
    let errored = 0

    for (const file of files) {
        const res = auditSfc(file)

        if (res.error) {
            errored++
            console.log(`ERR   ${path.relative(root, file)} :: ${res.error}`)
            continue
        }

        if (res.missing.length) {
            flagged++
            console.log(`FAIL  ${path.relative(root, file)} :: ${res.missing.join(', ')}`)
        }
    }

    console.log('')
    console.log(`root=${root}`)
    console.log(`scanned=${files.length} flagged=${flagged} compile-errors=${errored}`)
}
