#!/usr/bin/env node
/**
 * split-locales.mjs — One-shot migration: explode the monolithic
 * `src/assets/locales/{en,fr}.json` files into one fragment file per
 * top-level namespace (`src/assets/locales/{locale}/{namespace}.json`).
 *
 * WHY
 *   The two monolithic files are ~58 KB each. 7 devs writing translations
 *   in parallel guarantees git conflicts on 2 files. Splitting by top-level
 *   namespace (nav, home, theming, …) means one dev = one file.
 *
 * HOW THE RUNTIME MERGE WORKS (verified against @nuxtjs/i18n 10.4.0 source,
 * dist/runtime/shared/messages.js): each entry in `LocaleObject.files` is
 * loaded independently and `deepCopy`'d into a single `merged` object, keyed
 * by whatever top-level key(s) the fragment file contains. That means each
 * fragment file MUST keep its namespace as an explicit top-level wrapper key
 * (`{ "nav": { ... } }`), NOT just the bare nested content — otherwise the
 * namespace would be lost on merge.
 *
 * SAFETY — this script is lossless by construction and PROVES it before
 * touching anything:
 *   1. Read the current monolithic en.json / fr.json into memory.
 *   2. Write one fragment file per top-level key.
 *   3. Re-read every fragment just written, recompose them into a single
 *      object (mirrors the runtime `deepCopy` merge), and deep-compare the
 *      recomposed object against the original in-memory object.
 *   4. Only if recomposition is byte-for-byte structurally identical does it
 *      delete the monolithic file. If ANY locale fails the check, the whole
 *      run aborts with a non-zero exit code and no monolithic file is
 *      deleted (fragments already written are left in place for inspection).
 *
 * USAGE
 *   node scripts/split-locales.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.resolve(__dirname, '..', 'src', 'assets', 'locales')
const LOCALE_CODES = ['en', 'fr']

function canonicalize(value) {
    if (Array.isArray(value)) {
        return value.map(canonicalize)
    }

    if (value !== null && typeof value === 'object') {
        const sortedKeys = Object.keys(value).sort()

        return sortedKeys.reduce((acc, key) => {
            acc[key] = canonicalize(value[key])

            return acc
        }, {})
    }

    return value
}

function deepEqual(a, b) {
    return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b))
}

function splitLocale(code) {
    const srcFile = path.join(LOCALES_DIR, `${code}.json`)

    if (!fs.existsSync(srcFile)) {
        console.log(`  [${code}] no monolithic file found (already split?) — skipping`)

        return { code, skipped: true }
    }

    const raw = fs.readFileSync(srcFile, 'utf-8')
    const original = JSON.parse(raw)
    const namespaces = Object.keys(original)
    const outDir = path.join(LOCALES_DIR, code)

    fs.mkdirSync(outDir, { recursive: true })

    const fragmentFiles = []

    for (const ns of namespaces) {
        const fragment = { [ns]: original[ns] }
        const outFile = path.join(outDir, `${ns}.json`)

        fs.writeFileSync(outFile, `${JSON.stringify(fragment, null, 4)}\n`, 'utf-8')
        fragmentFiles.push(outFile)
    }

    const recomposed = {}

    for (const outFile of fragmentFiles) {
        const fragment = JSON.parse(fs.readFileSync(outFile, 'utf-8'))

        Object.assign(recomposed, fragment)
    }

    const identical = deepEqual(original, recomposed)

    return {
        code,
        skipped: false,
        namespaceCount: namespaces.length,
        namespaces,
        identical,
        srcFile,
        outDir
    }
}

function main() {
    console.log('i18n locale split — packages/marketing/src/assets/locales\n')

    const results = LOCALE_CODES.map(splitLocale)
    const failures = results.filter((r) => !r.skipped && !r.identical)

    for (const r of results) {
        if (r.skipped) continue

        console.log(`  [${r.code}] ${r.namespaceCount} fragments written to ${path.relative(process.cwd(), r.outDir)}/`)
        console.log(`  [${r.code}] namespaces: ${r.namespaces.join(', ')}`)
        console.log(`  [${r.code}] recomposition === original: ${r.identical ? 'IDENTICAL ✔' : 'MISMATCH ✘'}`)
    }

    if (failures.length > 0) {
        console.error(`\nABORT: ${failures.length} locale(s) failed recomposition proof. Monolithic file(s) NOT deleted.`)
        process.exit(1)
    }

    for (const r of results) {
        if (r.skipped) continue

        fs.rmSync(r.srcFile)
        console.log(`  [${r.code}] deleted monolithic ${path.relative(process.cwd(), r.srcFile)} (superseded by fragments)`)
    }

    console.log('\nSplit complete — lossless, proven by recomposition.')
}

main()
