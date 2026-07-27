import type { CSSProperties } from 'vue'
import type { IWireframeLayout } from '~/interfaces/wireframes.interface'

export const WIREFRAME_HERO_BADGE_VARS: CSSProperties = {
    '--origam-chip---background-color': 'transparent'
} as CSSProperties

export const WIREFRAMES: IWireframeLayout[] = [
    {
        id: 'dashboard',
        icon: 'mdi-view-dashboard-outline',
        titleKey: 'wireframe.layouts.dashboard.title',
        titleFallback: 'Dashboard',
        descriptionKey: 'wireframe.layouts.dashboard.description',
        descriptionFallback: 'App shell with sidebar navigation, top bar and a grid of stat cards.',
        components: ['OrigamApp', 'OrigamDrawer', 'OrigamToolbar', 'OrigamGrid', 'OrigamCard']
    },
    {
        id: 'settings',
        icon: 'mdi-cog-outline',
        titleKey: 'wireframe.layouts.settings.title',
        titleFallback: 'Settings',
        descriptionKey: 'wireframe.layouts.settings.description',
        descriptionFallback: 'Sectioned settings page with sidebar nav and inline form fields.',
        components: ['OrigamList', 'OrigamListItem', 'OrigamDivider', 'OrigamTextField', 'OrigamSwitch', 'OrigamBtn']
    },
    {
        id: 'auth',
        icon: 'mdi-lock-outline',
        titleKey: 'wireframe.layouts.auth.title',
        titleFallback: 'Auth / Login',
        descriptionKey: 'wireframe.layouts.auth.description',
        descriptionFallback: 'Centered auth card with a logo, form fields and submit action.',
        components: ['OrigamCard', 'OrigamTextField', 'OrigamPasswordField', 'OrigamBtn', 'OrigamDivider']
    },
    {
        id: 'list-detail',
        icon: 'mdi-view-split-vertical',
        titleKey: 'wireframe.layouts.list_detail.title',
        titleFallback: 'List – Detail',
        descriptionKey: 'wireframe.layouts.list_detail.description',
        descriptionFallback: 'Master list on the left, detail pane on the right — classic split view.',
        components: ['OrigamList', 'OrigamListItem', 'OrigamDivider', 'OrigamCard', 'OrigamChip', 'OrigamBtn']
    },
    {
        id: 'pricing',
        icon: 'mdi-currency-usd',
        titleKey: 'wireframe.layouts.pricing.title',
        titleFallback: 'Pricing',
        descriptionKey: 'wireframe.layouts.pricing.description',
        descriptionFallback: 'Grid of pricing cards with feature lists and call-to-action buttons.',
        components: ['OrigamGrid', 'OrigamCard', 'OrigamChip', 'OrigamDivider', 'OrigamBtn']
    },
    {
        id: 'landing',
        icon: 'mdi-rocket-launch-outline',
        titleKey: 'wireframe.layouts.landing.title',
        titleFallback: 'Landing Page',
        descriptionKey: 'wireframe.layouts.landing.description',
        descriptionFallback: 'Marketing hero, feature grid and a final call-to-action section.',
        components: ['OrigamContainer', 'OrigamGrid', 'OrigamCard', 'OrigamAvatar', 'OrigamBtn', 'OrigamChip']
    }
]
