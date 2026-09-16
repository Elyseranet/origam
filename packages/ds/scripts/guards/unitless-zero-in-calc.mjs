#!/usr/bin/env node
/*
 * Guard 24 — unitless-zero-in-calc : un `0` SANS UNITE lu comme terme
 * additif d'une fonction mathematique CSS invalide LA DECLARATION ENTIERE.
 *
 * BACKGROUND (#568) — le mecanisme complet est dans
 * `lib/unitless-zero-in-calc.mjs`. Forme courte : dans `calc()`, `0` est un
 * `<number>` ; `<length> + <number>` est interdit ; le navigateur ne jette
 * pas le terme fautif mais la declaration. Et quand la valeur contient un
 * `var()`, l'echec arrive au COMPUTED-VALUE TIME, apres que la declaration
 * a gagne la cascade : elle devient `unset` et ECRASE la valeur precedente
 * au lieu de lui ceder.
 *
 * Mesure Chromium (#568), temoin a `height: 7px`, cible voulue `36px` :
 *   calc(36px + 0px)          -> 36px  applique
 *   calc(36px + 0)            ->  7px  ecarte au parse, temoin visible
 *   calc(36px + var(--x:0))   ->  0px  temoin ECRASE, retour a `auto`
 *
 * ⛔ POURQUOI UN GARDE ET PAS SEULEMENT LES CORRECTIFS. Trois occurrences
 * connues (OrigamRow, OrigamBtnGroup, puis le balayage de #568 qui en a
 * sorti trois de plus : `--origam-btn---density` et
 * `--origam-field__input---padding-start/end`, ces deux dernieres tuant le
 * `max-width` du label de TOUS les champs du catalogue). AUCUNE n'a ete
 * trouvee par un test rouge, et le classeur d'inspection notait la ligne
 * de `OrigamRow` « conforme ». Le motif est invisible a la relecture (`0`
 * a l'air d'un zero), invisible au type-check, et invisible aux TU :
 * `getComputedStyle` sous jsdom ne resout jamais `var()` et fabrique
 * `16px`, donc un test unitaire confirme une hauteur qui n'existe pas.
 * Le ticket dit que le garde vaut plus que les correctifs, et c'est exact.
 *
 * ⛔ CE QUE LA BASELINE CONTIENT — la famille
 * `--origam-field---padding-start/end`, posee a `0` nu par
 * `OrigamColorPickerField`, `OrigamNumberField` et `OrigamOtpInputField`
 * sur `.origam-field`. Ce N'EST PAS un oubli : mesure en navigateur, mettre
 * l'unite ferait passer le `padding-inline` de corner-clearing de
 * `OrigamField.vue:887` de `0px` a `4px` — c'est-a-dire que ces trois
 * champs comptent aujourd'hui sur le fait que la declaration soit JETEE
 * pour obtenir leur padding nul. Corriger l'unite est donc un changement
 * de rendu, pas une correction : il demande un arbitrage. Voir #568 pour
 * la mesure et le ticket de suite.
 *
 * PORTEE — statique, et volontairement ignorante de la cascade : le garde
 * ne sait pas qu'une classe de densite peut masquer un `:root` fautif.
 * Masque n'est pas corrige. Le verdict runtime ne s'obtient que dans un
 * vrai navigateur.
 *
 * Run: `node packages/ds/scripts/guards/unitless-zero-in-calc.mjs`
 *      `node packages/ds/scripts/guards/unitless-zero-in-calc.mjs --update-baseline`
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSources } from './lib/unitless-zero-in-calc.mjs'
import { runFixtures } from './lib/unitless-zero-in-calc.selftest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/* __dirname = packages/ds/scripts/guards -> DS_ROOT = packages/ds */
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/unitless-zero-in-calc.json')

const SCAN_DIRS = [
	path.join(DS_ROOT, 'src/components'),
	path.join(DS_ROOT, 'src/assets/css/tokens'),
	path.join(DS_ROOT, 'src/assets/scss/tokens')
]
const EXTENSIONS = new Set(['.vue', '.css', '.scss'])

/*
 * `main.css` est le BUNDLE compresse regenere par `styles:build` a partir
 * des feuilles de tokens deja balayees ci-dessus. L'inclure ferait
 * remonter chaque violation deux fois, sous un identifiant qui disparait
 * au prochain rebuild.
 */
const EXCLUDE = /assets\/(css\/main\.css|scss\/main\.scss)$/

