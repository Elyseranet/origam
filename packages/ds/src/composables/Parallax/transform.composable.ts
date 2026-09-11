import {
    PARALLAX_ELEMENT_DEFAULT_STRENGTH,
    PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR,
    PARALLAX_ELEMENT_MOVEMENT_BASE,
    PARALLAX_ELEMENT_MOVEMENT_DIVISOR
} from '../../consts/Parallax/parallax-element.const'

import { AXIS, PARALLAX_ELEMENT_TYPE } from '../../enums'

import type { IParallaxElementProps } from '../../interfaces/Parallax/parallax-element.interface'

import { computed } from 'vue'

/*********************************************************
 * useParallaxTransform
 ********************************************************/
/*********************************************************
 * useParallaxTransform
 *
 * @description
 * Traduit une position de defilement en declaration `transform` pour un
 * `<origam-parallax-element>`, selon son `type` : `translate`, `rotate`,
 * `scale`, `depth` et `depth-inv`.
 *
 * @description
 * ⛔ Les deux types de profondeur forcent `Math.abs(strength)`. Une force
 * negative y serait contradictoire — c'est `depth-inv` qui porte l'inversion,
 * pas le signe — et laisserait deux facons d'exprimer la meme chose, dont une
 * qui annulerait l'autre.
 ********************************************************/
export function useParallaxTransform (props: IParallaxElementProps) {
    const strength = computed(() => {
        const str = props.strength ?? PARALLAX_ELEMENT_DEFAULT_STRENGTH

        return props.type === PARALLAX_ELEMENT_TYPE.DEPTH || props.type === PARALLAX_ELEMENT_TYPE.DEPTH_INV
            ? Math.abs(str)
            : str
    })

    const transformStyles = (x: number, y: number) => {
        let transform

        switch (props.type) {
            case PARALLAX_ELEMENT_TYPE.TRANSLATE:
                transform = translateMovement(x, y)
                break
            case PARALLAX_ELEMENT_TYPE.ROTATE:
                transform = rotateMovement(x, y)
                break
            case PARALLAX_ELEMENT_TYPE.DEPTH:
                transform = depthMovement(x, y)
                break
            case PARALLAX_ELEMENT_TYPE.DEPTH_INV:
                transform = depthMovement(-x, -y)
                break
            case PARALLAX_ELEMENT_TYPE.SCALE:
            case PARALLAX_ELEMENT_TYPE.SCALE_X:
            case PARALLAX_ELEMENT_TYPE.SCALE_Y:
                transform = scaleMovement(x, y)
                break
        }

        return transform
    }

    /*********************************************************
     * toMovement
     *
     * @description
     * Convert a raw pointer offset into a movement amount (px, deg, or a
     * scale ratio depending on the caller) — the single formula every
     * movement helper below shares.
     ********************************************************/
    const toMovement = (offset: number) => {
        return (strength.value * offset) / PARALLAX_ELEMENT_MOVEMENT_DIVISOR + PARALLAX_ELEMENT_MOVEMENT_BASE
    }

    const translateMovement = (x: number, y: number) => {
        const movementX = toMovement(x)
        const movementY = toMovement(y)

        return `translate3d(${-movementX}px, ${-movementY}px, 0)`
    }
    const rotateMovement = (x: number, y: number) => {
        let movement = 0

        if (!props.axis) {
            movement = toMovement(x + y)
        } else if (props.axis === AXIS.X) {
            movement = toMovement(x)
        } else if (props.axis === AXIS.Y) {
            movement = toMovement(y)
        }

        return `rotate3d(0,0,1,${movement}deg)`
    }
    const depthMovement = (x: number, y: number) => {
        const depth = strength.value * PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR

        return `rotateX(${-y}deg) rotateY(${x}deg) translate3d(0,0,${depth}px)`
    }
    const scaleMovement = (x: number, y: number) => {
        const movement = toMovement(Math.abs(x) + Math.abs(y))

        return `scale3d(${props.type === PARALLAX_ELEMENT_TYPE.SCALE_X || props.type === PARALLAX_ELEMENT_TYPE.SCALE ? movement : 1},
            ${props.type === PARALLAX_ELEMENT_TYPE.SCALE_Y || props.type === PARALLAX_ELEMENT_TYPE.SCALE ? movement : 1},
            1)`
    }

    /*********************************************************
     * customMovement — la trappe `type="custom"` (#432)
     *
     * @description
     * Rend le montant de mouvement PAR AXE, apres application de
     * `strength` — la meme valeur exactement que `translateMovement`
     * injecte dans son `translate3d`. `<OrigamParallaxElement>` la publie
     * dans deux proprietes personnalisees (voir `PARALLAX_ELEMENT_VAR_X` /
     * `_Y`) pour que le consommateur compose SA transform en CSS.
     * @description
     * ⛔ On rend `toMovement(x)`, jamais `x` brut. Publier la valeur brute
     * ferait sauter `strength` — et avec lui `axis`, `min`, `max`, `cycle`
     * qui l'alimentent en amont : toutes les props du composant seraient
     * mortes des qu'on choisit `custom`, ce qui reproduirait le defaut
     * qu'on repare sous une autre forme.
     * @description
     * Aucune unite n'est ajoutee : le meme nombre vaut des px, des degres
     * ou un ratio selon la transform que le consommateur ecrit. C'est lui
     * qui multiplie.
     ********************************************************/
    const customMovement = (x: number, y: number) => {
        return {
            x: toMovement(x),
            y: toMovement(y)
        }
    }

    return {transformStyles, strength, customMovement}
}
