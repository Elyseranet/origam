import type { InjectionKey } from 'vue'
import type { IGroupProvide } from '../../interfaces'

/**
 * Injection key shared by `<OrigamItemGroup>` (provider) and
 * `<OrigamItem>` (consumer). Mirrors Vuetify's `v-item-group` /
 * `v-item` pair: a generic, renderless selection primitive that lets
 * the consumer paint each option however they like (a Card, a Tile,
 * a custom UI) while the group handles single / multiple / mandatory
 * selection state.
 */
export const ORIGAM_ITEM_GROUP_KEY: InjectionKey<IGroupProvide> = Symbol.for('origam:item-group')
