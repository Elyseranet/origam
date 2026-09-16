import { readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { HISTOIRE_BASE_PATH } from '../e2e/_support/histoire-manifest.const'
import {
    STORIES_PACKAGE_ROOT,
    resolveHistoireBaseUrl,
    storyIdForFile
} from '../e2e/_support/histoire-manifest'

/*
 * Component-level a11y sweep.
 *
 * Drives Histoire and runs axe-core against the Default Variant of every
 * component listed in `SWEPT_STORIES`. Each component is a separate test so
 * the report tells you exactly which one introduced a regression.
 *
 * Failures block on `serious` AND `critical` impact — see `IMPACT_FAIL_LEVEL`.
 *
 * Prerequisite: Histoire running (the Playwright config spawns it).
 */

/*********************************************************
 * ⛔ CETTE SUITE N'A RIEN MESURÉ PENDANT ~3 MOIS — #573
 *
 * @description
 * Symptôme signalé : la famille Media n'était pas balayée. Cause réelle,
 * mesurée : AUCUN composant ne l'était. Chacun des 30 tests chargeait une
 * page d'erreur, n'y trouvait aucun nœud `origam-*`, et concluait « 0
 * violation » — donc PASS. Y compris `Btn` et `Alert`, « verts » depuis
 * mai 2026.
 *
 * @description
 * Deux régressions INDÉPENDANTES dans l'URL construite à la main ici,
 * chacune suffisante à elle seule :
 *
 *   1. l'identifiant de story portait encore le préfixe `stories-`, hérité
 *      de l'époque où les stories vivaient à la racine du dépôt. Le
 *      déplacement en monorepo (70f1819f6, 2026-05-27, TROIS JOURS après la
 *      création de cette suite) a déplacé la racine de dérivation vers
 *      `packages/stories`, supprimant ce segment ;
 *   2. `vite.base = '/stories/'` (bf5c1bbcb, 2026-06-22) a préfixé toutes
 *      les routes. Le commentaire de `histoire.config.js` affirme
 *      « `histoire dev` is unaffected (base only applies to the production
 *      build) » — MESURÉ FAUX : le serveur dev répond « The server is
 *      configured with a public base URL of /stories/ ».
 *
 * @description
 * Mesure des quatre combinaisons, story MediaVolumeControl, chromium :
 *
 *   sans base + préfixe « stories- »  ->  iframes=0  origam=0   (page d'erreur)
 *   base seule                        ->  iframes=0  origam=0
 *   id corrigé seul                   ->  iframes=0  origam=0
 *   base + id corrigé                 ->  iframes=1  origam=170  ✅
 *
 * @description
 * LE CORRECTIF DURABLE N'EST PAS L'URL. Une URL juste se re-cassera au
 * prochain déplacement. Deux changements structurels l'empêchent :
 *   - l'URL est dérivée par les MÊMES helpers que la suite e2e
 *     (`storyIdForFile`, `HISTOIRE_BASE_PATH`) au lieu d'être réécrite à la
 *     main ici — une seule dérivation, donc pas de dérive possible ;
 *   - `assertStoryRendered()` REFUSE de rendre un verdict sur une page où
 *     aucun nœud de composant n'a été trouvé. Un test a11y ne peut plus
 *     passer sur une page vide.
 ********************************************************/

const HISTOIRE_BASE_URL = process.env.HISTOIRE_BASE_URL ?? resolveHistoireBaseUrl()

/*********************************************************
 * IMPACT_FAIL_LEVEL — `serious` bloque depuis #777
 *
 * @description
 * Le seuil est passe de `['critical']` a `['serious', 'critical']`. La
 * raison d'etre de l'ancien reglage a disparu : il tolerait un arriere de
 * violations `serious` heritees de choix d'architecture. Cet arriere valait
 * DEUX violations, toutes deux `color-contrast`, toutes deux corrigees a la
 * source dans le meme lot (#777) — `OrigamCard` 1.37:1 -> 5.69:1,
 * `OrigamBreadcrumb` 3.69:1 -> 19.79:1, mesure axe-core dans Chromium.
 *
 * @description
 * ⛔ CE SEUIL A ETE PROUVE MORDANT, pas seulement elargi. Un seuil dont on
 * ne demontre pas qu'il echoue est indiscernable d'un seuil decoratif —
 * c'est exactement la panne que #573 / #575 ont laissee vivre trois mois.
 * Demonstration vert -> rouge -> vert executee avant merge : en
 * reintroduisant le premier plan neutre du sous-titre de Card
 * (`--origam-card-header__subtitle---color: var(--origam-color__text---secondary)`),
 * la suite passe de `36 passed` a `1 failed` en nommant OrigamCard ; le
 * correctif remis, elle repasse a `36 passed`. Rejouer exactement cette
 * sequence a toute modification de cette constante.
 *
 * @description
 * `moderate` et `minor` restent NON bloquants et continuent de s'afficher
 * en console pour triage. L'`aria-allowed-role` d'`OrigamChart`, corrige
 * dans le meme lot, etait `minor` : il n'aurait jamais bloque, et ne le
 * prouve donc pas.
 *
 * @description
 * ⚠️ La portee reste 36 stories sur 218. Ce seuil ne dit RIEN des 182
 * entrees de `UNSWEPT_STORIES` — elargir la couverture est un autre
 * chantier, et un `serious` bloquant sur 36 composants n'est pas une
 * conformite de catalogue.
 ********************************************************/
const IMPACT_FAIL_LEVEL: Array<'serious' | 'critical'> = ['serious', 'critical']

/*
 * Rules to ignore — these fire on Histoire's own DOM (sandbox
 * iframes without `title`, the responsive-preview wrapper, the
 * tabbed Variant selector). They're not actionable from inside
 * the components we test.
 *
 * `region` is excluded because component Variants are mounted in
 * an iframe and don't carry top-level `<main>` / `<nav>` landmarks
 * — that's a story-shell concern, not the component's.
 */
const IGNORED_RULES = new Set<string>([
    'frame-title',
    'region',
    'page-has-heading-one',
    'landmark-one-main',
    'document-title',
    'html-has-lang',
    'html-lang-valid',
    /*
     * Tooltip / Menu overlays are teleported via the Overlay plugin
     * to a top-level portal element. When axe scans the iframe DOM
     * the teleport target may have no `text()` visible to it even
     * though the user-facing tooltip renders correctly on hover.
     * Tracked in the a11y backlog for restructuring.
     */
    'aria-tooltip-name'
])

/*
 * Stories effectivement balayées, désignées par leur FICHIER — pas par un
 * slug recopié à la main. L'identifiant Histoire en est dérivé par
 * `storyIdForFile()`, le helper que la suite e2e utilise déjà.
 *
 * ⛔ CETTE LISTE N'A JAMAIS SUIVI LE CATALOGUE (#573) :
 *   2026-05-24 (création) ....  28 entrées
 *   2026-08-27 (dernière MAJ)   30 entrées   (+2 en trois mois)
 *   catalogue au 2026-09-16 .. 218 stories
 *
 * La famille Media n'avait rien de particulier : elle était l'une des 72
 * familles à couverture ZÉRO. Les 6 stories Media ajoutées par #573 sont en
 * fin de liste.
 */
const SWEPT_STORIES: readonly string[] = [
    'components/stories/Alert/OrigamAlert.story.vue',
    'components/stories/Avatar/OrigamAvatar.story.vue',
    'components/stories/Badge/OrigamBadge.story.vue',
    'components/stories/Breadcrumb/OrigamBreadcrumb.story.vue',
    'components/stories/Btn/OrigamBtn.story.vue',
    'components/stories/Card/OrigamCard.story.vue',
    'components/stories/Checkbox/OrigamCheckbox.story.vue',
    'components/stories/Chip/OrigamChip.story.vue',
    'components/stories/Dialog/OrigamDialog.story.vue',
    'components/stories/Drawer/OrigamDrawer.story.vue',
    'components/stories/Field/OrigamField.story.vue',
    'components/stories/Form/OrigamForm.story.vue',
    'components/stories/Input/OrigamInput.story.vue',
    'components/stories/Label/OrigamLabel.story.vue',
    'components/stories/Menu/OrigamMenu.story.vue',
    'components/stories/Pagination/OrigamPagination.story.vue',
    'components/stories/Progress/OrigamProgress.story.vue',
    'components/stories/Progress/OrigamProgressCircular.story.vue',
    'components/stories/Progress/OrigamProgressLinear.story.vue',
    'components/stories/Radio/OrigamRadio.story.vue',
    'components/stories/Select/OrigamSelect.story.vue',
    'components/stories/Sheet/OrigamSheet.story.vue',
    'components/stories/Snackbar/OrigamSnackbar.story.vue',
    'components/stories/Stepper/OrigamStepper.story.vue',
    'components/stories/Switch/OrigamSwitch.story.vue',
    'components/stories/TextField/OrigamTextField.story.vue',
    'components/stories/Tooltip/OrigamTooltip.story.vue',
    'components/stories/Tabs/OrigamTabs.story.vue',
    'components/stories/Treeview/OrigamTreeview.story.vue',
    'components/stories/Chart/OrigamChart.story.vue',
    'components/stories/Audio/OrigamAudio.story.vue',
    'components/stories/Audio/OrigamAudioWaveform.story.vue',
    'components/stories/Video/OrigamVideo.story.vue',
    'components/stories/MediaController/OrigamMediaController.story.vue',
    'components/stories/MediaScrubber/OrigamMediaScrubber.story.vue',
    'components/stories/MediaVolumeControl/OrigamMediaVolumeControl.story.vue'
]

/*
 * Stories du catalogue qui ne sont PAS balayées par axe aujourd'hui.
 *
 * ⛔ Ce n'est PAS une liste d'exemptions : aucune de ces stories n'a été
 * déclarée conforme. C'est l'aveu, chiffré, de ce que la porte
 * pré-livraison ne regarde pas. Elle doit DÉCROÎTRE.
 *
 * Le test « inventaire » plus bas la maintient honnête dans les deux sens :
 * une story retirée du disque et laissée ici fait échouer la suite, tout
 * comme une story neuve qui n'entre dans aucune des deux listes.
 */
const UNSWEPT_STORIES: readonly string[] = [
    'components/stories/App/OrigamApp.story.vue',
    'components/stories/App/OrigamAppBar.story.vue',
    'components/stories/Avatar/OrigamAvatarGroup.story.vue',
    'components/stories/Blockquote/OrigamBlockquote.story.vue',
    'components/stories/BottomNav/OrigamBottomNav.story.vue',
    'components/stories/Bracket/OrigamBracket.story.vue',
    'components/stories/Bracket/OrigamBracketCompetitor.story.vue',
    'components/stories/Bracket/OrigamBracketMatch.story.vue',
    'components/stories/Bracket/OrigamBracketRound.story.vue',
    'components/stories/Breadcrumb/OrigamBreadcrumbDivider.story.vue',
    'components/stories/Breadcrumb/OrigamBreadcrumbItem.story.vue',
    'components/stories/Btn/OrigamBtnGroup.story.vue',
    'components/stories/Btn/OrigamBtnToggle.story.vue',
    'components/stories/Calendar/OrigamCalendar.story.vue',
    'components/stories/Card/OrigamCardHeader.story.vue',
    'components/stories/Card/OrigamCardText.story.vue',
    'components/stories/Carousel/OrigamCarousel.story.vue',
    'components/stories/Carousel/OrigamCarouselItem.story.vue',
    'components/stories/Chart/OrigamChartAxis.story.vue',
    'components/stories/Chart/OrigamChartBoxPlot.story.vue',
    'components/stories/Chart/OrigamChartBullet.story.vue',
    'components/stories/Chart/OrigamChartCandlestick.story.vue',
    'components/stories/Chart/OrigamChartCartesian.story.vue',
    'components/stories/Chart/OrigamChartGauge.story.vue',
    'components/stories/Chart/OrigamChartHeatmap.story.vue',
    'components/stories/Chart/OrigamChartHoneycomb.story.vue',
    'components/stories/Chart/OrigamChartLegend.story.vue',
    'components/stories/Chart/OrigamChartMap.story.vue',
    'components/stories/Chart/OrigamChartPareto.story.vue',
    'components/stories/Chart/OrigamChartPictorial.story.vue',
    'components/stories/Chart/OrigamChartPolar.story.vue',
    'components/stories/Chart/OrigamChartPolarBar.story.vue',
    'components/stories/Chart/OrigamChartPyramid.story.vue',
    'components/stories/Chart/OrigamChartRadar.story.vue',
    'components/stories/Chart/OrigamChartRangeSelector.story.vue',
    'components/stories/Chart/OrigamChartSankey.story.vue',
    'components/stories/Chart/OrigamChartSparkline.story.vue',
    'components/stories/Chart/OrigamChartStreamgraph.story.vue',
    'components/stories/Chart/OrigamChartSunburst.story.vue',
    'components/stories/Chart/OrigamChartTooltip.story.vue',
    'components/stories/Chart/OrigamChartTreemap.story.vue',
    'components/stories/Chart/OrigamChartVariwide.story.vue',
    'components/stories/Chart/OrigamChartWordCloud.story.vue',
    'components/stories/Checkbox/OrigamCheckboxBtn.story.vue',
    'components/stories/Checkbox/OrigamCheckboxGroup.story.vue',
    'components/stories/Chip/OrigamChipGroup.story.vue',
    'components/stories/ClientOnly/OrigamClientOnly.story.vue',
    'components/stories/Clipboard/OrigamClipboard.story.vue',
    'components/stories/Code/OrigamCode.story.vue',
    'components/stories/ColorGradient/OrigamColorGradient.story.vue',
    'components/stories/ColorPicker/OrigamColorPicker.story.vue',
    'components/stories/ColorPicker/OrigamColorPickerCanvas.story.vue',
    'components/stories/ColorPicker/OrigamColorPickerEdit.story.vue',
    'components/stories/ColorPicker/OrigamColorPickerPreview.story.vue',
    'components/stories/ColorPicker/OrigamColorPickerSwatches.story.vue',
    'components/stories/ColorPickerField/OrigamColorPickerField.story.vue',
    'components/stories/CommandPalette/OrigamCommandPalette.story.vue',
    'components/stories/ConfirmWrapper/OrigamConfirmWrapper.story.vue',
    'components/stories/ContextualMenu/OrigamContextualMenu.story.vue',
    'components/stories/Counter/OrigamCounter.story.vue',
    'components/stories/DataList/OrigamDataList.story.vue',
    'components/stories/DataList/OrigamDataText.story.vue',
    'components/stories/DataList/OrigamDataTitle.story.vue',
    'components/stories/DataTable/OrigamDataTable.story.vue',
    'components/stories/DataTable/OrigamDataTableColumnCell.story.vue',
    'components/stories/DataTable/OrigamDataTableFooter.story.vue',
    'components/stories/DataTable/OrigamDataTableGroupHeaderRow.story.vue',
    'components/stories/DataTable/OrigamDataTableHeaderCell.story.vue',
    'components/stories/DataTable/OrigamDataTableHeaders.story.vue',
    'components/stories/DataTable/OrigamDataTableHeadersCell.story.vue',
    'components/stories/DataTable/OrigamDataTableHeadersCellMobile.story.vue',
    'components/stories/DataTable/OrigamDataTableRow.story.vue',
    'components/stories/DataTable/OrigamDataTableRows.story.vue',
    'components/stories/DatePicker/OrigamDatePicker.story.vue',
    'components/stories/DatePicker/OrigamDatePickerControls.story.vue',
    'components/stories/DatePicker/OrigamDatePickerHeader.story.vue',
    'components/stories/DatePicker/OrigamDatePickerMonth.story.vue',
    'components/stories/DatePicker/OrigamDatePickerMonths.story.vue',
    'components/stories/DatePicker/OrigamDatePickerYears.story.vue',
    'components/stories/DatePickerField/OrigamDatePickerField.story.vue',
    'components/stories/DefaultsProvider/OrigamDefaultsProvider.story.vue',
    'components/stories/Dialog/OrigamDialogConfirmation.story.vue',
    'components/stories/Divider/OrigamDivider.story.vue',
    'components/stories/EmptyState/OrigamEmptyState.story.vue',
    'components/stories/ExpansionPanel/OrigamExpansionPanel.story.vue',
    'components/stories/ExpansionPanel/OrigamExpansionPanelContent.story.vue',
    'components/stories/ExpansionPanel/OrigamExpansionPanelHeader.story.vue',
    'components/stories/ExpansionPanel/OrigamExpansionPanels.story.vue',
    'components/stories/FileField/OrigamFileField.story.vue',
    'components/stories/FileField/OrigamFileFieldDragNDropItem.story.vue',
    'components/stories/FileField/OrigamFileFieldListItem.story.vue',
    'components/stories/Grid/OrigamGrid.story.vue',
    'components/stories/Grid/OrigamGridItem.story.vue',
    'components/stories/Grids/OrigamCol.story.vue',
    'components/stories/Grids/OrigamContainer.story.vue',
    'components/stories/Grids/OrigamRow.story.vue',
    'components/stories/Grids/OrigamSpacer.story.vue',
    'components/stories/Icon/OrigamClassIcon.story.vue',
    'components/stories/Icon/OrigamComponentIcon.story.vue',
    'components/stories/Icon/OrigamIcon.story.vue',
    'components/stories/Icon/OrigamLigatureIcon.story.vue',
    'components/stories/Icon/OrigamSvgIcon.story.vue',
    'components/stories/Img/OrigamImg.story.vue',
    'components/stories/InfiniteScroll/OrigamInfiniteScroll.story.vue',
    'components/stories/InfiniteScroll/OrigamInfiniteScrollIntersect.story.vue',
    'components/stories/InlineEdit/OrigamInlineEdit.story.vue',
    'components/stories/ItemGroup/OrigamItem.story.vue',
    'components/stories/ItemGroup/OrigamItemGroup.story.vue',
    'components/stories/Kbd/OrigamKbd.story.vue',
    'components/stories/Layout/OrigamLayout.story.vue',
    'components/stories/Lazy/OrigamLazy.story.vue',
    'components/stories/List/OrigamList.story.vue',
    'components/stories/List/OrigamListChildren.story.vue',
    'components/stories/List/OrigamListGroup.story.vue',
    'components/stories/List/OrigamListGroupActivator.story.vue',
    'components/stories/List/OrigamListItem.story.vue',
    'components/stories/List/OrigamListSubheader.story.vue',
    'components/stories/Loader/OrigamLoader.story.vue',
    'components/stories/Main/OrigamMain.story.vue',
    'components/stories/Masonry/OrigamMasonry.story.vue',
    'components/stories/Messages/OrigamMessages.story.vue',
    'components/stories/NumberField/OrigamNumberField.story.vue',
    'components/stories/NumberFormat/OrigamNumberFormat.story.vue',
    'components/stories/OtpInputField/OrigamOtpInputField.story.vue',
    'components/stories/Overlay/OrigamOverlay.story.vue',
    'components/stories/Overlay/OrigamOverlayScrim.story.vue',
    'components/stories/Parallax/OrigamParallax.story.vue',
    'components/stories/Parallax/OrigamParallaxElement.story.vue',
    'components/stories/Parallax/OrigamParallaxLayer.story.vue',
    'components/stories/PasswordField/OrigamPasswordField.story.vue',
    'components/stories/Picker/OrigamPicker.story.vue',
    'components/stories/Picker/OrigamPickerTitle.story.vue',
    'components/stories/QrCode/OrigamQrCode.story.vue',
    'components/stories/Radio/OrigamRadioBtn.story.vue',
    'components/stories/Radio/OrigamRadioGroup.story.vue',
    'components/stories/RatingField/OrigamRatingField.story.vue',
    'components/stories/RatingField/OrigamRatingFieldItem.story.vue',
    'components/stories/Responsive/OrigamResponsive.story.vue',
    'components/stories/SelectionControl/OrigamSelectionControl.story.vue',
    'components/stories/SelectionControl/OrigamSelectionControlGroup.story.vue',
    'components/stories/Skeleton/OrigamSkeleton.story.vue',
    'components/stories/Slide/OrigamSlideGroup.story.vue',
    'components/stories/SliderField/OrigamSliderField.story.vue',
    'components/stories/SliderField/OrigamSliderField.emits.story.vue',
    'components/stories/SliderField/OrigamSliderField.slots.story.vue',
    'components/stories/SliderField/OrigamSliderFieldTrack.story.vue',
    'components/stories/Snackbar/OrigamSnackbarGroup.story.vue',
    'components/stories/Snackbar/OrigamSnackbarItem.story.vue',
    'components/stories/Stepper/OrigamStepperItem.story.vue',
    'components/stories/Switch/OrigamSwitchTrack.story.vue',
    'components/stories/SystemBar/OrigamSystemBar.story.vue',
    'components/stories/Table/OrigamTable.story.vue',
    'components/stories/TextareaField/OrigamTextareaField.story.vue',
    'components/stories/TextMask/OrigamTextMask.story.vue',
    'components/stories/ThemeProvider/OrigamThemeProvider.story.vue',
    'components/stories/Timeline/OrigamTimeline.story.vue',
    'components/stories/Timeline/OrigamTimelineItem.story.vue',
    'components/stories/Title/OrigamTitle.story.vue',
    'components/stories/Toolbar/OrigamToolbar.story.vue',
    'components/stories/Transition/OrigamExpandX.story.vue',
    'components/stories/Transition/OrigamExpandY.story.vue',
    'components/stories/Transition/OrigamFade.story.vue',
    'components/stories/Transition/OrigamReverseTranslatePicker.story.vue',
    'components/stories/Transition/OrigamScaleRotate.story.vue',
    'components/stories/Transition/OrigamSlideX.story.vue',
    'components/stories/Transition/OrigamSlideY.story.vue',
    'components/stories/Transition/OrigamSnack.story.vue',
    'components/stories/Transition/OrigamTransition.story.vue',
    'components/stories/Transition/OrigamTranslateBottom.story.vue',
    'components/stories/Transition/OrigamTranslatePicker.story.vue',
    'components/stories/Transition/OrigamTranslateScale.story.vue',
    'components/stories/Transition/OrigamWindowXReverseTranslate.story.vue',
    'components/stories/Transition/OrigamWindowXTranslate.story.vue',
    'components/stories/Transition/OrigamWindowYReverseTranslate.story.vue',
    'components/stories/Transition/OrigamWindowYTranslate.story.vue',
    'components/stories/Treeview/OrigamTreeviewNode.story.vue',
    'components/stories/Utilities/OrigamUtilities.story.vue',
    'components/stories/VirtualScroll/OrigamVirtualScroll.story.vue',
    'components/stories/VirtualScroll/OrigamVirtualScrollItem.story.vue',
    'components/stories/Watermark/OrigamWatermark.story.vue',
    'components/stories/Window/OrigamWindow.story.vue',
    'components/stories/Window/OrigamWindowItem.story.vue'
]

/** Nom lisible d'une story à partir de son fichier (`OrigamBtn.story.vue` -> `OrigamBtn`). */
function storyName (storyFile: string): string {
    return storyFile.split('/').pop()!.replace(/\.story\.vue$/, '')
}

/** Nombre de nœuds `origam-*` présents, toutes frames confondues. */
async function countComponentNodes (page: Page): Promise<number> {
    let total = 0
    for (const frame of page.frames()) {
        total += await frame.locator('[class*="origam-"]').count().catch(() => 0)
    }
    return total
}

/*********************************************************
 * assertStoryRendered — un verdict a11y exige une page rendue
 *
 * @description
 * C'est ce garde qui rend la panne de #573 impossible à répéter. Sans lui,
 * une page d'erreur produit « 0 violation » et donc PASS : le test ne peut
 * pas échouer, quoi que fasse le composant. Avec lui, une URL cassée, un
 * serveur étranger ou une story renommée échouent BRUYAMMENT, en nommant la
 * cause au lieu de la maquiller en succès.
 *
 * @description
 * CE QU'IL PROUVE, EXACTEMENT : que la story a été MONTÉE dans le sandbox —
 * le shell (`origam-app` / `origam-layout`) compte parmi les nœuds trouvés.
 * Il ne prouve PAS que le composant testé est visible : une Variant qui rend
 * un composant fermé par défaut (Alert, Badge) passe ce garde avec ~14
 * nœuds de shell. C'est le bon curseur pour la panne visée — « la page
 * n'existe pas » — et il ne faut pas lui faire dire plus.
 *
 * @description
 * L'ATTENTE EST POLLÉE, PAS FIXE. Un `waitForTimeout(2500)` fixe faisait
 * échouer Alert et Badge au premier run complet (0 nœud à 2,5 s, 14 nœuds à
 * 6 s) : le garde aurait été accusé de faux positif alors qu'il mesurait un
 * montage encore en cours. Une attente fixe transforme la charge machine en
 * verdict produit — exactement le piège que le CLAUDE.md décrit pour la
 * suite e2e.
 ********************************************************/
async function assertStoryRendered (page: Page, name: string) {
    const deadline = Date.now() + 20_000
    let componentNodes = await countComponentNodes(page)
    while (componentNodes === 0 && Date.now() < deadline) {
        await page.waitForTimeout(500)
        componentNodes = await countComponentNodes(page)
    }
    expect(
        componentNodes,
        `${name} : aucun noeud \`origam-*\` trouve sur la page de story apres 20 s. ` +
        `La story n'a PAS ete montee (URL cassee, serveur etranger, story renommee) — ` +
        `un verdict a11y sur cette page ne voudrait rien dire. Voir #573.`
    ).toBeGreaterThan(0)
    return componentNodes
}

async function runAxeOn (page: Page, storyFile: string, name: string) {
    const storyId = storyIdForFile(resolve(STORIES_PACKAGE_ROOT, storyFile))
    const url = `${HISTOIRE_BASE_URL}${HISTOIRE_BASE_PATH}story/${storyId}?variantId=${storyId}-0`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    const componentNodes = await assertStoryRendered(page, name)
    // Laisser les transitions d'entree se poser avant de photographier l'a11y.
    await page.waitForTimeout(1500)

    /*
     * Axe scans the WHOLE page — including the Histoire chrome
     * (sidebar, controls panel) — which inevitably contains its
     * own a11y noise. We filter by `target` selector below so
     * Histoire-owned violations don't pollute the component
     * verdict. The sandbox iframe is auto-traversed by axe.
     */
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze()

    /*
     * Drop Histoire-noise rules first, then keep only violations
     * whose nodes touch component-owned DOM (`origam-*` classes
     * or the `story-shell` wrapper).
     */
    const componentViolations = results.violations
        .filter((v) => !IGNORED_RULES.has(v.id))
        .filter((v) =>
            v.nodes.some((n) =>
                n.target.some((t) => {
                    const s = String(t)
                    return s.includes('origam-') || s.includes('story-shell') || s.includes('story-col')
                })
            )
        )

    const blocking = componentViolations.filter((v) => IMPACT_FAIL_LEVEL.includes(v.impact as never))
    return { blocking, all: componentViolations, componentNodes }
}

/*
 * Components with known architectural a11y issues — temporarily
 * skipped while tracked in the a11y backlog. Each entry must
 * reference the backlog item / PR that resolves it.
 *
 * - `OrigamSelect` — `OrigamInput` wrapper `<div>` inherits the
 *   fall-through `aria-haspopup` / `aria-expanded` from
 *   `OrigamSelect.comboboxAriaAttrs` alongside the native
 *   `<input>`. Needs `inheritAttrs: false` + explicit
 *   distribution on `OrigamInput`.
 */
const KNOWN_FAILURES = new Set<string>(['OrigamSelect'])

/*
 * ⛔ INVENTAIRE — l'écart de couverture doit être MESURÉ, pas supposé (#573)
 *
 * Le point 2 du ticket vaut plus que le point 1 : « une couverture
 * partielle qu'on croit complète est plus dangereuse qu'une couverture
 * absente ». Ajouter Media sans instrument laisserait les 182 autres
 * stories dans le même angle mort.
 *
 * Ce test ne balaye rien : il confronte les listes au disque. Il échoue si
 * une story n'est NI balayée NI listée comme sciemment non balayée, et si
 * une entrée de l'une ou l'autre liste ne correspond à aucun fichier.
 */
function storyFilesOnDisk (): string[] {
    const root = join(STORIES_PACKAGE_ROOT, 'components', 'stories')
    const out: string[] = []
    for (const dir of readdirSync(root)) {
        const full = join(root, dir)
        if (!statSync(full).isDirectory()) continue
        for (const file of readdirSync(full)) {
            if (!file.endsWith('.story.vue')) continue
            out.push(relative(STORIES_PACKAGE_ROOT, join(full, file)))
        }
    }
    return out.sort()
}

test('inventaire — chaque story est balayée ou explicitement reconnue non balayée', () => {
    const onDisk = storyFilesOnDisk()
    const swept = new Set(SWEPT_STORIES)
    const unswept = new Set(UNSWEPT_STORIES)

    const orphanSwept = [...swept].filter((s) => !onDisk.includes(s))
    const orphanUnswept = [...unswept].filter((s) => !onDisk.includes(s))
    const unaccounted = onDisk.filter((s) => !swept.has(s) && !unswept.has(s))

    console.log(
        `[a11y] couverture : ${swept.size}/${onDisk.length} stories balayées, ` +
        `${unswept.size} reconnues non balayées (baseline à faire décroître)`
    )

    expect(orphanSwept, `story balayée absente du disque : ${orphanSwept.join(', ')}`).toEqual([])
    expect(orphanUnswept, `story non-balayée absente du disque : ${orphanUnswept.join(', ')}`).toEqual([])
    expect(
        unaccounted,
        `story(ies) hors inventaire — ajoute-les à SWEPT_STORIES (de préférence) ` +
        `ou à UNSWEPT_STORIES : ${unaccounted.join(', ')}`
    ).toEqual([])
})

for (const storyFile of SWEPT_STORIES) {
    const name = storyName(storyFile)
    const runner = KNOWN_FAILURES.has(name) ? test.fixme : test
    runner(`a11y — ${name} Default Variant`, async ({ page }) => {
        const { blocking, all, componentNodes } = await runAxeOn(page, storyFile, name)
        if (all.length > 0) {
            console.log(`[a11y] ${name}: ${all.length} total violation(s), ${blocking.length} blocking (${componentNodes} noeuds)`)
            for (const v of all) {
                console.log(`  ${IMPACT_FAIL_LEVEL.includes(v.impact as never) ? '✗' : '·'} ${v.id} (${v.impact}): ${v.help}`)
            }
        }
        expect(
            blocking,
            `${name} : ${blocking.length} violation(s) a11y bloquante(s) ` +
            `(${IMPACT_FAIL_LEVEL.join(' / ')}) — ${blocking.map((v) => `${v.id} (${v.impact})`).join(', ')}`
        ).toHaveLength(0)
    })
}
