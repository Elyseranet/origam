import type { InjectionKey } from 'vue'
import type { IGroupProvide, ITabPanelsProvide } from '../../interfaces'

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
