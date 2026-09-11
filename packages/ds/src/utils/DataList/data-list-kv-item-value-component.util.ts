import type { IDataListKVItem, IDataListKVItemValueComponent } from '../../interfaces'

/**
 * Type-guard helper — narrows a KV row's `value` to the dynamic-
 * component descriptor shape so the template can call
 * `<component :is>` without optional chaining gymnastics.
 *
 * Co-located with the rest of the project's utils per the global
 * CLAUDE.md rule that interfaces directories must contain interface
 * declarations only — type guards are functions and belong here.
 */
export function isDataListKVItemValueComponent (
    v: IDataListKVItem['value']
): v is IDataListKVItemValueComponent {
    return typeof v === 'object' && v !== null && 'component' in (v as object)
}
