/*********************************************************
 *  UNSEEDED
 *
 *  @description
 *  Marks an uncontrolled `useVModel` ref that has never held a value.
 *  A symbol rather than `undefined` or `null` because both of those are
 *  legitimate model values a consumer can set deliberately, and mistaking one
 *  for "never set" would re-seed the ref from the props on every read.
 ********************************************************/
export const UNSEEDED = Symbol('origam:vmodel:unseeded')
