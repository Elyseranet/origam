/**
 * lib/ts-token-refs — voir une reference `var(--origam-…)` ASSEMBLEE EN
 * TYPESCRIPT, la ou toutes les feuilles du monde n'en montrent rien.
 *
 * ⛔ L'ANGLE MORT (#823)
 * ----------------------
 * `token-var-channels` et `unitless-zero-in-calc` lisent DES FEUILLES :
 * les blocs `<style>` des SFC et les `*.css` de tokens. Une reference
 * concatenee a l'execution n'y figure nulle part :
 *
 *     function shadowVar (rung: string): string {
 *         return `var(${SHADOW_TOKEN_PREFIX}${rung})`
 *     }
 *
 * Aucun grep sur `var(--origam-` ne trouve celle-ci — le nom du token
 * n'apparait meme pas dans le texte du gabarit, il vient d'un import.
 * C'est exactement par la que #813 est passe : `useElevation` emettait
 * `var(--origam-shadow---2xl)` pour un token qu'AUCUNE feuille ne declare,
 * et les gardes restaient verts.
 *
 * ⛔ POURQUOI UNE REFERENCE IRRESOLVABLE EFFACE AU LIEU DE CEDER
 * ---------------------------------------------------------------
 * | echec au PARSE (sans `var()`)  | declaration ecartee -> la regle
 * |                                | precedente s'applique
 * | echec au COMPUTED-VALUE TIME   | la declaration a DEJA gagne la
 * | (avec `var()`)                 | cascade -> elle devient `unset` et
 * |                                | ECRASE ce qui marchait
 *
 * Une reference TS irresolvable ne « ne fait rien » pas : elle DETRUIT.
 *
 * COMMENT CE MODULE VOIT CES REFERENCES
 * --------------------------------------
 * Interpretation concrete, pas analyse compositionnelle. Pour chaque
 * gabarit dont le texte source contient `var(`, on remonte la chaine des
 * LIEURS qui l'entourent (parametres de fonction a type union de litteraux,
 * variables de boucle `for…of`), on ENUMERE le produit cartesien de leurs
 * domaines, et pour chaque affectation concrete on evalue le gabarit.
 *
 * ⛔ L'enumeration n'est pas un detail de performance, c'est ce qui rend le
 * resultat JUSTE. Une evaluation compositionnelle (« l'union des valeurs de
 * `rung` » x « l'union des branches du ternaire ») perd la CORRELATION entre
 * les deux et fabrique des references qui n'existent pas :
 *
 *     `var(${PREFIX}${rung}${fallback ? `, ${fallback}` : ''})`
 *
 * avec `const fallback = SHADOW_RUNG_FALLBACK[rung]`. En compositionnel,
 * `2xl` se combine aussi avec la branche vide et on « trouve » un
 * `var(--origam-shadow---2xl)` nu qui n'est plus emis depuis #813 — un faux
 * rouge sur du code correct. En concret, `rung = '2xl'` force
 * `fallback = '0 25px 50px …'`, donc la branche vide n'est pas prise. Les
 * consts locales sont evaluees PARESSEUSEMENT, sous l'environnement
 * concret : la correlation est gratuite.
 *
 * DEUX VERDICTS, PAS UN
 * ----------------------
 * • RESOLUE      — le jeu de valeurs est ferme, on connait les noms exacts
 *                  emis. Chacun doit etre declare par une feuille.
 * • IRRESOLVABLE — le nom depend d'une valeur qu'aucune analyse statique ne
 *                  borne. On ne peut rien dire du nom ; on peut en revanche
 *                  exiger un REPLI (`var(--x, valeur)`), qui transforme
 *                  mecaniquement un effacement en valeur par defaut. C'est
 *                  ce que `useRounded` fait depuis toujours, et la raison
 *                  pour laquelle le canal `rounded` n'a jamais eu ce defaut.
 *
 * LIMITES ASSUMEES (et pourquoi elles ne sont pas des trous)
 * -----------------------------------------------------------
 * • Pre-filtre `var(` sur le TEXTE SOURCE du gabarit. Un `var(` lui-meme
 *   assemble (`${OPEN}${name})`) echapperait. Aucun site du depot ne fait
 *   ca, et le pre-filtre est ce qui evite d'interpreter des milliers de
 *   gabarits sans rapport.
 * • Une lecture depuis une prop (`props[key]`) est UNKNOWN : le type la
 *   borne, mais un consommateur JS ne respecte aucun type. La reference
 *   tombe alors dans le verdict IRRESOLVABLE, ou l'exigence de repli
 *   s'applique — ce qui est precisement la bonne reponse pour une valeur
 *   venue de l'exterieur.
 * • Pas de flux inter-fonctions autre que l'appel direct (`f(x)` dont le
 *   corps est interprete). Un helper passe en callback est UNKNOWN.
 *
 * Aucune E/S ici : le module recoit ses sources par injection, pour que
 * l'auto-test lui serve des fixtures en memoire.
 */

import { createRequire } from 'node:module'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')

/** Valeur qu'aucune analyse statique ne borne. */
export const UNKNOWN = Symbol('unknown')

/** Plafond du produit cartesien des domaines d'un gabarit. */
const MAX_ENUMERATION = 4096
/** Profondeur maximale d'interpretation d'appels imbriques. */
const MAX_CALL_DEPTH = 6
/** Plafond des chemins explores par gabarit (forks sur test inconnu). */
const MAX_PATHS = 512

/*********************************************************
 * Chooser — l'enumeration de CHEMINS, et pourquoi elle n'est pas un luxe
 *
 * @description
 * Un test qu'on ne sait pas evaluer (`typeof value === 'number'`) n'autorise
 * pas a rendre UNKNOWN : les deux branches sont atteignables, et l'une d'elles
 * emet peut-etre une reference. On FORKE donc — mais sans jamais melanger deux
 * branches dans une meme valeur : chaque chemin est reexecute de bout en bout
 * avec ses decisions figees, donc les correlations internes tiennent.
 *
 * @description
 * ⛔ C'est la difference entre « l'union des possibles » et « l'ensemble des
 * executions possibles ». La premiere fabrique des combinaisons qui n'arrivent
 * jamais (cf. l'en-tete du module) ; la seconde n'invente rien.
 ********************************************************/
