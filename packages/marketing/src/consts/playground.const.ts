import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/**
 * HomePlayground — static showcase. The buttons below drive BOTH the rendered
 * OrigamBtn and the displayed code (utils/home-demo.util.ts), so the preview
 * is exactly what the code shows. The component name and prop names are code,
 * so they are intentionally not translated; only the labels are.
 *
 * Owner decision (#1517): Secondary = violet outline + ink text, Ghost = white
 * fill + lavender border. The `ghost` / `outlined` variants do not paint that
 * (measured: `outlined` + `color` gives violet text on an ink border, `ghost`
 * a grey veil), and Btn has no surface intent, hence the `var()` values.
 * Keys are kebab-case because they are printed verbatim in the snippet.
 */
export const HOME_DEMO_BUTTONS: IHomeDemoButton[] = [
    {
        key: 'primary',
        labelKey: 'home.playground.btn_primary',
        labelFallback: 'Primary',
        props: { variant: 'flat', 'bg-color': 'primary' }
    },
    {
        key: 'secondary',
        labelKey: 'home.playground.btn_secondary',
        labelFallback: 'Secondary',
        props: { variant: 'outlined', 'border-color': 'var(--origam-color__action--primary---bg)' }
    },
    {
        key: 'ghost',
        labelKey: 'home.playground.btn_ghost',
        labelFallback: 'Ghost',
        props: {
            variant: 'flat',
            border: true,
            'border-color': 'var(--origam-color__surface---sunken)',
            'bg-color': 'var(--origam-color__surface---raised)'
        }
    }
]

/** Longest one-line `<OrigamBtn …>` the demo snippet keeps inline before breaking one attribute per line. */
export const HOME_DEMO_SNIPPET_MAX_LINE = 72
