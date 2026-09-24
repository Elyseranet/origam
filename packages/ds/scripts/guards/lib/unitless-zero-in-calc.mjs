/*********************************************************
 * Detecteur — un zero SANS UNITE lu comme terme additif d'un `calc()`
 *
 * @description
 * Dans une fonction mathematique CSS (`calc()`, `min()`, `max()`, `clamp()`)
 * un `0` nu est un `<number>`, pas une `<length>`. Additionner les deux est
 * interdit, et le navigateur ne jette pas le terme fautif : il jette LA
 * DECLARATION ENTIERE.
 *
 * @description
 * ⛔ Le defaut a DEUX visages, et seul le second est vraiment dangereux :
 *
 *   - sans `var()` — `height: calc(36px + 0)` est invalide des le PARSE.
 *     La declaration est ecartee et la declaration precedente de la cascade
 *     l'emporte. Degat limite : on retombe sur une valeur anterieure.
 *   - avec `var()` — `height: calc(36px + var(--x))` ou `--x: 0` est VALIDE
 *     au parse (une valeur contenant `var()` est acceptee sans examen) et
 *     n'echoue qu'au COMPUTED-VALUE TIME. La declaration a donc deja GAGNE
 *     la cascade quand elle echoue : elle devient `unset` et ECRASE la
 *     valeur precedente au lieu de lui ceder. On ne retombe pas sur un
 *     repli, on tombe sur l'`initial`.
 *
 * Mesure (Chromium, temoin a `height: 7px`, cible voulue `36px`) :
 *
 *   height: 36px                      -> 36px   applique
 *   height: calc(36px + 0px)          -> 36px   applique
 *   height: calc(36px + 0)            ->  7px   ecarte au parse, temoin visible
 *   height: calc(36px + var(--x:0))   ->  0px   temoin ECRASE, retour a `auto`
 *   height: calc(36px + var(--x:0px)) -> 36px   applique
 *
 * @description
 * ⛔ POURQUOI UN GARDE ET PAS SEULEMENT LES CORRECTIFS. Le motif est
 * invisible a la relecture (`0` a l'air d'un zero), invisible au
 * type-check, invisible aux TU — `getComputedStyle` sous jsdom ne resout
 * jamais `var()` et fabrique `16px`, donc un test unitaire confirme
 * joyeusement une hauteur qui n'existe pas. Il est aussi souvent LATENT :
 * une classe de densite pose `0px` sur l'element et masque la valeur
 * `:root` fautive jusqu'au jour ou la cascade bouge. Trois occurrences
 * connues avant ce garde (OrigamRow, OrigamBtnGroup, puis le balayage de
 * #568 qui en a sorti trois de plus), aucune trouvee par un test rouge.
 *
 * @description
 * ⛔ CE QU'IL NE FAUT PAS LEVER — un `0` nu n'est pas fautif en soi, il
 * l'est SEULEMENT en position additive dans une expression de longueur :
 *
 *   - `opacity: 0`, `flex-grow: 0`, `z-index: 0`, `line-height: 0` exigent
 *     un `<number>` : une unite y serait une erreur ;
 *   - `margin-inline-start: var(--x, 0)` hors fonction mathematique est
 *     parfaitement valide — `0` EST une longueur en CSS ordinaire ;
 *   - `calc(var(--depth, 0) * 16px)` exige un `<number>` comme facteur :
 *     `0px * 16px` serait invalide. C'est le cas reel de
 *     `OrigamDataTableGroupHeaderRow`, et le lever aurait fait desactiver
 *     le garde dans la semaine.
 *
 * D'ou les deux filtres : position ADDITIVE uniquement (un operande colle a
 * `*` ou `/` est ignore), et presence d'un litteral de longueur ou de
 * pourcentage dans l'expression — sans quoi rien ne prouve qu'on attend une
 * longueur.
 *
 * @description
 * PORTEE — statique. Le garde prouve qu'une valeur nue ATTEINT une position
 * additive, pas que le navigateur jette la declaration : le verdict runtime
 * ne s'obtient que dans un vrai navigateur. Il ne suit pas non plus la
 * cascade : il ignore qu'une classe de densite puisse masquer un `:root`
 * fautif. C'est deliberé — masque n'est pas corrige.
 ********************************************************/

/*
 * Unites de longueur + pourcentage : la preuve qu'on attend une longueur.
 *
 * ⛔ Pas de `\b` apres l'unite. `%` n'est pas un caractere de mot, donc
 * `\b` echoue entre `%` et `)` et `calc(100% - …)` n'etait PAS reconnu —
 * c'est-a-dire precisement la forme de `OrigamField.vue:1065`, le defaut
 * le plus grave du lot. Pris par le temoin positif, pas a l'oeil.
 */
const LENGTH_LITERAL = /\.?\d[\d.]*(?:(?:px|rem|em|vh|vw|vmin|vmax|ch|ex|pt|pc|cm|mm|in|q)(?![A-Za-z0-9])|%)/i

/*
 * Declaration d'une custom property a `0` nu.
 *
 * ⛔ Pas d'ancrage en debut de ligne. `main.css` est compresse — tout le
 * fichier tient sur UNE ligne — et une regle SCSS compacte
 * (`.f { --x: 0; }`) l'est aussi. Un detecteur ancre sur `^` annonce
 * « 0 violation » sur un fichier qui n'en contient qu'une seule, de ligne.
 * Le separateur admis est donc `{`, `;` ou un debut de fichier.
 */
