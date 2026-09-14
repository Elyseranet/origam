/*********************************************************
 * prop-shadowing — detecteur de masquage `const`/prop (#665, #666, #693)
 *
 * @description
 * En `<script setup>`, Vue expose les props au template par leur NOM NU
 * (`label`, pas `props.label`). Une liaison de portee module portant le
 * meme nom — `const label = computed(...)` — gagne contre la prop : le
 * template lit le local, la prop devient inatteignable par cette
 * liaison, et RIEN n'avertit. Ni le compilateur, ni `vue-tsc`, ni ESLint.
 *
 * @description
 * MESURE, pas supposee. Sur `OrigamSelect` (#622, corrige par PR #656)
 * puis sur `OrigamColorPickerField` / `OrigamDatePickerField` (#665 /
 * #666), `const label = computed(() => menu.value ? props.closeText :
 * props.openText)` masquait `IFieldProps.label` ; les deux lectures
 * `:aria-label="t(label)"` et `:title="t(label)"` resolvaient vers le
 * libelle du bouton d'ouverture. Un `aria-label` sur un `<input>`
 * ECRASE le `<label for>` visible : le nom accessible de TOUT
 * `<origam-select>`, `<origam-color-picker-field>` et
 * `<origam-date-picker-field>` du catalogue etait « Ouvrir » / « Open »,
 * quel que soit son `label`. Trois tickets, trois fois le meme patron.
 *
 * @description
 * ⛔ POURQUOI CE DETECTEUR N'ALERTE PAS SUR TOUT MASQUAGE. Le balayage
 * brut du catalogue sort 66 couples (composant, prop) ou une liaison de
 * portee module masque une prop lue en nom nu — et 49 d'entre eux sont
 * des DERIVATIONS DELIBEREES, parfaitement correctes :
 *
 *     const placeholder = computed(() => {
 *         return isDirty.value || (!isFocused.value && props.label && …)
 *             ? undefined
 *             : props.placeholder
 *     })
 *
 * Le local derive de `props.placeholder` : la valeur de la prop atteint
 * bien le template, le local ne fait que la supprimer quand le label
 * flottant occupe la place. Un garde qui hurlerait sur ces 49 cas serait
 * desactive dans la semaine — et n'aurait servi a rien. Ce detecteur ne
 * leve donc QUE les deux formes dont la nocivite est STRUCTURELLEMENT
 * demontrable, decrites ci-dessous.
 ********************************************************/

import fs from 'node:fs'
import path from 'node:path'
import { getRealComponents, DS_ROOT } from './components.mjs'
import { declaredPropsFor, scanPropNameArgs } from '../../audit-unconsumed-props.mjs'

/*********************************************************
 * Regle B — attributs de TEXTE destines a l'utilisateur
 *
 * @description
 * La liste est volontairement COURTE et ne contient que des attributs
 * dont la valeur est un texte lu par un humain ou annonce par une
 * technologie d'assistance. Elle exclut deliberement `aria-labelledby`
 * et `aria-describedby`, qui prennent une REFERENCE D'ID et non du
 * texte : `OrigamListGroup` y lit sciemment l'identifiant genere de son
 * activateur (`:aria-labelledby="id"`, l.36) pendant que `props.id`
 * part ailleurs (`useStyle(listGroupStyles, () => props.id)`, l.192).
 * C'est un masquage VOULU et correct — le mettre dans cette liste
 * fabriquerait un faux positif sur du code juste.
 ********************************************************/
export const USER_FACING_TEXT_ATTRS = new Set([
	'aria-label',
	'aria-placeholder',
	'aria-description',
	'aria-roledescription',
	'aria-valuetext',
	'title',
	'placeholder',
	'alt',
	'label'
])

/** Retire commentaires de ligne et de bloc, sans toucher aux longueurs de ligne utiles. */
function stripComments (src) {
	return src
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
		.replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)))
}

/** Neutralise le CONTENU des chaines, en conservant les quotes et la longueur. */
function blankStrings (src) {
	return src.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g,
		(_, q, body) => `${ q }${ body.replace(/[^\n]/g, ' ') }${ q }`)
}

