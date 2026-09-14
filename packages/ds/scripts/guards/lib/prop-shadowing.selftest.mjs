/*********************************************************
 * Self-test de `prop-shadowing.mjs` — precision ET rappel
 *
 * @description
 * ⛔ UN DETECTEUR QUI NE VOIT RIEN EST PIRE QU'ABSENT : il certifie le
 * vide. Ce n'est pas une precaution theorique ici, c'est l'histoire de ce
 * fichier. Le premier harnais ecrit pour #665 a renvoye « 0 resultat » sur
 * un catalogue qui contenait trois defauts mesures, a cause de DEUX bugs
 * de rappel :
 *
 *   1. `<script setup>` est ecrit sur PLUSIEURS LIGNES dans ce depot
 *      (`<script\n\tlang="ts"\n\tsetup\n>`) — une regex exigeant l'espace
 *      litterale `<script setup` ne matchait aucun composant ;
 *   2. la regex de liaison de template ne matchait JAMAIS la forme
 *      `:attr="expr"`, donc pas `:aria-label="t(label)"` — c'est-a-dire
 *      exactement le defaut cherche.
 *
 * Un troisieme est apparu en industrialisant le detecteur :
 *
 *   3. `declaredPropsFor()` rend une **Map**, pas un Set : `for (const p
 *      of map)` itere des paires `[cle, valeur]`, toutes les comparaisons
 *      echouent en silence, le detecteur renvoie 0.
 *
 * Les trois ont ete pris par des TEMOINS POSITIFS, jamais a l'oeil. C'est
 * la raison d'etre de `MUST_FLAG` : chaque entree echoue si le detecteur
 * redevient aveugle sur ce point precis.
 *
 * @description
 * `MUST_NOT_FLAG` porte l'autre moitie du contrat. Le balayage brut sort
 * 66 masquages dont 49 sont des derivations deliberees et correctes ; un
 * garde qui hurlerait dessus serait desactive dans la semaine. Chaque
 * negatif ci-dessous est un cas REEL du catalogue, mesure, qui doit rester
 * silencieux.
 *
 * Run: node packages/ds/scripts/guards/lib/prop-shadowing.selftest.mjs
 ********************************************************/

import { fileURLToPath } from 'node:url'
import { analyseSource } from './prop-shadowing.mjs'

/** Enveloppe un `<script setup>` MULTI-LIGNES, comme le depot les ecrit. */
const wrap = (tpl, body) => `<template>\n${ tpl }\n</template>\n\n<script\n\t\tlang="ts"\n\t\tsetup\n>\n${ body }\n</script>\n`

/* ------------------------------------------------------------------ */
/* TEMOINS POSITIFS — doivent etre leves                               */
/* ------------------------------------------------------------------ */
const MUST_FLAG = [
	[
		'#665 / #666 — const label masque IFieldProps.label, lu en :aria-label (regle B)',
		wrap(
			`\t<origam-text-field\n\t\t\t:aria-label="t(label)"\n\t\t\t:title="t(label)"\n\t/>`,
			`\tconst props = withDefaults(defineProps<IColorPickerFieldProps>(), { openText: 'origam.open' })
	const placeholder = computed(() => props.label ? undefined : props.placeholder)
	const label = computed(() => menu.value ? props.closeText : props.openText)`
		),
		['label', 'label'], ['B']
	],
	[
		'regle B tient meme quand props.label est lue AILLEURS dans le module',
		wrap(
			`\t<input :aria-label="t(label)">`,
			`\tconst props = defineProps<IProps>()
	const somethingElse = computed(() => props.label ? 1 : 2)
	const label = computed(() => props.openText)`
		),
		['label'], ['B']
	],
	[
		'#693 — const validationValue masque IValidationProps.validationValue, jamais lue (regle A)',
		wrap(
			`\t<origam-text-field :validation-value="validationValue"/>`,
			`\tconst props = defineProps<ISelectProps>()
	const model = useVModel(props, 'modelValue')
	const validationValue = computed(() => model.value)`
		),
		['validationValue'], ['A']
	],
	[
		'regle A — une liste d EXCLUSION filterProps ne vaut PAS une lecture',
		wrap(
			`\t<origam-text-field :validation-value="validationValue"/>`,
			`\tconst props = defineProps<ISelectProps>()
	const validationValue = computed(() => model.value)
	const fwd = computed(() => ref.value?.filterProps(props, ['id', 'validationValue', 'focused']))`
		),
		['validationValue'], ['A']
	],
	[
		'regle A — un props.X en COMMENTAIRE ne vaut pas une lecture',
		wrap(
			`\t<child :text="text"/>`,
			`\tconst props = defineProps<IProps>()
	// props.text bascule le mode explicite
	/* et props.text encore, en bloc */
	const text = computed(() => adapter.format(d, 'monthAndYear'))`
		),
		['text'], ['A']
	],
	[
		'template lu en interpolation {{ }} et non en attribut (regle A)',
		wrap(
			`\t<span>{{ caption }}</span>`,
			`\tconst props = defineProps<IProps>()
	const caption = computed(() => 'x')`
		),
		['caption'], ['A']
	]
]

