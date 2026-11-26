import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/**
 * HomePlayground — static showcase. The buttons below drive BOTH the rendered
 * OrigamBtn and the displayed code (utils/home-demo.util.ts), so the preview
 * is exactly what the code shows. The component name and prop names are code,
 * so they are intentionally not translated; only the labels are.
 */
export const HOME_DEMO_BUTTONS: IHomeDemoButton[] = [
    {
        key: 'primary',
        labelKey: 'home.playground.btn_primary',
        labelFallback: 'Primary',
        props: { color: 'primary' }
    },
    {
        key: 'secondary',
        labelKey: 'home.playground.btn_secondary',
        labelFallback: 'Secondary',
        props: { variant: 'outlined', color: 'primary' }
    },
    {
        key: 'ghost',
        labelKey: 'home.playground.btn_ghost',
        labelFallback: 'Ghost',
        props: { variant: 'ghost' }
    }
]
