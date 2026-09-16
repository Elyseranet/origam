/**
 * C8 — chaînes destinées à l'UTILISATEUR écrites en dur au lieu de passer
 * par `t('cle', 'fallback')` (`useLocale()`).
 *
 * CINQ SURFACES COUVERTES
 * ---------------------------------------------------------------------
 *   1. Attribut STATIQUE — `aria-label="Close dialog"` (pas de `:`, donc
 *      littéral HTML pur). Trouvé réel : `OrigamDialog.vue`
 *      (`aria-label="Close dialog"`), `OrigamChartCartesian.vue`
 *      (`aria-label="Reset zoom"`), `OrigamSkeleton.vue` (×3,
 *      `aria-label="Loading"`), `OrigamNumberField.vue` (`"Decrement"`/
 *      `"Increment"`), `OrigamSheet.vue` (`"Drag handle"`).
 *   2. Attribut LIÉ mais dont l'EXPRESSION est un littéral de chaîne —
 *      `:aria-label="'Notifications'"`. Un `:` ne protège de rien si
 *      l'expression liée est elle-même une constante. Trouvé réel :
 *      `OrigamSnackbarGroup.vue` (`:aria-label="'Notifications'"`),
 *      `OrigamDrawer.vue` (`:aria-label="props.name || 'Navigation'"` —
 *      le FALLBACK est en dur), `OrigamTreeviewNode.vue`
 *      (`` :aria-label="`${node.label} contents`" `` — le gabarit ajoute
 *      `" contents"` en dur autour d'une valeur dynamique).
 *   3. TEXTE STATIQUE dans le `<template>` — `<span>No data to display</span>`.
 *      Trouvé réel : les ~18 composants `OrigamChart*` partagent le même
 *      `<span>No data to display</span>`, `OrigamChartCartesian.vue`
 *      contient aussi `<text>Reset zoom</text>`.
 *   4. Valeur par défaut dans `withDefaults(defineProps<T>(), {…})` qui
 *      transporte du texte affiché. Trouvé réel : `OrigamBracket.vue`
 *      (`winnersLabel: 'Winners bracket'`), `OrigamClipboard.vue`
 *      (`feedbackText: 'Copied!'`), `OrigamCommandPalette.vue`
 *      (`emptyText: 'No results'`).
 *   5. LITTÉRAL DÉFINI DANS LE `<script>` puis RENDU — `const errorMessage
 *      = computed(() => 'Playback error')` affiché en `{{ errorMessage }}`.
 *      Ajouté par #567 : c'est ce cas qui a laissé `OrigamAudio` passer
 *      pour « conforme / 0 » alors qu'il portait deux chaînes anglaises.
 *      N'inspecte QUE les symboles effectivement référencés par le
 *      template — voir le bloc « Cas 5 » plus bas pour le pourquoi.
 *
 * LE PIÈGE CENTRAL : DISTINGUER UNE CLÉ I18N D'UN TEXTE EN DUR
 * ---------------------------------------------------------------------
 * Le DS a DÉJÀ un mécanisme i18n (`useLocale()` + `t()`), et l'immense
 * majorité des `withDefaults` qui portent un nom de prop "display"
 * (`closeLabel`, `emptyText`, `noDataText`, …) contiennent déjà une CLÉ,
 * PAS un texte — `closeLabel: 'origam.close'`,
 * `itemsPerPageText: 'origam.data_footer.items_per_page_text'`. Confondre
 * les deux ferait crier ce détecteur sur la moitié du catalogue DÉJÀ
 * correctement traduite — la mort d'un détecteur en une semaine (cf. le
 * garde `pnpm-tree-integrity`, dont le header documente le même risque).
 *
 * Le classifieur `looksLikeDisplayText()` s'appuie sur une observation
 * vérifiée sur ce dépôt, pas une supposition : TOUTE clé i18n existante
 * suit le gabarit `segment(.segment)+`, chaque segment en minuscules
 * (`origam.data_footer.items_per_page_text`) — jamais d'espace, jamais de
 * majuscule. Un texte affiché, à l'inverse, contient soit un espace
 * (`'No results'`), soit une majuscule initiale suivie de minuscules
 * (`'Notifications'`, `'Copied!'`). Un jeton technique isolé
 * (`'title'`, `'default'`, `'menu'`) ne contient ni majuscule ni espace ET
 * n'a pas de point — exclu par construction. Valeurs numériques/CSS/
 * couleurs (`'16px'`, `'#fff'`, `'true'`) explicitement exclues aussi.
 *
 * POURQUOI L'AST `vue/compiler-sfc`, PAS UNE REGEX SUR LE TEMPLATE
 * ---------------------------------------------------------------------
 * `no-declarations-in-vue.mjs` documente déjà le principe : une regex sur
 * du HTML/Vue confond des cas qu'un vrai parseur sépare proprement. Ici,
 * l'AST du compilateur distingue nativement un nœud TEXTE STATIQUE (type 2)
 * d'une INTERPOLATION `{{ }}` (type 5) — une regex devrait ré-implémenter
 * cette distinction et la raterait sur `Page {{ n }} sur {{ total }}`
 * (texte ET interpolations mêlés dans le même nœud texte HTML brut).
 *
 * LIMITES ASSUMÉES
 * ---------------------------------------------------------------------
 *   - Un mot de liaison court (`or`, `to`, `of`) glissé seul dans un nœud
 *     texte est traité comme un texte affiché comme un autre : il l'EST,
 *     au sens strict (annoncé par un lecteur d'écran), même si son poids
 *     de traduction réel est faible. Assumé, pas filtré.
 *   - Un format technique en dur qui ressemble à du texte (ex. un motif de
 *     date `'YYYY-MM-DD'`) peut ressortir en faux positif sur un
 *     `withDefaults` : `looksLikeDisplayText()` le voit comme "commence en
 *     majuscule, contient des lettres". Aucune instance de ce type n'a été
 *     trouvée dans le catalogue actuel (vérifié), mais le risque existe
 *     structurellement — documenté, pas corrigé, pour ne pas complexifier
 *     le classifieur sur un cas hypothétique.
 *   - `<component :is="...">`, contenu SVG (`<path d="...">`), et autres
 *     attributs hors la liste `TARGET_ATTRS` ne sont PAS couverts — hors
 *     périmètre de la mission (aria-label/title/placeholder/alt +
 *     withDefaults + texte de template + littéral de script rendu).
 *   - Un gabarit dont le texte fixe se réduit à de la PONCTUATION
 *     (`` `${a}: ${b}` ``) n'est PAS signalé : `looksLikeDisplayText()`
 *     rejette une chaîne d'un seul caractère. Cas réels `OrigamChartSankey`
 *     et `OrigamChartWordCloud`. C'est un choix DÉLIBÉRÉ mais DISCUTABLE —
 *     le français veut une espace insécable avant « : », donc ce séparateur
 *     est, au sens strict, dépendant de la locale. Laissé hors champ en
 *     attendant une décision explicite ; ne pas lire l'absence de
 *     signalement comme une conformité établie.
 *   - Cas 5 ne suit PAS la donnée à travers un objet (`MESSAGES.error`),
 *     un tableau, un `import`, ni un `ref()` alimenté depuis un handler.
 */

