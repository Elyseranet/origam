// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'

import { useChartSize } from '../../../../ds/src/composables/Chart/chart-size.composable'

describe('useChartSize (#1317)', () => {
	it('rend le fallback cote serveur, sans warn', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const Cmp = defineComponent({
			setup () {
				const { resizeRef, width, height } = useChartSize({ width: 600, height: 360 })
				return () => h('svg', { ref: resizeRef, viewBox: `0 0 ${ width.value } ${ height.value }` })
			}
		})
		const html = await renderToString(createSSRApp(Cmp))
		expect(html).toContain('viewBox="0 0 600 360"')
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('mode carre : le repli est un carre de cote min(largeur, hauteur) (#1324)', async () => {
		const Cmp = defineComponent({
			setup () {
				const { resizeRef, width, height } = useChartSize({ width: 600, height: 360 }, { square: true })
				return () => h('svg', { ref: resizeRef, viewBox: `0 0 ${ width.value } ${ height.value }` })
			}
		})
		const html = await renderToString(createSSRApp(Cmp))
		expect(html).toContain('viewBox="0 0 360 360"')
	})
})
