import type { IHomeLibraryCategory } from '../interfaces/home-library.interface'

/**
 * The 6 home categories, each mapped to a REAL category of the components
 * catalogue (raw DB values, see assets/seed/component.json). "Data" maps to
 * `Data Display`; `Data Visualization` (1 component) is not shown on the home.
 */
export const HOME_LIBRARY_CATEGORIES: IHomeLibraryCategory[] = [
    { key: 'forms', icon: 'mdi-form-textbox', labelKey: 'home.library.forms', labelFallback: 'Forms', catalogCategory: 'Form & Input' },
    { key: 'navigation', icon: 'mdi-menu', labelKey: 'home.library.navigation', labelFallback: 'Navigation', catalogCategory: 'Navigation' },
    { key: 'data', icon: 'mdi-table', labelKey: 'home.library.data', labelFallback: 'Data', catalogCategory: 'Data Display' },
    { key: 'feedback', icon: 'mdi-check-circle-outline', labelKey: 'home.library.feedback', labelFallback: 'Feedback', catalogCategory: 'Feedback & Status' },
    { key: 'overlays', icon: 'mdi-layers-outline', labelKey: 'home.library.overlays', labelFallback: 'Overlays', catalogCategory: 'Overlay & Surface' },
    { key: 'layout', icon: 'mdi-view-dashboard-outline', labelKey: 'home.library.layout', labelFallback: 'Layout', catalogCategory: 'Layout & Structure' }
]