import { parse } from 'vue/compiler-sfc'
import { createRequire } from 'node:module'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')

const TARGET_ATTRS = new Set(['aria-label', 'title', 'placeholder', 'alt'])

const I18N_KEY_RE = /^[a-z][a-z0-9]*(\.[a-z0-9_]+)+$/
const TECHNICAL_TOKEN_RE = /^[a-z][a-z0-9_-]*$/
const CSS_LENGTH_RE = /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|ms|s|deg|fr)?$/
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/
const BOOLEAN_ISH_RE = /^(true|false|null|undefined)$/i

/**
 * Classifie une chaîne candidate : est-ce du texte destiné à l'utilisateur ?
 * `false` pour une clé i18n (`origam.close`), un jeton technique
 * (`title`, `default`), une valeur CSS/numérique/couleur/booléenne, ou une
 * chaîne vide.
 */
export function looksLikeDisplayText (value, { skipTechnicalTokenCheck = false } = {}) {
    if (!value) return false
    const trimmed = value.trim()
    if (!trimmed) return false
    // Un caractère isolé (`'M'`, `'L'`) n'est jamais un texte affiché — c'est
    // un code (niveau de correction d'erreur QR, unité, initiale d'enum).
    // Trouvé réel : `OrigamQrCode.vue`'s `errorCorrectionLevel: 'M'`, que
    // `DISPLAY_PROP_NAME_RE` matchait par accident via la sous-chaîne
    // "error" du nom de prop.
    if (trimmed.length === 1) return false
    if (I18N_KEY_RE.test(trimmed)) return false
    if (!skipTechnicalTokenCheck && TECHNICAL_TOKEN_RE.test(trimmed)) return false
    if (CSS_LENGTH_RE.test(trimmed)) return false
    if (HEX_COLOR_RE.test(trimmed)) return false
    if (BOOLEAN_ISH_RE.test(trimmed)) return false
    return /[A-Za-z]/.test(trimmed)
}