export function splitSfc (src) {
	const tpl = src.match(/<template>([\s\S]*)<\/template>/)
	/*
	 * ⛔ La balise `<script setup>` de ce depot est MULTI-LIGNES :
	 *     <script
	 *             lang="ts"
	 *             setup
	 *     >
	 * Une regex exigeant l'espace litterale `<script setup` ne matche
	 * AUCUN composant du catalogue et renvoie « 0 defaut » avec aplomb.
	 * C'est l'un des deux bugs de rappel qui ont fait renvoyer 0 resultat
	 * au premier harnais de #665 — voir la selftest, temoins positifs.
	 */
	const scr = src.match(/<script[^>]*?\bsetup\b[^>]*?>([\s\S]*?)\n<\/script>/)
	return { template: tpl ? tpl[1] : '', script: scr ? scr[1] : '' }
}

/**
 * Liaisons declarees a la PROFONDEUR 0 du bloc `<script setup>`.
 * La profondeur est comptee sur les accolades/parentheses/crochets apres
 * neutralisation des commentaires et des chaines — jamais sur
 * l'indentation, qui ne survit pas a un reformatage.
 */
export function moduleScopeBindings (script) {
	const src = blankStrings(stripComments(script))
	const out = new Map()
	let depth = 0
	for (let i = 0; i < src.length; i++) {
		const c = src[i]
		if (c === '{' || c === '(' || c === '[') depth++
		else if (c === '}' || c === ')' || c === ']') depth--
		else if (depth === 0) {
			const rest = src.slice(i, i + 400)
			const m = rest.match(/^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/)
			if (m && (i === 0 || /[\s;}]/.test(src[i - 1]))) {
				if (!out.has(m[1])) out.set(m[1], i)
			}
		}
	}
	return out
}

/**
 * Expressions liees du template, avec le nom d'attribut porteur.
 * Couvre `:attr="…"`, `v-bind:attr="…"`, `v-if="…"`, `@evt="…"` et `{{ … }}`.
 *
 * ⛔ Second bug de rappel du harnais d'origine : une regex qui exigeait
 * `:` immediatement suivi de `="` ne matchait JAMAIS la forme
 * `:aria-label="expr"` — c'est-a-dire exactement le defaut cherche.
 */
export function templateBindings (template) {
	const out = []
	for (const m of template.matchAll(/(?:^|[\s])((?:[:@]|v-bind:|v-)[A-Za-z][\w.:-]*)="([^"]*)"/g)) {
		let attr = m[1].replace(/^v-bind:/, '').replace(/^[:@]/, '')
		out.push({ attr, expr: m[2] })
	}
	for (const m of template.matchAll(/\{\{([\s\S]*?)\}\}/g)) out.push({ attr: null, expr: m[1] })
	return out
}

/** L'expression lit-elle `name` en NOM NU (et non `props.name`) ? */
export function readsBareName (expr, name) {
	return new RegExp(`(?:^|[^.\\w$])${ name }(?![\\w$])`).test(expr)
}

/** Texte de l'initialiseur d'une liaison, jusqu'a la liaison de portee module suivante. */
function initializerText (script, bindings, name) {
	const start = bindings.get(name)
	let end = script.length
	for (const idx of bindings.values()) if (idx > start && idx < end) end = idx
	return stripComments(script.slice(start, end))
}

/*********************************************************
 * Le coeur : deux regles, et seulement deux
 *
 * @description
 * REGLE A — « prop morte ». La prop est declaree, un local de portee
 * module la masque, le template lit le nom nu, ET la prop n'est lue
 * NULLE PART dans le script : ni `props.X`, ni creditee par un
 * `useX(props, 'X')`. Elle est alors structurellement inatteignable —
 * un consommateur qui la passe ne peut rien changer. C'est #693
 * (`validationValue` sur Select / ColorPickerField / DatePickerField :
 * `const validationValue = computed(() => model.value)`, et `props.
 * validationValue` n'apparait nulle part ailleurs).
 *
 * ⛔ La lecture doit etre cherchee APRES retrait des commentaires. Sur
 * `OrigamCard`, `props.link` apparait trois fois en commentaire et une
 * seule fois en code reel (l.311) : un detecteur qui compte les
 * commentaires ou qui les ignore mal bascule ce composant du bon cote
 * pour la mauvaise raison.
 *
 * ⛔ Et le credit par NOM DE PROP doit venir de `scanPropNameArgs()`
 * (forme `useX(props, 'nom')`), JAMAIS d'une occurrence brute de la
 * chaine `'nom'` dans le fichier. Mesure : `OrigamColorPickerField`
 * l.344 contient `filterProps(props, ['class', 'id', …,
 * 'validationValue', 'focused'])` — une liste d'EXCLUSION. Y voir une
 * preuve de lecture inverse exactement le sens de la mesure et
 * blanchirait #693.
 *
 * @description
 * REGLE B — « nom accessible masque ». La prop est declaree, un local
 * de portee module la masque, le template injecte le nom nu dans un
 * ATTRIBUT DE TEXTE destine a l'utilisateur (cf.
 * `USER_FACING_TEXT_ATTRS`), ET l'initialiseur du local ne porte pas la
 * valeur de la prop. C'est #665 / #666.
 *
 * @description
 * Les deux tests de « portage » n'ont PAS la meme portee, et c'est
 * volontaire : la regle A interroge tout le module (la prop est-elle
 * lue quelque part ?), la regle B interroge le seul initialiseur du
 * local (ce local transporte-t-il la prop qu'il masque ?). Une prop
 * peut etre lue ailleurs dans le module tout en etant absente du local
 * qui la masque — c'est exactement le cas de #665, ou `props.label`
 * sert au calcul du placeholder (l.370) pendant que `const label` porte
 * tout autre chose.
 ********************************************************/
