import { MDI_ICONS } from 'origam/enums'

/**
 * Reference entity "kinds" shared by the admin nav (layouts/admin.vue) and
 * the admin dashboard grid (pages/admin/dashboard.vue) — one source of
 * truth for the 8 families exposed by /api/reference/**.
 */
export const ADMIN_NAV_KINDS = [
    { key: 'component', icon: MDI_ICONS.LAYERS, labelKey: 'admin.nav.kind.component', labelFallback: 'Components' },
    { key: 'composable', icon: MDI_ICONS.COG, labelKey: 'admin.nav.kind.composable', labelFallback: 'Composables' },
    { key: 'const', icon: MDI_ICONS.TABLE, labelKey: 'admin.nav.kind.const', labelFallback: 'Consts' },
    { key: 'directive', icon: MDI_ICONS.PENCIL, labelKey: 'admin.nav.kind.directive', labelFallback: 'Directives' },
    { key: 'enum', icon: MDI_ICONS.FORMAT_LIST_BULLETED, labelKey: 'admin.nav.kind.enum', labelFallback: 'Enums' },
    { key: 'interface', icon: MDI_ICONS.CODE_TAGS, labelKey: 'admin.nav.kind.interface', labelFallback: 'Interfaces' },
    { key: 'type', icon: MDI_ICONS.TEXT, labelKey: 'admin.nav.kind.type', labelFallback: 'Types' },
    { key: 'util', icon: MDI_ICONS.WRENCH, labelKey: 'admin.nav.kind.util', labelFallback: 'Utils' },
] as const
