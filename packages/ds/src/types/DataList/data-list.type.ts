import OrigamDataList from '../../components/DataList/OrigamDataList.vue'
import { DATA_LIST_MODE } from '../../enums/DataList/data-list.enum'

export type TOrigamDataList = InstanceType<typeof OrigamDataList>

/**
 * Layout mode of `<OrigamDataList>`.
 *
 * - `"avatar"` (default, back-compat) — the historical `<dl>` layout
 *   where each item stacks a `<dt>` (title) above one or more `<dd>`
 *   rows (text). Items conform to {@link IDataItem}. The naming reflects
 *   the most common usage: a `prependAvatar` per title, with a stack of
 *   labels below — the Vuetify `v-list`-flavoured shape.
 *
 * - `"kv"` — the PDF-aligned key/value table where each row renders a
 *   key on the left (muted) and a value on the right (primary text or
 *   an inline component such as `<origam-chip>` / `<origam-avatar>`).
 *   Items conform to {@link IDataListKVItem}.
 */
export type TDataListMode = `${DATA_LIST_MODE}`