const BARE_ZERO_DECL = /(?:^|[;{])\s*(--[A-Za-z0-9_-]+)\s*:\s*0\s*(?:!important\s*)?(?=[;}])/g

const MATH_FN = /\b(calc|min|max|clamp)\(/g
const VAR_OPEN = /\bvar\(\s*(--[A-Za-z0-9_-]+)/g

/** Avance depuis `from` (juste apres une parenthese ouvrante) jusqu'a sa fermante. */
function matchParen (text, from) {
	let depth = 1
	let i = from
	while (i < text.length && depth > 0) {
		if (text[i] === '(') depth++
		else if (text[i] === ')') depth--
		i++
	}
	return i // index JUSTE APRES la fermante
}

/** Toutes les fonctions mathematiques du texte, avec leur offset absolu. */
export function extractMathFns (text) {
	const out = []
	MATH_FN.lastIndex = 0
	let m
	while ((m = MATH_FN.exec(text))) {
		const end = matchParen(text, MATH_FN.lastIndex)
		out.push({ start: m.index, end, expr: text.slice(m.index, end) })
	}
	return out
}

/**
 * Nom de la propriete CSS qui porte l'expression : on remonte jusqu'au
 * separateur precedent (`;`, `{` ou `}`) et on lit le token avant `:`.
 * Sert a fabriquer un identifiant stable, JAMAIS un numero de ligne — une
 * baseline indexee sur des lignes casse a la premiere edition au-dessus.
 */
export function propertyFor (text, mathStart) {
	const head = text.slice(0, mathStart)
	const cut = Math.max(head.lastIndexOf(';'), head.lastIndexOf('{'), head.lastIndexOf('}'))
	/*
	 * ⛔ Retirer les commentaires AVANT de chercher le `:`. Sans ca, le long
	 * commentaire de corner-clearing qui precede `padding-inline:` dans
	 * `OrigamField.vue` fournissait le premier `:` et l'identifiant devenait
	 * `// Corner-clearing` — un identifiant de baseline qui bouge des qu'on
	 * reformule un commentaire, donc une baseline qui se perime toute seule.
	 */
	const decl = head.slice(cut + 1)
		.replace(/\/\*[\s\S]*?\*\//g, ' ')
		.replace(/\/\/[^\n]*/g, ' ')
	const colon = decl.indexOf(':')
	if (colon === -1) return '?'
	return decl.slice(0, colon).trim().replace(/\s+/g, ' ') || '?'
}

/** Le repli propre de ce `var(` est-il un `0` nu ? */
function bareZeroFallback (expr, varOpenEnd) {
	const end = matchParen(expr, varOpenEnd)
	const inner = expr.slice(varOpenEnd, end - 1)
	const comma = inner.indexOf(',')
	if (comma === -1) return { bare: false, end }
	return { bare: inner.slice(comma + 1).trim() === '0', end }
}

/**
 * Operande colle a `*` ou `/` ? Dans ce cas un `<number>` est LEGITIME,
 * voire obligatoire, et le lever serait un faux positif.
 */
function isMultiplicative (expr, varStart, varEnd) {
	const before = expr.slice(0, varStart).replace(/\s+$/, '')
	const after = expr.slice(varEnd).replace(/^\s+/, '')
	return before.endsWith('*') || before.endsWith('/') ||
		after.startsWith('*') || after.startsWith('/')
}

/**
 * @param {{path: string, source: string}[]} files
 * @returns {{id: string, file: string, property: string, varName: string,
 *            reason: 'bare-zero-declaration'|'bare-zero-fallback',
 *            expr: string, declaredAt: string[]}[]}
 */
export function analyseSources (files) {
	/* Passe 1 — toutes les custom properties posees a `0` nu, ou qu'elles soient. */
	const bareZero = new Map()
	for (const { path: p, source } of files) {
		BARE_ZERO_DECL.lastIndex = 0
		let d
		while ((d = BARE_ZERO_DECL.exec(source))) {
			const line = source.slice(0, d.index).split('\n').length
			if (!bareZero.has(d[1])) bareZero.set(d[1], [])
			bareZero.get(d[1]).push(`${ p }:${ line }`)
		}
	}

	/* Passe 2 — chaque lecture en position additive d'une expression de longueur. */
	const violations = []
	const seen = new Set()
	for (const { path: p, source } of files) {
		for (const { start, expr } of extractMathFns(source)) {
			if (!LENGTH_LITERAL.test(expr)) continue
			const property = propertyFor(source, start)

			VAR_OPEN.lastIndex = 0
			let v
			while ((v = VAR_OPEN.exec(expr))) {
				const name = v[1]
				const { bare, end } = bareZeroFallback(expr, VAR_OPEN.lastIndex)
				const declared = bareZero.get(name)
				if (!declared && !bare) continue
				if (isMultiplicative(expr, v.index, end)) continue

				const reason = declared ? 'bare-zero-declaration' : 'bare-zero-fallback'
				const id = `${ p }::${ property }::${ name }`
				if (seen.has(id)) continue
				seen.add(id)
				violations.push({
					id,
					file: p,
					property,
					varName: name,
					reason,
					expr: expr.replace(/\s+/g, ' ').slice(0, 150),
					declaredAt: declared ? [...declared] : []
				})
			}
		}
	}
	return violations
}
