/**
 * migration-guard — detector for #831.
 *
 * WHY
 *   `pnpm -F @origam/marketing db:migrate:make` diffs the live schema
 *   against the 16 entities. Ten FKs, four CHECK constraints and two
 *   functional unique indexes exist only as raw DDL (see the 3 committed
 *   migrations) — nothing an entity declares. TypeORM's differ correctly
 *   concludes they are superfluous and proposes to DROP all 16. Applying
 *   that output verbatim destroys referential integrity and two data
 *   invariants, silently: the command succeeds, the migration runs clean.
 *
 * WHY NO OPTION MAKES THE GENERATOR ITSELF SAFE
 *   The 2 functional indexes (`md5(value)`, `coalesce(name, '')`) cannot be
 *   expressed by `@Index`/`@Unique` — those decorators only accept column
 *   lists, not expressions (checked against the TypeORM 1.1.1 decorator
 *   signatures). Declaring the 10 relations and the 4 `@Check()`s would
 *   close 14 of 16, but the remaining 2 are structurally unreachable by any
 *   entity declaration. The only protection that covers all 16, forever, is
 *   refusing what the generator PRODUCES when it is destructive — this
 *   module.
 *
 * SCOPE — up() only, not down()
 *   A migration's own down() is expected to DROP whatever its own up() just
 *   created (see AddDocEntrySvgKeys's down(), which drops the 4 columns its
 *   up() added — perfectly normal, must stay green). What's dangerous is
 *   up() dropping something that predates this migration: a constraint or
 *   index some earlier migration put there to protect data already in
 *   production. Scanning only up() is therefore not a convenience, it's the
 *   actual question being asked: "does APPLYING this migration remove a
 *   safeguard that existed before it ran?"
 *
 * ESCAPE HATCH — an inline directive, not a baseline file
 *   This repo already has a vocabulary for "a human reviewed this exact
 *   line and says it's fine despite what the tool thinks": the tool
 *   directives `comment-format.mjs` explicitly exempts (eslint-disable,
 *   @ts-expect-error, /// <reference>) — a comment glued to the one
 *   statement it excuses, visible in the diff the reviewer is already
 *   looking at. The `packages/ds/scripts/guards/baseline/*.json` mechanism
 *   was deliberately NOT reused here: baselines exist to grandfather
 *   PRE-EXISTING debt across an entire codebase scan, reviewed once, then
 *   left alone — its own README documents the known failure mode ("nothing
 *   stops someone from introducing a real new violation and adding its ID
 *   to the baseline in the same commit"). A migration is the opposite
 *   shape: it is written ONCE, reviewed ONCE, and never touched again after
 *   merge. Keeping the authorization on the exact line, in the exact commit
 *   that introduces the drop, is strictly harder to rubber-stamp than a
 *   separate JSON file 40 files away — the reviewer cannot approve the
 *   statement without also reading the reason typed next to it.
 *
 *   Directive shape, one line, immediately preceding the `queryRunner.query`
 *   (or `dropForeignKey`/`dropIndex`/`dropUniqueConstraint`/
 *   `dropCheckConstraint`) call it authorizes:
 *
 *     // origam-allow-destructive: <reason, at least 10 characters>
 *     await queryRunner.query(`ALTER TABLE "x" DROP CONSTRAINT "x_y_fkey"`)
 *
 *   A directive with no reason (or a trivially short one) does not count —
 *   "// origam-allow-destructive: ok" authorizes nothing. The point is a
 *   reviewer reading WHY, not a magic string that silences the tool.
 *
 * DETECTION — real TypeScript AST, not a hand-rolled regex over source text
 *   Guard 14 (`dead-handlers.mjs`) already established why in this repo: a
 *   regex over `<template>` truncated at the first nested block and missed
 *   a real bug outright. The same risk exists here — a DROP could be split
 *   across template-literal lines, embedded in a multi-statement ALTER, or
 *   expressed via the QueryRunner API instead of raw SQL. Parsing with
 *   `typescript`'s own compiler (already a workspace devDependency,
 *   resolvable from this package) finds the `up()` method structurally,
 *   walks every CallExpression inside it, and reads the STATIC text of each
 *   string/template-literal argument.
 */

import ts from 'typescript'

/** Raw-SQL shape TypeORM's generator emits for both FK and CHECK drops
 *  (Postgres represents both as a constraint) and for index drops — one
 *  pattern covers all 16 real statements, including the 2 functional
 *  indexes, because a DROP INDEX statement is textually identical whether
 *  the index is a plain column index or a functional one. */
const DESTRUCTIVE_SQL_RE = /\bDROP\s+(CONSTRAINT|INDEX)\b/gi

/** Extracts, per match, the kind (CONSTRAINT|INDEX) and the target name —
 *  best-effort; a statement that matches DESTRUCTIVE_SQL_RE but whose name
 *  this can't parse is still reported (kind UNKNOWN), never swallowed. */
const DROP_NAME_RE = /DROP\s+(CONSTRAINT|INDEX)\s+(?:IF\s+EXISTS\s+)?(?:"?[\w]+"?\.)?"?([\w]+)"?/i

/** QueryRunner API equivalents of the same two operations — not what
 *  `migration:generate` emits today (it always emits raw SQL, verified by
 *  regeneration against the real entities, #831), but a hand-written or
 *  future-TypeORM migration could use them instead. Defense in depth: same
 *  gate, same directive requirement. */
