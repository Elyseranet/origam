/*********************************************************
 * t-fallback-scan
 *
 * @description
 * `t(key, ...params)` treats every argument after the key as an
 * INTERPOLATION PARAMETER, never as a fallback:
 *
 *     t('origam.code.copy', 'Copy')   // 'Copy' is passed as {0}
 *
 * The message `"Copy"` carries no `{0}`, so the argument is silently
 * discarded. Nothing warns. The author believes they wrote a safety net;
 * they wrote nothing at all.
 * @description
 * Today the damage is nil — every key exists, so every call resolves. The
 * trap is what it costs LATER: the day a key is renamed or dropped, `t()`
 * returns the key itself and the interface shows `origam.code.copy` to the
 * user, exactly where the author thought a fallback stood. Issue #502.
 * @description
 * ⛔ A second argument is NOT automatically wrong. It is legitimate — and
 * required — whenever the resolved message contains an interpolation
 * token. `t('origam.validation.max_length', limit)` against
 * `"Maximum {0} characters"` is correct. This scan therefore resolves the
 * message before judging, and only flags a STRING LITERAL passed to a
 * message that carries NO token. Judging on the argument's shape alone
 * would condemn 11 correct calls in this repo.
 *
 * Pure scanner. The runnable guard is scripts/guards/t-fallback.mjs.
 ********************************************************/

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')
const DS_SRC = resolve(REPO, 'packages/ds/src')
const LOCALE = resolve(DS_SRC, 'assets/locales/en.json')

/**
 * `t('key', <string literal>)` — the key and the literal are both captured
 * so the message can be resolved before any verdict is reached.
 */
const CALL_RE = /\bt\(\s*(['"])([^'"]+)\1\s*,\s*(['"])((?:\\.|(?!\3)[^\\])*)\3\s*\)/g

/** Any `{0}` / `{value}` placeholder makes a positional argument legitimate. */
const TOKEN_RE = /\{[^}]+\}/

function walk (dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)

        if (full.includes('node_modules') || full.includes('/dist/')) continue
        if (statSync(full).isDirectory()) walk(full, out)
        else if (/\.(vue|ts)$/.test(full)) out.push(full)
    }

    return out
}

/** Resolve a dotted key against the English catalogue, or undefined. */
function resolveMessage (messages, key) {
    return key.split('.').reduce(
        (acc, seg) => (acc && typeof acc === 'object' ? acc[seg] : undefined),
        messages
    )
}

export function scanTFallbacks (root = DS_SRC, localePath = LOCALE) {
    const messages = JSON.parse(readFileSync(localePath, 'utf8'))
    const offenders = []

    for (const file of walk(root)) {
        const src = readFileSync(file, 'utf8')

        for (const match of src.matchAll(CALL_RE)) {
            const [, , key, , literal] = match
            const message = resolveMessage(messages, key)

            // Unknown key: a different defect (a missing translation), and
            // not this scan's business. Reported so it is never silent.
            if (typeof message !== 'string') {
                offenders.push({ file: relative(REPO, file), key, literal, reason: 'unknown-key' })
                continue
            }

            // Message carries a token → the argument really interpolates.
            if (TOKEN_RE.test(message)) continue

            offenders.push({ file: relative(REPO, file), key, literal, reason: 'inert-argument' })
        }
    }

    return offenders
}
