#!/usr/bin/env node
/*********************************************************
 * Harnais de mesure — C7 « Story + doc refletent-elles l'API vivante ? »
 *
 * @description
 * Le critere C7 du classeur d'inspection demande : chaque prop declaree
 * a-t-elle un controle dans la story ET une ligne dans le tableau Props de
 * la doc ? chaque emit a-t-il sa Variant `Events - {nom}` ? chaque slot sa
 * Variant `Slots - {Nom}` ? C'est exactement la liste « Pre-commit sanity »
 * de CLAUDE.md, section « Story + doc sync ».
 *
 * @description
 * ⛔ POURQUOI CE FICHIER EXISTE PLUTOT QU'UNE RELECTURE. La colonne C7 a
 * d'abord ete remplie par lecture humaine sur 216 composants. Remesuree
 * apres la campagne de correction, cette premiere passe s'est revelee
 * perimee a ~65 % : elle aurait peint en rouge une vingtaine de composants
 * deja repares. Une mesure qui vieillit sans prevenir coute autant qu'une
 * absence de mesure — d'ou une mesure REJOUABLE.
 *
 * @description
 * ⛔ CE N'EST PAS UN GARDE. Aucun `process.exit(1)`, aucune baseline, aucun
 * push bloque. Il mesure et rapporte.
 *
 * @description
 * REUTILISATION — rien n'est reecrit ici. La surface de props vient de
 * `declaredPropsFor` (`scripts/audit-unconsumed-props.mjs`), la meme
 * resolution d'`extends` / `Pick` / `Omit` que le garde `unconsumed-props`.
 * Les emits viennent de `guards/lib/emits.mjs` (`buildInterfaceIndex` +
 * `resolveDeclared`), partages avec `emits-completeness` et
 * `unemitted-declarations`. Le catalogue vient de
 * `guards/lib/components.mjs`.
 *
 * @description
 * ⛔ LIMITES CONNUES, a lire avant de croire un verdict.
 *
 * 1. `class` et `style` sont EXCLUS de l'exigence de controle et de ligne
 *    de doc. Ce sont des passe-plats d'attributs presents sur presque
 *    toutes les interfaces ; les exiger peindrait en rouge la quasi-
 *    totalite du catalogue pour une raison qui n'apprend rien.
 *
 * 2. Un controle est reconnu par `v-model="state.{prop}"` dans la story.
 *    Une story qui piloterait une prop autrement (valeur figee dans le
 *    `#default`, prop passee en dur) est comptee comme SANS controle —
 *    c'est le verdict voulu : la story ne permet alors pas d'exercer la
 *    prop.
 *
 * 3. Une ligne de doc est reconnue par une ligne de tableau markdown
 *    commencant par `` | `{prop}` ``. Une doc qui citerait la prop en
 *    prose sans l'inscrire au tableau est comptee comme absente.
 *
 * 4. ⛔ LE CANAL « controle MENTEUR » N'EST PAS MESURE, volontairement.
 *    Reperer un `state.{cle}` absent de la surface de props semble mesurer
 *    « la story expose un controle qui ne pilote rien ». En pratique le
 *    signal est indistinguable d'un usage legitime : la story de `Btn`
 *    porte `state.progress` et `state.circularSize` pour piloter le
 *    `<origam-progress>` de sa demo, pas `Btn`. Sans lire le template pour
 *    savoir A QUEL composant chaque cle est liee, tout verdict ici est un
 *    tirage au sort. Un canal qu'on sait faux ne se publie pas.
 *
 * 5. ⛔ LE CANAL « Variant emit MENTEUSE » N'EST PAS MESURE NON PLUS, pour
 *    une raison mesuree et non supposee. Un `Events - focus` sur une story
 *    dont le composant ne DECLARE pas `focus` semble etre un mensonge. Il
 *    n'en est pas un : aucun composant du DS ne pose `inheritAttrs: false`,
 *    et la racine de la plupart est un AUTRE composant (`origam-input`,
 *    `origam-text-field`, `origam-menu`) ou un `<component :is>`. Un
 *    listener non declare tombe dans `$attrs` et RETOMBE sur cette racine,
 *    en cascade, jusqu'a un element natif ou un composant qui, lui, emet.
 *    Verifie au runtime, les deux mecanismes, dans
 *    `packages/tests/TU/probe/fallthrough-emits.spec.ts` :
 *      - `focus` / `blur` poses sur `<origam-text-field>` — non declares —
 *        partent bien quand l'`<input>` interne prend le focus ;
 *      - `click:clear` pose sur `<origam-date-picker-field>` — non declare —
 *        part bien quand le `<origam-text-field>` interne l'emet.
 *    Sur les 14 composants que ce canal accusait, 11 relevaient du premier
 *    cas et les 5 `click:*` de `DatePickerField` du second. Statuer
 *    demanderait de resoudre une chaine de racines dont une partie est
 *    dynamique (`<component :is="tag">`, `<teleport>`). Meme conclusion
 *    qu'au point 4 : un canal qu'on sait faux ne se publie pas.
 *
 * 6. Les slots sont lus sur l'interface `IXxxSlots` passee a
 *    `defineSlots`. Un composant qui documente en commentaire pourquoi il
 *    n'appelle pas `defineSlots` (cf. `OrigamContextualMenu`) n'a donc
 *    aucun slot exige — le scan retire les commentaires avant de chercher
 *    la macro, comme `define-macros-scan.mjs`.
 *
 * Run:
 *   node packages/ds/scripts/analysis/c7-story-doc-sync.mjs          # resume
 *   node packages/ds/scripts/analysis/c7-story-doc-sync.mjs csv      # une ligne par composant
 *   node packages/ds/scripts/analysis/c7-story-doc-sync.mjs json     # detail complet
 ********************************************************/

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getRealComponents, DS_ROOT } from '../guards/lib/components.mjs'
import { buildInterfaceIndex, resolveDeclared } from '../guards/lib/emits.mjs'
import { declaredPropsFor } from '../audit-unconsumed-props.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(DS_ROOT, '..', '..')
const STORIES_DIR = path.join(REPO, 'packages/stories/components/stories')
const DOCS_DIR = path.join(REPO, 'packages/docs/components')

