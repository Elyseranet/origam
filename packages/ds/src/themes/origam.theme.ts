import type { IOrigamTheme } from '../interfaces/Commons/theme.interface'

// origam's DEFAULT identity ("sobre") authored as clean IOrigamTheme objects —
// vars (semantic + scale tokens) + per-component default props, NO CSS dump.
// Component variables reference the semantic tier, so these few vars cascade to
// every component.
//   - origamLightTheme : no name, no mode → injected at `:root` (the default).
//   - origamDarkTheme  : mode:'dark'      → injected at `[data-mode="dark"]`.
// Component default props live on the mode-less light object so they apply in
// BOTH modes (no duplication); dark only retunes colour + brand shadows.

export const origamLightTheme: IOrigamTheme = {
    label: 'Origam',
    description: 'Calm, neutral surfaces with a single violet accent — the default origam identity.',

    vars: {
        color: {
            surface: {
                default: '#ffffff',
                raised: '#fafafa',
                sunken: '#f5f5f5',
                overlay: '#f5f5f5',
                disabled: '#e6e6e6'
            },
            text: {
                primary: '#0a0a0a',
                secondary: '#525252',
                tertiary: '#737373',
                disabled: '#a3a3a3',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#0a0a0a'
            },
            action: {
                primary: {
                    bg: '#7c3aed',
                    bgHover: '#6d28d9',
                    bgDisabled: '#e6e6e6',
                    bgSubtle: 'rgba(124, 58, 237, 0.10)',
                    fg: '#ffffff',
                    fgDisabled: '#a3a3a3',
                    fgSubtle: '#6d28d9'
                },
                secondary: {
                    bg: '#f5f5f5',
                    bgHover: '#e6e6e6',
                    bgDisabled: '#fafafa',
                    fg: '#171717',
                    fgDisabled: '#a3a3a3'
                },
                ghost: {
                    bg: 'rgba(0, 0, 0, 0)',
                    bgHover: 'rgba(0, 0, 0, 0.06)',
                    bgDisabled: 'rgba(0, 0, 0, 0)',
                    fg: '#7c3aed',
                    fgDisabled: '#a3a3a3'
                }
            },
            border: {
                default: 'rgba(0, 0, 0, 0.08)',
                subtle: 'rgba(0, 0, 0, 0.04)',
                'subtle-alpha': 'rgba(0, 0, 0, 0.08)',
                strong: 'rgba(0, 0, 0, 0.16)',
                ghost: 'rgba(0, 0, 0, 0.08)',
                focus: '#7c3aed'
            },
            feedback: {
                danger: { bg: '#dc2626', bgSubtle: 'rgba(220, 38, 38, 0.08)', fg: '#ffffff', fgSubtle: '#b91c1c', border: '#dc2626' },
                info: { bg: '#2563eb', bgSubtle: 'rgba(37, 99, 235, 0.08)', fg: '#ffffff', fgSubtle: '#1d4ed8', border: '#2563eb' },
                success: { bg: '#16a34a', bgSubtle: 'rgba(22, 163, 74, 0.08)', fg: '#ffffff', fgSubtle: '#15803d', border: '#16a34a' },
                warning: { bg: '#d97706', bgSubtle: 'rgba(217, 119, 6, 0.08)', fg: '#ffffff', fgSubtle: '#b45309', border: '#d97706' }
            }
        },
        rounded: {
            none: '0px',
            xs: '2px',
            sm: '4px',
            md: '8px',
            lg: '12px',
            xl: '16px',
            '2xl': '24px',
            full: '9999px'
        },
        border: {
            width: { '0': '0px', thin: '1px', '2': '2px', '4': '4px' },
            style: { solid: 'solid', dashed: 'dashed', dotted: 'dotted' }
        },
        typo: {
            family: {
                sans: "Inter, 'Helvetica Neue', Arial, sans-serif",
                serif: "Georgia, 'Times New Roman', serif",
                mono: "'JetBrains Mono', 'Fira Code', monospace"
            },
            size: {
                xs: '0.625rem',
                sm: '0.75rem',
                md: '0.875rem',
                lg: '1rem',
                xl: '1.125rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
                '4xl': '1.875rem',
                '5xl': '2.25rem'
            },
            weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
            lineHeight: { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 },
            letterSpacing: {
                tight: '-0.025em',
                normal: '0em',
                wide: '0.0094em',
                wider: '0.0125em',
                widest: '0.0893em'
            }
        },
        shadow: {
            none: '0px 0px 0px 0px rgba(0,0,0,0)',
            xs: '0px 1px 2px 0px rgba(0,0,0,0.05)',
            sm: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            md: '0px 6px 24px 0px rgba(0,0,0,0.05), 0px 0px 0px 1px rgba(0,0,0,0.08)',
            lg: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
            xl: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
            'btn-primary': 'rgba(255, 255, 255, 0.20) 0px 1px 0px 0px inset, rgba(124, 58, 237, 0.50) 0px 8px 24px -8px',
            'btn-secondary': 'none',
            'card-elevated': '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px -16px rgba(0, 0, 0, 0.18)',
            'glow-primary': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 24px -8px rgba(124, 58, 237, 0.5)'
        },
        spacing: {
            '0': '0px',
            '1': '4px',
            '2': '8px',
            '3': '12px',
            '4': '16px',
            '5': '20px',
            '6': '24px',
            '8': '32px',
            '10': '40px',
            '12': '48px',
            '14': '56px',
            '16': '64px',
            '20': '80px'
        },
        motion: {
            duration: {
                instant: '0ms',
                fast: '100ms',
                normal: '150ms',
                medium: '200ms',
                slow: '280ms',
                xslow: '400ms'
            },
            easing: {
                linear: 'cubic-bezier(0, 0, 1, 1)',
                standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
                accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
                decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
                sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
            }
        }
    },

    cssVars: {},

    components: {
        'origam-alert': { tag: 'div', density: 'default' },
        'origam-audio': { tag: 'article', variant: 'expanded', position: 'relative' },
        /*********************************************************
         * origam-avatar — no forced `color` (#530)
         *
         * @description
         * A global constant foreground can't stay readable against every
         * `bgColor` a consumer picks (a text-secondary grey by default is
         * fine unstyled; violet-on-amber or violet-on-blue once a consumer
         * sets `bgColor="warning"`/`"info"` is not). Leaving `color` unset
         * lets `OrigamAvatar`'s own per-instance auto-contrast
         * (`useStateEffect`, `bgColor` → matching `fg` token) do the job it
         * was built for instead of being pre-empted by a static default.
         ********************************************************/
        'origam-avatar': { tag: 'div', size: 'default', rounded: 'full' },
        'origam-badge': { tag: 'div', location: 'top right' },
        'origam-blockquote': { tag: 'blockquote', variant: 'default' },
        'origam-bottom-nav': { tag: 'nav', position: 'start' },
        'origam-bracket': { tag: 'div', variant: 'single-elimination', color: 'primary' },
        'origam-breadcrumb': { tag: 'nav', density: 'default' },
        'origam-btn': { variant: 'text', size: 'small' },
        'origam-btn-group': { variant: 'text', size: 'small' },
        'origam-btn-toggle': { variant: 'text', size: 'small' },
        'origam-card': { tag: 'div', density: 'default', rounded: 'lg', border: true, flat: true },
        'origam-checkbox': { density: 'default' },
        'origam-chip': { size: 'small', variant: 'outlined', color: 'primary', pill: true, border: true, borderColor: 'var(--origam-color__action--primary---bg)' },
        'origam-clipboard': { tag: 'span' },
        'origam-code': { tag: 'figure', rounded: 'lg' },
        'origam-color-picker-field': { density: 'default', border: true, rounded: true },
        'origam-confirm-wrapper': { density: 'default' },
        'origam-contextual-menu': { location: 'right' },
        'origam-counter': { tag: 'div' },
        'origam-data-table': { tag: 'div', density: 'default' },
        'origam-date-picker-field': { density: 'default', border: true, rounded: true },
        'origam-divider': { color: 'var(--origam-color__border---default)' },
        'origam-drawer': { tag: 'nav', location: 'left' },
        'origam-empty-state': { size: 'md', align: 'center' },
        'origam-field': { variant: 'outlined', density: 'default' },
        'origam-file-field': { density: 'default', border: true, rounded: true },
        'origam-grid': { gap: '1rem', tag: 'ul' },
        'origam-grid-item': { tag: 'li' },
        'origam-input': { density: 'default' },
        'origam-kbd': { variant: 'outlined' },
        'origam-list': { tag: 'div', density: 'compact' },
        'origam-list-item': { density: 'compact' },
        'origam-loader': { tag: 'span' },
        'origam-main': { tag: 'main' },
        'origam-masonry': { tag: 'div', gap: 'md', align: 'top' },
        'origam-menu': { location: 'bottom' },
        'origam-messages': { tag: 'div', density: 'default' },
        'origam-number-field': { border: true, rounded: true },
        'origam-number-format': { tag: 'span' },
        'origam-overlay': { location: 'bottom' },
        'origam-pagination': { tag: 'nav' },
        'origam-parallax': { tag: 'div' },
        'origam-password-field': { density: 'default', rounded: true },
        'origam-progress': { tag: 'div', size: 'default' },
        'origam-qr-code': { tag: 'div', color: 'currentColor' },
        'origam-rating-field': { tag: 'div', size: 'default' },
        'origam-select': { border: true, rounded: true, variant: 'outlined', density: 'compact' },
        'origam-sheet': { border: true, borderColor: 'var(--origam-color__border---default)' },
        'origam-skeleton': { variant: 'text', rounded: 'sm' },
        'origam-slider-field': { variant: 'field' },
        'origam-snackbar': { location: 'bottom', border: true, rounded: true, elevation: 1 },
        'origam-stepper': { size: 'default' },
        'origam-switch': { density: 'compact' },
        'origam-system-bar': { tag: 'div' },
        'origam-table': { tag: 'div', border: true, rounded: 'lg' },
        'origam-tabs': { tag: 'div', variant: 'default' },
        'origam-text-field': { rounded: 'lg', variant: 'outlined', density: 'compact' },
        'origam-text-mask': { tag: 'span', align: 'left' },
        'origam-textarea-field': { density: 'default', rounded: true },
        'origam-theme-provider': { tag: 'div' },
        'origam-timeline': { tag: 'div' },
        'origam-title': { tag: 'h2' },
        'origam-toolbar': { tag: 'header', density: 'default' },
        'origam-tooltip': { location: 'right' },
        'origam-treeview': { density: 'default', size: 'default' },
        'origam-watermark': { tag: 'div', color: 'currentColor' },
        'origam-window': { tag: 'div' },
        'origam-calendar': { rounded: 'lg', density: 'compact', border: true },
        'origam-chart': { rounded: 'lg' },
        'origam-color-picker': { rounded: 'lg', border: true },
        'origam-data-list': { rounded: 'lg', density: 'compact', border: true },
        'origam-date-picker': { rounded: 'lg', border: true },
        'origam-expansion-panel': { rounded: 'md', density: 'compact', border: true },
        'origam-otp-input-field': { variant: 'outlined' },
        'origam-radio': { density: 'compact' },
        'origam-selection-control': { density: 'compact' }
    }
}