/** Une expression JS est-elle un littéral de chaîne pur (`'x'`, `"x"`) ? */
function asStringLiteral (expr) {
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text
    return null
}

/**
 * Texte FIXE d'un gabarit `` `${x} texte fixe` `` — ce texte est en dur
 * (cas OrigamTreeviewNode). C'est souvent un FRAGMENT d'une phrase plus
 * large (`' contents'`, `' (start)'`, un seul mot minuscule sans espace ni
 * point) : le jeton technique (`TECHNICAL_TOKEN_RE`) est bâti pour exclure
 * des noms de champ isolés (`'title'`), pas des fragments de texte
 * concaténés — d'où `fromTemplate: true`, qui fait sauter ce filtre côté
 * appelant.
 */
function asTemplateFixedText (expr) {
    if (!ts.isTemplateExpression(expr)) return null
    const fixed = [expr.head.text, ...expr.templateSpans.map(s => s.literal.text)].join(' ').trim()
    return fixed || null
}

/*********************************************************
 * Descente RÉCURSIVE dans les opérateurs — correctif #567
 *
 * @description
 * La version precedente traitait le littéral direct, les deux côtés d'un
 * `||`, les deux branches d'un ternaire, ET `ts.isTemplateExpression` —
 * mais elle ne DESCENDAIT PAS : les branches passaient par
 * `asStringLiteral()`, qui rejette un gabarit AVEC substitution. La règle
 * réelle était donc « un gabarit n'est vu que s'il est l'expression de
 * premier niveau » ; n'importe quel opérateur autour le faisait
 * disparaître.
 *
 * @description
 * Mesuré sur le catalogue au commit 5c1acdd1 : 7 occurrences manquées, 3
 * vues. `OrigamAudio` a été classé « conforme / 0 » au commit même où il
 * portait `` :title="track.title ?? `Track ${index + 1}`" ``. Le point
 * contre-intuitif : ce n'était PAS « `??` n'est pas géré » — `||` était
 * géré et ratait quand même, parce que le rejet venait de la branche, pas
 * de l'opérateur.
 *
 * @description
 * `??` manquait EN PLUS, et de façon indépendante : `:title="x ?? 'Texte'"`
 * (littéral pur, sans gabarit) était lui aussi invisible, car seul
 * `BarBarToken` était testé. Deux défauts distincts dans la même fonction.
 *
 * @description
 * On ne descend PAS dans les appels de fonction : un littéral enfoui dans
 * une expression calculée produit trop de faux positifs, et la précision
 * prime sur le rappel (cf. header du self-test).
 ********************************************************/
function descendForLiteral (expr) {
    if (!expr) return null
    if (ts.isParenthesizedExpression(expr)) return descendForLiteral(expr.expression)

    const direct = asStringLiteral(expr)
    if (direct !== null) return { text: direct, fromTemplate: false }

    const templated = asTemplateFixedText(expr)
    if (templated !== null) return { text: templated, fromTemplate: true }

    if (ts.isBinaryExpression(expr)) {
        const kind = expr.operatorToken.kind
        if (kind === ts.SyntaxKind.BarBarToken ||
            kind === ts.SyntaxKind.QuestionQuestionToken ||
            kind === ts.SyntaxKind.AmpersandAmpersandToken) {
            return descendForLiteral(expr.right) ?? descendForLiteral(expr.left)
        }
        return null
    }
    if (ts.isConditionalExpression(expr)) {
        return descendForLiteral(expr.whenTrue) ?? descendForLiteral(expr.whenFalse)
    }
    return null
}

/**
 * Cas 2 — expression liée dont au moins UNE branche est un littéral
 * candidat, à n'importe quelle profondeur d'opérateurs (`||`, `??`, `&&`,
 * ternaire, parenthèses).
 */
