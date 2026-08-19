import type { Ref } from 'vue'
import { shallowRef, watch } from 'vue'
import type { TOrigamList } from '../../types/List/list.type'
import type { TOrigamTextField } from '../../types/TextField/text-field.type'

/*********************************************************
 * useScrolling
 *
 * @description
 * Keyboard-driven list scrolling (PageUp/PageDown/Home/End) with a
 * frame-accurate "is currently scrolling" flag used to defer focus
 * moves until the scroll settles.
 * Independent from `useScroll` / `useScrollStrategies` — no shared
 * state or call dependency.
 ********************************************************/
export function useScrolling (listRef: Ref<TOrigamList | undefined>, textFieldRef: Ref<TOrigamTextField | undefined>) {
    const isScrolling = shallowRef(false)
    let scrollTimeout: number

    const onListScroll = () => {
        cancelAnimationFrame(scrollTimeout)
        isScrolling.value = true
        scrollTimeout = requestAnimationFrame(() => {
            scrollTimeout = requestAnimationFrame(() => {
                isScrolling.value = false
            })
        })
    }
    const finishScrolling = async () => {
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise<void>(resolve => {
            if (isScrolling.value) {
                const stop = watch(isScrolling, () => {
                    stop()
                    resolve()
                })
            } else resolve()
        })
    }
    const onListKeydown = async (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            textFieldRef.value?.focus()
        }

        if (!['PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return
        const el: HTMLElement = listRef.value?.$el
        if (!el) return

        if (e.key === 'Home' || e.key === 'End') {
            el.scrollTo({
                top: e.key === 'Home' ? 0 : el.scrollHeight,
                behavior: 'smooth'
            })
        }

        await finishScrolling()

        const children = el.querySelectorAll(':scope > :not(.origam-virtual-scroll__spacer)')

        if (e.key === 'PageDown' || e.key === 'Home') {
            const top = el.getBoundingClientRect().top
            for (const child of children) {
                if (child.getBoundingClientRect().top >= top) {
                    (child as HTMLElement).focus()
                    break
                }
            }
        } else {
            const bottom = el.getBoundingClientRect().bottom
            for (const child of [...children].reverse()) {
                if (child.getBoundingClientRect().bottom <= bottom) {
                    (child as HTMLElement).focus()
                    break
                }
            }
        }
    }

    return {onListScroll, onListKeydown}
}
