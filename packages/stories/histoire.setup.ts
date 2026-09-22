import { defineSetupVue3 } from '@histoire/plugin-vue'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'

import OrigamStoryLayout from '@stories/components/_shared/OrigamStoryLayout.vue'

// Design-system tokens must be loaded before any component renders —
// otherwise `var(--origam-color__action--*---bg)` and friends resolve to
// `undefined` and inline color styles silently no-op. The order matches
// `src/assets/scss/main.scss`: primitives first (raw values), then the
// theme overrides (light by default, dark via `[data-theme="dark"]`).
import '@origam/assets/css/tokens/primitive.css'
import '@origam/assets/css/tokens/light.css'
import '@origam/assets/css/tokens/dark.css'

// Global utility classes (`.origam--bg-primary`, `.origam--shadow-md`, …).
// Loaded AFTER tokens so the `var(--origam-…)` references resolve, and
// BEFORE component <style scoped> blocks (Vite injects scoped CSS after the
// imports above, so source order keeps component selectors winning the
// specificity tie at 0,1,0).
import '@origam/assets/css/tokens/origam-utilities.css'

// Material Design Icons font — every component that renders an icon
// (OrigamIcon, OrigamListGroup activator's expand chevron, OrigamBtn
// prepend-icon, OrigamChip close button, …) ships with class names
// like `mdi mdi-chevron-down`. Pictogrammers' `@mdi/font` declares the
// `@font-face` and the per-glyph `::before { content: "…" }` rules
// those classes consume. Without it, the `<i class="mdi mdi-…">`
// elements render as 16x16 invisible boxes and consumers see only the
// label next to the empty append slot. Material Icons / Symbols
// (loaded below) are a different icon set used by `OrigamLigatureIcon`
// and DO NOT cover the `mdi-*` glyph names.
import '@mdi/font/css/materialdesignicons.css'

// Force the light theme by default in the Histoire sandbox so component
// stories render against the light palette. The dark palette is still
// reachable by setting `<html data-theme="dark">` from a story wrapper
// (or via the OrigamThemeProvider component for sub-tree overrides).
// Without this attribute, `prefers-color-scheme: dark` on the host
// machine would silently flip every story to dark.
if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'light')

    // Force the sandbox iframe to fluidly fill its pane in both
    // directions. Histoire's responsive-preview component wraps the
    // iframe in `.htw-overflow-hidden` whose width is driven by an
    // inline responsive preset (default 720px). When the user drags
    // the sandbox/panel sash, the OUTER pane resizes but the INNER
    // preview wrapper stays at the preset → the iframe inside
    // appears stuck. We target that wrapper directly with
    // `width: 100% !important` so the iframe always follows the
    // pane. The trade-off is that Histoire's responsive-preset
    // picker (320 / 768 / 1024 px) becomes a no-op visually — the
    // project never uses it, so that's acceptable.
    //
    // The `iframe[src*="__sandbox"]` block stays because it removes
    // the small horizontal scroll bar that appears at the bottom of
    // the preview on certain Vite HMR rehydrations (the iframe
    // briefly reverts to its 720x720 attribute values before its
    // inner contents recompute). Idempotent on re-runs.
    try {
        const top = window.top
        if (top && top !== window && top.document && !top.document.getElementById('origam-iframe-fit')) {
            const s = top.document.createElement('style')
            s.id = 'origam-iframe-fit'
            s.textContent = `
                .histoire-story-responsive-preview,
                .histoire-story-responsive-preview > div,
                .histoire-story-responsive-preview > div > div {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                }
                iframe[src*="__sandbox"] {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                }
            `
            top.document.head.appendChild(s)
        }
    } catch {
        // Cross-origin or no top window — silently no-op.
    }

    // Disable clipping inside Histoire's per-story render frame so
    // box-shadow halos (e.g. the Btn ghost glow) and other "outside the
    // box" effects are NOT cut off. Histoire's default
    // `.histoire-generic-render-story` ships with `overflow: auto` which
    // clips ~18-24 px halos at the frame edges. We make it `visible`
    // and add a min-height so the frame still reserves space for content
    // that was relying on the auto sizing.
    if (!document.getElementById('origam-render-frame-fix')) {
        const s = document.createElement('style')
        s.id = 'origam-render-frame-fix'
        s.textContent = `
            .histoire-generic-render-story,
            .__histoire-render-story {
                overflow: visible !important;
                min-height: 80px;
            }
        `
        document.head.appendChild(s)
    }

    // Load Material Icons + Material Symbols Outlined fonts for
    // `OrigamLigatureIcon`. The component itself does NOT load any font
    // (each host app declares its own icon strategy), but the stories
    // need them so the ligature substitution can swap the icon name
    // text into the actual glyph. Idempotent — re-running setup won't
    // duplicate the <link>.
    const FONT_HREFS = [
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
    ]
    for (const href of FONT_HREFS) {
        if (!document.head.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = href
            document.head.appendChild(link)
        }
    }
}

export const setupVue3 = defineSetupVue3(({ app, addWrapper }) => {
    // ⛔ #360 (v3.0.0 harvest) — `createOrigam()` no longer installs a theme by
    // default. Stories rely on `origamTheme`'s per-component `components` prop
    // defaults (ADR-005 — e.g. `origam-avatar`'s `rounded: 'full'`), so it must
    // be passed explicitly or every story would silently lose those defaults.
    app.use(createOrigam({ themes: origamTheme }))
    addWrapper(OrigamStoryLayout)
})
