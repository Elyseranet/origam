/*********************************************************
 * TOUCH_EDGE_ZONE_PX
 *
 * @description
 * Distance (px) from the screen edge inside which a `touchstart` arms the
 * drag gesture even though the element is closed — the "grab handle" band
 * a temporary drawer is opened from.
 ********************************************************/
export const TOUCH_EDGE_ZONE_PX = 25

/*********************************************************
 * TOUCH_DRAG_THRESHOLD_PX
 *
 * @description
 * Movement (px) on the gesture's own axis before an armed touch is
 * promoted to a real drag. The same value also disqualifies the gesture
 * when the movement happens on the OTHER axis first (the user is
 * scrolling, not dragging).
 ********************************************************/
export const TOUCH_DRAG_THRESHOLD_PX = 3

/*********************************************************
 * TOUCH_FLING_VELOCITY_X / TOUCH_FLING_VELOCITY_Y
 *
 * @description
 * Fling velocity above which `touchend` settles the element by gesture
 * DIRECTION rather than by how far it was dragged.
 *
 * @description
 * The two axes do not share a value: this is the behaviour as
 * implemented, extracted verbatim, not a re-tuning.
 *
 * @description
 * `TOUCH_FLING_VELOCITY_Y` is the vertical twin of
 * `TOUCH_FLING_VELOCITY_X`.
 ********************************************************/
export const TOUCH_FLING_VELOCITY_X = 400

export const TOUCH_FLING_VELOCITY_Y = 3

/*********************************************************
 * TOUCH_SETTLE_PROGRESS
 *
 * @description
 * Drag progress (0 → 1) above which a released gesture settles OPEN when
 * no fling was detected — i.e. dragged past halfway.
 ********************************************************/
export const TOUCH_SETTLE_PROGRESS = 0.5

/*********************************************************
 * TOUCH_OPEN_DIRECTION_BY_POSITION
 *
 * @description
 * For an element anchored on a given edge, the fling direction that
 * OPENS it. Flinging the other way closes it.
 *
 * @description
 * Values match the direction vocabulary `useVelocity().direction`
 * returns (`'left' | 'right' | 'up' | 'down'`).
 ********************************************************/
export const TOUCH_OPEN_DIRECTION_BY_POSITION = {
    left: 'right',
    right: 'left',
    top: 'down',
    bottom: 'up'
} as const
