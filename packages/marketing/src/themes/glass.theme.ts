import type { IOrigamTheme } from 'origam/interfaces'

export const glassLightTheme: IOrigamTheme = {
    name: 'glass',
    label: 'Glass',
    vars: {
        rounded: {
            card: '16px',
            btn: '999px',
            pill: '999px',
            sm: '10px',
            md: '16px',
            lg: '22px'
        },
        color: {
            surface: {
                default: '#e9ecff',
                raised: 'rgba(255, 255, 255, 0.65)',
                sunken: 'rgba(255, 255, 255, 0.85)',
                overlay: 'rgba(255, 255, 255, 0.85)',
                disabled: 'rgba(196, 181, 253, 0.20)'
            },
            text: {
                primary: '#1a1538',
                secondary: '#3f2e7e',
                tertiary: '#4c3a8c',
                disabled: '#a78bfa',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#1a1538'
            },
            action: {
                primary: {
                    bg: '#7c3aed',
                    bgHover: '#6d28d9',
                    bgSubtle: 'rgba(124, 58, 237, 0.10)',
                    bgDisabled: 'rgba(196, 181, 253, 0.20)',
                    fg: '#ffffff',
                    fgSubtle: '#6d28d9',
                    fgDisabled: '#a78bfa'
                },
                secondary: {
                    bg: 'rgba(255, 255, 255, 0.18)',
                    bgHover: 'rgba(255, 255, 255, 0.28)',
                    bgDisabled: 'rgba(255, 255, 255, 0.08)',
                    fg: '#1a1538',
                    fgDisabled: '#a78bfa'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(124, 58, 237, 0.08)',
                    bgDisabled: 'transparent',
                    fg: '#6d28d9',
                    fgDisabled: '#a78bfa'
                }
            },
            border: {
                // Fix source #2 (SYNTHESE glass §5.2, WCAG 1.4.11 non-text
                // contrast): the previous rgba(124,58,237,.20) resolved to
                // ~2.1:1 — an empty control/field contour was nearly
                // invisible on the frosted gradient. Solid #6d28d9 (6.06:1,
                // spec-calculated) replaces it as the global default border.
                default: '#6d28d9',
                subtle: 'rgba(124, 58, 237, 0.10)',
                strong: 'rgba(124, 58, 237, 0.35)',
                focus: '#7c3aed',
                'subtle-alpha': 'rgba(124, 58, 237, 0.12)',
                ghost: 'rgba(124, 58, 237, 0.16)'
            },
            feedback: {
                success: {
                    bg: '#16a34a',
                    bgSubtle: 'rgba(22, 163, 74, 0.1)',
                    fg: '#000000',
                    // Fix source #1 (SYNTHESE glass §5.1): #15803d measured
                    // 4.4:1 on the frosted surface (< AA). green-800 clears
                    // AA at 6.24:1.
                    fgSubtle: '#166534',
                    border: '#16a34a'
                },
                warning: {
                    bg: '#d97706',
                    bgSubtle: 'rgba(217, 119, 6, 0.1)',
                    fg: '#000000',
                    // Fix source #1 (SYNTHESE glass §5.1): #b45309 measured
                    // 4.4:1 on the frosted surface (< AA). amber-800 clears
                    // AA at 6.21:1.
                    fgSubtle: '#92400e',
                    border: '#d97706'
                },
                danger: {
                    bg: '#dc2626',
                    bgSubtle: 'rgba(220, 38, 38, 0.1)',
                    fg: '#ffffff',
                    fgSubtle: '#b91c1c',
                    border: '#dc2626'
                },
                info: {
                    bg: '#2563eb',
                    bgSubtle: 'rgba(37, 99, 235, 0.1)',
                    fg: '#ffffff',
                    fgSubtle: '#1d4ed8',
                    border: '#2563eb'
                }
            },
            'btn-primary-text': '#1a1538',
            'btn-secondary-bg': 'rgba(255, 255, 255, 0.22)',
            'btn-secondary-border': 'transparent',
            'btn-secondary-text': '#1a1538'
        },
        // ⛔ ELEVATION = le tier `shadow` sémantique. Échelle croissante glassmorphism :
        // inset white highlights (reflets internes) + blur diffus violet. Les composants
        // consomment via la prop `elevation` (ci-dessous), jamais de shadow custom nommée.
        shadow: {
            none: 'none',
            xs: 'inset 0 1px 0 rgba(255, 255, 255, 0.70), 0 1px 4px -1px rgba(60, 30, 120, 0.08)',
            sm: 'inset 0 1px 1px rgba(255, 255, 255, 0.80), inset 1px 0 1px rgba(255, 255, 255, 0.40), 0 4px 12px -4px rgba(60, 30, 120, 0.15)',
            md: 'inset 0 1px 1px rgba(255, 255, 255, 0.90), inset 1px 0 1px rgba(255, 255, 255, 0.50), inset 0 -1px 1px rgba(124, 58, 237, 0.10), 0 6px 20px -6px rgba(60, 30, 120, 0.25)',
            lg: 'inset 0 1px 1px rgba(255, 255, 255, 0.90), inset 1px 0 1px rgba(255, 255, 255, 0.50), inset 0 -1px 1px rgba(124, 58, 237, 0.12), 0 10px 30px -12px rgba(60, 30, 120, 0.40)',
            xl: 'inset 0 1px 1px rgba(255, 255, 255, 0.90), inset 1px 0 1px rgba(255, 255, 255, 0.60), inset 0 -1px 1px rgba(124, 58, 237, 0.18), 0 16px 48px -16px rgba(60, 30, 120, 0.55), 0 4px 12px -4px rgba(60, 30, 120, 0.20)'
        }
    },
    // ⛔ PROPS D'ABORD (logique DS). Overrides glass superposés sur la baseline
    // `origam` (deep-merge). Identité glassmorphism = très arrondi + translucide
    // + bordures subtiles + elevation diffuse. Seuls les reflets et couleurs
    // translucides (non exprimables en props) restent dans `vars`/`cssVars`.
    //
    // Source unique : SYNTHESE-glass-theme.md §3 (bloc validé). Chaque prop a
    // été vérifiée contre l'interface DS réelle avant écriture — voir la PR
    // pour le détail. PR #249 (issue #242, câblage `useDefaults()` sur 11
    // composants) est MERGÉE dans develop — tous les composants ci-dessous
    // sont désormais câblés et vérifiés par computed-style (voir la PR),
    // à l'exception de checkbox/radio (issue #241, glyphe mdi — distincte
    // de #242/#249, toujours ouverte).
    // ⚠️ `origam-app` is intentionally ABSENT from the `components` block
    // below. Tried `'origam-app': { bgColor: 'transparent' }` first (the
    // PROPS-FIRST path — `IAppProps extends IBgColorProps`, and `bgColor`
    // is forwarded to `OrigamLayout`) but verified via computed-style /
    // outerHTML that it is a SILENT NO-OP: `OrigamApp.vue` does not call
    // `useDefaults()` (grep confirms only ~20 other components do — Btn,
    // Card, Chip, Alert, Snackbar, … — App isn't one of them), so the
    // theme's per-component prop block never reaches this component. DS GAP
    // (same category as the `pill`/`border` no-ops already documented
    // elsewhere in this file) — fixed here via the `cssVars` escape hatch
    // instead (`--origam-app---background-color`, the var `OrigamApp.vue`'s
    // OWN scoped `<style>` genuinely reads). See the `cssVars` block, fix
    // #285 root-cause note, for the full explanation.
    components: {
        // ── Btn family — hors périmètre SYNTHESE (non ré-spécifiée), conservée
        // telle quelle. `pill` retiré : IBtnProps n'a PAS de prop `pill`
        // (confirmé — seul IChipProps en a une) ; c'était un no-op silencieux.
        'origam-btn': { variant: 'tonal', rounded: 'lg', elevation: 2 },
        'origam-btn-group': { variant: 'tonal', rounded: 'lg', elevation: 2 },
        'origam-btn-toggle': { variant: 'tonal', rounded: 'lg', elevation: 2 },
        // `origam-field` — hors périmètre SYNTHESE. `border` retiré : IFieldProps
        // n'étend PAS IBorderProps (seuls IInputProps / ITextFieldProps l'ont) ;
        // c'était un no-op silencieux.
        'origam-field': { variant: 'outlined', rounded: 'lg' },
        'origam-date-picker-field': { rounded: 'lg', border: true },
        'origam-file-field': { rounded: 'lg', border: true },
        'origam-color-picker-field': { rounded: 'lg', border: true },

        // ── Feedback & Status (SYNTHESE §3) ─────────────────────────────
        'origam-alert': { rounded: 'lg', border: true, elevation: 2 },
        'origam-snackbar': { rounded: 'lg', border: true, elevation: 3 },
        'origam-badge': { rounded: 'lg', border: true, elevation: 1 },
        'origam-progress-linear': { rounded: true, color: 'primary' },
        'origam-progress-circular': { color: 'primary' },
        // variant:'tonal' retiré (fix source #3) : IChipProps n'a pas de
        // prop `variant` — translucidité posée via cssVars à la place.
        'origam-chip': { rounded: 'lg', border: true, pill: true, elevation: 1 },

        // ── Form & Input — sélection (SYNTHESE §3) ──────────────────────
        // rounded/border/elevation existent bien sur ICheckboxProps /
        // IRadioProps (types valides) mais ne sont PAS rendus par
        // OrigamCheckboxBtn.vue / OrigamRadioBtn.vue (glyphe mdi, aucun
        // useRounded/useBorder/useElevation dans le rendu — issue #241,
        // distincte de #242/#249. Posées quand même (prêtes à s'activer le jour où
        // #241 est corrigé) — marquées pending #241 dans la vérification (seul
        // point encore non résolu de tout le thème).
        'origam-checkbox': { rounded: 'lg', border: true, elevation: 3 }, // pending #241 (glyph render)
        'origam-radio': { rounded: 'lg', border: true, elevation: 3 }, // pending #241 (glyph render)
        // `color:'primary'` ajouté au-delà de la liste littérale SYNTHESE §3 :
        // ISwitchProps extends IColorProps (vérifié) — nécessaire pour obtenir
        // le "fill accent bombé" au ON exigé par la règle couple-actif §1.2 ;
        // sans lui le thumb/track ON restent sur la couleur neutre par défaut.
        'origam-switch': { rounded: 'lg', border: true, elevation: 3, inset: true, color: 'primary' },
        'origam-slider-field': { rounded: true, color: 'primary', trackProps: { rounded: true } },

        // ── Form & Input — champs (SYNTHESE §3) ─────────────────────────
        'origam-text-field': { variant: 'outlined', rounded: 'lg', border: true, elevation: 2 },
        'origam-textarea-field': { variant: 'outlined', rounded: 'lg', border: true, elevation: 2 },
        'origam-number-field': { variant: 'outlined', rounded: 'lg', border: true, elevation: 2 },
        'origam-password-field': { variant: 'outlined', rounded: 'lg', border: true, elevation: 2 },
        'origam-select': {
            variant: 'outlined', rounded: 'lg', border: true,
            menuProps: { rounded: 'lg', elevation: 3, nav: true }
        },

        // ── Overlay & Surface (SYNTHESE §3) ─────────────────────────────
        'origam-card': { rounded: 'lg', border: true, elevation: 4 },
        'origam-sheet': { rounded: 'lg', border: true, elevation: 4 },
        'origam-menu': { rounded: 'lg', border: true, elevation: 4, nav: true },
        'origam-dialog': { rounded: 'lg', border: true, elevation: 5 },
        // origam-tooltip volontairement ABSENT d'ici : ITooltipProps n'a NI
        // `rounded`, NI `border`, NI `elevation` (confirmé — aucune de ces
        // Commons interfaces n'est étendue). Le radius passe par le cssVar
        // `--origam-tooltip---border-radius` (seul hook exposé par le SCSS).
        // Le "sans caret" du §1.4 est acquis par défaut : le composant ne
        // rend aucun triangle/pointeur, la spec n'a rien à désactiver.

        // ── Navigation (SYNTHESE §3) ─────────────────────────────────────
        'origam-tabs': { variant: 'pills', rounded: 'lg' },
        'origam-bottom-nav': { rounded: 'lg', border: true, elevation: 4 },
        'origam-breadcrumb': { rounded: 'lg', border: true, density: 'compact' },
        // rounded retiré : IPaginationProps n'étend PAS IRoundedProps — le
        // radius est 100% cssVar-driven (`--origam-pagination---border-radius`
        // / `-rounded`), câblé plus bas dans `cssVars`.
        'origam-pagination': { border: true, elevation: 2 },
        'origam-list': { rounded: 'lg', nav: true },

        // ── Data Display (SYNTHESE §3) ───────────────────────────────────
        'origam-table': { rounded: 'lg', border: true, elevation: 3, hover: true },
        'origam-code': { rounded: 'lg', border: true, elevation: 3, copyable: true },
        'origam-avatar': { rounded: 'lg', border: true, elevation: 2 },
        'origam-blockquote': {
            variant: 'default', rounded: 'lg', border: true, elevation: 3,
            accentColor: 'primary'
        }
    },
    // Overrides bruts glassmorphism non exprimables en props (bordures translucides,
    // backdrop-filter, ombres douces à reflets internes). Migrés depuis glass.css →
    // appliqués par le DS via `[data-theme="glass"]` (sous-arbre-capable).
    //
    // ⛔ Chaque nom de var ci-dessous a été vérifié en lisant le `<style>` réel
    // du composant DS (`packages/ds/src/components/**`) — pas de var inventée.
    // Les effets demandés par SYNTHESE §4 qui n'ont AUCUN hook CSS réel dans le
    // composant sont listés en commentaire "DS GAP" (non appliqués) plutôt que
    // simulés avec un nom de var qui ne serait lu par rien — voir la PR.
    cssVars: {
        // Fix #285 (root cause) — `<origam-app>` (the page shell, rendered as
        // a full-page-height `<div class="origam-app">` directly inside
        // `<body>`) defaults to an OPAQUE `background-color`
        // (`--origam-app---background-color`, falls back to
        // `{color.surface.default}`). That opaque fill sits ON TOP of
        // `<body>`'s own `--origam-page---background-image` (the 4-blob
        // glass gradient below) and fully occludes it for the ENTIRE page —
        // confirmed by computed-style: `.origam-app`'s `background-color`
        // resolved to solid `rgb(233, 236, 255)` with no `background-image`,
        // at full document height (4512px, not just the 720px viewport).
        // Card/sheet backgrounds were ALREADY correctly translucent
        // (verified: `--origam-card---background` computed to
        // `rgba(255,255,255,0.65)` even before this fix), but with nothing
        // colourful behind them to blur, the frosted effect was invisible —
        // reading as flat/opaque exactly as reported in #285. Fixed here
        // (not via the `components` props block — see the note above it).
        '--origam-app---background-color': 'transparent',
        '--origam-btn---border-color': 'rgba(124, 58, 237, 0.35)',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': 'inset 0 1px 1px rgba(255, 255, 255, 0.90), inset 1px 0 1px rgba(255, 255, 255, 0.50), inset 0 -1px 1px rgba(124, 58, 237, 0.12), 0 10px 30px -12px rgba(60, 30, 120, 0.40)',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-btn---backdrop-filter-ghost': 'blur(12px) saturate(1.8) brightness(1.05)',
        '--origam-card---box-shadow': 'var(--origam-shadow---card-elevated)',
        '--origam-code---border-radius': '16px',
        // Niveau FORT (mission de suivi #29) : blur(3px) était quasi
        // imperceptible — hooks vérifiés (OrigamCard.vue/OrigamSheet.vue,
        // ligne `backdrop-filter: var(--origam-card---backdrop-filter, none)`).
        '--origam-card---backdrop-filter': 'blur(28px) saturate(2.5) brightness(1.12)',
        '--origam-sheet---backdrop-filter': 'blur(28px) saturate(2.5) brightness(1.12)',
        // Fix #285 — dedicated translucent background for card AND sheet.
        // Card already resolved translucent via its DS default
        // (`{color.surface.raised}` = `rgba(255,255,255,0.65)` in this theme,
        // re-declared here explicitly so it doesn't silently depend on the
        // generic surface-raised semantic matching this exact recipe forever).
        // Sheet had NO override — its DS default is `{color.surface.default}`
        // = the OPAQUE flat `#e9ecff` page colour (verified: `origam-sheet.json`
        // → `background: {color.surface.default}`), so sheet WAS genuinely
        // opaque, unlike card. Same translucency recipe as card (both are
        // "raised glass surface" components in this design).
        '--origam-card---background': 'rgba(255, 255, 255, 0.65)',
        '--origam-sheet---background': 'rgba(255, 255, 255, 0.65)',
        '--origam-appbar---backdrop-filter': 'saturate(2) brightness(1.1) blur(26px)',
        // Hook vérifié (OrigamMenu.vue) ; valeur FORT unique donnée pour les 2
        // modes (contrairement à card/sheet qui ont des recettes séparées).
        '--origam-menu---backdrop-filter': 'blur(30px) saturate(2.6) brightness(1.08)',
        '--origam-appbar---bg': 'rgba(255, 255, 255, 0.30)',
        '--origam-menu---background': 'rgba(224, 215, 250, 0.42)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '16px',
        '--origam-menu---box-shadow': '0 8px 32px -8px rgba(124, 58, 237, 0.18), 0 1px 4px -1px rgba(124, 58, 237, 0.10), 0 0 0 1px var(--origam-color__border---default), inset 0 1px 0 rgba(255, 255, 255, 0.60)',
        '--origam-menu__content---padding': '6px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        // Respiration items (SYNTHESE §1.5/§4) — `nav:true` (posé en props sur
        // origam-menu/origam-list) applique déjà `margin-block-end:4px` via son
        // propre modificateur ; seul le radius d'item reste à fixer ici.
        '--origam-list-item---border-radius': '11px',
        // Tint hover/actif (SYNTHESE §4) — le "fill" de l'item est un overlay
        // `currentColor` dont seule l'opacité varie par état (.08 hover-link /
        // .12 actif / .16 actif+hover) ; on route sa COULEUR sur l'accent pour
        // obtenir un tint violet au lieu d'un tint "texte" par défaut. Couple
        // actif partiel : la teinte de fond est bien accent, mais aucun hook
        // CSS dédié n'existe pour forcer le texte en accent-ink par item actif
        // (résolution de la couleur se fait par prop JS, pas par cssVar) — DS GAP.
        '--origam-list-item__overlay---background-color': '#7c3aed',
        '--origam-list-item---border-color': 'var(--origam-color__border---default)',

        // Niveau FORT (relecture design — mission de suivi #29) : blur 24px
        // (au lieu de 3px, quasi imperceptible). Hook vérifié :
        // `@supports (backdrop-filter…) { backdrop-filter: var(--origam-alert---backdrop-filter, none) }`
        // dans OrigamAlert.vue — réel, appliqué.
        '--origam-alert---backdrop-filter': 'blur(24px) saturate(2.4) brightness(1.10)',
        // ⚠️ Hook vérifié = `background-color: var(--origam-alert---background-color)`
        // (propriété `background-color`, PAS `background`) — un gradient y est
        // CSS invalide (même piège que le badge, cf. commit précédent). La
        // recette FORT demandée (linear-gradient 3 arrêts) est donc remontée
        // en rgba plate : moyenne pondérée des 3 arrêts (.62/.34/.30 blanc)
        // ≈ 0.42.
        '--origam-alert---background-color': 'rgba(255, 255, 255, 0.42)',
        '--origam-alert---border-color': 'rgba(124, 58, 237, 0.20)',
        // NOUVEAU — hook réel trouvé et jusqu'ici inutilisé : `&--elevated { box-shadow:
        // var(--origam-alert---box-shadow-elevated, var(--origam-shadow---md)) }`.
        // `elevation:2` (props ci-dessus) pousse déjà `--elevated` via
        // `useStateEffect`/`elevationClasses` (vérifié en runtime) — la recette
        // cut-glass FORT (SYNTHESE §2, light) remplace le fallback générique.
        '--origam-alert---box-shadow-elevated': 'inset 0 2px 0 rgba(255, 255, 255, 1), inset 2px 0 4px -1px rgba(255, 255, 255, 0.75), inset -1px 0 3px -1px rgba(255, 255, 255, 0.45), inset 0 -2px 3px rgba(124, 58, 237, 0.14), 0 20px 46px -14px rgba(60, 30, 120, 0.42), 0 4px 14px -6px rgba(124, 58, 237, 0.30)',

        // ── Chip (fix source #3) — `variant:'tonal'` retiré des props
        // (IChipProps n'a pas de `variant`, confirmé dead) ; la translucidité
        // qu'il était censé porter passe ici, sur les vraies vars du composant.
        // Valeurs FORT (mission de suivi #29). `backdrop-filter` débloqué par
        // #253 (hook déclaré + consommé sur .origam-chip, vérifié computed-style
        // baseline "none" → opérant) — appliqué.
        '--origam-chip---background-color': 'rgba(255, 255, 255, 0.28)',
        '--origam-chip---border-color': 'rgba(124, 58, 237, 0.20)',
        '--origam-chip---backdrop-filter': 'blur(16px) saturate(2)',

        // ── Snackbar (SYNTHESE §4) — plus opaque que l'alert (flotte au-dessus
        // du contenu). `backdrop-filter` débloqué par #253 (hook déclaré sur le
        // vrai porteur visuel, OrigamSnackbarItem.vue / .origam-snackbar-item,
        // pas le __wrapper de layout) — appliqué.
        '--origam-snackbar-item---background-color': 'rgba(255, 255, 255, 0.55)',
        '--origam-snackbar-item---border-color': 'rgba(124, 58, 237, 0.24)',
        '--origam-snackbar-item---color': 'var(--origam-color__text---primary)',
        '--origam-snackbar-item---backdrop-filter': 'blur(24px)',

        // ── Badge (SYNTHESE §4) — remplissage feedback plein conservé (classes
        // `--warning/--success/--info/--error` inchangées, lisent déjà
        // `vars.color.feedback`) ; le badge NEUTRE (sans intent) reçoit un
        // fill accent + rim clair, pas de translucidité (surface trop petite
        // pour lire un flou).
        // ⛔ BUG TROUVÉ EN VÉRIFICATION RUNTIME (Playwright) : `background-color`
        // (SCSS ligne consommatrice, `OrigamBadge.vue`) N'ACCEPTE PAS de
        // gradient — une valeur `linear-gradient(...)` y est CSS invalide et
        // rejetée silencieusement (aucun fallback dans `var(...)`), rendant le
        // badge transparent. Confirmé par capture computed-style AVANT/APRÈS.
        // Corrigé en couleur pleine unie ; le "dégradé spéculaire" demandé par
        // la spec n'est pas atteignable sans passer par `background-image`/
        // `background` (propriété non consommée par le composant) — DS GAP.
        '--origam-badge__badge---background-color': '#7c3aed',
        '--origam-badge__badge---border-color': 'rgba(255, 255, 255, 0.55)',
        '--origam-badge__badge---color': '#ffffff',
        // Mission de suivi #29 — "rim si le hook l'accepte" : `box-shadow:
        // var(--origam-badge__badge---box-shadow)` existe et n'a jamais été
        // renseigné (hook réel, vérifié dans OrigamBadge.vue). Glint spéculaire
        // haut-gauche en lieu du dégradé de fond (bloqué par `background-color`).
        '--origam-badge__badge---box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.65)',

        // ── Progress (SYNTHESE §4) — piste translucide + barre accent. Le
        // "glow" spéculaire du pouce/barre n'a pas de hook box-shadow exposé
        // par OrigamProgressLinear/Circular — DS GAP, non appliqué.
        '--origam-progress-linear__background---color': '#7c3aed',
        '--origam-progress-linear__background---opacity': '0.14',
        '--origam-progress-linear__loader---color': '#7c3aed',
        '--origam-progress-circular__underlay---color': '#7c3aed',
        '--origam-progress-circular__underlay---opacity': '0.14',
        '--origam-progress-circular__overlay---color': '#7c3aed',

        // ── Switch (SYNTHESE §4) — puits translucide (OFF) + thumb perle. Le
        // fill bombé accent au ON vient de la prop `color:'primary'` posée sur
        // `origam-switch` (IColorProps, résolution JS — pas de cssVar requise).
        // Aucun hook box-shadow (glow/puits creux) exposé par
        // OrigamSwitchTrack/OrigamSwitch — DS GAP, non appliqué (inchangé).
        // `backdrop-filter: blur(20px) saturate(2.6)` débloqué par #253 sur les
        // 2 hooks distincts : le track du switch (--origam-switch__track---*)
        // ET le puits partagé checkbox/radio (--origam-selection-control__input---*,
        // OrigamSelectionControl.vue — un seul composant pour les deux). Le puits
        // checkbox/radio reste "pending #241" pour rounded/border/elevation
        // (glyphe mdi, sans effet), MAIS backdrop-filter n'est PAS soumis à cette
        // limitation : il floute la zone derrière l'élément (cercle 40x40,
        // border-radius:50%) indépendamment du glyphe dessiné dessus — appliqué.
        '--origam-switch__track---background-color': 'rgba(255, 255, 255, 0.35)',
        '--origam-switch__track---backdrop-filter': 'blur(20px) saturate(2.6)',
        '--origam-switch__thumb---background-color': '#ffffff',
        '--origam-switch__thumb---border-color': 'rgba(124, 58, 237, 0.35)',
        '--origam-selection-control__input---backdrop-filter': 'blur(20px) saturate(2.6)',

        // ── Champs (SYNTHESE §4) — contour ≥0.55 au repos (le fix source #2
        // porte le contour ≥0.8 pour les CONTRÔLES VIDES ; ici on route le
        // champ sur ce même token fixé au lieu du fallback `currentColor` par
        // défaut). `backdrop-filter` débloqué par #253 (hook déclaré sur
        // .origam-field, le root qui porte le fond de tous les variants) —
        // appliqué, valeur FORT re-confirmée mission #29 (blur(24px) saturate(2.2)).
        // L'anneau de focus (--origam-field---focus-ring-*) est également
        // débloqué par #253 mais AUCUNE valeur FORT n'a été fournie pour ce
        // hook précis dans le tableau de la PR #255 — non posé ici, pas
        // d'invention de valeur (ticket de suivi séparé si le design le
        // spécifie).
        '--origam-field---background-color': 'rgba(255, 255, 255, 0.30)',
        '--origam-field---border-color': 'var(--origam-color__border---default)',
        '--origam-field---backdrop-filter': 'blur(24px) saturate(2.2)',

        // ── Dialog / scrim (SYNTHESE §4) — le "scrim flouté" demandé est
        // débloqué par #253 (hook déclaré + consommé sur .origam-scrim,
        // OrigamOverlayScrim.vue, vérifié computed-style baseline "none" →
        // opérant) — appliqué. La teinte de fond reste inchangée (rgba(20,14,48,.35),
        // re-confirmée mission #29). Le "verre" du dialog LUI-MÊME (pas le
        // scrim) est hérité : OrigamDialog.vue rend un
        // `<origam-card ref="origamCardRef" … v-bind="cardProps">` interne (lu
        // dans le source, ligne ~22) qui reçoit donc `--origam-card---backdrop-filter`
        // du thème comme toute autre instance `origam-card` (résolution par nom
        // de composant, pas par position DOM — déjà vérifiée en runtime sur
        // /components/card). ⚠️ PAS observé directement sur un dialog ouvert :
        // la page /components/dialog n'a pas de démo interactive (seuls des
        // exemples de code statiques avec bouton "Copy") — preuve par lecture
        // de code + composant frère vérifié, pas par capture runtime de CETTE
        // instance précise.
        '--origam-overlay-scrim---background-color': 'rgba(20, 14, 48, 0.35)',
        '--origam-overlay-scrim---backdrop-filter': 'blur(10px) saturate(1.4)',

        // ── Table (SYNTHESE §4) ──────────────────────────────────────────
        '--origam-table---background-color': 'rgba(255, 255, 255, 0.30)',
        '--origam-table__header-cell---background-color': 'rgba(124, 58, 237, 0.08)',
        '--origam-table__row---hover-background-color': 'rgba(124, 58, 237, 0.10)',
        '--origam-table__cell---border-color': 'rgba(124, 58, 237, 0.12)',
        '--origam-table__header-cell---border-bottom-color': 'rgba(124, 58, 237, 0.20)',

        // ── Code (SYNTHESE §4) — en-tête translucide + surlignage tint accent.
        // DS GAP : les couleurs de syntaxe (kw/str/fn/cmt) viennent de shiki
        // (`--shiki-light`/`--shiki-dark`), PAS de vars `--origam-code---*` —
        // aucun token origam par-catégorie n'existe, donc rien à écraser ici
        // sans reconfigurer le thème shiki (hors périmètre d'un thème marketing).
        '--origam-code__header---background-color': 'rgba(255, 255, 255, 0.40)',
        '--origam-code__header---color': 'var(--origam-color__text---secondary)',
        '--origam-code__line-highlight---background-color': 'rgba(124, 58, 237, 0.10)',
        '--origam-code__line-highlight---accent-color': '#7c3aed',

        // ── Avatar (SYNTHESE §4) — perle de verre (initiales/icône) + anneau.
        '--origam-avatar---background-color': 'rgba(255, 255, 255, 0.40)',
        '--origam-avatar---border-color': 'rgba(255, 255, 255, 0.55)',

        // ── Divider — DS GAP : OrigamDivider.vue n'expose qu'un `border-*-width`
        // (pas de `background`/`background-color`), le dégradé demandé par la
        // spec (`linear-gradient(90deg, transparent, accent, transparent)`) est
        // donc IMPOSSIBLE via cssVars sans modifier le composant DS. Non appliqué.

        // ── Pagination (SYNTHESE §4) — page courante = fill accent + on-color
        // (couple actif). `rounded` n'existe pas comme prop (voir `components`
        // ci-dessus) ; le radius passe ici, en cssVar réelle.
        '--origam-pagination---border-radius': '12px',
        '--origam-pagination__item--is-active---background-color': '#7c3aed',
        '--origam-pagination__item--is-active---color': '#ffffff',
        '--origam-pagination__item--is-active---border-color': 'transparent',

        // ── Tooltip (SYNTHESE §3/§4) — `border-radius`/`background-color`/`color`
        // sont les hooks historiques exposés par OrigamTooltip.vue. Toujours pas
        // de `border`/`box-shadow` — DS GAP (voir la note dans `components`
        // ci-dessus). Le "sans caret" est acquis par défaut. `backdrop-filter`
        // débloqué par #253 (hook déclaré + consommé sur .origam-tooltip__content,
        // vérifié computed-style baseline "none" → opérant) — appliqué, valeur
        // FORT re-confirmée mission #29 (blur(20px) saturate(2.2)).
        '--origam-tooltip---border-radius': '10px',
        '--origam-tooltip---background-color': 'rgba(26, 21, 56, 0.90)',
        '--origam-tooltip---color': '#ffffff',
        '--origam-tooltip---backdrop-filter': 'blur(20px) saturate(2.2)'
    }
}

