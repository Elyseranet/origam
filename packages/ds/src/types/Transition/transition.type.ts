import { OrigamTransition } from "../../components"
import { TRANSITION_MODE } from '../../enums'

import { Component, TransitionProps } from 'vue'

export type TTransitionMode = `${TRANSITION_MODE}`

export type TTransitionProps = TransitionProps & {
    component?: Component
}

export type TOrigamTransition = InstanceType<typeof OrigamTransition>
