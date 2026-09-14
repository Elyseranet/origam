import OrigamBottomNav from '../../components/BottomNav/OrigamBottomNav.vue'
import type { BOTTOM_NAV_POSITION } from '../../enums/BottomNav/bottom-nav.enum'

export type TOrigamBottomNav = InstanceType<typeof OrigamBottomNav>

/**
 * String-typed equivalent of {@link BOTTOM_NAV_POSITION}, a strict
 * `start | center | end` subset of the Commons `TAlign` scale — see
 * `enums/BottomNav/bottom-nav-position.enum.ts`.
 */
export type TBottomNavPosition = `${BOTTOM_NAV_POSITION}`
