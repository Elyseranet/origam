import type { IHomeLibraryCategory } from '../interfaces/home-library.interface'
import { BUILD_STATS } from './build-stats.const'

/**
 * The 7 home categories, each mapped to a REAL category of the components
 * catalogue (raw DB values, see assets/seed/component.json). "Data" maps to
 * `Data Display`. The catalogue's other categories (`Data Visualization`,
 * `Media`, `Utilities & Providers`…) have no card in the kit's grid. "Charts" maps to
 * `Data Visualization` (#1546), the group holding the `Chart` family; its type count comes from BUILD_STATS (#1545).
 */
export const HOME_LIBRARY_CATEGORIES: IHomeLibraryCategory[] = [
    { key: 'forms', icon: 'mdi-form-textbox', labelKey: 'home.library.forms', labelFallback: 'Forms', catalogCategory: 'Form & Input' },
    { key: 'navigation', icon: 'mdi-menu', labelKey: 'home.library.navigation', labelFallback: 'Navigation', catalogCategory: 'Navigation' },
    { key: 'data', icon: 'mdi-table', labelKey: 'home.library.data', labelFallback: 'Data', catalogCategory: 'Data Display' },
    { key: 'charts', icon: 'mdi-chart-line', labelKey: 'home.library.charts', labelFallback: 'Charts', hintKey: 'home.library.charts_hint', hintFallback: `${ BUILD_STATS.chartTypes } types, from line to heatmap`, hintParams: { count: BUILD_STATS.chartTypes }, catalogCategory: 'Data Visualization' },
    { key: 'feedback', icon: 'mdi-check-circle-outline', labelKey: 'home.library.feedback', labelFallback: 'Alerts and status', catalogCategory: 'Feedback & Status' },
    { key: 'overlays', icon: 'mdi-layers-outline', labelKey: 'home.library.overlays', labelFallback: 'Dialogs and menus', catalogCategory: 'Overlay & Surface' },
    { key: 'layout', icon: 'mdi-view-dashboard-outline', labelKey: 'home.library.layout', labelFallback: 'Layout', catalogCategory: 'Layout & Structure' }
]
