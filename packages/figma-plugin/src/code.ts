/**
 * code.ts — Main thread entrypoint for the Origam DS Sync Figma plugin.
 *
 * Wires the postMessage protocol from the UI (messaging.ts) to the component
 * builders (components/*.ts) and library helpers (lib/*.ts).
 *
 * Phase scope implemented here:
 *   - Phase 2: UI shell already built (ui.tsx)
 *   - Phase 3: Lib helpers wired (variables, styles, messaging)
 *   - Phase 4: Btn component builder
 *   - Phase 5: TextField, Textarea, Select, Checkbox, Radio, Switch (injected below)
 *   - Phase 6: Card, Chip, Avatar, Alert, Dialog, Toolbar, Badge
 */

import { onMessageFromUI, postToUI } from './lib/messaging'
import { findCollection } from './lib/variables'
import { buildBtn } from './components/Btn'
import { buildTextField } from './components/TextField'
import { buildTextarea } from './components/Textarea'
import { buildSelect } from './components/Select'
import { buildCheckbox } from './components/Checkbox'
import { buildRadio } from './components/Radio'
import { buildSwitch } from './components/Switch'
import { buildCard } from './components/Card'
import { buildChip } from './components/Chip'
import { buildAvatar } from './components/Avatar'
import { buildAlert } from './components/Alert'
import { buildDialog } from './components/Dialog'
import { buildToolbar } from './components/Toolbar'
import { buildBadge } from './components/Badge'
import type { BuildOpts } from './components/Btn'

// ---------------------------------------------------------------------------
// Utility — uint8ArrayToBase64
// ---------------------------------------------------------------------------

/**
 * Encode a Uint8Array to a base-64 string without relying on `Buffer`
 * (unavailable in the Figma sandboxed runtime).
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UI_WIDTH = 360
const UI_HEIGHT = 480

/**
 * The name of the Tokens Studio variable collection that Origam expects.
 * Tokens Studio creates a collection named after the active theme group
 * (often "Origam" or the repo folder). We look for any collection whose
 * name starts with "Origam" (case-insensitive) and fall back to the first
 * local collection.
 */
const COLLECTION_NAME_HINT = 'Origam'

/** Name of the Figma page where components are generated. */
const TARGET_PAGE_NAME = '[Origam] Components'

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