function walk (dir, out = []) {
	let entries
	try {
		entries = readdirSync(dir)
	} catch {
		return out
	}
	for (const e of entries) {
		const full = path.join(dir, e)
		if (statSync(full).isDirectory()) walk(full, out)
		else if (EXTENSIONS.has(path.extname(full)) && !EXCLUDE.test(full)) out.push(full)
	}
	return out
}

/*
 * ⛔ AUTO-TEST D'ABORD. L'etat nominal de ce garde est « quelques
 * violations connues, zero nouvelle » : un detecteur devenu aveugle rendrait
 * « 0 nouvelle » exactement comme un catalogue sain, ET ferait passer les
 * entrees de baseline pour perimees — ce qui invite a les effacer et a
 * perdre la trace du chantier. Le detecteur s'est d'ailleurs revele aveugle
 * a `calc(100% - …)` a l'ecriture, pris par un temoin positif et pas a
 * l'oeil. Meme disposition que `class-fallthrough.mjs`.
 */
function run () {
	const self = runFixtures({ silent: true })
	if (self.failures) {
		console.log('─'.repeat(70))
		console.log('Guard: unitless-zero-in-calc — AUTO-TEST EN ECHEC, balayage non effectue')
		console.log('─'.repeat(70))
		console.log(`⛔ ${ self.failures }/${ self.total } fixture(s) du detecteur echouent.`)
		console.log('   Son verdict sur le catalogue ne vaut rien tant que ces temoins')
		console.log('   ne repassent pas.')
		console.log('   Detail : node packages/ds/scripts/guards/lib/unitless-zero-in-calc.selftest.mjs')
		console.log('─'.repeat(70))
		process.exit(1)
	}

	const files = SCAN_DIRS.flatMap(d => walk(d)).map(full => ({
		path: path.relative(REPO_ROOT, full),
		source: readFileSync(full, 'utf8')
	}))

	/*
	 * ⛔ UN BALAYAGE VIDE N'EST PAS UN CATALOGUE SAIN. La premiere version de
	 * ce fichier derivait DS_ROOT d'un `..` de trop : elle a annonce
	 * « PASS — 0 violation » apres avoir lu ZERO fichier. Seule la note de
	 * couverture l'a trahi. Le cas devient donc bloquant plutot que
	 * decoratif — c'est le faux negatif le plus cher du genre, puisqu'il
	 * ressemble trait pour trait a un resultat propre.
	 */
	if (files.length === 0) {
		console.log('─'.repeat(70))
		console.log('Guard: unitless-zero-in-calc — BALAYAGE VIDE, verdict sans valeur')
		console.log('─'.repeat(70))
		console.log('⛔ Aucun fichier lu. Racines attendues :')
		for (const d of SCAN_DIRS) console.log(`   ${ d }`)
		console.log('─'.repeat(70))
		process.exit(1)
	}

	const violations = analyseSources(files)
	const currentIds = new Set(violations.map(v => v.id))

	const detailsById = new Map()
	for (const v of violations) {
		const origin = v.reason === 'bare-zero-declaration'
			? `pose a \`0\` nu en ${ v.declaredAt.join(', ') }`
			: 'repli `var(…, 0)` nu, aucune declaration trouvee'
		detailsById.set(v.id, `${ v.property } lit ${ v.varName } — ${ origin }\n      ${ v.expr }`)
	}

	if (process.argv.includes('--update-baseline')) {
		const written = writeBaseline(BASELINE_PATH, currentIds)
		console.log(`Baseline ecrite : ${ written.length } entree(s) -> ${ BASELINE_PATH }`)
		return 0
	}

	return report({
		guardName: 'unitless-zero-in-calc (un `0` nu en terme additif de calc() jette la declaration)',
		baselinePath: BASELINE_PATH,
		currentIds,
		detailsById,
		fixHint: 'Ajouter l\'unite (`0px`) a la declaration OU au repli. ⛔ Verifier d\'ABORD\n'
			+ 'ce que la declaration vaut une fois REPAREE : une valeur jetee vaut\n'
			+ '`initial`, pas `0`. Sur `OrigamField.vue:887` la reparation fait passer\n'
			+ 'le padding de 0px a 4px — c\'est un changement de rendu, pas un correctif.',
		coverageNote: `Couverture : ${ files.length } fichier(s) (.vue/.css/.scss) sous `
			+ 'src/components + src/assets/{css,scss}/tokens. NON balaye : main.css '
			+ '(bundle regenere), les autres packages (stories, docs, marketing), et '
			+ 'toute CSS produite a l\'execution par useStyle().'
	})
}

process.exit(run())