const DESTRUCTIVE_API_METHODS = new Map([
    ['dropForeignKey', 'CONSTRAINT'],
    ['dropForeignKeys', 'CONSTRAINT'],
    ['dropUniqueConstraint', 'CONSTRAINT'],
    ['dropCheckConstraint', 'CONSTRAINT'],
    ['dropIndex', 'INDEX'],
])

const ALLOW_DIRECTIVE_RE = /origam-allow-destructive:\s*(.+)/
const MIN_REASON_LENGTH = 10

/** Static text of a string/template-literal argument. Template
 *  interpolations (`${...}`) are dropped — real migrations only
 *  interpolate table/column identifiers there, never the DROP keyword
 *  itself (confirmed against the 3 committed migrations and the real
 *  generator output, #831) — so losing them cannot hide a destructive
 *  keyword; at worst it costs part of an identifier used only for display. */
function literalText (node) {
    if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteralLike(node)) {
        return node.text
    }
    if (ts.isTemplateExpression(node)) {
        return node.head.text + node.templateSpans.map((span) => span.literal.text).join(' ')
    }
    return ''
}

/** Walks up from `node` to the nearest enclosing statement, so leading
 *  comments (attached to statements, not to arbitrary sub-expressions) can
 *  be read. `await x.query(...)` and `x.dropIndex(...)` are both, in every
 *  real and generated migration, direct `ExpressionStatement`s — but this
 *  still walks defensively in case a future shape wraps the call (e.g.
 *  inside a `for` loop body's single statement). */
function enclosingStatement (node) {
    let current = node

    while (current.parent && !ts.isSourceFile(current.parent)) {
        if (ts.isExpressionStatement(current) || ts.isVariableStatement(current)) {
            return current
        }

        current = current.parent
    }

    return current
}

/** True + reason when a `// origam-allow-destructive: <reason>` directive
 *  (reason >= MIN_REASON_LENGTH chars) is among the statement's leading
 *  comments. */
function authorization (sourceFile, statementNode) {
    const ranges = ts.getLeadingCommentRanges(sourceFile.text, statementNode.getFullStart()) ?? []

    for (const range of ranges) {
        const text = sourceFile.text.slice(range.pos, range.end)
        const match = text.match(ALLOW_DIRECTIVE_RE)

        if (match && match[1].trim().length >= MIN_REASON_LENGTH) {
            return { authorized: true, reason: match[1].trim() }
        }
    }

    return { authorized: false, reason: null }
}

/**
 * Scans one migration file's `up()` method for destructive statements.
 *
 * @param {string} filePath - used only for diagnostics (basename in IDs).
 * @param {string} source - the file's TypeScript source text.
 * @returns {Array<{id: string, className: string, kind: string, name: string, authorized: boolean, reason: string|null, statementText: string}>}
 */
export function scanMigrationSource (filePath, source) {
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const violations = []

    /** One class implementing MigrationInterface is the expected shape
     *  (every migration in this repo), but nothing here assumes there is
     *  exactly one — every class declaration in the file is inspected. */
    const visitClass = (classNode) => {
        const className = classNode.name?.text ?? filePath

        for (const member of classNode.members) {
            if (!ts.isMethodDeclaration(member) || !member.body) continue

            const methodName = member.name && ts.isIdentifier(member.name) ? member.name.text : null

            if (methodName !== 'up') continue

            const visitNode = (node) => {
                if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
                    const propName = node.expression.name.text
                    const statementNode = enclosingStatement(node)

                    if (propName === 'query' && node.arguments.length > 0) {
                        const text = literalText(node.arguments[0])
                        const drops = text.match(DESTRUCTIVE_SQL_RE) ?? []

                        if (drops.length > 0) {
                            const { authorized, reason } = authorization(sourceFile, statementNode)
                            const nameMatch = text.match(DROP_NAME_RE)
                            const kind = nameMatch ? nameMatch[1].toUpperCase() : 'UNKNOWN'
                            const name = nameMatch ? nameMatch[2] : 'unparsed'

                            violations.push({
                                id: `${className}::DROP_${kind}::${name}`,
                                className,
                                kind,
                                name,
                                authorized,
                                reason,
                                statementText: text.trim(),
                            })
                        }
                    } else if (DESTRUCTIVE_API_METHODS.has(propName)) {
                        const { authorized, reason } = authorization(sourceFile, statementNode)
                        const kind = DESTRUCTIVE_API_METHODS.get(propName)
                        const firstArgText = node.arguments[0] ? literalText(node.arguments[0]) || node.arguments[0].getText(sourceFile) : 'unparsed'

                        violations.push({
                            id: `${className}::${propName}::${firstArgText}`,
                            className,
                            kind,
                            name: firstArgText,
                            authorized,
                            reason,
                            statementText: `${propName}(${firstArgText})`,
                        })
                    }
                }

                ts.forEachChild(node, visitNode)
            }

            visitNode(member.body)
        }
    }

    ts.forEachChild(sourceFile, (node) => {
        if (ts.isClassDeclaration(node)) visitClass(node)
    })

    return violations
}

/** Convenience: scan a file from disk. */
export function scanMigrationFile (filePath, readFileSyncFn) {
    const source = readFileSyncFn(filePath, 'utf8')
    return scanMigrationSource(filePath, source)
}
