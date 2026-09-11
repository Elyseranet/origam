import OrigamTransition from '../../components/Transition/OrigamTransition.vue'
import { TRANSITION_MODE } from '../../enums/Transition/transition.enum'

import { Component, TransitionProps } from 'vue'

export type TTransitionMode = `${TRANSITION_MODE}`

export type TTransitionProps = TransitionProps & {
    component?: Component
}

export type TOrigamTransition = InstanceType<typeof OrigamTransition>
