import type { DeepReadonly, Ref } from 'vue'

export interface IResizeState<T extends Element = HTMLElement> {
    resizeRef: Ref<T | null | undefined>
    contentRect: DeepReadonly<Ref<DOMRectReadOnly | undefined>>
}
