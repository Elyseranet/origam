/** Chiffres du produit mesurés dans le dépôt par scripts/generate-build-stats.mjs. */
export interface IBuildStats {
    /** Dossiers de premier niveau de packages/ds/src/components (recoupés avec les `export *` de index.ts). */
    componentFamilies: number
    /** Membres de l'enum CHART_TYPE. */
    chartTypes: number
    /** Entrées de SWEPT_STORIES (stories balayées par axe-core). */
    a11ySweptStories: number
    /** Fichiers *.spec.ts sous packages/tests/TU (fichiers, pas nombre de tests). */
    unitTestFiles: number
    /** Fichiers *.spec.ts sous packages/tests/e2e (fichiers, pas nombre de tests). */
    e2eTestFiles: number
    /** Fichiers *.composable.ts sous packages/ds/src/composables. */
    composables: number
    /** Fichiers *.directive.ts sous packages/ds/src/directives. */
    directives: number
    /** Gardes listés dans GUARDS de packages/ds/scripts/guards/run-all.mjs (ceux que `pnpm -F origam guards` exécute). */
    architectureGuards: number
    /** Champ `license` de packages/ds/package.json. */
    license: string
    /** Champ `version` de packages/ds/package.json. */
    version: string
    /** Date de la mesure (AAAA-MM-JJ, UTC), c'est-à-dire du build qui a produit l'artefact. */
    measuredOn: string
}
