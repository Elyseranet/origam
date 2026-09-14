#!/usr/bin/env node
/*********************************************************
 * Guard 21 — prop-shadowing (#665, #666, #693)
 *
 * @description
 * En `<script setup>`, Vue expose les props au template par leur NOM NU.
 * Une liaison de portee module portant le meme nom masque la prop, et
 * RIEN n'avertit : ni le compilateur Vue, ni `vue-tsc`, ni ESLint. Le
 * catalogue a paye ce patron TROIS fois — #622 (OrigamSelect, PR #656),
 * puis #665 / #666 (ColorPickerField, DatePickerField, PR #692) : un
 * `const label` masquait `IFieldProps.label`, si bien que
 * `:aria-label="t(label)"` annoncait « Ouvrir » / « Open » sur TOUS ces
 * champs, quel que soit leur `label`. Un `aria-label` sur un `<input>`
 * ecrase le `<label for>` visible : le nom accessible etait faux a
 * l'echelle du catalogue.
 *
 * @description
 * ⛔ CE GARDE NE LEVE PAS TOUT MASQUAGE, ET C'EST DELIBERE. Le balayage
 * brut sort 66 couples (composant, prop) ou un local de portee module
 * masque une prop lue en nom nu — dont 49 sont des DERIVATIONS
 * deliberees et correctes (`const placeholder = computed(() => … :
 * props.placeholder)`). Un garde qui hurle sur 49 faux positifs est
 * desactive dans la semaine et n'a servi a rien. Seules deux formes,
 * dont la nocivite est structurellement demontrable, sont levees :
 *
 *   REGLE A — « prop morte » : la prop n'est lue NULLE PART dans le
 *   script (ni `props.X`, ni creditee par `useX(props, 'X')`). Elle est
 *   inatteignable : un consommateur qui la passe ne peut rien changer.
 *
 *   REGLE B — « nom accessible masque » : le template injecte le nom nu
 *   dans un attribut de TEXTE destine a l'utilisateur (`aria-label`,
 *   `title`, `placeholder`, `alt`, …) et le local ne porte pas la valeur
 *   de la prop.
 *
 * Le detail des deux regles, et la raison de chaque exclusion, vivent
 * dans `lib/prop-shadowing.mjs`. Les deux directions sont epinglees par
 * `lib/prop-shadowing.selftest.mjs` (6 temoins positifs, 8 negatifs),
 * lui-meme verifie par mutation : reintroduire l'un des bugs de rappel
 * historiques rend la selftest rouge.
 *
 * @description
 * ⛔ CE QUE CE GARDE NE SAIT PAS VOIR — a lire avant de lui faire dire
 * plus qu'il ne dit :
 *
 *   1. **L'intention.** Un masquage volontaire et un masquage nuisible
 *      ont la MEME forme syntaxique. `OrigamListGroup` lit sciemment
 *      l'identifiant genere de son activateur dans
 *      `:aria-labelledby="id"` pendant que `props.id` part vers
 *      `useStyle(...)` : c'est correct. Il n'est hors de portee du garde
 *      que parce qu'`aria-labelledby` prend un IDREF et non du texte —
 *      une heuristique, pas une preuve d'intention. Un futur masquage
 *      volontaire sur un attribut de texte sera un FAUX POSITIF ; sa
 *      place est alors la baseline, avec la raison ecrite.
 *
 *   2. **Les props reconstituees dynamiquement.** `props[key]` dans une
 *      boucle, un acces via cast TS, ou un `filterProps(props, …)` qui
 *      reexporte tout : la regle A peut declarer « jamais lue » une prop
 *      atteinte par un chemin qu'aucun `props.X` litteral ne revele.
 *      C'est la meme limite que `unconsumed-props`, et pour la meme
 *      raison.
 *
 *   3. **Les composants sans `defineProps<IXxx>()` explicite.** La
 *      resolution passe par `declaredPropsFor()` ; un composant qui
 *      declare ses props autrement (objet runtime, generique) n'est pas
 *      analyse du tout — silencieusement.
 *
 *   4. **Le masquage par import.** Un identifiant importe en haut du
 *      module (`import { label } from …`) masque lui aussi la prop ;
 *      seules les declarations `const` / `let` / `var` / `function` de
 *      profondeur 0 sont examinees.
 *
 *   5. **Les portees intermediaires.** Un `const label` dans un bloc
 *      `{ … }` de profondeur 0 n'est pas vu — volontaire, il ne peut pas
 *      atteindre le template, mais c'est une hypothese sur la sortie du
 *      compilateur, pas une mesure.
 *
 * @description
 * ⛔ RAPPORT AU GARDE 15 (`id-forwarding.mjs`) — ce n'est PAS un doublon,
 * et les deux doivent rester. Le garde 15 traite UN cas particulier de
 * cette famille (`const {id} = useStyle(xxxStyles)` sans second argument
 * `() => props.id`, masquant `:id="id"`) avec une connaissance precise de
 * `useStyle` que ce garde-ci n'a pas : il sait distinguer l'appel a deux
 * arguments de l'appel a un seul. Ce garde-ci, lui, ne regarde que la
 * forme syntaxique du masquage et laisserait passer exactement ce cas —
 * verifie : `id` n'apparait dans aucune de ses 4 entrees. Inversement, le
 * garde 15 ne voit que `id` et que `useStyle`. Les deux couvertures se
 * recoupent en intention, jamais en portee.
 *
 * Run: `node packages/ds/scripts/guards/prop-shadowing.mjs`
 *      `node packages/ds/scripts/guards/prop-shadowing.mjs --update-baseline`
 *      `node packages/ds/scripts/guards/lib/prop-shadowing.selftest.mjs`
 ********************************************************/

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseComponents } from './lib/prop-shadowing.mjs'
import { runFixtures } from './lib/prop-shadowing.selftest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, 'baseline/prop-shadowing.json')

