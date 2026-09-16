/*********************************************************
 * Auto-test de `unitless-zero-in-calc.mjs` — precision ET rappel
 *
 * @description
 * ⛔ CE GARDE A UNE BASELINE NON VIDE MAIS PETITE : son etat nominal est
 * « quelques violations connues, zero nouvelle ». Un detecteur devenu
 * aveugle rendrait donc « 0 nouvelle » exactement comme un catalogue sain
 * — et, pire, ferait apparaitre les entrees de baseline comme PERIMEES,
 * ce qui invite a les supprimer et a perdre la trace du chantier. D'ou les
 * temoins positifs ci-dessous : chacun echoue si le detecteur cesse de voir
 * ce point precis.
 *
 * @description
 * `MUST_NOT_FLAG` porte l'autre moitie du contrat, et c'est la moitie qui
 * decide si le garde survit. Un `0` nu est CORRECT dans la majorite de ses
 * emplois (`opacity`, `flex-grow`, `z-index`, une marge hors `calc()`, un
 * facteur multiplicatif). Chaque negatif ci-dessous est un cas REEL du
 * catalogue qui doit rester silencieux — celui de `DataTableGroupHeaderRow`
 * en particulier, ou une unite serait une ERREUR.
 *
 * Run: node packages/ds/scripts/guards/lib/unitless-zero-in-calc.selftest.mjs
 ********************************************************/

import { fileURLToPath } from 'node:url'
import { analyseSources } from './unitless-zero-in-calc.mjs'

/* ------------------------------------------------------------------ */
/* TEMOINS POSITIFS — doivent etre leves                               */
/* ------------------------------------------------------------------ */
const MUST_FLAG = [
	[
		'#568 — OrigamBtnGroup : :root pose la densite a 0 nu, lue en calc()',
		[{
			path: 'X.vue',
			source: `:root {\n\t--origam-btn-group---density: 0;\n}\n.g {\n\theight: calc(var(--origam-btn-group---height, 36px) + var(--origam-btn-group---density, 0px));\n}\n`
		}],
		['X.vue::height::--origam-btn-group---density']
	],
	[
		'#568 — la declaration fautive peut vivre dans un AUTRE fichier que la lecture',
		[
			{ path: 'tokens.css', source: `:root {\n  --origam-btn---density: 0;\n}\n` },
			{ path: 'Btn.vue', source: `.b { height: calc(var(--origam-btn---height, 36px) + var(--origam-btn---density, 0px)); }\n` }
		],
		['Btn.vue::height::--origam-btn---density']
	],
	[
		'#568 — repli nu `var(--x, 0)`, meme si --x n est declare nulle part',
		[{ path: 'F.vue', source: `.f { max-width: calc(100% - var(--origam-field__input---padding-start, 0)); }\n` }],
		['F.vue::max-width::--origam-field__input---padding-start']
	],
	[
		'min()/max()/clamp() comptent autant que calc()',
		[{
			path: 'F.vue',
			source: `.f {\n\t--origam-field---padding-start: 0;\n}\n.g {\n\tpadding-inline: max(var(--origam-field---padding-start), min(var(--origam-field---border-radius, 8px), 36px));\n}\n`
		}],
		['F.vue::padding-inline::--origam-field---padding-start']
	],
	[
		'la soustraction est additive elle aussi',
		[{ path: 'F.vue', source: `.f { --origam-x---d: 0; }\n.g { row-gap: calc(8px - var(--origam-x---d)); }\n` }],
		['F.vue::row-gap::--origam-x---d']
	],
	[
		'un `!important` ne met pas la declaration a l abri',
		[{ path: 'F.vue', source: `.f { --origam-y---d: 0 !important; }\n.g { height: calc(36px + var(--origam-y---d)); }\n` }],
		['F.vue::height::--origam-y---d']
	]
]

/* ------------------------------------------------------------------ */
/* TEMOINS NEGATIFS — doivent rester silencieux                        */
/* ------------------------------------------------------------------ */
const MUST_NOT_FLAG = [
	[
		'OrigamDataTableGroupHeaderRow (cas REEL) — facteur multiplicatif : `0px * 16px` serait INVALIDE',
		[{
			path: 'R.vue',
			source: `.r {\n\tpadding-inline-start: calc(var(--origam-data-table-group-header-row--depth, 0) * var(--origam-f, 16px));\n}\n`
		}]
	],
	[
		'division — meme raisonnement que la multiplication',
		[{ path: 'R.vue', source: `.r { --origam-n: 0; }\n.s { width: calc(100px / var(--origam-n)); }\n` }]
	],
	[
		'OrigamField (cas REEL) — `var(--x, 0)` HORS fonction mathematique : `margin: 0` est valide',
		[{ path: 'F.vue', source: `.f { margin-inline-start: var(--origam-field__input---padding-start, 0); }\n` }]
	],
	[
		'zero nu avec unite : rien a signaler',
		[{ path: 'B.vue', source: `:root { --origam-btn---density: 0px; }\n.b { height: calc(36px + var(--origam-btn---density, 0px)); }\n` }]
	],
	[
		'expression SANS litteral de longueur — rien ne prouve qu on attend une longueur',
		[{ path: 'C.vue', source: `.c { --origam-k: 0; }\n.d { z-index: calc(var(--origam-k) + 1); }\n` }]
	],
	[
		'proprietes qui EXIGENT un <number> : une unite y serait le vrai defaut',
		[{
			path: 'O.vue',
			source: `:root {\n\t--origam-switch__input---opacity: 0;\n\t--origam-col---flex-grow: 0;\n\t--origam-img---z-index: 0;\n}\n.o { opacity: var(--origam-switch__input---opacity); flex-grow: var(--origam-col---flex-grow); }\n`
		}]
	],
	[
		'une custom property etrangere au DS n est pas du ressort du garde... mais un 0 nu reste un 0 nu',
		[{ path: 'Z.vue', source: `.z { padding: 0; margin: 0; border: 0; }\n` }]
	]
]

export function runFixtures ({ silent = false } = {}) {
	let failures = 0
	let total = 0

	for (const [label, files, expected] of MUST_FLAG) {
		total++
		const got = analyseSources(files).map(v => v.id).sort()
		const want = [...expected].sort()
		const ok = want.every(id => got.includes(id))
		if (!ok) {
			failures++
			if (!silent) {
				console.log(`  ✗ RAPPEL  ${ label }`)
				console.log(`      attendu : ${ want.join(', ') }`)
				console.log(`      obtenu  : ${ got.length ? got.join(', ') : '(rien)' }`)
			}
		} else if (!silent) {
			console.log(`  ✓ rappel  ${ label }`)
		}
	}

	for (const [label, files] of MUST_NOT_FLAG) {
		total++
		const got = analyseSources(files).map(v => v.id)
		if (got.length > 0) {
			failures++
			if (!silent) {
				console.log(`  ✗ PRECISION  ${ label }`)
				console.log(`      faux positif : ${ got.join(', ') }`)
			}
		} else if (!silent) {
			console.log(`  ✓ precision  ${ label }`)
		}
	}

	return { failures, total }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	console.log('Auto-test — unitless-zero-in-calc')
	const { failures, total } = runFixtures()
	console.log(`\n${ total - failures }/${ total } fixture(s) OK.`)
	process.exit(failures ? 1 : 0)
}