function makeChooser (prefix) {
    const taken = []
    const arity = []

    return {
        choose (n) {
            const i = taken.length
            const v = i < prefix.length ? prefix[i] : 0
            taken.push(v)
            arity.push(n)
            return v
        },
        taken,
        arity
    }
}

/** Chooser degenere : aucun fork possible (utilise hors enumeration). */
const NO_CHOICE = { choose: () => 0, taken: [], arity: [] }

/*********************************************************
 * scanVarReferences — extrait les references `var(--…)` d'une chaine CSS
 *
 * @description
 * Scanner a parentheses equilibrees : `var(--a, color-mix(in srgb, var(--b),
 * black 20%))` porte DEUX references, dont une imbriquee dans le repli de
 * l'autre. Un regex naif coupe au premier `)` et rate la seconde.
 *
 * @param text  une valeur CSS concrete (plus aucune interpolation)
 * @returns Array<{ name, hasFallback }>
 ********************************************************/
export function scanVarReferences (text) {
    const out = []
    if (typeof text !== 'string') return out

    for (let i = 0; i < text.length; i++) {
        if (!text.startsWith('var(', i)) continue
        // `--x` doit suivre immediatement (espaces admis)
        let j = i + 4
        while (j < text.length && /\s/.test(text[j])) j++
        if (!text.startsWith('--', j)) continue

        const nameStart = j
        while (j < text.length && /[A-Za-z0-9_-]/.test(text[j])) j++
        const name = text.slice(nameStart, j)

        // Repli = une virgule au niveau 1 avant la parenthese fermante
        let depth = 1
        let hasFallback = false
        let k = j
        for (; k < text.length && depth > 0; k++) {
            const c = text[k]
            if (c === '(') depth++
            else if (c === ')') depth--
            else if (c === ',' && depth === 1) hasFallback = true
        }

        out.push({ name, hasFallback })
    }

    return out
}

/** Marque d'une interpolation dont la valeur n'est pas calculable. */
export const HOLE = ''

/*********************************************************
 * maskInterpolations — ce qui reste LISIBLE quand tout n'est pas calculable
 *
 * @description
 * Un gabarit partiellement inconnu n'est pas totalement inconnu :
 *
 *     `border-${axis}-width: var(--origam-border__width---thin)`
 *
 * `axis` est libre, donc la chaine entiere est incalculable — mais le NOM DU
 * TOKEN, lui, est ecrit en clair. Le declarer « irresolvable » serait un faux
 * rouge sur une reference parfaitement verifiable.
 *
 * @description
 * Chaque `${…}` est donc remplace par une marque opaque. Une reference dont le
 * nom ne contient pas la marque est CONNUE, meme si le reste de la chaine ne
 * l'est pas ; une reference dont le nom en contient une ne l'est pas. Le
 * comptage d'accolades traverse les gabarits imbriques (`${x ? `, ${y}` : ''}`)
 * sans les lire.
 ********************************************************/
export function maskInterpolations (raw) {
    let out = ''
    for (let i = 0; i < raw.length; i++) {
        if (raw[i] === '$' && raw[i + 1] === '{') {
            let braces = 0
            for (; i < raw.length; i++) {
                if (raw[i] === '{') braces++
                else if (raw[i] === '}') { braces--; if (braces === 0) break }
            }
            out += HOLE
            continue
        }
        out += raw[i]
    }
    return out
}

/*********************************************************
 * scanMaskedVarReferences — comme `scanVarReferences`, marques comprises
 *
 * @description
 * `var(${PREFIX}${rung})` n'a meme pas de `--` apres `var(` : un scanner qui
 * exige le prefixe litteral ne voit RIEN et le site disparait du rapport. Or
 * c'est exactement la forme de #813. La marque est donc acceptee comme premier
 * caractere d'un nom.
 ********************************************************/
export function scanMaskedVarReferences (text) {
    const out = []

    for (let i = 0; i < text.length; i++) {
        if (!text.startsWith('var(', i)) continue
        let j = i + 4
        while (j < text.length && /\s/.test(text[j])) j++
        if (!text.startsWith('--', j) && text[j] !== HOLE) continue

        const nameStart = j
        while (j < text.length && (/[A-Za-z0-9_-]/.test(text[j]) || text[j] === HOLE)) j++
        const name = text.slice(nameStart, j)

        let depth = 1
        let hasFallback = false
        for (let k = j; k < text.length && depth > 0; k++) {
            const c = text[k]
            if (c === '(') depth++
            else if (c === ')') depth--
            else if (c === ',' && depth === 1) hasFallback = true
        }

        out.push({ name, hasFallback, resolved: !name.includes(HOLE) })
    }

    return out
}

/*********************************************************
 * createInterpreter — le graphe de modules + l'interprete concret
 *
 * @param readSource      (absPath) => string | null
 * @param resolveSpecifier (fromAbs, specifier) => absPath | null
 ********************************************************/