export function analyseSource (src, declaredProps) {
	const { template, script } = splitSfc(src)
	if (!template || !script) return []

	const bindings = moduleScopeBindings(script)
	const tplBindings = templateBindings(template)
	const codeOnly = blankStrings(stripComments(script))
	const nameArgs = scanPropNameArgs(script)

	const creditedByNameArg = new Set()
	for (const names of nameArgs.values()) for (const n of names) creditedByNameArg.add(n)

	/*
	 * ⛔ `declaredPropsFor()` rend une **Map** (nom de prop -> interface
	 * d'origine), pas un Set. Un `for (const p of map)` itere des paires
	 * `[cle, valeur]` : chaque comparaison echoue silencieusement et le
	 * detecteur renvoie 0 resultat sur un catalogue qui en contient. Ce
	 * troisieme bug de rappel a ete pris par la selftest, pas a l'oeil.
	 * On normalise ici pour accepter Map, Set ou tableau.
	 */
	const propNames = declaredProps instanceof Map ? [...declaredProps.keys()] : [...declaredProps]

	const findings = []
	for (const prop of propNames) {
		if (!bindings.has(prop)) continue

		const reads = tplBindings.filter((b) => readsBareName(b.expr, prop))
		if (!reads.length) continue

		const readInScript = new RegExp(`\\bprops\\s*\\.\\s*${ prop }\\b`).test(codeOnly)
		const reachable = readInScript || creditedByNameArg.has(prop)

		if (!reachable) {
			findings.push({
				prop,
				rule: 'A',
				why: 'prop jamais lue dans le script (ni props.' + prop + ', ni useX(props, \'' + prop + '\')) — elle est inatteignable',
				attrs: [...new Set(reads.map((r) => r.attr).filter(Boolean))]
			})
			continue
		}

		const textReads = reads.filter((r) => r.attr && USER_FACING_TEXT_ATTRS.has(r.attr))
		if (!textReads.length) continue

		const init = initializerText(script, bindings, prop)
		const initCarries = new RegExp(`\\bprops\\s*\\.\\s*${ prop }\\b`).test(blankStrings(init))
			|| new RegExp(`\\(\\s*props\\s*,\\s*['"]${ prop }['"]`).test(init)
		if (initCarries) continue

		findings.push({
			prop,
			rule: 'B',
			why: 'le local masque la prop et alimente un attribut de texte utilisateur sans porter sa valeur',
			attrs: [...new Set(textReads.map((r) => r.attr))]
		})
	}
	return findings
}

/** Balaie le catalogue reel. */
export function analyseComponents () {
	const out = []
	for (const { file } of getRealComponents()) {
		const src = fs.readFileSync(file, 'utf8')
		const { script } = splitSfc(src)
		if (!script) continue
		const m = script.match(/defineProps<\s*([A-Za-z0-9_]+)\s*>/)
		if (!m) continue

		let declared
		try {
			declared = declaredPropsFor(m[1])
		} catch {
			continue
		}
		if (!declared || !declared.size) continue

		/*
		 * ⛔ Chemin relatif a DS_ROOT, JAMAIS a `process.cwd()` : la
		 * baseline est comparee par chaine, et un identifiant dependant du
		 * repertoire d'appel change selon que le garde est lance depuis la
		 * racine du depot, depuis `packages/ds/` ou depuis `run-all.mjs`.
		 * Toutes les entrees paraitraient alors nouvelles a chaque
		 * invocation.
		 */
		for (const f of analyseSource(src, declared)) {
			out.push({ file: path.relative(DS_ROOT, file), iface: m[1], ...f })
		}
	}
	return out
}