/** Props presentes partout et qui n'apprennent rien — cf. limite 1. */
const IGNORED_PROPS = new Set(['class', 'style'])

/*********************************************************
 * stripComments
 *
 * @description
 * Une seule passe, sur une copie en memoire. Meme precaution que
 * `define-macros-scan.mjs` : un `grep` compte les MENTIONS, pas les appels,
 * et un commentaire qui cite `defineSlots` suffit a fausser le verdict.
 ********************************************************/
function stripComments (src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/** Chemins story / doc d'un composant, indexes par nom de fichier. */
function indexByBasename (root, suffix) {
    const out = new Map()
    if (!existsSync(root)) return out
    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            const full = path.join(dir, entry)
            if (statSync(full).isDirectory()) walk(full)
            else if (entry.endsWith(suffix)) out.set(entry.slice(0, -suffix.length), full)
        }
    }
    walk(root)
    return out
}

/*********************************************************
 * slotNameToVariantTitle
 *
 * @description
 * La convention de titre est `Slots - {Nom}` avec le nom en PascalCase :
 * `prepend` donne `Prepend`, `group-header` donne `GroupHeader`,
 * `item.name` donne `Item.name` — ce dernier cas n'existe pas comme slot
 * declare (les slots dynamiques ne sont pas des membres d'interface), il
 * est traite comme les autres sans cas particulier.
 ********************************************************/
function slotNameToVariantTitle (name) {
    return name
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
}

/*********************************************************
 * normaliseTitle
 *
 * @description
 * La convention `Slots - {Nom}` en PascalCase n'est pas observee
 * uniformement : le catalogue porte `Slots - metadata`, `Slots - Legend-item`,
 * `Slots - legend-item` et `Slots - Legend-Item` pour la meme famille. Ces
 * ecarts sont une inconsistance de redaction, PAS une story qui decrit un
 * slot inexistant — les confondre fabrique un rouge la ou il n'y a rien a
 * corriger.
 *
 * @description
 * La comparaison se fait donc sur une forme reduite : minuscules, sans
 * separateur. `Legend-item`, `legend_item` et `LegendItem` se rejoignent.
 ********************************************************/
function normaliseTitle (name) {
    /*********************************************************
     * Une parenthese finale est une ANNOTATION, pas le nom
     *
     * @description
     * `Slots - Dropzone (scoped)` et `Slots - Key (KV mode)` nomment les
     * slots `dropzone` et `key` ; la parenthese dit au lecteur dans quel
     * mode le slot s'applique. La comparer au nom declare accusait la story
     * de decrire un slot inexistant alors qu'elle documentait le bon.
     ********************************************************/
    return name.replace(/\s*\([^)]*\)\s*$/, '').toLowerCase().replace(/[-_.\s]/g, '')
}

