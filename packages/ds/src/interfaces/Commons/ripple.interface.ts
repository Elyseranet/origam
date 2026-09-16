import type { DirectiveBinding } from 'vue'

export interface IRippleProps {
    ripple?: boolean | { class: string }
}

export interface IRippleDirectiveBinding extends Omit<DirectiveBinding, 'modifiers' | 'value'> {
    value?: boolean | { class: string }
    modifiers: {
        center?: boolean
        circle?: boolean
        stop?: boolean
    }
}

export interface IRippleOptions {
    class?: string
    center?: boolean
    circle?: boolean
}

export interface IRippleHtmlElement extends HTMLElement {
    _ripple?: IRippleHtmlElementRipple
}

export interface IRippleHtmlElementRipple {
    enabled?: boolean
    centered?: boolean
    circle?: boolean
    class?: string
    touched?: boolean
    isTouch?: boolean
    showTimer?: number
    showTimerCommit?: null | (() => void)
    /*********************************************************
     * Timers d'animation en vol (#753)
     *
     * @description
     * Les trois `setTimeout` de `RIPPLES.show` / `RIPPLES.hide`
     * orchestrent les phases de l'animation (`--enter` → `--in` →
     * `--out`) et retirent le noeud a la fin. Rien ne les annulait au
     * `unmounted` de la directive, alors que la cadence la plus longue
     * (250 ms d'attente + 300 ms de sortie) depasse largement la duree de
     * vie d'un bouton qui disparait sur son propre clic.
     *
     * @description
     * La portee est l'ELEMENT (directive), pas un scope Vue : les handles
     * vivent donc ici, avec le reste de l'etat du ripple.
     ********************************************************/
    timers?: Set<ReturnType<typeof setTimeout>>
}

export interface IRippleElement extends Element {
    dataset?: IRippleElementDataset
}

export interface IRippleElementDataset {
    isHiding?: string
    activated?: string
}
