import type { Component } from 'vue'

/*********************************************************
 * TPropValue
 *
 * @description
 * Any value an instance can hold for a prop. Deliberately NOT `unknown`: a
 * scene is serialised (saved, shared by URL, restored), so every value it
 * carries has to survive a JSON round-trip. A `Component`, a function or a
 * `Symbol` cannot, and a scene that accepted them would fail at save time
 * rather than at edit time.
 *
 * @description
 * ⛔ `TIcon` is the reason this is not simply a scalar union. It resolves to
 * `string | Array<string | [path, opacity]> | Component` (measured, 200 props
 * across the catalogue), so the icon props genuinely accept a nested array.
 * The array/record arms exist for that shape and for the chart data props —
 * `IChartSeries[]` and friends, 22 props — not as a general escape hatch.
 ********************************************************/
export type TPropValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | TPropValue[]
    | { [key: string]: TPropValue }

/*********************************************************
 * TComponentLoader
 *
 * @description
 * How a component's implementation reaches the registry. Always a THUNK,
 * never the component itself, because the catalogue is 218 components and
 * loading all of them to show one is the thing this indirection exists to
 * prevent.
 *
 * @description
 * The natural unit is the FAMILY, not the component: the DS ships 96
 * `components/{Family}/index.ts` barrels covering 218 SFCs (measured on
 * `develop` @ bcb9dc909), and `origam`'s package `exports` maps
 * `./components/*` onto them. So `() => import('origam/components/Btn')`
 * yields `OrigamBtn`, `OrigamBtnGroup` and `OrigamBtnToggle` in one chunk —
 * 96 chunks for the catalogue instead of 218, and sub-components that must be
 * rendered inside their parent arrive together with it.
 *
 * @description
 * A loader resolves to a MODULE RECORD rather than a component so a single
 * registered loader can serve every member of its family; the registry picks
 * the named export. A host that prefers eager binding can still return an
 * already-resolved record.
 ********************************************************/
export type TComponentLoader = () => Promise<Record<string, unknown>> | Record<string, unknown>

/*********************************************************
 * TComponentResolution
 *
 * @description
 * What `getComponent` hands back. `null` is a REAL answer, not an error
 * condition: a host may register a partial catalogue (marketing embeds the
 * playground to show one component), and asking for an absent one is routine.
 * Throwing would make the common case exceptional.
 ********************************************************/
export type TComponentResolution = Component | null
