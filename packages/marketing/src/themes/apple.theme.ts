import type { IOrigamTheme } from 'origam/interfaces'

export const appleLightTheme: IOrigamTheme = {
    name: 'apple',
    label: 'Apple',
    vars: {
        rounded: {
            card: '12px',
            btn: '12px',
            pill: '980px',
            sm: '8px',
            md: '12px',
            lg: '18px'
        },
        color: {
            surface: {
                default: '#ffffff',
                raised: '#fbfbfd',
                sunken: '#f5f5f7',
                overlay: '#f5f5f7',
                disabled: '#d2d2d7'
            },
            text: {
                primary: '#1d1d1f',
                secondary: '#515154',
                tertiary: '#86868b',
                disabled: '#86868b',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#1d1d1f'
            },
            action: {
                primary: {
                    bg: '#0071e3',
                    bgHover: '#0058b0',
                    bgSubtle: '#f0f7ff',
                    bgDisabled: '#d2d2d7',
                    fg: '#ffffff',
                    fgSubtle: '#0058b0',
                    fgDisabled: '#86868b'
                },
                secondary: {
                    bg: '#fbfbfd',
                    bgHover: '#f5f5f7',
                    bgDisabled: '#d2d2d7',
                    fg: '#1d1d1f',
                    fgDisabled: '#86868b'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(0, 0, 0, 0.04)',
                    bgDisabled: 'transparent',
                    fg: '#1d1d1f',
                    fgDisabled: '#86868b'
                }
            },
            border: {
                default: '#d2d2d7',
                subtle: '#e5e5e7',
                strong: '#86868b',
                focus: '#0071e3',
                'subtle-alpha': 'rgba(210, 210, 215, 0.60)',
                ghost: 'rgba(210, 210, 215, 0.40)'
            },
            feedback: {
                success: {
                    bg: '#28cd41',
                    bgSubtle: '#e8f8ec',
                    fg: '#000000',
                    fgSubtle: '#166534',
                    border: '#28cd41'
                },
                warning: {
                    bg: '#ff9f0a',
                    bgSubtle: '#fff4e5',
                    fg: '#000000',
                    fgSubtle: '#78350f',
                    border: '#ff9f0a'
                },
                danger: {
                    bg: '#ff3b30',
                    bgSubtle: '#ffe9e7',
                    fg: '#000000',
                    fgSubtle: '#c2271c',
                    border: '#ff3b30'
                },
                info: {
                    bg: '#0071e3',
                    bgSubtle: '#f0f7ff',
                    fg: '#ffffff',
                    fgSubtle: '#0058b0',
                    border: '#0071e3'
                }
            }
        },
        // ⛔ ELEVATION = le tier `shadow` sémantique. Rampe croissante iOS :
        // ombres douces, multicouches, opacités très faibles (style HIG Apple).
        // Les composants consomment via la prop `elevation`, jamais de shadow inline.
        shadow: {
            none: 'none',
            xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
            sm: '0 2px 6px rgba(0, 0, 0, 0.06)',
            md: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
            lg: '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
            xl: '0 12px 32px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04)'
        }
    },
    // ⛔ PROPS D'ABORD (logique DS). Overrides apple superposés sur la baseline
    // `origam` (deep-merge). Identité Apple/iOS HIG = boutons pleins, coins
    // arrondis modérés, bordures minimales, elevation subtile via ombres douces.
    // Mode-agnostic : s'applique aux deux modes (light + dark).
    components: {
        'origam-btn': { variant: 'flat', rounded: 'md', elevation: 1 },
        'origam-btn-group': { variant: 'flat', rounded: 'md', elevation: 1 },
        'origam-btn-toggle': { variant: 'flat', rounded: 'md', elevation: 1 },
        'origam-card': { rounded: 'md', flat: false, elevation: 2, border: false },
        'origam-chip': { variant: 'tonal', rounded: 'md', pill: false, border: false },
        'origam-alert': { rounded: 'md', elevation: 1 },
        'origam-field': { variant: 'outlined', rounded: 'md', border: true },
        'origam-text-field': { variant: 'outlined', rounded: 'md', density: 'compact' },
        'origam-textarea-field': { variant: 'outlined', rounded: 'md' },
        'origam-number-field': { variant: 'outlined', rounded: 'md', border: true },
        'origam-password-field': { variant: 'outlined', rounded: 'md' },
        'origam-select': { variant: 'outlined', rounded: 'md', border: true, density: 'compact' },
        'origam-date-picker-field': { rounded: 'md', border: true },
        'origam-file-field': { rounded: 'md', border: true },
        'origam-color-picker-field': { rounded: 'md', border: true },
        'origam-code': { rounded: 'md', elevation: 1 },
        'origam-menu': { rounded: 'md', elevation: 3 },
        'origam-table': { rounded: 'md', border: true },
        'origam-avatar': { rounded: 'full' },
        'origam-checkbox': { rounded: 'sm' },
        'origam-list-item': { rounded: 'md' },
        // Switch harmony (lot 4) — mirrors `origam-text-field`'s rounded so
        // the track reads as the same visual family as the theme's fields
        // (see cartoon.theme.ts for the full rationale comment).
        'origam-switch': { rounded: 'md' },
        'origam-snackbar': { rounded: 'lg', elevation: 4 },
        // Breadcrumb (Refs #33) — "liens et page active bleu plein" : `color`
        // is a foreground-only prop (IColorProps). The bare `'primary'` intent
        // resolves to `action.primary.fgSubtle` (a derived darker/lighter rung,
        // via `tokenForegroundForIntent`), not the pure accent — so we pass
        // the raw `action.primary.bg` var reference directly (still through
        // the `color` PROP, just a custom value instead of the intent
        // keyword) to get the exact solid #0071e3 / #0a84ff swatch.
        'origam-breadcrumb-item': { color: 'var(--origam-color__action--primary---bg)' }
    },
    cssVars: {
        "--origam-font-family---heading": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        "--origam-title---font-family": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        '--origam-appbar---backdrop-filter': 'saturate(180%) blur(20px)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '12px',
        '--origam-menu__content---padding': '6px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-card---box-shadow': 'var(--origam-shadow---card-elevated)',
        '--origam-code---border-radius': '12px',
        '--origam-appbar---bg': 'color-mix(in srgb, #ffffff 80%, transparent)',
        // ⛔ vibrancy iOS/macOS HIG (Refs #33) — chrome flottant : saturate(180%) blur(20px).
        // Hook vérifié : OrigamMenu.vue:390-391 consomme `--origam-menu---backdrop-filter`.
        '--origam-menu---backdrop-filter': 'saturate(180%) blur(20px)',
        // 92% → 80% : aligné sur la spec (background reste translucide, la vibrancy fait le reste).
        '--origam-menu---background': 'color-mix(in srgb, var(--origam-color__surface---raised) 80%, transparent)',
        '--origam-menu---box-shadow': '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 0.5px var(--origam-color__border---default)',
        '--origam-btn---border-color': '#d2d2d7',
        '--origam-btn---box-shadow-elevated': '0 2px 8px rgba(0, 113, 227, 0.25)',

        // ── Sheet (Refs #33) — vibrancy + translucent surface + top-only radius.
        // Hooks vérifiés : OrigamSheet.vue:294-298 (background/backdrop-filter/border-radius).
        '--origam-sheet---backdrop-filter': 'saturate(180%) blur(20px)',
        '--origam-sheet---background': 'color-mix(in srgb, var(--origam-color__surface---raised) 78%, transparent)',
        '--origam-sheet---border-radius': '18px 18px 0 0',

        // ── Tooltip (Refs #33) — dark chip on any surface, 8px radius (caret untouched).
        // Hooks vérifiés : OrigamTooltip.vue:198-205.
        '--origam-tooltip---background-color': 'color-mix(in srgb, #1d1d1f 92%, transparent)',
        '--origam-tooltip---color': '#ffffff',
        '--origam-tooltip---border-radius': '8px',

        // ── Segmented control / btn-toggle (Refs #33) — track + lifted active pill.
        // Hooks vérifiés : OrigamBtn.vue `&--variant-tonal` / `&--variant-tonal &--active`
        // (background-color-tonal, background-color-tonal-active, box-shadow-tonal-active).
        // font-weight 600 sur l'état actif est déjà câblé en dur dans le SCSS (pas de var).
        // ⚠️ Effet visible seulement si l'instance consommatrice utilise `variant="tonal"`
        // (btn-toggle ne cascade pas `variant` vers ses boutons enfants — cf. rapport).
        '--origam-btn---background-color-tonal': 'color-mix(in srgb, var(--origam-color__text---primary) 6%, transparent)',
        '--origam-btn---background-color-tonal-active': '#ffffff',
        '--origam-btn---box-shadow-tonal-active': '0 3px 8px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.04), 0 0 0 0.5px rgba(0, 0, 0, 0.04)',

        // ── Tabs indicator (Refs #33) — bleu plein, 2px (2px = défaut DS déjà correct).
        // Hook vérifié : OrigamTab.vue:280 (--origam-tabs__indicator---color, défaut currentColor).
        '--origam-tabs__indicator---color': 'var(--origam-color__action--primary---bg)',

        // ── Bottom nav (Refs #33) — vibrancy-style surface + hairline top border.
        // ⚠️ Vrai préfixe DS = `--origam-bottom-bar---*` (pas `--origam-bottom-nav---*`,
        // divergence de nommage vs la spec — cf. rapport). Backdrop-filter : AUCUN hook
        // trouvé sur OrigamBottomNav.vue → bloqué #253 (pas posé).
        // Hooks vérifiés : OrigamBottomNav.vue:293,299 (background, border-top-width).
        '--origam-bottom-bar---background': 'color-mix(in srgb, var(--origam-color__surface---raised) 80%, transparent)',
        '--origam-bottom-bar---border-top-width': '0.5px',
        '--origam-bottom-bar---border-color': 'var(--origam-color__border---default)',

        // ── Grouped list divider inset (Refs #33) — 52px, pour un alignement iOS
        // (le texte du divider s'aligne avec le contenu, pas le prepend/icon).
        // ⚠️ Nom réel du hook = `--origam-divider--inset---margin-inline-start`
        // (le nom `--origam-list-item__divider---*` de la spec n'existe pas dans le DS
        // — divergence de nommage, cf. rapport). Hook vérifié : OrigamDivider.vue:163.
        '--origam-divider--inset---margin-inline-start': '52px',

        // ── Table (Refs #33) — header sunken + tertiary ink ; hairline row separator.
        // Hooks vérifiés : OrigamTable.vue:223-224 (header-cell bg/color), :235 (cell border).
        // Uppercase header + tabular-nums : AUCUN hook (text-transform/font-variant absents
        // du composant) → bloqué #253 (pas posé).
        // Row "border-top" (spec) : seul un hook border-BOTTOM existe sur `__cell` → posé
        // via ce hook (séparateur hairline visuellement équivalent) — divergence notée.
        '--origam-table__header-cell---background-color': 'var(--origam-color__surface---sunken)',
        '--origam-table__header-cell---color': 'var(--origam-color__text---tertiary)',
        '--origam-table__cell---border-width': '0.5px',

        // ── Avatar ring (Refs #33) — séparation nette sur fonds superposés (photo contact
        // style iMessage/HIG). Hook vérifié : OrigamAvatar.vue:235 (--origam-avatar---box-shadow,
        // pas de fallback par défaut dans le composant).
        '--origam-avatar---box-shadow': '0 0 0 2px var(--origam-color__surface---default)'
    }
}