/* ------------------------------------------------------------------ */
/* TEMOINS NEGATIFS — doivent rester silencieux                        */
/* ------------------------------------------------------------------ */
const MUST_NOT_FLAG = [
	[
		'const placeholder DERIVE de props.placeholder — la valeur atteint le template',
		wrap(
			`\t<origam-text-field :placeholder="placeholder"/>`,
			`\tconst props = defineProps<ITextFieldProps>()
	const placeholder = computed(() => {
		return isDirty.value || (!isFocused.value && props.label && !props.persistentPlaceholder)
			? undefined
			: props.placeholder
	})`
		)
	],
	[
		'OrigamListGroup — :aria-labelledby prend un IDREF, pas du texte ; props.id part ailleurs',
		wrap(
			`\t<div :aria-labelledby="id" role="group"/>`,
			`\tconst props = defineProps<IListGroupProps>()
	const {isOpen, id: _id} = useNestedItem(toRef(props, 'value'), true)
	const id = computed(() => \`origam-list-group--id-\${ String(_id.value) }\`)
	const style = useStyle(listGroupStyles, () => props.id)`
		)
	],
	[
		'useVModel(props, \'menu\') credite la prop meme sans props.menu litteral',
		wrap(
			`\t<origam-menu v-model="menu"/>`,
			`\tconst props = defineProps<ISelectProps>()
	const menuState = useVModel(props, 'menu')
	const menu = computed({ get: () => menuState.value, set: (v) => { menuState.value = v } })`
		)
	],
	[
		'useLink(props, attrs) — props.link est lue en code reel ailleurs',
		wrap(
			`\t<component :is="link.tag.value" :href="link.href.value"/>`,
			`\tconst props = defineProps<ICardProps>()
	const link = useLink(props, attrs)
	const isClickable = computed(() => !props.disabled && (props.link || link.isClickable.value))`
		)
	],
	[
		'ChartBullet / Pareto / Variwide / InlineEdit — const label en CORPS DE FONCTION',
		wrap(
			`\t<svg><text>{{ axisTicks[0].label }}</text></svg>`,
			`\tconst props = defineProps<IChartBulletProps>()
	const axisTicks = computed(() => {
		const label = props.xAxisFormat ? props.xAxisFormat(v) : String(v)
		return [{ value: v, label }]
	})`
		)
	],
	[
		'prop NON declaree par l interface — aucun masquage possible',
		wrap(
			`\t<span :aria-label="notAProp"/>`,
			`\tconst props = defineProps<IProps>()
	const notAProp = computed(() => 'x')`
		)
	],
	[
		'le template lit props.label explicitement — pas de nom nu',
		wrap(
			`\t<span :aria-label="props.label"/>`,
			`\tconst props = defineProps<IProps>()
	const label = computed(() => props.openText)`
		)
	],
	[
		'aucune liaison de template ne lit le local',
		wrap(
			`\t<span>statique</span>`,
			`\tconst props = defineProps<IProps>()
	const label = computed(() => props.openText)`
		)
	]
]

/*
 * Jeu de props declarees commun aux fixtures. Le detecteur recoit ici
 * l'ensemble directement : la resolution des chaines `extends` est le
 * travail de `declaredPropsFor()`, deja epingle par ses propres tests.
 */
const DECLARED = new Set([
	'label', 'placeholder', 'validationValue', 'text', 'caption',
	'id', 'menu', 'link', 'disabled', 'value', 'openText', 'closeText'
])

/*********************************************************
 * `runFixtures()` — appelee par le GARDE, pas seulement par la CLI
 *
 * @description
 * Aucun `*.selftest.mjs` de ce dossier n'est lance par la CI : ils
 * existent, mais rien ne les execute, donc rien ne les empeche de
 * pourrir. Des fixtures qui ne tournent jamais ne pinnent rien — elles
 * decorent. `prop-shadowing.mjs` appelle donc ce jeu AVANT de balayer le
 * catalogue : `pnpm -F origam guards` exerce les 14 temoins a chaque
 * execution, et un detecteur redevenu aveugle fait echouer le garde au
 * lieu d'annoncer sereinement « 0 nouvelle violation ».
 *
 * Le cout est nul a l'echelle du garde : 14 analyses de chaines en
 * memoire, aucun acces disque.
 ********************************************************/
export function runFixtures ({ silent = false } = {}) {
	const log = silent ? () => {} : (m) => console.log(m)
	let failures = 0

	for (const [name, src, expectedProps, expectedRules] of MUST_FLAG) {
		const found = analyseSource(src, DECLARED)
		const props = found.map((f) => f.prop).sort()
		const rules = [...new Set(found.map((f) => f.rule))].sort()
		const wantProps = [...new Set(expectedProps)].sort()
		const okProps = wantProps.every((p) => props.includes(p))
		const okRules = expectedRules.every((r) => rules.includes(r))
		if (!okProps || !okRules) {
			failures++
			console.log(`✗ MUST_FLAG  ${ name }`)
			console.log(`    attendu props ${ JSON.stringify(wantProps) } regles ${ JSON.stringify(expectedRules) }`)
			console.log(`    obtenu  props ${ JSON.stringify(props) } regles ${ JSON.stringify(rules) }`)
		} else {
			log(`✓ MUST_FLAG  ${ name }`)
		}
	}

	for (const [name, src] of MUST_NOT_FLAG) {
		const found = analyseSource(src, DECLARED)
		if (found.length) {
			failures++
			console.log(`✗ MUST_NOT_FLAG  ${ name }`)
			console.log(`    faux positif : ${ JSON.stringify(found.map((f) => `${ f.rule }:${ f.prop }`)) }`)
		} else {
			log(`✓ MUST_NOT_FLAG  ${ name }`)
		}
	}

	return { failures, total: MUST_FLAG.length + MUST_NOT_FLAG.length, positives: MUST_FLAG.length, negatives: MUST_NOT_FLAG.length }
}

/* CLI — ignoree lorsque le module est importe par le garde */
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
	const { failures, total, positives, negatives } = runFixtures()
	console.log('')
	if (failures) {
		console.log(`⛔ ${ failures }/${ total } fixture(s) en echec.`)
		process.exit(1)
	}
	console.log(`✅ ${ total }/${ total } fixtures OK (${ positives } positives, ${ negatives } negatives).`)
}