/*********************************************************
 * Les 4 entrees baselinees sont de vrais defauts, pas de la dette
 * anonyme — chacune a son ticket (#693)
 *
 * @description
 * ⛔ AUCUNE de ces 4 entrees n'est un faux positif. Elles sont
 * baselinees parce que leur correction appartient a un autre lot, PAS
 * parce qu'elles seraient tolerables.
 *
 * `OrigamSelect` / `OrigamColorPickerField` / `OrigamDatePickerField`
 * — `validationValue`. Les trois portent
 * `const validationValue = computed(() => model.value)`, qui masque
 * `IValidationProps.validationValue`, lue en nom nu par
 * `:validation-value="validationValue"`. MESURE : `props.
 * validationValue` n'apparait dans AUCUN des trois scripts. La seule
 * occurrence de la chaine est une liste d'EXCLUSION
 * (`filterProps(props, [… 'validationValue' …])`), qui prouve l'inverse
 * d'une lecture. La prop est donc structurellement inatteignable : un
 * consommateur qui la passe ne change rien. Suivi en **#693**, confie a
 * un autre dev.
 *
 * `OrigamDatePicker` — `text`. Meme forme, trouvee par ce garde et non
 * par un humain : `const text = computed(() => adapter.format(date,
 * 'monthAndYear'))` masque `text`, declaree via
 * `Omit<IDatePickerControlsProps, 'active'>` (d'ou l'interet de resoudre
 * les chaines `extends` pour de vrai — un resolveur naif qui tronque a
 * `Omit` rate cette prop). `props.text` n'est lu nulle part, et `text`
 * figure lui aussi dans la liste d'exclusion de `filterProps`.
 * A rattacher a #693 ou a ouvrir pour lui-meme.
 *
 * @description
 * Retirer une entree de la baseline apres correction n'est pas
 * optionnel : `report()` signale les entrees PERIMEES autant que les
 * nouvelles, pour qu'une baseline ne devienne jamais un cimetiere.
 ********************************************************/

/*
 * ⛔ Les fixtures tournent AVANT le balayage. Un detecteur aveugle
 * annonce « 0 nouvelle violation » avec le meme aplomb qu'un catalogue
 * sain — c'est exactement comme ca que le premier harnais de #665 a
 * renvoye 0 resultat sur trois defauts mesures. Ici, il fait echouer le
 * garde.
 */
const self = runFixtures({ silent: true })
if (self.failures) {
	console.log('─'.repeat(70))
	console.log('Guard: prop-shadowing — AUTO-TEST EN ECHEC, balayage non effectue')
	console.log('─'.repeat(70))
	console.log(`⛔ ${ self.failures }/${ self.total } fixture(s) du detecteur echouent (voir ci-dessus).`)
	console.log('   Le detecteur ne voit plus ce qu\'il est cense voir : son verdict sur le')
	console.log('   catalogue ne vaut rien tant que ces temoins ne repassent pas.')
	console.log('   Detail : node packages/ds/scripts/guards/lib/prop-shadowing.selftest.mjs')
	console.log('─'.repeat(70))
	process.exit(1)
}

const findings = analyseComponents()

const currentIds = new Set()
const detailsById = new Map()

for (const f of findings) {
	const id = `${ f.file }:${ f.prop }:${ f.rule }`
	currentIds.add(id)
	detailsById.set(id, `regle ${ f.rule } — ${ f.why }`
		+ (f.attrs.length ? ` (attribut(s) : ${ f.attrs.join(', ') })` : ''))
}

if (process.argv.includes('--update-baseline')) {
	const sorted = writeBaseline(BASELINE_PATH, currentIds)
	console.log(`baseline prop-shadowing mise a jour : ${ sorted.length } entree(s).`)
	process.exit(0)
}

const code = report({
	guardName: 'prop-shadowing (un const local masque-t-il une prop lue en nom nu ?)',
	baselinePath: BASELINE_PATH,
	currentIds,
	detailsById,
	fixHint:
		'Une NOUVELLE entree signifie qu\'une liaison de portee module porte le nom d\'une prop\n'
		+ 'declaree, et que le template lit ce nom nu — donc le local, jamais la prop.\n\n'
		+ '  REGLE B (nom accessible) : renommer le local (`toggleLabel`, …) puis, si un repli\n'
		+ '    est necessaire, exposer `accessibleLabel = props.label || toggleLabel.value`.\n'
		+ '    Voir PR #656 / #692 pour le patron exact et sa justification a11y.\n'
		+ '  REGLE A (prop morte) : la prop n\'est lue nulle part. Soit la brancher, soit la\n'
		+ '    retirer de l\'interface — la laisser declaree ment au consommateur.\n\n'
		+ 'Si le masquage est DELIBERE et correct (cf. `OrigamListGroup`), baseliner l\'entree\n'
		+ 'AVEC la raison ecrite ici meme — jamais en silence.'
})

process.exit(code)