export const appleDarkTheme: IOrigamTheme = {
    name: 'apple',
    mode: 'dark',
    vars: {
        rounded: {
            card: '12px',
            btn: '12px',
            pill: '980px',
            sm: '8px',
            md: '12px',
            lg: '18px'
        },
        color: {
            surface: {
                default: '#000000',
                raised: '#1c1c1e',
                sunken: '#2c2c2e',
                overlay: '#2c2c2e',
                disabled: '#38383a'
            },
            text: {
                primary: '#f5f5f7',
                secondary: '#a1a1a6',
                tertiary: '#6e6e73',
                disabled: '#6e6e73',
                inverse: '#000000',
                onColor: '#ffffff',
                ink: '#f5f5f7'
            },
            action: {
                primary: {
                    bg: '#0a84ff',
                    bgHover: '#64b5ff',
                    bgSubtle: 'rgba(10, 132, 255, 0.16)',
                    bgDisabled: '#38383a',
                    fg: '#ffffff',
                    fgSubtle: '#64b5ff',
                    fgDisabled: '#6e6e73'
                },
                secondary: {
                    bg: '#1c1c1e',
                    bgHover: '#2c2c2e',
                    bgDisabled: '#38383a',
                    fg: '#f5f5f7',
                    fgDisabled: '#6e6e73'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(255, 255, 255, 0.06)',
                    bgDisabled: 'transparent',
                    fg: '#f5f5f7',
                    fgDisabled: '#6e6e73'
                }
            },
            border: {
                default: '#38383a',
                subtle: '#2c2c2e',
                strong: '#6e6e73',
                focus: '#0a84ff',
                'subtle-alpha': 'rgba(56, 56, 58, 0.60)',
                ghost: 'rgba(56, 56, 58, 0.40)'
            },
            feedback: {
                success: {
                    bg: '#64e47c',
                    bgSubtle: 'rgba(100, 228, 124, 0.12)',
                    fg: '#000000',
                    fgSubtle: '#64e47c',
                    border: '#64e47c'
                },
                warning: {
                    bg: '#ffb445',
                    bgSubtle: 'rgba(255, 180, 69, 0.12)',
                    fg: '#000000',
                    fgSubtle: '#ffb445',
                    border: '#ffb445'
                },
                danger: {
                    bg: '#ff6961',
                    bgSubtle: 'rgba(255, 105, 97, 0.12)',
                    // ⛔ CORRECTIF CONTRASTE (Refs #33) : #ffffff sur #ff6961 = 2.82:1
                    // (échec WCAG AA, seuil 4.5:1 pour texte). #000000 sur #ff6961 ≈ 6.3:1.
                    fg: '#000000',
                    fgSubtle: '#ff6961',
                    border: '#ff6961'
                },
                info: {
                    bg: '#0a84ff',
                    bgSubtle: 'rgba(10, 132, 255, 0.12)',
                    fg: '#ffffff',
                    fgSubtle: '#64b5ff',
                    border: '#0a84ff'
                }
            }
        },
        // ELEVATION (dark) : même style iOS, opacités plus profondes pour
        // rester visible sur fond noir. Consommée via la prop `elevation`.
        shadow: {
            none: 'none',
            xs: '0 1px 2px rgba(0, 0, 0, 0.20)',
            sm: '0 2px 6px rgba(0, 0, 0, 0.30)',
            md: '0 4px 12px rgba(0, 0, 0, 0.40), 0 1px 3px rgba(0, 0, 0, 0.20)',
            lg: '0 8px 20px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
            xl: '0 12px 32px rgba(0, 0, 0, 0.50), 0 4px 8px rgba(0, 0, 0, 0.30)'
        }
    },
    cssVars: {
        "--origam-font-family---heading": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        "--origam-title---font-family": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        '--origam-appbar---backdrop-filter': 'saturate(180%) blur(20px)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '12px',
        '--origam-menu__content---padding': '6px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-card---box-shadow': 'var(--origam-shadow---card-elevated)',
        '--origam-code---border-radius': '12px',
        '--origam-appbar---bg': 'color-mix(in srgb, #000000 80%, transparent)',
        // ⛔ vibrancy (Refs #33) — même traitement que light : voir commentaire détaillé
        // dans appleLightTheme.cssVars. Overridden ici car `[data-mode="dark"]` a une
        // spécificité supérieure au bloc mode-agnostic et écraserait sinon la valeur.
        '--origam-menu---backdrop-filter': 'saturate(180%) blur(20px)',
        '--origam-menu---background': 'color-mix(in srgb, var(--origam-color__surface---raised) 80%, transparent)',
        '--origam-menu---box-shadow': '0 4px 24px rgba(0, 0, 0, 0.50), 0 1px 2px rgba(0, 0, 0, 0.40), 0 0 0 0.5px var(--origam-color__border---default)',
        '--origam-btn---border-color': '#38383a',
        '--origam-btn---box-shadow-elevated': '0 2px 8px rgba(10, 132, 255, 0.30)',

        // ── Tooltip (Refs #33, dark) — light chip inversé. Hooks : OrigamTooltip.vue:198-205.
        '--origam-tooltip---background-color': 'color-mix(in srgb, #e5e5e7 94%, transparent)',
        '--origam-tooltip---color': '#000000',

        // ── Segmented control / btn-toggle (Refs #33, dark) — track identique (mode-agnostic,
        // hérité de appleLightTheme via `color-mix(text.primary)`), active pill #636366 +
        // ombres plus profondes (opacités .4/.3/.2 vs .12/.04/.04 en light).
        '--origam-btn---background-color-tonal-active': '#636366',
        '--origam-btn---box-shadow-tonal-active': '0 3px 8px rgba(0, 0, 0, 0.40), 0 1px 1px rgba(0, 0, 0, 0.30), 0 0 0 0.5px rgba(0, 0, 0, 0.20)'
    }
}

export const appleThemes: IOrigamTheme[] = [appleLightTheme, appleDarkTheme]
