import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/**
 * HomePlayground — static showcase. The buttons below are rendered as real
 * OrigamBtn; the first one (Primary) also drives the displayed code
 * (utils/home-demo.util.ts), so the code shows exactly what it renders.
 * The component name and prop names are code, so they are intentionally not
 * translated; only the labels are.
 *
 * Owner decision (#1517): Secondary = violet outline + ink text, Ghost = white
 * fill + lavender border. The `ghost` / `outlined` variants do not paint that
 * (measured: `outlined` + `color` gives violet text on an ink border, `ghost`
 * a grey veil), and Btn has no surface intent, hence the `var()` values.
 * Keys are kebab-case because they are printed verbatim in the snippet.
 */
/** The Primary, also the one button the code window shows (owner decision, #1517: like the mockup). */
export const HOME_DEMO_CODE_BUTTON: IHomeDemoButton = {
    key: 'primary',
    labelKey: 'home.playground.btn_primary',
    labelFallback: 'Primary',
    props: { variant: 'flat', 'bg-color': 'primary' }
}

/**
 * Rendered size of the three buttons (x-large = 52 px, scale x1.8). Kept out of `props`
 * on purpose: `size="x-large"` would stretch the 3-line snippet past the code column
 * (measured 648 px of code in a 481 px pane); the window shows the semantic props.
 */
export const HOME_DEMO_BUTTON_SIZE = 'x-large'

export const HOME_DEMO_BUTTONS: IHomeDemoButton[] = [
    HOME_DEMO_CODE_BUTTON,
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

/** Window chrome dots, left to right (mockup: red, yellow, green). */
export const HOME_DEMO_DOTS = ['danger', 'warning', 'success'] as const
