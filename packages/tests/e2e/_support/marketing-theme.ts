/**
 * Épingler la marque qu'un test marketing prétend mesurer.
 *
 * ## Pourquoi ce helper existe
 *
 * Une famille de tests de style calculé s'intitule « Sobre — … » et assert les
 * valeurs du thème `sobre`. Aucun d'eux ne demandait ce thème : ils se
 * contentaient de charger `/`, à l'époque où `sobre` était le défaut du site.
 *
 * Ce défaut a bougé deux fois — `sobre` → `origam` (2026-06-27, `df88e8d24`),
 * puis `origam` → `geek` (2026-09-17, décision mainteneur) — et ces tests sont
 * devenus rouges à chaque fois, sans qu'aucun comportement de leur objet n'ait
 * changé. Leur sujet dépendait d'un réglage sans rapport avec eux.
 *
 * `applyBrand()` rend explicite ce qu'ils mesurent. Un test nommé d'après une
 * marque demande cette marque ; il reste vert quel que soit le thème par défaut
 * du site, et il redevient un vrai filet : s'il casse, c'est que la marque a
 * changé de rendu.
 *
 * ⛔ Ne PAS s'en servir pour figer le thème par défaut du site — c'est l'objet
 * de `marketing-theme-honored.spec.ts`, et lui seul.
 */
import type { Page } from '@playwright/test'

/**
 * Applique `brand` (+ `mode`) via les cookies que le plugin SSR du DS lit, puis
 * recharge pour que le serveur rende bien cette marque.
 *
 * Le rechargement n'est pas cosmétique : les cookies sont lus par
 * `resolveServerTheme()` PENDANT le rendu serveur. Les poser sans recharger
 * laisserait la page peinte par le thème précédent.
 */
export async function applyBrand (page: Page, brand: string, mode: 'light' | 'dark' = 'light'): Promise<void> {
    const url = new URL(page.url()).origin

    await page.context().addCookies([
        { name: 'origam-theme', value: brand, url },
        { name: 'origam-mode', value: mode, url }
    ])

    await page.reload()

    await page.waitForFunction(
        (expected: string) => document.documentElement.getAttribute('data-theme') === expected,
        brand,
        { timeout: 20_000 }
    )
}
