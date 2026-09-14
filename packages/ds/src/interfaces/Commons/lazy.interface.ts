/*********************************************************
 * ILazyProps
 *
 * @description
 * Genuinely transverse — `extends ILazyProps` by Tabs (TabPanel),
 * ExpansionPanel (x3: Panel, Panels, Content), Tooltip, Img, Window
 * (WindowItem), Select, and Overlay. None of that is the Lazy family.
 *
 * @description
 * `ILazyComponentProps` / `ILazyEmits` / `ILazySlots` (the actual
 * `<OrigamLazy>` component surface, single consumer) moved out to
 * `interfaces/Lazy/lazy.interface.ts` under issue #364 — they were the
 * symbols in this file that were NOT transverse.
 ********************************************************/
export interface ILazyProps {
    eager?: boolean
}
