// Volontairement vide. `OrigamSection` n'est pas exporte tant qu'il reste un
// stub non implemente (aucune prop, aucun slot, aucun style, et ses enfants ne
// sont jamais rendus).
//
// Ce fichier est conserve plutot que supprime parce que `package.json` declare
// `"./components/*": "./dist/src/components/*/index.js"` : sans lui, le
// sous-chemin public `origam/components/Section` echouerait sur un
// MODULE_NOT_FOUND opaque. Un module vide donne une erreur d'import nommee,
// bien plus lisible.
//
// A retablir en meme temps que l'implementation :
//   export { default as OrigamSection } from './OrigamSection.vue'

export {}