export const glassDarkTheme: IOrigamTheme = {
    name: 'glass',
    mode: 'dark',
    vars: {
        rounded: {
            card: '22px',
            btn: '999px',
            pill: '999px',
            sm: '16px',
            md: '22px',
            lg: '30px'
        },
        color: {
            surface: {
                default: '#07060f',
                raised: 'rgba(255, 255, 255, 0.05)',
                sunken: 'rgba(255, 255, 255, 0.04)',
                overlay: 'rgba(255, 255, 255, 0.04)',
                disabled: 'rgba(107, 95, 175, 0.20)'
            },
            text: {
                primary: '#ffffff',
                secondary: '#e4deff',
                tertiary: '#cfc4f5',
                disabled: '#6b5faf',
                inverse: '#07060f',
                onColor: '#07060f',
                ink: '#ffffff'
            },
            action: {
                primary: {
                    bg: 'rgba(255, 255, 255, 0.08)',
                    bgHover: 'rgba(255, 255, 255, 0.14)',
                    bgSubtle: 'rgba(167, 139, 250, 0.14)',
                    bgDisabled: 'rgba(107, 95, 175, 0.20)',
                    fg: '#ffffff',
                    fgSubtle: '#ddd6fe',
                    fgDisabled: '#6b5faf'
                },
                secondary: {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    bgHover: 'rgba(255, 255, 255, 0.10)',
                    bgDisabled: 'rgba(255, 255, 255, 0.02)',
                    fg: '#ffffff',
                    fgDisabled: '#6b5faf'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(167, 139, 250, 0.10)',
                    bgDisabled: 'transparent',
                    fg: '#ddd6fe',
                    fgDisabled: '#6b5faf'
                }
            },
            border: {
                // Fix source #2 (SYNTHESE glass §5.2): dark contour needs
                // white ≥0.35 opacity (3.10:1) — 0.12 was near-invisible.
                default: 'rgba(255, 255, 255, 0.35)',
                subtle: 'rgba(255, 255, 255, 0.06)',
                strong: 'rgba(255, 255, 255, 0.20)',
                focus: '#a78bfa',
                'subtle-alpha': 'rgba(255, 255, 255, 0.08)',
                ghost: 'rgba(255, 255, 255, 0.08)'
            },
            feedback: {
                success: {
                    bg: '#6ee7b7',
                    bgSubtle: 'rgba(110, 231, 183, 0.10)',
                    fg: '#07060f',
                    fgSubtle: '#6ee7b7',
                    border: '#6ee7b7'
                },
                warning: {
                    bg: '#fcd34d',
                    bgSubtle: 'rgba(252, 211, 77, 0.10)',
                    fg: '#07060f',
                    fgSubtle: '#fcd34d',
                    border: '#fcd34d'
                },
                danger: {
                    bg: '#fca5a5',
                    bgSubtle: 'rgba(252, 165, 165, 0.10)',
                    fg: '#07060f',
                    fgSubtle: '#fca5a5',
                    border: '#fca5a5'
                },
                info: {
                    bg: '#7dd3fc',
                    bgSubtle: 'rgba(125, 211, 252, 0.10)',
                    fg: '#07060f',
                    fgSubtle: '#7dd3fc',
                    border: '#7dd3fc'
                }
            },
            'btn-primary-text': '#ffffff',
            'btn-secondary-bg': 'rgba(255, 255, 255, 0.08)',
            'btn-secondary-border': 'transparent',
            'btn-secondary-text': '#ffffff'
        },
        // ELEVATION (dark) : même rampe glassmorphism, reflets blancs atténués sur fond
        // sombre + ombres portées profondes. Consommée via la prop `elevation`.
        shadow: {
            none: 'none',
            xs: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 4px -1px rgba(0, 0, 0, 0.25)',
            sm: 'inset 0 1px 1px rgba(255, 255, 255, 0.18), inset 1px 0 1px rgba(255, 255, 255, 0.10), 0 4px 12px -4px rgba(0, 0, 0, 0.35)',
            md: 'inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 1.5px 0 1px rgba(255, 255, 255, 0.14), inset 0 -1px 1px rgba(0, 0, 0, 0.10), 0 8px 24px -8px rgba(0, 0, 0, 0.45)',
            lg: 'inset 0 1px 1px rgba(255, 255, 255, 0.60), inset 1.5px 0 1px rgba(255, 255, 255, 0.28), inset -1.5px 0 1px rgba(255, 255, 255, 0.14), inset 0 -10px 22px rgba(255, 255, 255, 0.05), inset 0 -1px 1px rgba(0, 0, 0, 0.20), 0 12px 34px -10px rgba(0, 0, 0, 0.50), 0 2px 6px -2px rgba(0, 0, 0, 0.30)',
            xl: 'inset 0 1px 1px rgba(255, 255, 255, 0.70), inset 1.5px 0 1px rgba(255, 255, 255, 0.35), inset -1.5px 0 1px rgba(255, 255, 255, 0.20), inset 0 -10px 22px rgba(255, 255, 255, 0.06), inset 0 -1px 1px rgba(0, 0, 0, 0.25), 0 16px 48px -12px rgba(0, 0, 0, 0.65), 0 4px 10px -4px rgba(0, 0, 0, 0.40)'
        }
    },
    cssVars: {
        // Fix #285 (root cause, dark) — see the light theme's `cssVars`
        // block above for the full explanation: `<origam-app>`'s opaque
        // default background-color occludes `<body>`'s page gradient for
        // the entire page. `components: { 'origam-app': {...} }` is a
        // no-op (OrigamApp isn't wired to `useDefaults()`) — fixed via the
        // raw cssVar instead, same as light.
        '--origam-app---background-color': 'transparent',
        '--origam-btn---border-color': 'rgba(255, 255, 255, 0.20)',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': 'inset 0 1px 1px rgba(255, 255, 255, 0.60), inset 1.5px 0 1px rgba(255, 255, 255, 0.28), inset 0 -1px 1px rgba(0, 0, 0, 0.20), 0 8px 24px -6px rgba(167, 139, 250, 0.60)',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-btn---backdrop-filter-ghost': 'blur(12px) saturate(1.6) brightness(1.02)',
        '--origam-card---box-shadow': 'var(--origam-shadow---card-elevated)',
        '--origam-code---border-radius': '16px',
        '--origam-card---backdrop-filter': 'blur(28px) saturate(2.2)',
        '--origam-sheet---backdrop-filter': 'blur(28px) saturate(2.2)',
        // Fix #285 — dedicated translucent background for card AND sheet
        // (dark). Same values as the DS default resolved via
        // `{color.surface.raised}` for card (`rgba(255,255,255,0.05)`,
        // re-declared explicitly), extended to sheet whose DS default
        // (`{color.surface.default}` = opaque `#07060f`) was genuinely
        // opaque. See the light theme's cssVars block for the full note.
        '--origam-card---background': 'rgba(255, 255, 255, 0.05)',
        '--origam-sheet---background': 'rgba(255, 255, 255, 0.05)',
        '--origam-appbar---backdrop-filter': 'saturate(2) brightness(1.1) blur(26px)',
        '--origam-menu---backdrop-filter': 'blur(30px) saturate(2.3) brightness(1.05)',
        '--origam-appbar---bg': 'rgba(255, 255, 255, 0.06)',
        '--origam-menu---background': 'rgba(30, 25, 58, 0.50)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '22px',
        '--origam-menu---box-shadow': '0 8px 32px -8px rgba(0, 0, 0, 0.60), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
        '--origam-menu__content---padding': '6px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-list-item---border-radius': '11px',
        // Dark = verre teinté sombre (SYNTHESE §1.3), pas blanc — l'overlay actif
        // reste sur l'accent clair `#a78bfa` (7.4:1 sur fond sombre, cf. §1.2 fill
        // accent bombé) plutôt que sur `#7c3aed` (trop sombre pour un tint dark).
        '--origam-list-item__overlay---background-color': '#a78bfa',
        '--origam-list-item---border-color': 'var(--origam-color__border---default)',

        '--origam-alert---backdrop-filter': 'blur(24px) saturate(2.1)',
        // ⚠️ Même piège que light (background-color n'accepte pas de gradient) —
        // recette dark linear-gradient(150deg, rgba(44,40,80,.58), rgba(12,10,28,.52))
        // remontée en rgba plate : moyenne canal par canal des 2 arrêts
        // (R (44+12)/2, G (40+10)/2, B (80+28)/2, alpha (.58+.52)/2).
        '--origam-alert---background-color': 'rgba(28, 25, 54, 0.55)',
        '--origam-alert---border-color': 'rgba(255, 255, 255, 0.12)',
        // La recette cut-glass dark de SYNTHESE §2 est partiellement elidée
        // dans le document source ("…" entre les 2 premiers et les 2 derniers
        // termes) — seuls les termes EXPLICITEMENT donnés sont appliqués, pas
        // d'invention des termes manquants.
        '--origam-alert---box-shadow-elevated': 'inset 0 1.5px 0 rgba(255, 255, 255, 0.5), 0 22px 50px -14px rgba(0, 0, 0, 0.7), 0 0 26px -6px rgba(167, 139, 250, 0.35)',

        '--origam-chip---background-color': 'rgba(255, 255, 255, 0.07)',
        '--origam-chip---border-color': 'rgba(255, 255, 255, 0.14)',
        '--origam-chip---backdrop-filter': 'blur(16px) saturate(2)',

        '--origam-snackbar-item---background-color': 'rgba(24, 22, 44, 0.78)',
        '--origam-snackbar-item---border-color': 'rgba(255, 255, 255, 0.16)',
        '--origam-snackbar-item---color': 'var(--origam-color__text---primary)',
        '--origam-snackbar-item---backdrop-filter': 'blur(24px)',

        // Voir le commentaire "BUG TROUVÉ EN VÉRIFICATION RUNTIME" côté light —
        // même correction (solide, pas de gradient sur `background-color`).
        '--origam-badge__badge---background-color': '#a78bfa',
        '--origam-badge__badge---border-color': 'rgba(255, 255, 255, 0.30)',
        '--origam-badge__badge---color': '#07060f',
        '--origam-badge__badge---box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',

        '--origam-progress-linear__background---color': '#ffffff',
        '--origam-progress-linear__background---opacity': '0.10',
        '--origam-progress-linear__loader---color': '#a78bfa',
        '--origam-progress-circular__underlay---color': '#ffffff',
        '--origam-progress-circular__underlay---opacity': '0.10',
        '--origam-progress-circular__overlay---color': '#a78bfa',

        '--origam-switch__track---background-color': 'rgba(255, 255, 255, 0.10)',
        '--origam-switch__track---backdrop-filter': 'blur(20px) saturate(2.6)',
        '--origam-switch__thumb---background-color': '#e4deff',
        '--origam-switch__thumb---border-color': 'rgba(255, 255, 255, 0.20)',
        '--origam-selection-control__input---backdrop-filter': 'blur(20px) saturate(2.6)',

        '--origam-field---background-color': 'rgba(255, 255, 255, 0.06)',
        '--origam-field---border-color': 'var(--origam-color__border---default)',
        '--origam-field---backdrop-filter': 'blur(24px) saturate(2.2)',

        '--origam-overlay-scrim---background-color': 'rgba(4, 3, 12, 0.55)',
        '--origam-overlay-scrim---backdrop-filter': 'blur(10px) saturate(1.4)',

        '--origam-table---background-color': 'rgba(255, 255, 255, 0.05)',
        '--origam-table__header-cell---background-color': 'rgba(167, 139, 250, 0.10)',
        '--origam-table__row---hover-background-color': 'rgba(167, 139, 250, 0.12)',
        '--origam-table__cell---border-color': 'rgba(255, 255, 255, 0.10)',
        '--origam-table__header-cell---border-bottom-color': 'rgba(255, 255, 255, 0.16)',

        '--origam-code__header---background-color': 'rgba(255, 255, 255, 0.06)',
        '--origam-code__header---color': 'var(--origam-color__text---secondary)',
        '--origam-code__line-highlight---background-color': 'rgba(167, 139, 250, 0.14)',
        '--origam-code__line-highlight---accent-color': '#a78bfa',

        '--origam-avatar---background-color': 'rgba(255, 255, 255, 0.08)',
        '--origam-avatar---border-color': 'rgba(255, 255, 255, 0.24)',

        '--origam-pagination---border-radius': '12px',
        '--origam-pagination__item--is-active---background-color': '#a78bfa',
        '--origam-pagination__item--is-active---color': '#07060f',
        '--origam-pagination__item--is-active---border-color': 'transparent',

        '--origam-tooltip---border-radius': '10px',
        '--origam-tooltip---background-color': 'rgba(255, 255, 255, 0.12)',
        '--origam-tooltip---color': '#ffffff',
        '--origam-tooltip---backdrop-filter': 'blur(20px) saturate(2.2)'
    }
}

export const glassThemes: IOrigamTheme[] = [glassLightTheme, glassDarkTheme]
