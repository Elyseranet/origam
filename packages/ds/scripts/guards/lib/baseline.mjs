// Baseline mechanism shared by every architecture guard.
//
// WHY THIS EXISTS
// ----------------
// Four guards were introduced onto a codebase that already carries known
// architecture debt (misplaced declarations, missing instance types,
// mis-named enum/type files, legacy variant CSS). A guard that goes red on
// day one gets disabled within a week — that is the actual failure mode this
// file exists to prevent.
//
// THE CONTRACT
// ------------
// Each guard ships a `baseline/<guard>.json` — a flat, sorted JSON array of
// stable violation IDs (never line numbers: a baseline keyed on line number
// breaks every time someone edits an unrelated line above it). The guard
// computes the CURRENT violation set and diffs it against the baseline:
//
//   - an ID present NOW but NOT in the baseline   -> NEW violation   -> FAIL
//   - an ID present in the baseline but NOT NOW    -> STALE entry     -> FAIL
//   - anything else (exact match)                  -> PASS
//
// This gives exactly the three properties asked for:
//   1. A brand new violation always reddens CI — it is never silently
//      absorbed by "the count is still under threshold".
//   2. An already-known violation never blocks a PR that doesn't touch it.
//   3. The known stock can only shrink: once a violation is fixed, its ID
//      disappears from the CURRENT set, which makes the baseline entry
//      STALE and turns the build red until someone deletes that line from
//      the baseline file. There is no way to "leave it there for later" —
//      removing the code fix without removing the baseline line still fails.
//
// HOW TO RETIRE A BASELINE ENTRY
// -------------------------------
// Fix the violation, run the guard locally (see README.md), then delete the
// now-stale line(s) the guard prints from the matching `baseline/*.json`
// file, in the SAME commit as the fix. Never add a NEW id to a baseline file
// to make a guard pass — that defeats the guard's entire purpose and will be
// caught in review (a baseline diff that grows is itself a review smell).

import { readFileSync, writeFileSync } from 'node:fs'

// Writes the CURRENT violation set as the new baseline, sorted, one entry
// per line for a readable diff. Used by `--update-baseline` — see README.md
// for when that flag is legitimate to use (establishing a new baseline after
// a reviewed, intentional bulk change) versus when it is NOT (masking a
// regression — that always needs a real fix, not a baseline bump).
export function writeBaseline (jsonPath, currentIds) {
    const sorted = [...(currentIds instanceof Set ? currentIds : new Set(currentIds))].sort()
    writeFileSync(jsonPath, JSON.stringify(sorted, null, 4) + '\n')
    return sorted
}

export function loadBaseline (jsonPath) {
    let raw
    try {
        raw = readFileSync(jsonPath, 'utf8')
    } catch {
        return new Set()
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
        throw new Error(`Baseline file ${jsonPath} must contain a JSON array of strings.`)
    }
    return new Set(parsed)
}

export function diffAgainstBaseline (currentIds, baselineSet) {
    const current = currentIds instanceof Set ? currentIds : new Set(currentIds)
    const newViolations = [...current].filter(id => !baselineSet.has(id)).sort()
    const staleEntries = [...baselineSet].filter(id => !current.has(id)).sort()
    return { newViolations, staleEntries, knownCount: current.size - newViolations.length }
}

// Prints a uniform pass/fail report and returns the process exit code (0/1).
// `detailsById` is an optional Map<id, string> used to print a human-readable
// line for each NEW violation (stale entries only need the id — it's a
// baseline-file line to delete).
export function report ({ guardName, baselinePath, currentIds, detailsById = new Map(), fixHint }) {
    const baseline = loadBaseline(baselinePath)
    const { newViolations, staleEntries, knownCount } = diffAgainstBaseline(currentIds, baseline)

    const line = '─'.repeat(70)
    console.log(line)
    console.log(`Guard: ${guardName}`)
    console.log(line)

    if (newViolations.length === 0 && staleEntries.length === 0) {
        console.log(`PASS — ${knownCount} known (baselined) violation(s), 0 new.`)
        console.log(line)
        return 0
    }

    if (newViolations.length > 0) {
        console.log(`\nFAIL — ${newViolations.length} NEW violation(s) not in the baseline:\n`)
        for (const id of newViolations) {
            const detail = detailsById.get(id)
            console.log(`  ✗ ${id}${detail ? `\n      ${detail}` : ''}`)
        }
        if (fixHint) {
            console.log(`\n${fixHint}`)
        }
    }

    if (staleEntries.length > 0) {
        console.log(`\nFAIL — ${staleEntries.length} STALE baseline entr${staleEntries.length === 1 ? 'y' : 'ies'} (already fixed, no longer detected):\n`)
        for (const id of staleEntries) {
            console.log(`  ~ ${id}`)
        }
        console.log(`\n  These are fixed! Delete the line(s) above from:\n  ${baselinePath}`)
    }

    console.log(line)
    return 1
}
