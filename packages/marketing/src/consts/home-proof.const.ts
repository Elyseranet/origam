import type { IHomeProofItem } from '~/interfaces/home-proof.interface'
import { BUILD_STATS } from '~/consts/build-stats.const'

/**
 * Section « preuves » de la home (#1545). Chaque valeur vient de BUILD_STATS,
 * mesuré dans le dépôt au build (le build échoue si une mesure échoue) ; la
 * définition affichée reprend celle du script de mesure. Aucun compteur
 * d'adoption ici : ils restent sous les seuils de #1543 (adoption.const.ts).
 */
export const HOME_PROOF_ITEMS: IHomeProofItem[] = [
    { key: 'families', value: String(BUILD_STATS.componentFamilies), labelKey: 'home.proof.families_label', labelFallback: 'component families', definitionKey: 'home.proof.families_definition', definitionFallback: 'A top-level folder of packages/ds/src/components.' },
    { key: 'charts', value: String(BUILD_STATS.chartTypes), labelKey: 'home.proof.charts_label', labelFallback: 'chart types', definitionKey: 'home.proof.charts_definition', definitionFallback: 'A value of the CHART_TYPE enum.' },
    { key: 'a11y', value: String(BUILD_STATS.a11ySweptStories), labelKey: 'home.proof.a11y_label', labelFallback: 'stories tested with axe-core', definitionKey: 'home.proof.a11y_definition', definitionFallback: 'An entry of SWEPT_STORIES, swept on its default variant; only serious and critical violations block.' },
    { key: 'unit', value: String(BUILD_STATS.unitTestFiles), labelKey: 'home.proof.unit_label', labelFallback: 'unit test files', definitionKey: 'home.proof.unit_definition', definitionFallback: 'A *.spec.ts file under packages/tests/TU: files, not a number of tests.' },
    { key: 'e2e', value: String(BUILD_STATS.e2eTestFiles), labelKey: 'home.proof.e2e_label', labelFallback: 'e2e test files', definitionKey: 'home.proof.e2e_definition', definitionFallback: 'A *.spec.ts file under packages/tests/e2e: files, not a number of tests.' },
    { key: 'license', value: BUILD_STATS.license, labelKey: 'home.proof.license_label', labelFallback: 'open source licence', definitionKey: 'home.proof.license_definition', definitionFallback: 'The license field of the published package.' }
]
