#!/usr/bin/env node
/*
 * Guard 15 — id-forwarding: a `useStyle(...)`-generated `id` must not
 * silently shadow the `id` PROP of the same name.
 *
 * BACKGROUND (#381) — full mechanism writeup lives in `lib/id-forwarding.mjs`.
 * 16 components destructured `const {id, ...} = useStyle(xxxStyles)` WITHOUT
 * the `() => props.id` second argument that makes a consumer-supplied id
 * win over the generated one (documented on `useStyle` itself). The
 * template's `:id="id"` then rendered the GENERATED identifier
 * (`origam-xxx-0`) instead of the consumer's — every time, silently, no
 * type error, no runtime warning.
 *
 * SCOPE — this guard catches ONE of the four #381/#421 mechanisms (the
 * majority: 16 of ~20 real occurrences measured). It is a STATIC AST guard,
 * same architecture as every other guard in this suite (fast, no component
 * mounting) — the same split as guard 5 (`unconsumed-props.mjs`, static +
 * `audit:inert-props` runtime sweep in packages/tests). The other three
 * mechanisms — `filterProps` excluding `id` from what reaches a child that
 * needs it, a scoped-slot variable renamed specifically to dodge THIS
 * guard's pattern but still misbound, and a real control with NO `:id`
 * binding at all — have no textual `:id="id"` shape to detect; they were
 * found and fixed by mounting each of `OrigamInput`'s direct consumers and
 * reading the rendered `id` attribute (#421). A component passing this
 * guard is NOT proof its consumer id reaches every real control — only
 * that THIS specific homonym-shadowing shape is absent.
 *
 * ⛔ SECOND VOLET — L'ABSENCE TOTALE DE BINDING (#633)
 * -----------------------------------------------------
 * Le paragraphe SCOPE ci-dessus ecartait « a real control with NO `:id`
 * binding at all » comme indetectable statiquement. C'etait vrai de la forme
 * textuelle `:id="id"`, pas du fait lui-meme : on peut decider si UN canal
 * quelconque porte l'id du consommateur jusqu'a un noeud rendu. C'est ce que
 * fait `lib/id-reach.mjs`, dont l'en-tete detaille les cinq canaux credites.
 *
 * Le cas revelateur, `OrigamConfirmWrapper`, est corrige (#632, `21cb0792`) —
 * son message de commit signalait deja l'angle mort mot pour mot.
 *
 * AMPLEUR MESUREE (2026-09-16)
 * `origin/develop` @ 5b5818668 — remesuree a l'identique apres six merges.
 * ---------------------------------------------------------------------
 * Le chiffre n'etait pas dans le ticket. Il est de TROIS, et il n'a pas ete
 * obtenu en lisant le code :
 *
 *   - Le compagnon runtime `pnpm -F @origam/tests audit:id-forwarding` monte
 *     chaque composant declarant `id` et annonce 193 composants, `lost 0`.
 *   - ⛔ CE ZERO EST FAUX. Son verdict « descendant » est
 *     `html.includes(SENTINEL)` — un test de SOUS-CHAINE, que toute
 *     DERIVATION satisfait : `origam-snackbar-group-<sentinelle>` contient la
 *     sentinelle. Rejoue avec une comparaison EXACTE d'attribut `id`, le meme
 *     balayage donne : root 154, descendant 33, **lost 5**.
 *   - Les 5 : `OrigamInput`, `OrigamOtpInputField`, `OrigamSnackbarGroup`,
 *     `OrigamRatingField`, `OrigamDataTableHeadersCell`.
 *
 * Ce garde en attrape 3, et les deux ecarts sont expliques, pas ignores :
 *   - `OrigamRatingField` transmet CORRECTEMENT `:id="id"` a son
 *     `<origam-input>` ; la perte est entierement celle d'`OrigamInput`. Le
 *     verdict statique est le bon, le « lost » runtime est une consequence.
 *   - `OrigamDataTableHeadersCell` ecrit
 *     `props.id ? \`${props.id}-row-${i}\` : undefined` : la CONDITION du
 *     ternaire lit `props.id`, donc le test « une reference survit-elle au
 *     masquage des gabarits ? » le classe pass-through au lieu de derive.
 *     Faux NEGATIF connu, assume : le biais du garde est qu'un faux positif
 *     bloque une PR innocente, un faux negatif ne rate que de la dette.
 *
 * ⛔ LES 2 ENTREES DE BASELINE RESTANTES SONT DES LIMITES DE L'INSTRUMENT,
 * PAS DES DEFAUTS. La version precedente de ce bloc affirmait l'inverse
 * (« LES 3 ENTREES SONT DE VRAIS DEFAUTS ») ; #790 a remonte chacune au
 * montage, attribut lu en EGALITE, et cette affirmation ne survit a la
 * mesure que pour UNE des trois. Le garde est statique : il lit la forme du
 * binding sur la RACINE. Deux mecanismes legitimes lui echappent par
 * construction — un id remis a un slot, et une prop `id` qui n'est pas un
 * id DOM.
 *
 *   - `Input:no-id-reach` — ⚠️ NON-DEFAUT, decision explicite de #421.
 *     La racine porte bien `origam-input-v-<n>` (son propre id de style),
 *     mais l'id du consommateur est remis au slot `#default`
 *     (`inputProps.id`) pour que le CONTROLE REEL le porte — la cible que
 *     vise un `<label for>`. Le poser AUSSI sur la racine peindrait la meme
 *     valeur sur deux noeuds. Mesure #790, `OrigamInput` monte AVEC un slot
 *     par defaut : `slotProps.id === 'mon-champ'`, `<input id="mon-champ">`,
 *     porteur EXACT et labelable ; la regle `#origam-input-v-0` n'est pas
 *     orpheline. Les 11 champs batis dessus (TextField, TextareaField,
 *     Checkbox, Radio, Switch, NumberField, PasswordField, FileField,
 *     SliderField, CheckboxGroup, RadioGroup) portent tous l'id EXACT.
 *     Le garde le voit « perdu » parce qu'un slot n'a pas de forme statique.
 *
 *   - `SnackbarGroup:no-id-reach` — ⚠️ NON-DEFAUT : `props.id` n'est PAS un
 *     id DOM ici, c'est la cle logique de la pile (`useSnackbarGroup({id})`,
 *     defaut `'default'`), partagee par tous les appels qui poussent dans la
 *     meme file. La racine porte `origam-snackbar-group-${props.id}` — un
 *     prefixage VOULU, sans quoi une cle comme `default` deviendrait un id
 *     DOM colisionnant. Le garde lit toute prop nommee `id` comme un id DOM.
 *
 * `OtpInputField:no-id-reach` est SORTI de la baseline : corrige par #790
 * (racine `:id="styleId"` + `useStyle(styles, () => props.id)`). C'etait la
 * seule des trois a etre un vrai defaut, et il etait double — l'id perdu ET
 * la regle `#origam-otp-input-field-<uid>` orpheline, donc un style mort.
 *
 * Run: `node packages/ds/scripts/guards/id-forwarding.mjs`
 *      `node packages/ds/scripts/guards/id-forwarding.mjs --update-baseline`
 *      (or `pnpm -F origam guards:id-forwarding`)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSource } from './lib/id-forwarding.mjs'
import { analyseIdReach } from './lib/id-reach.mjs'
import { runFixtures } from './lib/id-reach.selftest.mjs'
import { declaredPropsFor } from '../audit-unconsumed-props.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/id-forwarding.json')

const DEFINE_PROPS = /defineProps\s*<\s*([A-Za-z0-9_]+)\s*>/

function run () {
    /*
     * ⛔ AUTO-TEST D'ABORD, comme `class-fallthrough.mjs` (#620) et
     * `unconsumed-props.mjs`. Ce garde a porte une baseline VIDE pendant des
     * mois : son etat nominal EST « 0 ». Un detecteur devenu aveugle
     * imprimerait exactement le meme `PASS`. Les fixtures sont donc sur le
     * chemin bloquant, pas a cote.
     */
    const self = runFixtures({ silent: true })
    if (self.failures) {
        console.log('─'.repeat(70))
        console.log('Guard: id-forwarding — AUTO-TEST EN ECHEC, balayage non effectue')
        console.log('─'.repeat(70))
        console.log(`⛔ ${self.failures}/${self.total} fixture(s) du detecteur echouent.`)
        console.log('   Son verdict sur le catalogue ne vaut rien tant que ces temoins')
        console.log('   ne repassent pas.')
        console.log('   Detail : node packages/ds/scripts/guards/lib/id-reach.selftest.mjs')
        console.log('─'.repeat(70))
        process.exit(1)
    }

    const violations = new Map()
    let declaresIdCount = 0
    let undecidableIface = 0

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const { findings } = analyseSource(raw, path.basename(file))

        for (const f of findings) {
            const id = `${pascalName}:${f.line}`
            violations.set(
                id,
                `Origam${pascalName} (${path.relative(REPO_ROOT, file)}:${f.line}) — :id="id" resout l'id GENERE par useStyle (ligne ${f.useStyleLine}), pas la prop id du consommateur. Corriger : useStyle(xxxStyles, () => props.id).`
            )
        }

        /*
         * SECOND VOLET (#633) — la moitie symetrique : aucune racine, aucun
         * descendant, aucun transfert en bloc ne porte l'id du consommateur.
         * Aucun masquage, donc rien pour le volet ci-dessus a voir, et le
         * resultat est identique pour l'integrateur.
         */
        const m = DEFINE_PROPS.exec(raw)
        if (!m) continue
        let declared
        try {
            declared = declaredPropsFor(m[1])
        } catch {
            undecidableIface++
            continue
        }
        if (!declared || !declared.has('id')) continue
        declaresIdCount++

        const reach = analyseIdReach(raw, true, path.basename(file))
        if (!reach.violates) continue
        violations.set(
            `${pascalName}:no-id-reach`,
            `Origam${pascalName} (${path.relative(REPO_ROOT, file)}) — la prop \`id\` est declaree mais n'atteint AUCUN noeud rendu : ${reach.detail}`
        )
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'id-forwarding (la prop id doit atteindre le DOM, et ne pas etre masquee par useStyle())',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        coverageNote: `${declaresIdCount} composant(s) declarent une prop id et sont juges sur l'atteinte; ${undecidableIface} interface(s) non resolvables, non jugees. Le volet « masquage useStyle » balaie tout le catalogue.`,
        fixHint: 'Deux defauts distincts sous le meme garde.\n'
            + '  MASQUAGE — passer () => props.id en second argument de useStyle(...) (cf. le JSDoc de style.composable.ts). Si un `id` local existe deja pour eviter la collision, renommer la destructuration useStyle en `{id: styleId}`.\n'
            + '  NON-ATTEINTE (#633) — binder l\'id du consommateur sur un noeud rendu : la racine, ou le controle reel (un champ le pose sur son <input>, cible du <label for>). Une valeur DERIVEE (`${id}-messages`) ne compte pas : rien ne repond a document.getElementById(id). Un id GENERE par useStyle() sans 2e argument non plus.\n'
            + 'Verifier au runtime, pas en lisant : pnpm -F @origam/tests audit:id-forwarding (⚠️ son verdict « descendant » repose sur html.includes(), donc il credite une derivation — voir #633).'
    })
    process.exit(exitCode)
}

run()
