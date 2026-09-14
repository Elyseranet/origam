import type { InjectionKey, Ref } from 'vue'
import type { IGroupProvide } from '../../interfaces/Commons/group.interface'
import type { ITabPanelsProvide } from '../../interfaces/Tabs/tab-panels.interface'

/**
 * Injection key shared by `<OrigamTabs>` (provider) and `<OrigamTab>`
 * (consumer). Mirrors the `ORIGAM_BTN_TOGGLE_KEY` pattern but reserves
 * its own symbol so that an `<OrigamTabs>` rendered inside an
 * `<OrigamBtnToggle>` (e.g. composing toolbars) does not cross-register
 * its items with the outer group.
 */
export const ORIGAM_TABS_KEY: InjectionKey<IGroupProvide> = Symbol.for('origam:tabs')

/**
 * Injection key shared by `<OrigamTabPanels>` (provider) and
 * `<OrigamTabPanel>` (consumer). The panels group is kept distinct
 * from the tab list so the two can be rendered as siblings under a
 * common ancestor, with `modelValue` sync handled by the consumer.
 */
export const ORIGAM_TAB_PANELS_KEY: InjectionKey<IGroupProvide> = Symbol.for('origam:tab-panels')

/**
 * Auxiliary context exposed by `<OrigamTabPanels>` so child panels can
 * read transition + swipe settings without re-declaring the same
 * props at every level.
 */
export const ORIGAM_TAB_PANELS_CTX_KEY: InjectionKey<ITabPanelsProvide> = Symbol.for('origam:tab-panels-ctx')

/*********************************************************
 * ORIGAM_TAB_PANELS_LINK_KEY
 *
 * @description
 * #441 — `<OrigamTabs>` and `<OrigamTabPanels>` are documented as
 * SIBLINGS (OrigamTabs.md), never ancestor/descendant of one another.
 * `ORIGAM_TABS_KEY` / `ORIGAM_TAB_PANELS_KEY` above are therefore
 * unreachable via a plain cross-sibling `inject()` — Vue's `inject()`
 * only walks the ANCESTOR chain.
 * @description
 * `<OrigamTabs>` resolves its sibling `<OrigamTabPanels>` once (via
 * `useGroupSiblingLink`, walking the shared parent's render tree) and
 * re-provides the result under THIS key, down its OWN (real) ancestor
 * chain to `<OrigamTab>`. The `Ref` is `null` until the sibling has
 * mounted and been located; `<OrigamTab>` reads it lazily inside a
 * `computed` so the ARIA attribute updates reactively once resolved.
 ********************************************************/
export const ORIGAM_TAB_PANELS_LINK_KEY: InjectionKey<Ref<IGroupProvide | null>> = Symbol.for('origam:tab-panels-link')

/*********************************************************
 * ORIGAM_TABS_LINK_KEY
 *
 * @description
 * #441 — symmetric counterpart of `ORIGAM_TAB_PANELS_LINK_KEY`:
 * `<OrigamTabPanels>` resolves its sibling `<OrigamTabs>` and
 * re-provides it under this key for `<OrigamTabPanel>` to read.
 ********************************************************/
export const ORIGAM_TABS_LINK_KEY: InjectionKey<Ref<IGroupProvide | null>> = Symbol.for('origam:tabs-link')
