declare class As<T extends string> {
    private readonly as: T
}

export type TPoint = { x: number, y: number }

export type TElementPoint = TPoint & As<'element'>
export type TViewportPoint = TPoint & As<'viewport'>
export type TOffset = TPoint & As<'offset'>