/*********************************************************
 * splitVariantTitle
 *
 * @description
 * Une Variant couvre parfois deux evenements a la fois — `Events - focus &
 * blur`, `Events - drill / drill-up`. Comparer la chaine entiere a la liste
 * des emits declares la donne toujours pour inconnue. On separe donc sur
 * `/`, `&` et `,` avant de confronter chaque nom.
 ********************************************************/
function splitVariantTitle (title) {
    return title.split(/[/&,]/).map((part) => part.trim()).filter(Boolean)
}

/*********************************************************
 * buildOpenInterfaceSet — interfaces a signature d'index
 *
 * @description
 * `IChartSlots` s'ecrit `{ [name: string]: ((props: any) => any) | undefined }`.
 * Elle ne declare AUCUN membre nomme et accepte n'importe quel nom : une
 * story qui expose `Slots - Tooltip` n'y ment pas, elle utilise ce que
 * l'interface autorise. Sans cette distinction le detecteur accusait les
 * quatre Variants de `Chart` d'etre fictives.
 *
 * @description
 * Rend l'ensemble des noms d'interfaces ouvertes, `extends` compris — une
 * interface qui herite d'une interface ouverte l'est aussi.
 *
 * @description
 * La cle d'index peut etre un TEMPLATE LITTERAL et pas seulement `string` :
 * `IDataTableHeaderCellSlots` s'ecrit
 * `{ [key: \`header.${string}\`]: … }`. L'interface est ouverte sur cette
 * famille de noms, donc un Variant `Slots - Header` n'y ment pas.
 ********************************************************/
function buildOpenInterfaceSet () {
    const direct = new Map()
    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            const full = path.join(dir, entry)
            if (statSync(full).isDirectory()) { walk(full); continue }
            if (!entry.endsWith('.ts')) continue
            const src = readFileSync(full, 'utf8')
            const re = /interface\s+([A-Za-z0-9_]+)\s*(?:<[^{]*?>)?(?:\s*extends\s+([^{]+))?\s*\{/g
            for (let m = re.exec(src); m; m = re.exec(src)) {
                const body = extractBraceBody(src, re.lastIndex - 1)
                direct.set(m[1], {
                    open: /\[[A-Za-z0-9_]+\s*:\s*(?:string|number|`[^`]*\$\{[^}]*\}[^`]*`)\s*\]\s*:/.test(body),
                    parents: (m[2] ?? '').split(',').map((p) => p.trim().replace(/<.*/, '')).filter(Boolean)
                })
            }
        }
    }
    walk(path.join(DS_ROOT, 'src/interfaces'))

    const out = new Set()
    const isOpen = (name, seen = new Set()) => {
        if (seen.has(name) || !direct.has(name)) return false
        seen.add(name)
        const entry = direct.get(name)
        return entry.open || entry.parents.some((p) => isOpen(p, seen))
    }
    for (const name of direct.keys()) if (isOpen(name)) out.add(name)
    return out
}

/** Corps `{…}` equilibre a partir de l'accolade ouvrante a `open`. */
function extractBraceBody (src, open) {
    let depth = 0
    for (let i = open; i < src.length; i++) {
        if (src[i] === '{') depth++
        else if (src[i] === '}' && --depth === 0) return src.slice(open + 1, i)
    }
    return ''
}

/*********************************************************
 * docPropRowNames
 *
 * @description
 * Les noms de la premiere colonne des tableaux situes sous un titre
 * « Props ». La restriction a cette section est ce qui evite d'accuser une
 * doc de mentir : le meme fichier porte aussi des tableaux d'emits, de
 * slots, de variables CSS et de retours de composable, dont les lignes ne
 * sont PAS des props et ne doivent pas etre confrontees a la surface de
 * props.
 *
 * @description
 * Un nom retenu doit ressembler a un identifiant JS (`^[a-z][A-Za-z0-9]*$`).
 * Ecarte au passage les lignes `--origam-…` et les cellules de prose.
 *
 * @description
 * ⛔ Une section « Props » contient d'autres tableaux que le tableau de
 * props. Deux formes, mesurees, produisaient chacune une fausse accusation :
 *
 *   - un tableau de VALEURS d'une prop. `OrigamListItem.md` porte
 *     ``### Props — `size`: the row-height scale`` suivi de
 *     `| `size` | Row height | Block padding | Notes |`, dont les lignes
 *     sont `small` / `default` / `large` — des valeurs, pas des noms de
 *     props. Sa premiere cellule d'entete n'est pas `Prop`.
 *   - un tableau de props RETIREES. `OrigamDataTableRows.md` documente
 *     `| Prop | Why it is gone |` : `tag` y est cite precisement parce
 *     qu'il n'existe plus. L'entete commence bien par `Prop`, mais le
 *     tableau n'a que DEUX colonnes la ou le tableau de props canonique en
 *     a au moins trois (`Prop | Type | Default | Description`).
 *
 * D'ou la double condition : premiere cellule d'entete nommant la colonne
 * des props (`Prop` / `Property` / `Name` / `Nom`, 384 des tableaux du
 * dossier), ET au moins trois colonnes.
 ********************************************************/
