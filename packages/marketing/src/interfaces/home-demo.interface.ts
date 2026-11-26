/** One real OrigamBtn shown by the home demo; `props` feeds both the render and the displayed code. */
export interface IHomeDemoButton {
    key: string
    labelKey: string
    labelFallback: string
    props: Record<string, string | boolean>
}