export function createInterpreter ({ readSource, resolveSpecifier }) {
    const sourceCache = new Map()

    function sourceFile (absPath) {
        if (sourceCache.has(absPath)) return sourceCache.get(absPath)
        const text = readSource(absPath)
        const sf = text === null || text === undefined
            ? null
            : ts.createSourceFile(absPath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
        sourceCache.set(absPath, sf)
        return sf
    }

    /** Declaration exportee (ou simplement top-level) `name` dans `absPath`. */
    function findExported (absPath, name, seen = new Set()) {
        if (seen.has(absPath)) return null
        seen.add(absPath)

        const sf = sourceFile(absPath)
        if (!sf) return null

        for (const st of sf.statements) {
            if (ts.isVariableStatement(st)) {
                for (const d of st.declarationList.declarations) {
                    if (ts.isIdentifier(d.name) && d.name.text === name) return { decl: d, file: absPath }
                }
            } else if (ts.isFunctionDeclaration(st) && st.name && st.name.text === name) {
                return { decl: st, file: absPath }
            } else if (ts.isEnumDeclaration(st) && st.name.text === name) {
                return { decl: st, file: absPath }
            } else if (ts.isTypeAliasDeclaration(st) && st.name.text === name) {
                return { decl: st, file: absPath }
            } else if (ts.isInterfaceDeclaration(st) && st.name.text === name) {
                return { decl: st, file: absPath }
            }
        }

        // barrels: `export { X } from './y'` / `export * from './y'`
        for (const st of sf.statements) {
            if (!ts.isExportDeclaration(st) || !st.moduleSpecifier) continue
            const target = resolveSpecifier(absPath, st.moduleSpecifier.text)
            if (!target) continue

            if (st.exportClause && ts.isNamedExports(st.exportClause)) {
                const hit = st.exportClause.elements.find((e) => e.name.text === name)
                if (!hit) continue
                const original = hit.propertyName ? hit.propertyName.text : name
                const found = findExported(target, original, seen)
                if (found) return found
            } else if (!st.exportClause) {
                const found = findExported(target, name, seen)
                if (found) return found
            }
        }

        // imports re-exposes implicitement (un fichier qui importe puis reexporte
        // via `export { X }` sans clause `from` est couvert plus haut).
        return resolveImportBinding(absPath, name, seen)
    }

    function resolveImportBinding (absPath, name, seen = new Set()) {
        const sf = sourceFile(absPath)
        if (!sf) return null

        for (const st of sf.statements) {
            if (!ts.isImportDeclaration(st) || !st.importClause) continue
            const clause = st.importClause
            const spec = st.moduleSpecifier
            if (!ts.isStringLiteral(spec)) continue

            let original = null
            if (clause.name && clause.name.text === name) original = 'default'
            if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
                const hit = clause.namedBindings.elements.find((e) => e.name.text === name)
                if (hit) original = hit.propertyName ? hit.propertyName.text : name
            }
            if (!original) continue

            const target = resolveSpecifier(absPath, spec.text)
            if (!target) return null
            return findExported(target, original, seen)
        }
        return null
    }

    /** Remonte les parents pour trouver le lieur de `name` visible depuis `node`. */
    function lookupLocal (name, node) {
        let cur = node
        while (cur) {
            const parent = cur.parent

            if (parent && ts.isBlock(parent)) {
                const found = declInStatements(parent.statements, name)
                if (found) return found
            }
            if (parent && ts.isSourceFile(parent)) {
                const found = declInStatements(parent.statements, name)
                if (found) return found
            }
            if (parent && ts.isFunctionLike(parent)) {
                for (const p of parent.parameters) {
                    if (ts.isIdentifier(p.name) && p.name.text === name) return { kind: 'param', decl: p }
                }
                if (parent.body && ts.isBlock(parent.body)) {
                    const found = declInStatements(parent.body.statements, name)
                    if (found) return found
                }
            }
            if (parent && (ts.isForOfStatement(parent) || ts.isForInStatement(parent))) {
                const bound = bindingNamesOf(parent.initializer)
                if (bound.includes(name)) return { kind: 'loop', decl: parent }
            }

            cur = parent
        }
        return null
    }

    function declInStatements (statements, name) {
        for (const st of statements) {
            if (ts.isVariableStatement(st)) {
                for (const d of st.declarationList.declarations) {
                    if (ts.isIdentifier(d.name) && d.name.text === name) return { kind: 'var', decl: d }
                }
            } else if (ts.isFunctionDeclaration(st) && st.name && st.name.text === name) {
                return { kind: 'fn', decl: st }
            }
        }
        return null
    }

    function bindingNamesOf (initializer) {
        const names = []
        if (!initializer || !ts.isVariableDeclarationList(initializer)) return names
        for (const d of initializer.declarations) collectBindingNames(d.name, names)
        return names
    }

    function collectBindingNames (nameNode, out) {
        if (ts.isIdentifier(nameNode)) out.push(nameNode.text)
        else if (ts.isArrayBindingPattern(nameNode) || ts.isObjectBindingPattern(nameNode)) {
            for (const el of nameNode.elements) {
                if (ts.isOmittedExpression(el)) continue
                collectBindingNames(el.name, out)
            }
        }
    }

    // ---------------------------------------------------------------
    // Evaluation concrete
    // ---------------------------------------------------------------

    function evaluate (node, ctx) {
        if (!node) return UNKNOWN
        if (ctx.depth > MAX_CALL_DEPTH) return UNKNOWN

        if (ts.isParenthesizedExpression(node)) return evaluate(node.expression, ctx)
        if (ts.isAsExpression(node) || ts.isTypeAssertionExpression?.(node)) return evaluate(node.expression, ctx)
        if (ts.isNonNullExpression(node)) return evaluate(node.expression, ctx)
        if (ts.isSatisfiesExpression?.(node)) return evaluate(node.expression, ctx)

        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
        if (ts.isNumericLiteral(node)) return Number(node.text)
        if (node.kind === ts.SyntaxKind.TrueKeyword) return true
        if (node.kind === ts.SyntaxKind.FalseKeyword) return false
        if (node.kind === ts.SyntaxKind.NullKeyword) return null
        if (ts.isIdentifier(node) && node.text === 'undefined') return undefined

        if (ts.isTemplateExpression(node)) {
            let out = node.head.text
            for (const span of node.templateSpans) {
                const v = evaluate(span.expression, ctx)
                if (v === UNKNOWN || typeof v === 'object' && v !== null) return UNKNOWN
                out += String(v) + span.literal.text
            }
            return out
        }

        if (ts.isArrayLiteralExpression(node)) {
            return node.elements.map((e) => evaluate(e, ctx))
        }

        if (ts.isObjectLiteralExpression(node)) {
            const map = new Map()
            for (const p of node.properties) {
                if (!ts.isPropertyAssignment(p)) return UNKNOWN
                let key
                if (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) key = p.name.text
                else if (ts.isNumericLiteral(p.name)) key = p.name.text
                else if (ts.isComputedPropertyName(p.name)) {
                    const k = evaluate(p.name.expression, ctx)
                    if (k === UNKNOWN) return UNKNOWN
                    key = String(k)
                } else return UNKNOWN
                map.set(key, evaluate(p.initializer, ctx))
            }
            return map
        }

        if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Set') {
            const arg = node.arguments && node.arguments[0]
            const items = arg ? evaluate(arg, ctx) : []
            if (items === UNKNOWN || !Array.isArray(items)) return UNKNOWN
            return new Set(items)
        }
        if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Map') {
            const arg = node.arguments && node.arguments[0]
            const items = arg ? evaluate(arg, ctx) : []
            if (items === UNKNOWN || !Array.isArray(items)) return UNKNOWN
            const m = new Map()
            for (const pair of items) {
                if (!Array.isArray(pair) || pair.length < 2) return UNKNOWN
                m.set(pair[0], pair[1])
            }
            return m
        }

        if (ts.isConditionalExpression(node)) {
            const test = evaluate(node.condition, ctx)
            if (test !== UNKNOWN) return evaluate(truthy(test) ? node.whenTrue : node.whenFalse, ctx)

            // Test indecidable : les deux branches sont atteignables — on forke.
            const branchCtx = { ...ctx, env: new Map(ctx.env) }
            const takeTrue = ctx.chooser.choose(2) === 0
            if (takeTrue) narrowFrom(node.condition, branchCtx)
            return evaluate(takeTrue ? node.whenTrue : node.whenFalse, branchCtx)
        }

        if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
            const v = evaluate(node.operand, ctx)
            if (v === UNKNOWN) return UNKNOWN
            return !truthy(v)
        }

        if (ts.isTypeOfExpression(node)) {
            const v = evaluate(node.expression, ctx)
            if (v === UNKNOWN) return UNKNOWN
            if (v === null) return 'object'
            if (Array.isArray(v) || v instanceof Set || v instanceof Map) return 'object'
            return typeof v
        }

        if (ts.isBinaryExpression(node)) return evaluateBinary(node, ctx)

        if (ts.isIdentifier(node)) return evaluateIdentifier(node, ctx)

        if (ts.isPropertyAccessExpression(node)) {
            // Enum member: `BG_FG_ROLE.DEFAULT`
            const target = evaluate(node.expression, ctx)
            if (target === UNKNOWN) return UNKNOWN
            const key = node.name.text
            if (target instanceof Map) return target.has(key) ? target.get(key) : undefined
            if (Array.isArray(target) && key === 'length') return target.length
            if (target instanceof Set && key === 'size') return target.size
            if (typeof target === 'string' && key === 'length') return target.length
            return UNKNOWN
        }

        if (ts.isElementAccessExpression(node)) {
            const target = evaluate(node.expression, ctx)
            const key = evaluate(node.argumentExpression, ctx)
            if (target === UNKNOWN || key === UNKNOWN) return UNKNOWN
            if (target instanceof Map) return target.has(String(key)) ? target.get(String(key)) : undefined
            if (Array.isArray(target)) return target[Number(key)]
            return UNKNOWN
        }

        if (ts.isCallExpression(node)) return evaluateCall(node, ctx)

        return UNKNOWN
    }

    function truthy (v) {
        if (v === UNKNOWN) return false
        if (Array.isArray(v)) return true
        if (v instanceof Set || v instanceof Map) return true
        return Boolean(v)
    }

    function evaluateBinary (node, ctx) {
        const op = node.operatorToken.kind

        if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
            const l = evaluate(node.left, ctx)
            if (l === UNKNOWN) return UNKNOWN
            return truthy(l) ? evaluate(node.right, ctx) : l
        }
        if (op === ts.SyntaxKind.BarBarToken) {
            const l = evaluate(node.left, ctx)
            if (l === UNKNOWN) return UNKNOWN
            return truthy(l) ? l : evaluate(node.right, ctx)
        }
        if (op === ts.SyntaxKind.QuestionQuestionToken) {
            const l = evaluate(node.left, ctx)
            if (l === UNKNOWN) return UNKNOWN
            return (l === null || l === undefined) ? evaluate(node.right, ctx) : l
        }

        const l = evaluate(node.left, ctx)
        const r = evaluate(node.right, ctx)
        if (l === UNKNOWN || r === UNKNOWN) return UNKNOWN

        switch (op) {
            case ts.SyntaxKind.PlusToken:
                if (typeof l === 'object' && l !== null) return UNKNOWN
                if (typeof r === 'object' && r !== null) return UNKNOWN
                return l + r
            case ts.SyntaxKind.EqualsEqualsEqualsToken:
            case ts.SyntaxKind.EqualsEqualsToken:
                return l === r
            case ts.SyntaxKind.ExclamationEqualsEqualsToken:
            case ts.SyntaxKind.ExclamationEqualsToken:
                return l !== r
            default:
                return UNKNOWN
        }
    }

    function evaluateIdentifier (node, ctx) {
        const name = node.text
        if (ctx.env.has(name)) return ctx.env.get(name)

        const local = lookupLocal(name, node)
        if (local) {
            if (local.kind === 'var' && local.decl.initializer) {
                return evaluate(local.decl.initializer, { ...ctx, depth: ctx.depth + 1 })
            }
            if (local.kind === 'fn') return { __fn: local.decl, __file: ctx.file }
            // `param` / `loop` non lies dans l'env : valeur inconnue a ce point
            return UNKNOWN
        }

        const imported = resolveImportBinding(ctx.file, name)
        if (imported) return evaluateDeclaration(imported, ctx)

        return UNKNOWN
    }

    function evaluateDeclaration (found, ctx) {
        const { decl, file } = found
        const nextCtx = { env: new Map(), file, depth: ctx.depth + 1 }

        if (ts.isVariableDeclaration(decl)) {
            if (!decl.initializer) return UNKNOWN
            return evaluate(decl.initializer, nextCtx)
        }
        if (ts.isFunctionDeclaration(decl)) return { __fn: decl, __file: file }
        if (ts.isEnumDeclaration(decl)) {
            const m = new Map()
            let auto = 0
            for (const member of decl.members) {
                const key = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : null
                if (key === null) continue
                m.set(key, member.initializer ? evaluate(member.initializer, nextCtx) : auto++)
            }
            return m
        }
        return UNKNOWN
    }

    function evaluateCall (node, ctx) {
        const callee = node.expression

        // Methodes connues sur des valeurs concretes
        if (ts.isPropertyAccessExpression(callee)) {
            const method = callee.name.text
            const target = evaluate(callee.expression, ctx)

            if (target !== UNKNOWN) {
                const args = node.arguments.map((a) => evaluate(a, ctx))
                if (args.some((a) => a === UNKNOWN)) return UNKNOWN

                if (target instanceof Set && method === 'has') return target.has(args[0])
                if (target instanceof Map && method === 'has') return target.has(String(args[0]))
                if (target instanceof Map && method === 'get') return target.get(String(args[0]))
                if (Array.isArray(target) && method === 'includes') return target.includes(args[0])
                if (Array.isArray(target) && method === 'indexOf') return target.indexOf(args[0])
                if (Array.isArray(target) && method === 'join') return target.join(args[0] ?? ',')
                if (typeof target === 'string') {
                    if (method === 'toLowerCase') return target.toLowerCase()
                    if (method === 'toUpperCase') return target.toUpperCase()
                    if (method === 'trim') return target.trim()
                    if (method === 'replace' && args.length === 2 && typeof args[0] === 'string') return target.replace(args[0], args[1])
                    if (method === 'startsWith') return target.startsWith(args[0])
                    if (method === 'endsWith') return target.endsWith(args[0])
                    if (method === 'includes') return target.includes(args[0])
                }
                // `Object.keys(x)` / `Object.values(x)`
            }

            if (ts.isIdentifier(callee.expression) && callee.expression.text === 'Object') {
                const arg = evaluate(node.arguments[0], ctx)
                if (arg === UNKNOWN) return UNKNOWN
                if (arg instanceof Map) {
                    if (method === 'keys') return [ ...arg.keys() ]
                    if (method === 'values') return [ ...arg.values() ]
                    if (method === 'entries') return [ ...arg.entries() ].map(([ k, v ]) => [ k, v ])
                }
            }

            return UNKNOWN
        }

        if (!ts.isIdentifier(callee)) return UNKNOWN

        const fn = evaluate(callee, ctx)
        if (fn === UNKNOWN || !fn || !fn.__fn) return UNKNOWN

        const args = node.arguments.map((a) => evaluate(a, ctx))
        return callFunction(fn.__fn, fn.__file, args, ctx.depth + 1)
    }

    /** Interprete un corps de fonction restreint : const / if / return. */
    function callFunction (fnNode, file, args, depth) {
        if (depth > MAX_CALL_DEPTH) return UNKNOWN
        const env = new Map()

        fnNode.parameters.forEach((p, i) => {
            if (!ts.isIdentifier(p.name)) return
            let v = args[i]
            if (v === undefined && p.initializer) v = evaluate(p.initializer, { env, file, depth })
            env.set(p.name.text, v === undefined ? undefined : v)
        })

        const body = fnNode.body
        if (!body) return UNKNOWN
        if (!ts.isBlock(body)) return evaluate(body, { env, file, depth })

        const result = execBlock(body, { env, file, depth })
        return result.kind === 'return' ? result.value : UNKNOWN
    }

    function execBlock (block, ctx) {
        for (const st of block.statements) {
            const r = execStatement(st, ctx)
            if (r.kind !== 'next') return r
        }
        return { kind: 'next' }
    }

    function execStatement (st, ctx) {
        if (ts.isVariableStatement(st)) {
            for (const d of st.declarationList.declarations) {
                if (!ts.isIdentifier(d.name)) return { kind: 'abort' }
                ctx.env.set(d.name.text, d.initializer ? evaluate(d.initializer, ctx) : undefined)
            }
            return { kind: 'next' }
        }
        if (ts.isReturnStatement(st)) {
            return { kind: 'return', value: st.expression ? evaluate(st.expression, ctx) : undefined }
        }
        if (ts.isIfStatement(st)) {
            const test = evaluate(st.expression, ctx)
            if (test !== UNKNOWN) {
                if (truthy(test)) return execNested(st.thenStatement, ctx)
                if (st.elseStatement) return execNested(st.elseStatement, ctx)
                return { kind: 'next' }
            }

            // Meme raisonnement que pour le ternaire : on forke plutot que
            // d'abandonner, sinon tout corps de fonction garde devient opaque.
            if (ctx.chooser.choose(2) === 0) {
                narrowFrom(st.expression, ctx)
                return execNested(st.thenStatement, ctx)
            }
            if (st.elseStatement) return execNested(st.elseStatement, ctx)
            return { kind: 'next' }
        }
        if (ts.isBlock(st)) return execBlock(st, ctx)
        if (ts.isExpressionStatement(st)) return { kind: 'next' }
        return { kind: 'abort' }
    }

    function execNested (st, ctx) {
        if (ts.isBlock(st)) return execBlock(st, ctx)
        return execStatement(st, ctx)
    }

    /*********************************************************
     * narrowFrom — le GARDE qui borne une valeur que le type ne borne pas
     *
     * @description
     * Le depot borne ses valeurs par des gardes, pas par des types fermes :
     *
     *     if (ROUNDED_RUNGS.includes(value)) return `var(--origam-radius---${value})`
     *
     * `value` est type `TBracketRounded` (`string | number | boolean | null`) :
     * le type n'apprend rien. Le GARDE, lui, ferme le jeu de valeurs pour la
     * branche prise. Sans cette lecture, la moitie des references du DS reste
     * « irresolvable » sur du code parfaitement borne.
     *
     * @description
     * N'ecrit QUE sur une variable encore inconnue : un garde ne doit jamais
     * contredire une valeur deja fixee par l'enumeration des lieurs.
     ********************************************************/
    function narrowFrom (condition, ctx) {
        for (const fact of extractFacts(condition, ctx)) {
            const current = ctx.env.has(fact.name) ? ctx.env.get(fact.name) : UNKNOWN
            if (current !== UNKNOWN && current !== undefined) continue
            if (!fact.values.length) continue
            ctx.env.set(fact.name, fact.values[ctx.chooser.choose(fact.values.length)])
        }
    }

    function extractFacts (node, ctx) {
        if (!node) return []
        if (ts.isParenthesizedExpression(node)) return extractFacts(node.expression, ctx)

        if (ts.isBinaryExpression(node)) {
            const op = node.operatorToken.kind
            if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
                return [ ...extractFacts(node.left, ctx), ...extractFacts(node.right, ctx) ]
            }
            if (op === ts.SyntaxKind.InKeyword && ts.isIdentifier(node.left)) {
                const obj = evaluate(node.right, ctx)
                if (obj instanceof Map) return [ { name: node.left.text, values: [ ...obj.keys() ] } ]
                return []
            }
            if (op === ts.SyntaxKind.EqualsEqualsEqualsToken || op === ts.SyntaxKind.EqualsEqualsToken) {
                if (ts.isIdentifier(node.left)) {
                    const v = evaluate(node.right, ctx)
                    if (v !== UNKNOWN && typeof v !== 'object') return [ { name: node.left.text, values: [ v ] } ]
                }
                if (ts.isIdentifier(node.right)) {
                    const v = evaluate(node.left, ctx)
                    if (v !== UNKNOWN && typeof v !== 'object') return [ { name: node.right.text, values: [ v ] } ]
                }
            }
            return []
        }

        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
            const method = node.expression.name.text
            if (method !== 'has' && method !== 'includes') return []
            const arg = node.arguments[0]
            if (!arg || !ts.isIdentifier(arg)) return []
            const target = evaluate(node.expression.expression, ctx)
            if (target instanceof Set) return [ { name: arg.text, values: [ ...target ] } ]
            if (Array.isArray(target) && !target.includes(UNKNOWN)) return [ { name: arg.text, values: target } ]
            return []
        }

        return []
    }

    /*********************************************************
     * applyDominatorNarrowing — les gardes qui DOMINENT le gabarit
     *
     * @description
     * `narrowFrom` sert quand on EXECUTE un corps de fonction. Un gabarit
     * atteint directement (pas via un appel) n'est execute par personne : ses
     * gardes sont ses ANCETRES syntaxiques. On remonte donc la chaine et on
     * applique les faits de chaque `if` / ternaire / `&&` dont le gabarit
     * occupe la branche vraie.
     ********************************************************/
    function applyDominatorNarrowing (node, ctx) {
        const conditions = []
        const guardsBefore = []
        let cur = node

        while (cur && cur.parent) {
            const parent = cur.parent
            if (ts.isIfStatement(parent) && parent.thenStatement === cur) conditions.push({ node: parent.expression, mustBe: true })
            else if (ts.isIfStatement(parent) && parent.elseStatement === cur) conditions.push({ node: parent.expression, mustBe: false })
            else if (ts.isConditionalExpression(parent) && parent.whenTrue === cur) conditions.push({ node: parent.condition, mustBe: true })
            else if (ts.isConditionalExpression(parent) && parent.whenFalse === cur) conditions.push({ node: parent.condition, mustBe: false })
            else if (ts.isBinaryExpression(parent)
                && parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
                && parent.right === cur) conditions.push({ node: parent.left, mustBe: true })

            if (ts.isBlock(parent) || ts.isSourceFile(parent) || ts.isCaseClause(parent)) {
                for (const st of parent.statements) {
                    if (st === cur) break
                    if (ts.isIfStatement(st) && !st.elseStatement && exitsUnconditionally(st.thenStatement)) {
                        guardsBefore.push(st.expression)
                    }
                }
            }

            cur = parent
        }

        // Du plus externe au plus interne : un garde interne doit pouvoir
        // s'appuyer sur ce qu'un garde externe a deja fixe.
        for (const { node: condition, mustBe } of conditions.reverse()) {
            const value = evaluate(condition, ctx)
            if (value !== UNKNOWN && truthy(value) !== mustBe) return false // chemin impossible
            if (mustBe) narrowFrom(condition, ctx)
        }

        /*
         * ⛔ Le RETOUR ANTICIPE d'un frere PRECEDENT, sans quoi on invente des
         * references. `tokenForegroundForIntent` trie huit intentions par une
         * cascade de `if (…) return …` ; le dernier `return` n'a AUCUN
         * ancetre conditionnel, donc sans cette passe les huit intentions
         * l'atteignent et le module « trouve » un
         * `--origam-color__action--danger---fgSubtle` qu'aucune execution
         * n'emet — un faux rouge sur du code correct. Un `if` dont la branche
         * sort inconditionnellement et dont la condition est VRAIE ici rend
         * tout ce qui suit inatteignable.
         */
        for (const guard of guardsBefore) {
            const value = evaluate(guard, ctx)
            if (value !== UNKNOWN && truthy(value)) return false
        }

        return true
    }

    /** Un corps de branche qui ne rend jamais la main au flot suivant. */
    function exitsUnconditionally (statement) {
        if (!statement) return false
        if (ts.isReturnStatement(statement) || ts.isThrowStatement(statement)
            || ts.isContinueStatement(statement) || ts.isBreakStatement(statement)) return true
        if (ts.isBlock(statement)) {
            const last = statement.statements[statement.statements.length - 1]
            return exitsUnconditionally(last)
        }
        return false
    }

    // ---------------------------------------------------------------
    // Domaines : de quoi enumerer les lieurs qui entourent un gabarit
    // ---------------------------------------------------------------

    /** Union de litteraux de chaine d'un TypeNode, ou null si non borne. */
    function literalsOfType (typeNode, file, seen = new Set()) {
        if (!typeNode) return null

        if (ts.isLiteralTypeNode(typeNode)) {
            const lit = typeNode.literal
            if (ts.isStringLiteral(lit)) return [ lit.text ]
            if (ts.isNumericLiteral(lit)) return [ Number(lit.text) ]
            return null
        }
        if (ts.isUnionTypeNode(typeNode)) {
            const out = []
            for (const member of typeNode.types) {
                const vals = literalsOfType(member, file, seen)
                if (!vals) return null
                out.push(...vals)
            }
            return out
        }
        if (ts.isParenthesizedTypeNode(typeNode)) return literalsOfType(typeNode.type, file, seen)

        /*
         * ⛔ `type TIntent = `${INTENT}`` — le gabarit de type sur un enum est
         * L'IDIOME DOMINANT de ce depot (TIntent, TBgFgRole, TElevation…).
         * Sans cette branche, la quasi-totalite des parametres du DS tombe en
         * « non borne » et le garde ne resout plus rien.
         */
        if (ts.isTemplateLiteralTypeNode(typeNode)) {
            let combos = [ typeNode.head.text ]
            for (const span of typeNode.templateSpans) {
                const parts = literalsOfType(span.type, file, seen)
                if (!parts) return null
                const grown = []
                for (const c of combos) for (const p of parts) grown.push(c + String(p) + span.literal.text)
                combos = grown
                if (combos.length > MAX_ENUMERATION) return null
            }
            return combos
        }

        if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
            const key = `${file}::${typeNode.typeName.text}`
            if (seen.has(key)) return null
            seen.add(key)

            const local = findExported(file, typeNode.typeName.text)
            if (!local) return null
            if (ts.isTypeAliasDeclaration(local.decl)) return literalsOfType(local.decl.type, local.file, seen)
            if (ts.isEnumDeclaration(local.decl)) {
                const out = []
                let auto = 0
                for (const member of local.decl.members) {
                    if (!member.initializer) { out.push(auto++); continue }
                    const v = evaluate(member.initializer, { env: new Map(), file: local.file, depth: 0, chooser: NO_CHOICE })
                    if (v === UNKNOWN || typeof v === 'object') return null
                    out.push(v)
                }
                return out
            }
            return null
        }
        return null
    }

    /**
     * Chaine des lieurs entourant `node`, du plus externe au plus interne.
     * Chaque lieur expose `names` et une facon de produire ses affectations.
     */
    function bindersAround (node) {
        const chain = []
        let cur = node
        while (cur) {
            if (ts.isForOfStatement(cur)) chain.unshift({ kind: 'forOf', node: cur })
            else if (ts.isFunctionLike(cur)) chain.unshift({ kind: 'fn', node: cur })
            cur = cur.parent
        }
        return chain
    }

    /*********************************************************
     * enumerateEnvironments — les environnements concrets autour d'un gabarit
     *
     * @description
     * ⚠️ `truncated` ne dit PAS « un parametre n'est pas borne ». Un parametre
     * non borne est lie a UNKNOWN, et UNKNOWN se propage tout seul par
     * l'evaluation — si le gabarit ne le lit pas, sa valeur reste parfaitement
     * resolvable. Confondre les deux etait le premier defaut de ce module :
     * `'var(--origam-radius---md)'`, une chaine LITTERALE sans la moindre
     * interpolation, etait declaree irresolvable parce qu'un parametre voisin
     * de la meme fonction n'avait pas de type ferme.
     *
     * @description
     * `truncated` signale UNIQUEMENT un plafond atteint : la couverture est
     * alors incomplete et on ne certifie plus rien.
     *
     * @returns { envs: Array<Map>, truncated: boolean }
     ********************************************************/
    function enumerateEnvironments (node, file) {
        const binders = bindersAround(node)
        let envs = [ new Map() ]
        let truncated = false

        for (const binder of binders) {
            const next = []

            for (const env of envs) {
                const ctx = { env, file, depth: 0, chooser: NO_CHOICE }

                if (binder.kind === 'fn') {
                    let combos = [ new Map(env) ]
                    // `RUNGS.map((rung) => …)` — le domaine du parametre vient de la
                    // COLLECTION, pas d'un type : le rappel n'en a aucun.
                    const iterated = callbackIterationDomain(binder.node, ctx)

                    for (const [ index, p ] of binder.node.parameters.entries()) {
                        if (!ts.isIdentifier(p.name)) continue
                        const values = (iterated && index === 0) ? iterated : literalsOfType(p.type, file)
                        if (!values || !values.length) {
                            combos = combos.map((c) => { const n = new Map(c); n.set(p.name.text, UNKNOWN); return n })
                            continue
                        }
                        const grown = []
                        for (const c of combos) {
                            for (const v of values) {
                                const n = new Map(c)
                                n.set(p.name.text, v)
                                grown.push(n)
                            }
                        }
                        combos = grown
                        if (combos.length > MAX_ENUMERATION) { truncated = true; combos = combos.slice(0, MAX_ENUMERATION) }
                    }
                    next.push(...combos)
                    continue
                }

                // for…of
                const iterated = evaluate(binder.node.expression, ctx)
                const items = iterated === UNKNOWN
                    ? null
                    : (Array.isArray(iterated) ? iterated : (iterated instanceof Set ? [ ...iterated ] : (iterated instanceof Map ? [ ...iterated.entries() ] : null)))

                const names = bindingNamesOf(binder.node.initializer)
                if (!items) {
                    const n = new Map(env)
                    for (const name of names) n.set(name, UNKNOWN)
                    next.push(n)
                    continue
                }

                const decl = binder.node.initializer.declarations?.[0]
                for (const item of items) {
                    const n = new Map(env)
                    bindPattern(decl?.name, item, n)
                    next.push(n)
                }
            }

            envs = next
            if (envs.length > MAX_ENUMERATION) { truncated = true; envs = envs.slice(0, MAX_ENUMERATION) }
        }

        return { envs, truncated }
    }

    /** Methodes dont le premier argument est un rappel appele par element. */
    const ITERATION_METHODS = new Set([ 'map', 'forEach', 'filter', 'find', 'flatMap', 'some', 'every' ])

    /*********************************************************
     * callbackIterationDomain — le domaine d'un parametre de RAPPEL
     *
     * @description
     * `RUNGS.map((rung) => …)` : `rung` n'a pas de type ecrit et n'est pas une
     * variable de boucle. Son domaine est pourtant parfaitement ferme — c'est
     * la collection. Sans cette lecture, tout gabarit construit dans un `.map`
     * tombe en « irresolvable », ce qui est la forme la plus courante de
     * l'assemblage de tokens dans ce depot apres `for…of`.
     ********************************************************/
    function callbackIterationDomain (fnNode, ctx) {
        const call = fnNode.parent
        if (!call || !ts.isCallExpression(call) || call.arguments[0] !== fnNode) return null
        if (!ts.isPropertyAccessExpression(call.expression)) return null
        if (!ITERATION_METHODS.has(call.expression.name.text)) return null

        const target = evaluate(call.expression.expression, ctx)
        if (Array.isArray(target) && !target.includes(UNKNOWN)) return target
        if (target instanceof Set) return [ ...target ]
        return null
    }

    function bindPattern (nameNode, value, env) {
        if (!nameNode) return
        if (ts.isIdentifier(nameNode)) { env.set(nameNode.text, value); return }
        if (ts.isArrayBindingPattern(nameNode)) {
            const arr = Array.isArray(value) ? value : null
            nameNode.elements.forEach((el, i) => {
                if (ts.isOmittedExpression(el)) return
                bindPattern(el.name, arr ? arr[i] : UNKNOWN, env)
            })
            return
        }
        if (ts.isObjectBindingPattern(nameNode)) {
            for (const el of nameNode.elements) {
                const key = el.propertyName && (ts.isIdentifier(el.propertyName) || ts.isStringLiteral(el.propertyName))
                    ? el.propertyName.text
                    : (ts.isIdentifier(el.name) ? el.name.text : null)
                const v = (value instanceof Map && key !== null) ? value.get(key) : UNKNOWN
                bindPattern(el.name, v, env)
            }
        }
    }

    /*********************************************************
     * evaluateAllPaths — rejoue le gabarit une fois par chemin d'execution
     *
     * @description
     * Chaque execution part d'un environnement NEUF (clone) et d'un vecteur de
     * decisions fige. Les successeurs d'un chemin s'obtiennent en basculant une
     * decision prise apres la fin du prefixe — enumeration classique, chaque
     * chemin visite une seule fois.
     ********************************************************/
    function evaluateAllPaths (node, baseEnv, file) {
        const values = []
        const queue = [ [] ]
        let runs = 0

        while (queue.length && runs < MAX_PATHS) {
            const prefix = queue.shift()
            runs++

            const chooser = makeChooser(prefix)
            const ctx = { env: new Map(baseEnv), file, depth: 0, chooser }

            let value
            let feasible = true
            try {
                feasible = applyDominatorNarrowing(node, ctx)
                if (feasible) value = evaluate(node, ctx)
            } catch {
                value = UNKNOWN
            }
            if (feasible) values.push(value)

            for (let i = prefix.length; i < chooser.taken.length; i++) {
                for (let alt = 0; alt < chooser.arity[i]; alt++) {
                    if (alt === chooser.taken[i]) continue
                    queue.push([ ...chooser.taken.slice(0, i), alt ])
                }
            }
        }

        if (queue.length) values.push(UNKNOWN) // exploration tronquee : on ne certifie rien
        return values
    }

    /*********************************************************
     * analyseFile — le point d'entree
     *
     * @param absPath  chemin absolu (sert de cle du graphe de modules)
     * @returns Array<{ name|null, hasFallback, resolved, line, snippet }>
     ********************************************************/
    function analyseFile (absPath) {
        const sf = sourceFile(absPath)
        if (!sf) return []

        const candidates = []
        collectCandidates(sf, candidates)

        const out = []

        for (const node of candidates) {
            const { envs, truncated } = enumerateEnvironments(node, absPath)
            const produced = new Set()
            let anyUnknown = truncated

            for (const env of envs) {
                for (const value of evaluateAllPaths(node, env, absPath)) {
                    if (value === UNKNOWN || typeof value !== 'string') { anyUnknown = true; continue }
                    produced.add(value)
                }
            }

            const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
            const snippet = squash(node.getText(sf))

            const seenNames = new Set()
            for (const value of produced) {
                for (const ref of scanVarReferences(value)) {
                    if (!ref.name.startsWith('--origam-')) continue
                    const key = `${ref.name}::${ref.hasFallback}`
                    if (seenNames.has(key)) continue
                    seenNames.add(key)
                    out.push({ name: ref.name, hasFallback: ref.hasFallback, resolved: true, line, snippet })
                }
            }

            if (!anyUnknown) continue

            /*
             * L'evaluation concrete n'a pas tout couvert. Le TEXTE, lui, reste
             * lisible : on retombe sur la lecture masquee, reference par
             * reference — une par une, et non « tout le site est opaque ».
             */
            for (const ref of scanMaskedVarReferences(maskInterpolations(node.getText(sf)))) {
                if (ref.resolved) {
                    if (!ref.name.startsWith('--origam-')) continue
                    const key = `${ref.name}::${ref.hasFallback}`
                    if (seenNames.has(key)) continue
                    seenNames.add(key)
                    out.push({ name: ref.name, hasFallback: ref.hasFallback, resolved: true, line, snippet })
                    continue
                }
                // Un nom trou n'est retenu que s'il vise bien le DS : `var(${x})`
                // sans aucun `--origam-` litteral peut viser n'importe quoi.
                if (!ref.name.startsWith('--origam-') && !ref.name.startsWith(HOLE)) continue
                out.push({ name: null, hasFallback: ref.hasFallback, resolved: false, line, snippet })
            }
        }

        return out
    }

    function collectCandidates (sf, out) {
        const visit = (node) => {
            if ((ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node))
                && node.getText(sf).includes('var(')) {
                // Ne garder que le gabarit le plus EXTERNE : un gabarit imbrique dans
                // un autre est deja evalue par son parent, et l'evaluer seul perd
                // l'environnement (donc fabrique des faux « irresolvables »).
                if (!hasTemplateAncestorWithVar(node, sf)) out.push(node)
            }
            ts.forEachChild(node, visit)
        }
        visit(sf)
    }

    function hasTemplateAncestorWithVar (node, sf) {
        let cur = node.parent
        while (cur && !ts.isSourceFile(cur)) {
            if ((ts.isTemplateExpression(cur) || ts.isNoSubstitutionTemplateLiteral(cur) || ts.isStringLiteral(cur))
                && cur.getText(sf).includes('var(')) return true
            cur = cur.parent
        }
        return false
    }

    return { analyseFile, scanVarReferences, sourceFile }
}

function squash (text) {
    return text.replace(/\s+/g, ' ').trim().slice(0, 140)
}