function findLiteralInBoundExpr (exprSource) {
    const sf = ts.createSourceFile('expr.ts', `(${exprSource})`, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const stmt = sf.statements[0]
    if (!stmt || !ts.isExpressionStatement(stmt)) return null
    return descendForLiteral(stmt.expression)
}

function lineOf (source, offset) {
    let line = 1
    for (let i = 0; i < offset && i < source.length; i++) if (source[i] === '\n') line++
    return line
}

/**
 * Identifiants JS apparaissant dans une expression de template. Sert à
 * établir le lien « ce symbole du `<script>` est RENDU » — sans ce lien,
 * scanner le script produirait des faux positifs sur toutes les constantes
 * techniques du fichier (cf. cas 5 ci-dessous).
 */
function collectIdentifiers (exprSource, sink) {
    let sf
    try {
        sf = ts.createSourceFile('expr.ts', `(${exprSource})`, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch { return }
    const visit = (node) => {
        // `a.b` ne doit verser que `a` : `b` est un nom de propriété, pas
        // une référence à un symbole du script.
        if (ts.isPropertyAccessExpression(node)) { visit(node.expression); return }
        if (ts.isIdentifier(node)) sink.add(node.text)
        ts.forEachChild(node, visit)
    }
    visit(sf)
}

/** Parcourt l'AST du `<template>` et collecte les violations des cas 1-3. */
function walkTemplate (ast, source, violations, renderedIdents = new Set()) {
    if (!ast) return

    const visit = (node) => {
        if (!node) return

        if (node.type === 5) { // INTERPOLATION `{{ … }}`
            if (node.content?.content) collectIdentifiers(node.content.content, renderedIdents)
        } else if (node.type === 1) { // ELEMENT
            for (const prop of node.props) {
                if (prop.type === 6 && TARGET_ATTRS.has(prop.name)) { // static ATTRIBUTE
                    const value = prop.value?.content ?? ''
                    if (looksLikeDisplayText(value)) {
                        violations.push({
                            kind: 'static-attr',
                            detail: `${prop.name}="${value}"`,
                            line: prop.loc.start.line
                        })
                    }
                } else if (prop.type === 7 && prop.name === 'bind' && prop.arg?.type === 4 &&
                    TARGET_ATTRS.has(prop.arg.content) && prop.exp) {
                    collectIdentifiers(prop.exp.content, renderedIdents)
                    const literal = findLiteralInBoundExpr(prop.exp.content)
                    if (literal !== null && looksLikeDisplayText(literal.text, { skipTechnicalTokenCheck: literal.fromTemplate })) {
                        violations.push({
                            kind: 'bound-literal-attr',
                            detail: `:${prop.arg.content}="${prop.exp.content}"`,
                            line: prop.loc.start.line
                        })
                    }
                }
            }
        } else if (node.type === 2) { // TEXT
            const trimmed = node.content.trim()
            if (trimmed && /[A-Za-z]{2,}/.test(trimmed)) {
                violations.push({
                    kind: 'template-text',
                    detail: trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed,
                    line: node.loc.start.line
                })
            }
        }

        if (node.children) for (const c of node.children) visit(c)
    }
    visit(ast)
}

// Filtre STRICT sur le NOM de la prop, sans bypass "contient un espace" —
// un `origin: 'center center'` (transform-origin CSS) a un espace mais
// n'est pas du texte affiché ; toutes les trouvailles réelles catalogue
// (winnersLabel, losersLabel, feedbackText, emptyText, placeholder) passent
// déjà ce filtre par leur NOM, donc aucun bypass n'était nécessaire — il ne
// faisait qu'ouvrir un faux positif sur des valeurs CSS multi-mots.
const DISPLAY_PROP_NAME_RE = /label|title|text|message|caption|tooltip|placeholder|heading|hint|description|prompt|error|success|warning|info\b|help|instruction/i

/** Cas 4 — `withDefaults(defineProps<T>(), { … })` scanné via l'AST TS. */
function walkWithDefaults (scriptBody, scriptSource, offset, violations) {
    const sf = ts.createSourceFile('script.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)

    const visit = (node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'withDefaults') {
            const defaultsArg = node.arguments[1]
            if (defaultsArg && ts.isObjectLiteralExpression(defaultsArg)) {
                for (const prop of defaultsArg.properties) {
                    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue
                    const literal = asStringLiteral(prop.initializer)
                    if (literal === null) continue
                    if (!looksLikeDisplayText(literal)) continue
                    if (!DISPLAY_PROP_NAME_RE.test(prop.name.text)) continue
                    violations.push({
                        kind: 'withDefaults',
                        detail: `${prop.name.text}: '${literal}'`,
                        line: lineOf(scriptSource, offset + prop.getStart(sf))
                    })
                }
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
}

/*********************************************************
 * Cas 5 — littéral d'affichage défini dans le `<script>` puis RENDU
 *
 * @description
 * Second angle mort mesuré par #567. Le détecteur ne parcourait que
 * `walkWithDefaults()` : une chaîne retournée par un `computed`, une
 * fonction ou une constante, puis rendue en `{{ }}`, était hors champ.
 * C'est ce qui a laissé passer le `'Playback error'` de `OrigamAudio`
 * pendant que le témoin `<span>Playback error</span>` était vu.
 *
 * @description
 * LE PIÈGE DE PRÉCISION, et c'est lui qui dicte la forme de ce scanner :
 * un `.vue` est plein de littéraux de chaîne techniques (noms d'évènement,
 * sélecteurs, clés de cache, unités). Crier sur tous ferait mourir le
 * détecteur en une semaine. On n'inspecte donc QUE les déclarations dont
 * le nom est effectivement RÉFÉRENCÉ depuis le template, dans une position
 * d'affichage — une interpolation `{{ x }}` ou un des `TARGET_ATTRS` liés.
 * Le lien « défini ici, rendu là » est établi, pas supposé.
 *
 * @description
 * Ce lien est syntaxique, donc faillible dans un sens précis et connu :
 * un identifiant du template qui porte le même nom qu'une constante
 * technique du script les confond. Assumé — le coût est un faux positif
 * lisible, pas un faux « conforme ».
 *
 * @description
 * NON COUVERT, et il faut le dire plutôt que de le laisser croire : une
 * chaîne rendue via un objet (`MESSAGES.error`), un tableau, un `import`
 * depuis un autre fichier, ou construite dans un handler puis poussée dans
 * un `ref()`. Le détecteur ne suit pas la donnée à travers ces sauts.
 ********************************************************/

/** Déplie `computed(() => X)` / `computed(function () { return X })` vers X. */
function unwrapComputed (expr) {
    if (!expr) return []
    if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) &&
        (expr.expression.text === 'computed' || expr.expression.text === 'ref')) {
        return expr.arguments.flatMap(unwrapComputed)
    }
    if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
        if (expr.body && !ts.isBlock(expr.body)) return [expr.body]
        const returns = []
        const visit = (n) => {
            // Ne pas descendre dans une fonction imbriquee : son `return`
            // n'est pas celui du computed.
            if (n !== expr && (ts.isArrowFunction(n) || ts.isFunctionExpression(n) ||
                ts.isFunctionDeclaration(n))) return
            if (ts.isReturnStatement(n) && n.expression) returns.push(n.expression)
            ts.forEachChild(n, visit)
        }
        visit(expr.body)
        return returns
    }
    return [expr]
}

function walkScriptDisplayStrings (scriptBody, scriptSource, offset, renderedIdents, violations) {
    if (renderedIdents.size === 0) return
    const sf = ts.createSourceFile('script.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const seen = new Set()

    const visit = (node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
            renderedIdents.has(node.name.text) && node.initializer) {
            const name = node.name.text
            for (const candidate of unwrapComputed(node.initializer)) {
                const literal = descendForLiteral(candidate)
                if (literal === null) continue
                if (!looksLikeDisplayText(literal.text, { skipTechnicalTokenCheck: literal.fromTemplate })) continue
                if (seen.has(name)) break
                seen.add(name)
                violations.push({
                    kind: 'script-display',
                    detail: `${name} = '${literal.text}'`,
                    line: lineOf(scriptSource, offset + node.getStart(sf))
                })
                break
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
}

/**
 * @param {string} rawSource - le contenu ENTIER du `.vue`.
 * @param {string} filename - utilisé uniquement pour les messages d'erreur du parseur SFC.
 * @returns {{ static: Array, boundLiteral: Array, templateText: Array, withDefaults: Array, scriptDisplay: Array }}
 */
export function analyseHardcodedStrings (rawSource, filename = 'component.vue') {
    const empty = { static: [], boundLiteral: [], templateText: [], withDefaults: [], scriptDisplay: [] }
    let descriptor
    try {
        ;({ descriptor } = parse(rawSource, { filename }))
    } catch {
        return empty
    }

    const templateViolations = []
    const renderedIdents = new Set()
    if (descriptor.template) walkTemplate(descriptor.template.ast, rawSource, templateViolations, renderedIdents)

    const withDefaultsViolations = []
    const scriptDisplayViolations = []
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script
    if (scriptBlock) {
        walkWithDefaults(scriptBlock.content, rawSource, scriptBlock.loc.start.offset, withDefaultsViolations)
        walkScriptDisplayStrings(scriptBlock.content, rawSource, scriptBlock.loc.start.offset, renderedIdents, scriptDisplayViolations)
    }

    return {
        static: templateViolations.filter(v => v.kind === 'static-attr'),
        boundLiteral: templateViolations.filter(v => v.kind === 'bound-literal-attr'),
        templateText: templateViolations.filter(v => v.kind === 'template-text'),
        withDefaults: withDefaultsViolations,
        scriptDisplay: scriptDisplayViolations
    }
}
