/*********************************************************
 * VOLONTAIREMENT VIDE — OrigamSection n'est pas exporte
 *
 * @description
 * OrigamSection reste un stub non implemente : aucune prop, aucun slot,
 * aucun style, et un template qui ne rend jamais ses enfants.
 * Ce fichier est conserve plutot que supprime parce que package.json
 * mappe le motif public "./components/*" vers l'index.js de chaque
 * dossier de composant.
 * Sans lui, le sous-chemin public `origam/components/Section` echouerait
 * sur un MODULE_NOT_FOUND opaque ; un module vide donne une erreur
 * d'import nommee, bien plus lisible.
 * A retablir en meme temps que l'implementation :
 * export { default as OrigamSection } from './OrigamSection.vue'
 ********************************************************/

export {}