const DOC_PROP_HEADER = /^(props?|propert(?:y|ies)|names?|noms?|propriet(?:e|es|é|és))$/i

function docPropRowNames (doc, artifactName) {
    const names = []
    let inProps = false
    let inPropsTable = false
    for (const line of doc.split('\n')) {
        const heading = /^(#{2,4})\s+(.*)$/.exec(line)
        if (heading) {
            inPropsTable = false
            /*********************************************************
             * Un titre de props peut adresser un composant VOISIN.
             *
             * @description
             * `## Props — OrigamGridItem`, `## Props — OrigamTimelineItem`
             * et ``### `<OrigamItemGroupItem>` props`` matchent tous
             * `/props/i` : sans ce filtre, les props de l'ENFANT sont
             * imputees au parent et la doc est accusee de decrire une API
             * qui n'existe pas. C'etait 3 des 6 accusations du canal.
             * Un titre qui nomme un `Origam*` different du composant courant
             * ferme donc la section au lieu de l'ouvrir.
             ********************************************************/
            const named = heading[2].match(/Origam[A-Za-z0-9]+/g) ?? []
            inProps = /props/i.test(heading[2])
                && (named.length === 0 || named.includes(artifactName))
            continue
        }
        if (!inProps) continue
        if (!line.startsWith('|')) continue

        const cells = line.slice(1).split('|')
        if (cells.length && cells[cells.length - 1].trim() === '') cells.pop()
        const first = (cells[0] ?? '').trim()

        if (/^:?-{2,}:?$/.test(first)) continue

        if (!first.startsWith('`')) {
            inPropsTable = DOC_PROP_HEADER.test(first) && cells.length >= 3
            continue
        }

        if (!inPropsTable) continue

        const cell = /^`([^`]+)`$/.exec(first)
        if (cell && /^[a-z][A-Za-z0-9]*$/.test(cell[1])) names.push(cell[1])
    }
    return names
}

function analyse () {
    const emitsIndex = buildInterfaceIndex()
    const openInterfaces = buildOpenInterfaceSet()
    const stories = indexByBasename(STORIES_DIR, '.story.vue')
    const docs = indexByBasename(DOCS_DIR, '.md')

    const rows = []

    for (const cmp of getRealComponents()) {
        const src = readFileSync(cmp.file, 'utf8')
        const clean = stripComments(src)

        const propsIface = /defineProps\s*<\s*([A-Za-z0-9_]+)\s*>/.exec(clean)?.[1] ?? null
        const emitsIface = /defineEmits\s*<\s*([A-Za-z0-9_]+)\s*>/.exec(clean)?.[1] ?? null
        const slotsIface = /defineSlots\s*<\s*([A-Za-z0-9_]+)\s*>/.exec(clean)?.[1] ?? null

        const propsMap = propsIface ? declaredPropsFor(propsIface) : new Map()
        const props = [...propsMap.keys()].filter((p) => !IGNORED_PROPS.has(p))
        const ownProps = props.filter((p) => propsMap.get(p) === propsIface)
        const emits = emitsIface ? [...resolveDeclared(emitsIface, emitsIndex)] : []
        const slots = slotsIface ? [...declaredPropsFor(slotsIface).keys()] : []

        const artifactName = `Origam${cmp.pascalName}`
        const storyFile = stories.get(artifactName) ?? null
        const docFile = docs.get(artifactName) ?? null
        const story = storyFile ? readFileSync(storyFile, 'utf8') : ''
        const doc = docFile ? readFileSync(docFile, 'utf8') : ''

        const missing = {
            storyFile: !storyFile,
            docFile: !docFile,
            controls: [],
            docRows: [],
            eventVariants: [],
            slotVariants: []
        }

        /*********************************************************
         * Direction MENSONGE — la story ou la doc decrit une API qui
         * n'existe pas. C'est la moitie du critere que le classeur nomme
         * « doc MENSONGERE », par opposition a « doc ABSENTE ».
         ********************************************************/
        const lying = { controls: [], docRows: [], slotVariants: [] }

        const propSet = new Set(props)
        const slotTitleSet = new Set(slots.map(normaliseTitle))

        if (storyFile) {
            for (const prop of ownProps) {
                if (!story.includes(`state.${prop}"`) && !story.includes(`state.${prop}'`)) {
                    missing.controls.push(prop)
                }
            }
            for (const emit of emits) {
                if (!story.includes(`Events - ${emit}`)) missing.eventVariants.push(emit)
            }
            for (const slot of slots) {
                if (!story.includes(`Slots - ${slotNameToVariantTitle(slot)}`)) {
                    missing.slotVariants.push(slot)
                }
            }

            if (!openInterfaces.has(slotsIface)) {
                for (const m of story.matchAll(/title="Slots - ([^"]+)"/g)) {
                    for (const part of splitVariantTitle(m[1])) {
                        if (!slotTitleSet.has(normaliseTitle(part)) && !lying.slotVariants.includes(part)) {
                            lying.slotVariants.push(part)
                        }
                    }
                }
            }
        }

        if (docFile) {
            for (const prop of ownProps) {
                if (!new RegExp(`^\\|\\s*\`${prop}\`\\s*\\|`, 'm').test(doc)) missing.docRows.push(prop)
            }
            for (const name of docPropRowNames(doc, artifactName)) {
                if (IGNORED_PROPS.has(name)) continue
                if (!propSet.has(name) && !lying.docRows.includes(name)) lying.docRows.push(name)
            }
        }

        const anyMissing = missing.storyFile || missing.docFile
            || missing.controls.length > 0 || missing.docRows.length > 0
            || missing.eventVariants.length > 0 || missing.slotVariants.length > 0
        const anyLying = lying.controls.length > 0 || lying.docRows.length > 0
            || lying.slotVariants.length > 0
        const defect = anyMissing || anyLying

        rows.push({
            name: artifactName,
            verdict: defect ? 'defaut' : 'conforme',
            counts: {
                props: props.length,
                ownProps: ownProps.length,
                emits: emits.length,
                slots: slots.length
            },
            missing,
            lying
        })
    }

    return rows
}

