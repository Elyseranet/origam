import { decodeSceneParam, decodeTextParam } from '@origam/playground/scene-param'
import { chromium } from '@playwright/test'
import { afterAll, describe, expect, it } from 'vitest'
import { PlaygroundBrowser, buildSceneUrl } from '../src/services/playground.service.ts'

const browser = await chromium.launch({ headless: true }).catch(() => null)
const shot = async (color: string) => {
    const page = await browser!.newPage({ viewport: { width: 40, height: 20 } })
    await page.setContent(`<body style="margin:0;background:${color}"></body>`)
    const png = await page.screenshot()
    await page.close()
    return png
}
const pg = new PlaygroundBrowser()
afterAll(async () => { await pg.close(); await browser?.close() })

describe('playground : URL du contrat et diff de pixels', () => {
    it('construit ?component=&props=&slot= (base64url)', () => {
        const u = new URL(buildSceneUrl({ component: 'origam-btn', props: { color: 'primary' }, slot: 'Hé' }))
        expect(u.searchParams.get('component')).toBe('origam-btn')
        expect(decodeSceneParam(u.searchParams.get('props')!)).toEqual({ color: 'primary' })
        expect(decodeTextParam(u.searchParams.get('slot')!)).toBe('Hé')
    })

    it.skipIf(!browser)('pixelDiff : 0 % si identique, 100 % si tout differe', async () => {
        const red = await shot('red')
        expect(await pg.pixelDiff(red, await shot('red'))).toBe(0)
        expect(await pg.pixelDiff(red, await shot('blue'))).toBe(100)
    })
})
