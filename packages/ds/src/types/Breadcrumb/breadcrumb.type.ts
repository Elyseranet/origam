import OrigamBreadcrumb from '../../components/Breadcrumb/OrigamBreadcrumb.vue'
import type { IBreadcrumbItemProps } from '../../interfaces/Breadcrumb/breadcrumb-item.interface'

export type TBreadcrumbItem = string | Partial<IBreadcrumbItemProps> | never

export type TOrigamBreadcrumb = InstanceType<typeof OrigamBreadcrumb>