function reason (row) {
    const { missing: m, lying: l } = row
    const bits = []
    if (m.storyFile) bits.push('story absente')
    if (m.docFile) bits.push('doc absente')
    if (m.controls.length) bits.push(`${m.controls.length} prop(s) propre(s) sans controle`)
    if (m.docRows.length) bits.push(`${m.docRows.length} prop(s) propre(s) sans ligne de doc`)
    if (m.eventVariants.length) bits.push(`${m.eventVariants.length} emit(s) sans Variant`)
    if (m.slotVariants.length) bits.push(`${m.slotVariants.length} slot(s) sans Variant`)
    if (l.controls.length) bits.push(`controle MENTEUR: ${l.controls.join('/')}`)
    if (l.docRows.length) bits.push(`ligne de doc MENTEUSE: ${l.docRows.join('/')}`)
    if (l.slotVariants.length) bits.push(`Variant slot MENTEUSE: ${l.slotVariants.join('/')}`)
    return bits.join(', ')
}

const rows = analyse()
const mode = process.argv[2]

if (mode === 'json') {
    console.log(JSON.stringify(rows, null, 2))
} else if (mode === 'csv') {
    console.log('composant,verdict,raison')
    for (const row of rows) console.log(`${row.name},${row.verdict},"${reason(row)}"`)
} else {
    const conforme = rows.filter((r) => r.verdict === 'conforme').length
    console.log('C7 — story + doc refletent-elles l\'API vivante ? (mesure, ne bloque rien)')
    console.log(`  ${rows.length} composants — ${conforme} conforme, ${rows.length - conforme} defaut`)

    const tally = (pick) => {
        const out = new Map()
        for (const row of rows) {
            for (const [key, val] of Object.entries(pick(row))) {
                const hit = Array.isArray(val) ? val.length > 0 : val
                if (hit) out.set(key, (out.get(key) ?? 0) + 1)
            }
        }
        return [...out].sort((a, b) => b[1] - a[1])
    }

    console.log('\n  ABSENT — l\'API vivante n\'est pas couverte')
    for (const [key, n] of tally((r) => r.missing)) {
        console.log(`    ${key.padEnd(14)} ${n} composant(s)`)
    }

    console.log('\n  MENSONGER — story/doc decrit une API qui n\'existe pas')
    const lies = tally((r) => r.lying)
    if (!lies.length) console.log('    aucun')
    for (const [key, n] of lies) console.log(`    ${key.padEnd(14)} ${n} composant(s)`)
}