figma.showUI(__html__, {
  width: UI_WIDTH,
  height: UI_HEIGHT,
  themeColors: true,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Find or create the `[Origam] Components` page.
 * Reuses the existing page so repeated runs don't multiply pages.
 */
function ensureTargetPage(): PageNode {
  const existing = figma.root.children.find(
    (p) => p.type === 'PAGE' && p.name === TARGET_PAGE_NAME,
  ) as PageNode | undefined

  if (existing) return existing

  const page = figma.createPage()
  page.name = TARGET_PAGE_NAME
  return page
}

/**
 * Find the Tokens Studio variable collection.
 *
 * Strategy (in order):
 *   1. Look for a collection whose name contains COLLECTION_NAME_HINT (case-insensitive).
 *   2. Fall back to the first local collection (user may have renamed it).
 *   3. Throw if no local collection exists (Tokens Studio not installed / no sync yet).
 */
function ensureCollection(): VariableCollection {
  // Try the hinted name first (exact match via findCollection, then prefix search).
  const hinted = findCollection(COLLECTION_NAME_HINT)
  if (hinted) return hinted

  // Prefix / partial search
  const all = figma.variables.getLocalVariableCollections()
  const partial = all.find((c) =>
    c.name.toLowerCase().includes(COLLECTION_NAME_HINT.toLowerCase()),
  )
  if (partial) return partial

  // Last resort: first collection
  if (all.length > 0) {
    figma.notify(
      `[Origam] Could not find an "${COLLECTION_NAME_HINT}" collection. Using "${all[0].name}" instead. Variables may not bind correctly.`,
      { error: false },
    )
    return all[0]
  }

  throw new Error(
    'No Figma Variable collection found. Please install Tokens Studio for Figma and sync the origam/tokens/ folder first.',
  )
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

onMessageFromUI(async (msg) => {
  // ── detect-variables ──────────────────────────────────────────────────────
  if (msg.type === 'detect-variables') {
    try {
      const collection = ensureCollection()
      const missingNamespaces: string[] = []

      // Spot-check a few key variables to confirm Tokens Studio has synced.
      const requiredSamples = [
        'btn.background-color',
        'btn.primary.background-color',
        'btn.border-radius',
      ]

      for (const name of requiredSamples) {
        const v = figma.variables
          .getLocalVariables()
          .find((x) => x.name.toLowerCase().includes(name.replace(/\./g, '/').toLowerCase()))

        if (!v) {
          missingNamespaces.push(name)
        }
      }

      if (missingNamespaces.length > 0) {
        postToUI({
          type: 'variables-detected',
          found: false,
          missingNamespaces,
        })
      } else {
        postToUI({ type: 'variables-detected', found: true })
      }

      void collection // suppress noUnusedLocals — collection confirmed to exist
    } catch (err) {
      postToUI({
        type: 'variables-detected',
        found: false,
        missingNamespaces: [(err as Error).message],
      })
    }
    return
  }

  // ── generate-components ───────────────────────────────────────────────────
  if (msg.type === 'generate-components') {
    let collection: VariableCollection
    try {
      collection = ensureCollection()
    } catch (err) {
      postToUI({ type: 'error', message: (err as Error).message })
      return
    }

    const targetPage = ensureTargetPage()
    let count = 0

    // Builder map — Phase 5 injects TextField/Textarea/Select/Checkbox/Radio/Switch HERE
    // (append to this map, do not replace it)
    const builders: Record<string, (opts: BuildOpts) => Promise<ComponentSetNode>> = {
      Btn:       buildBtn,
      // ── Phase 5 ─────────────────────────────────────────────────────────────
      TextField: buildTextField,
      Textarea:  buildTextarea,
      Select:    buildSelect,
      Checkbox:  buildCheckbox,
      Radio:     buildRadio,
      Switch:    buildSwitch,
      // ────────────────────────────────────────────────────────────────────────
      Card:      buildCard,
      Chip:    buildChip,
      Avatar:  buildAvatar,
      Alert:   buildAlert,
      Dialog:  buildDialog,
      Toolbar: buildToolbar,
      Badge:   buildBadge,
    }

    for (const name of msg.components) {
      const builder = builders[name]
      if (!builder) continue

      try {
        await builder({
          targetPage,
          collection,
          onProgress: (current, total) => {
            postToUI({
              type: 'generate-progress',
              current,
              total,
              component: name,
            })
          },
        })
        count++
      } catch (err) {
        postToUI({
          type: 'error',
          message: `Failed to build ${name}: ${(err as Error).message}`,
        })
      }
    }

    postToUI({ type: 'generate-done', createdSetCount: count })
    return
  }

  // ── export ────────────────────────────────────────────────────────────────
  if (msg.type === 'export') {
    if (msg.format === 'w3c') {
      postToUI({ type: 'error', message: 'W3C exporter is v2 — not yet implemented.' })
      return
    }

    try {
      let result: { filename: string; mimeType: string; bytes: Uint8Array }

      if (msg.format === 'scss-origam') {
        const { exportScssOrigam } = await import('./exporters/scss-origam')
        result = await exportScssOrigam()
      } else {
        // 'tokens-studio' — default branch
        const { exportTokensStudio } = await import('./exporters/tokens-studio')
        result = await exportTokensStudio()
      }

      const base64 = uint8ArrayToBase64(result.bytes)
      postToUI({
        type: 'export-ready',
        filename: result.filename,
        mimeType: result.mimeType,
        base64,
      })
    } catch (err) {
      postToUI({ type: 'error', message: `Export failed: ${(err as Error).message}` })
    }
    return
  }

  // ── close ─────────────────────────────────────────────────────────────────
  if (msg.type === 'close') {
    figma.closePlugin()
  }
})