export const origamDarkTheme: IOrigamTheme = {
    mode: 'dark',
    label: 'Origam',
    description: 'Calm, neutral surfaces with a single violet accent — the default origam identity.',

    vars: {
        color: {
            surface: {
                default: '#0a0a0a',
                raised: '#0e0e0e',
                sunken: '#171717',
                overlay: '#0e0e0e',
                disabled: '#262626'
            },
            text: {
                primary: '#fafafa',
                secondary: '#a3a3a3',
                tertiary: '#737373',
                disabled: '#525252',
                inverse: '#0a0a0a',
                onColor: '#ffffff',
                ink: '#fafafa'
            },
            action: {
                primary: {
                    bg: '#8b5cf6',
                    bgHover: '#7c3aed',
                    bgDisabled: '#262626',
                    bgSubtle: 'rgba(124, 58, 237, 0.14)',
                    fg: '#ffffff',
                    fgDisabled: '#525252',
                    fgSubtle: '#c4b5fd'
                },
                secondary: {
                    bg: '#262626',
                    bgHover: '#404040',
                    bgDisabled: '#171717',
                    fg: '#fafafa',
                    fgDisabled: '#525252'
                },
                ghost: {
                    bg: 'rgba(0, 0, 0, 0)',
                    bgHover: 'rgba(255, 255, 255, 0.06)',
                    bgDisabled: 'rgba(0, 0, 0, 0)',
                    fg: '#c4b5fd',
                    fgDisabled: '#525252'
                }
            },
            border: {
                default: 'rgba(255, 255, 255, 0.08)',
                subtle: 'rgba(255, 255, 255, 0.04)',
                'subtle-alpha': 'rgba(255, 255, 255, 0.08)',
                strong: 'rgba(255, 255, 255, 0.16)',
                ghost: 'rgba(255, 255, 255, 0.08)',
                focus: '#a78bfa'
            },
            feedback: {
                danger: { bg: '#dc2626', bgSubtle: 'rgba(220, 38, 38, 0.12)', fg: '#ffffff', fgSubtle: '#f87171', border: '#f87171' },
                info: { bg: '#2563eb', bgSubtle: 'rgba(37, 99, 235, 0.12)', fg: '#ffffff', fgSubtle: '#60a5fa', border: '#60a5fa' },
                success: { bg: '#16a34a', bgSubtle: 'rgba(22, 163, 74, 0.12)', fg: '#ffffff', fgSubtle: '#6ee7b7', border: '#6ee7b7' },
                warning: { bg: '#d97706', bgSubtle: 'rgba(217, 119, 6, 0.12)', fg: '#ffffff', fgSubtle: '#fbbf24', border: '#fbbf24' }
            }
        },
        shadow: {
            'btn-primary': 'rgba(255, 255, 255, 0.08) 0px 1px 0px 0px inset, rgba(139, 92, 246, 0.50) 0px 8px 24px -8px',
            'btn-secondary': 'none',
            'card-elevated': 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 8px 24px -16px rgba(0, 0, 0, 0.6)',
            'glow-primary': 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 24px -8px rgba(139, 92, 246, 0.5)'
        }
    },

    cssVars: {},

    components: {
        'origam-alert': { tag: 'div', density: 'default' },
        'origam-audio': { tag: 'article', variant: 'expanded', position: 'relative' },
        /*********************************************************
         * origam-avatar — no forced `color` (#530)
         *
         * @description
         * A global constant foreground can't stay readable against every
         * `bgColor` a consumer picks (a text-secondary grey by default is
         * fine unstyled; violet-on-amber or violet-on-blue once a consumer
         * sets `bgColor="warning"`/`"info"` is not). Leaving `color` unset
         * lets `OrigamAvatar`'s own per-instance auto-contrast
         * (`useStateEffect`, `bgColor` → matching `fg` token) do the job it
         * was built for instead of being pre-empted by a static default.
         ********************************************************/
        'origam-avatar': { tag: 'div', size: 'default', rounded: 'full' },
        'origam-badge': { tag: 'div', location: 'top right' },
        'origam-blockquote': { tag: 'blockquote', variant: 'default' },
        'origam-bottom-nav': { tag: 'nav', position: 'start' },
        'origam-bracket': { tag: 'div', variant: 'single-elimination', color: 'primary' },
        'origam-breadcrumb': { tag: 'nav', density: 'default' },
        'origam-btn': { variant: 'text', size: 'small' },
        'origam-btn-group': { variant: 'text', size: 'small' },
        'origam-btn-toggle': { variant: 'text', size: 'small' },
        'origam-card': { tag: 'div', density: 'default', rounded: 'lg', border: true, flat: true },
        'origam-checkbox': { density: 'default' },
        'origam-chip': { size: 'small', variant: 'outlined', color: 'primary', pill: true, border: true, borderColor: 'var(--origam-color__action--primary---bg)' },
        'origam-clipboard': { tag: 'span' },
        'origam-code': { tag: 'figure', rounded: 'lg' },
        'origam-color-picker-field': { density: 'default', border: true, rounded: true },
        'origam-confirm-wrapper': { density: 'default' },
        'origam-contextual-menu': { location: 'right' },
        'origam-counter': { tag: 'div' },
        'origam-data-table': { tag: 'div', density: 'default' },
        'origam-date-picker-field': { density: 'default', border: true, rounded: true },
        'origam-divider': { color: 'var(--origam-color__border---default)' },
        'origam-drawer': { tag: 'nav', location: 'left' },
        'origam-empty-state': { size: 'md', align: 'center' },
        'origam-field': { variant: 'outlined', density: 'default' },
        'origam-file-field': { density: 'default', border: true, rounded: true },
        'origam-grid': { gap: '1rem', tag: 'ul' },
        'origam-grid-item': { tag: 'li' },
        'origam-input': { density: 'default' },
        'origam-kbd': { variant: 'outlined' },
        'origam-list': { tag: 'div', density: 'compact' },
        'origam-list-item': { density: 'compact' },
        'origam-loader': { tag: 'span' },
        'origam-main': { tag: 'main' },
        'origam-masonry': { tag: 'div', gap: 'md', align: 'top' },
        'origam-menu': { location: 'bottom' },
        'origam-messages': { tag: 'div', density: 'default' },
        'origam-number-field': { border: true, rounded: true },
        'origam-number-format': { tag: 'span' },
        'origam-overlay': { location: 'bottom' },
        'origam-pagination': { tag: 'nav' },
        'origam-parallax': { tag: 'div' },
        'origam-password-field': { density: 'default', rounded: true },
        'origam-progress': { tag: 'div', size: 'default' },
        'origam-qr-code': { tag: 'div', color: 'currentColor' },
        'origam-rating-field': { tag: 'div', size: 'default' },
        'origam-select': { border: true, rounded: true, variant: 'outlined', density: 'compact' },
        'origam-sheet': { border: true, borderColor: 'var(--origam-color__border---default)' },
        'origam-skeleton': { variant: 'text', rounded: 'sm' },
        'origam-slider-field': { variant: 'field' },
        'origam-snackbar': { location: 'bottom', border: true, rounded: true, elevation: 1 },
        'origam-stepper': { size: 'default' },
        'origam-switch': { density: 'compact' },
        'origam-system-bar': { tag: 'div' },
        'origam-table': { tag: 'div', border: true, rounded: 'lg' },
        'origam-tabs': { tag: 'div', variant: 'default' },
        'origam-text-field': { rounded: 'lg', variant: 'outlined', density: 'compact' },
        'origam-text-mask': { tag: 'span', align: 'left' },
        'origam-textarea-field': { density: 'default', rounded: true },
        'origam-theme-provider': { tag: 'div' },
        'origam-timeline': { tag: 'div' },
        'origam-title': { tag: 'h2' },
        'origam-toolbar': { tag: 'header', density: 'default' },
        'origam-tooltip': { location: 'right' },
        'origam-treeview': { density: 'default', size: 'default' },
        'origam-watermark': { tag: 'div', color: 'currentColor' },
        'origam-window': { tag: 'div' },
        'origam-calendar': { rounded: 'lg', density: 'compact', border: true },
        'origam-chart': { rounded: 'lg' },
        'origam-color-picker': { rounded: 'lg', border: true },
        'origam-data-list': { rounded: 'lg', density: 'compact', border: true },
        'origam-date-picker': { rounded: 'lg', border: true },
        'origam-expansion-panel': { rounded: 'md', density: 'compact', border: true },
        'origam-otp-input-field': { variant: 'outlined' },
        'origam-radio': { density: 'compact' },
        'origam-selection-control': { density: 'compact' }
    }
}

export const origamTheme: IOrigamTheme[] = [origamLightTheme, origamDarkTheme]
