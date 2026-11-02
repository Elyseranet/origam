import type { InjectionKey } from 'vue'
import type { IMenuProvide } from '../../interfaces/Menu/menu.interface'

export const ORIGAM_MENU_KEY: InjectionKey<IMenuProvide> = Symbol.for('origam:menu')

/*********************************************************
 * Menu wrapper ARIA reset — #1247 / #1308
 *
 * @description
 * Neutralises OrigamMenu's default aria-haspopup/expanded/owns on a role-less
 * `activator="parent"` wrapper (`.origam-field`); `undefined` suppresses them.
 * The combobox ARIA lives on the field's <input>.
 ********************************************************/
export const MENU_WRAPPER_ARIA_RESET = {
	'aria-haspopup': undefined,
	'aria-expanded': undefined,
	'aria-owns': undefined
} as const
