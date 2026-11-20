/*********************************************************
 * createOrigamForNuxt
 *
 * @description
 * The Nuxt plugins create the app through the `#origam-create` alias, which the module points at this file (default) or at `create.core.ts` (`lite: true`, #1384).
 ********************************************************/
export { createOrigam as createOrigamForNuxt } from '../origam'
