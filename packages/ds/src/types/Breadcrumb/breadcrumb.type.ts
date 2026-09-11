import { OrigamBreadcrumb } from "../../components"
import type { IBreadcrumbItemProps } from '../../interfaces'

export type TBreadcrumbItem = string | Partial<IBreadcrumbItemProps> | never

export type TOrigamBreadcrumb = InstanceType<typeof OrigamBreadcrumb>
