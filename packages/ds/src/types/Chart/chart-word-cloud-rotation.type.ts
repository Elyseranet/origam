import { CHART_WORD_CLOUD_ROTATION } from '../../enums/Chart/chart-word-cloud-rotation.enum'

/**
 * Word rotation mode for `<OrigamChartWordCloud>`.
 * - `'none'`        — all words horizontal (0°).
 * - `'random'`      — uniform random angle in [-30°, 30°].
 * - `'orthogonal'`  — each word either 0° or 90° (parity-based for determinism).
 */
export type TChartWordCloudRotation = `${CHART_WORD_CLOUD_ROTATION}`
