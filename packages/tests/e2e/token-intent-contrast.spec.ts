import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'

import { origamDarkTheme, origamLightTheme } from '../../ds/src/themes/origam.theme'
import { themeToCss } from '../../ds/src/utils/Commons/apply-theme.util'

/**
 * #789 — contraste WCAG AA des paires `fg`/`bg` d'intention, a pleine opacite.
 *
 * ── POURQUOI CE SPEC EXISTE ────────────────────────────────────────────────
 * Trois sondes successives ont produit trois jeux de chiffres contradictoires
 * sur les memes tokens (#789, #793, #805). Les deux causes, toutes deux
 * reproduites ici par un temoin :
 *
 *   1. UNE SONDE QUI NE COMPOSE PAS L'ALPHA. `action--ghost---bg` vaut
 *      `rgba(0, 0, 0, 0)`. Prise pour du noir opaque, la paire mesure 3.69 ;
 *      composee sur la surface de page, elle mesure 5.70 — conforme. Le 3.69
 *      du titre de #789 est un artefact, pas un defaut. Le temoin
 *      `bg-alpha-transparent` ci-dessous rend les DEUX valeurs cote a cote.
 *
 *   2. DEUX SOURCES DE TOKENS, PAS UNE. Les feuilles (`light.css` / `dark.css`,
 *      donc `main.css`, donc l'export `origam/styles`) et l'objet
 *      `origam.theme.ts` que `createOrigam()` serialise dans `<head>` ne
 *      portent PAS les memes valeurs. Un consommateur CSS-only et un
 *      consommateur `createOrigam()` ne voient pas le meme contraste. Les deux
 *      doivent tenir AA, donc les deux sont mesures ici.
 *
 * ── POURQUOI UN VRAI NAVIGATEUR ────────────────────────────────────────────
 * `getComputedStyle` sous jsdom ne resout JAMAIS `var()` : il fabrique une
 * valeur par defaut (`16px`) qui ressemble a une mesure. Sur des couleurs
 * issues de tokens, il mesure autre chose. Voir CLAUDE.md, §jsdom/#398.
 *
 * ── POURQUOI PAS HISTOIRE ──────────────────────────────────────────────────
 * Dans l'iframe `__sandbox`, `data-theme` pose apres rendu ne reprend pas, et
 * un element deja rendu par Vue ne recalcule pas. Ici les attributs sont
 * ECRITS DANS LE FICHIER, donc presents avant le parse — ce qui est aussi le
 * scenario reel d'un theme. Aucune mutation apres rendu, aucun serveur, aucune
 * dependance au port 6006.
 */

const AA_TEXT = 4.5

const HERE = dirname(fileURLToPath(import.meta.url))
const DS_ASSETS = resolve(HERE, '..', '..', 'ds', 'src', 'assets')
const MAIN_CSS = readFileSync(join(DS_ASSETS, 'css', 'main.css'), 'utf8')
const THEME_LIGHT_CSS = themeToCss(origamLightTheme)
const THEME_DARK_CSS = themeToCss(origamDarkTheme)

const OUT_DIR = mkdtempSync(join(tmpdir(), 'origam-789-'))

/** Copie exacte de `intentTokenBase` (`ds/src/utils/Commons/color.util.ts`). */
function intentTokenBase (intent: string): string {
    if (intent === 'neutral') return 'action--secondary'
    if (intent === 'success' || intent === 'warning' || intent === 'danger' || intent === 'info') {
        return `feedback--${intent}`
    }
    return `action--${intent}`
}

/** Les 8 membres de `INTENT` (`ds/src/enums/Commons/intent.enum.ts`). */
const INTENTS = ['neutral', 'primary', 'secondary', 'ghost', 'success', 'warning', 'danger', 'info'] as const

interface IProbeConfig {
    id: string
    /** Attributs poses sur `<html>` AVANT le parse. */
    attrs: string
    colorScheme: 'light' | 'dark'
    /** `true` = le consommateur appelle `createOrigam()`. */
    runtimeTheme: boolean
    label: string
}

/**
 * Les six etats DOM que le DS produit reellement.
 *
 * ⚠️ `data-theme` (marque) et `data-mode` (clair/sombre) sont DEUX AXES
 * INDEPENDANTS. `toggleMode()` n'ecrit que `data-mode`, et les feuilles ne
 * repondent qu'a `data-theme` / `prefers-color-scheme` : en `T-dark`, le
 * sombre vient donc du SEUL bloc runtime. C'est une configuration reelle, et
 * elle merite sa ligne.
 */
const CONFIGS: IProbeConfig[] = [
    { id: 'S-light', attrs: '', colorScheme: 'light', runtimeTheme: false, label: 'origam/styles seul — clair' },
    { id: 'S-dark-explicit', attrs: ' data-theme="dark"', colorScheme: 'light', runtimeTheme: false, label: 'origam/styles seul — sombre explicite' },
    { id: 'S-dark-auto', attrs: '', colorScheme: 'dark', runtimeTheme: false, label: 'origam/styles seul — sombre AUTO (#805)' },
    { id: 'T-light', attrs: ' data-mode="light"', colorScheme: 'light', runtimeTheme: true, label: 'createOrigam() — clair' },
    { id: 'T-dark', attrs: ' data-mode="dark"', colorScheme: 'light', runtimeTheme: true, label: 'createOrigam() — sombre (toggleMode)' },
    { id: 'T-dark-brand', attrs: ' data-theme="dark" data-mode="dark"', colorScheme: 'light', runtimeTheme: true, label: 'createOrigam() — sombre (marque + mode)' }
]

/**
 * Temoins a valeurs LITTERALES, calculables a la main avec la formule WCAG 2.x
 * (`L = 0.2126·f(r) + 0.7152·f(g) + 0.0722·f(b)`,
 *  `f(s) = s/12.92` si `s ≤ 0.03928` sinon `((s+0.055)/1.055)^2.4`,
 *  `ratio = (Lmax+0.05)/(Lmin+0.05)`) :
 *
 *   noir/blanc                  (1.0+0.05)/(0+0.05)            = 21.00
 *   #767676 sur blanc           f(118/255) = 0.181165          =  4.54
 *   #777777 sur blanc           f(119/255) = 0.184476          =  4.48
 *   rgba(0,0,0,.5) sur blanc    compose a 127.5, f(0.5)=0.213995 = 3.98
 *
 * #767676 et #777777 encadrent le seuil AA a 0.06 pres : une sonde qui ne
 * separe pas ces deux-la ne peut rien affirmer sur une paire limite.
 */
const CONTROLS: Record<string, { style: string, composited: number, naive?: number }> = {
    'noir-sur-blanc': { style: 'background-color:#ffffff;color:#000000', composited: 21.00 },
    '767676-sur-blanc': { style: 'background-color:#ffffff;color:#767676', composited: 4.54 },
    '777777-sur-blanc': { style: 'background-color:#ffffff;color:#777777', composited: 4.48 },
    'blanc-sur-blanc': { style: 'background-color:#ffffff;color:#ffffff', composited: 1.00 },
    // ⛔ Les deux temoins qui separent une sonde qui compose d'une qui ne
    // compose pas. Sans eux, ce spec n'aurait pas plus d'autorite que les
    // trois mesures contradictoires qu'il remplace.
    'alpha50-sur-blanc': { style: 'background-color:#ffffff;color:rgba(0,0,0,0.5)', composited: 3.98, naive: 21.00 },
    'bg-alpha-transparent': { style: 'background-color:rgba(0,0,0,0);color:#000000', composited: 21.00, naive: 1.00 }
}

function buildPage (cfg: IProbeConfig): string {
    const swatches = INTENTS.flatMap((intent) => {
        const base = intentTokenBase(intent)
        const pair = (slotBg: string, slotFg: string, label: string) => {
            const vb = `--origam-color__${base}---${slotBg}`
            const vf = `--origam-color__${base}---${slotFg}`
            return `<div class="sw" data-key="${intent}|${label}" data-bgtoken="${vb}" data-fgtoken="${vf}"`
                + ` style="background-color: var(${vb}); color: var(${vf});">Aa ${intent}</div>`
        }
        return [pair('bg', 'fg', 'bg'), pair('bgHover', 'fg', 'bgHover')]
    }).join('\n')

    const controls = Object.entries(CONTROLS)
        .map(([key, c]) => `<div class="ctl" data-key="${key}" style="${c.style}">Aa</div>`)
        .join('\n')

    return `<!doctype html>
<html lang="fr"${cfg.attrs}>
<head>
<meta charset="utf-8">
<style>${MAIN_CSS}</style>
${cfg.runtimeTheme ? `<style id="origam-theme">${THEME_LIGHT_CSS}</style><style id="origam-theme-dark">${THEME_DARK_CSS}</style>` : ''}
<style>
  html, body { margin: 0; padding: 0; }
  body { background-color: var(--origam-color__surface---default); }
  .sw, .ctl { padding: 12px 20px; font: 16px/1.4 system-ui, sans-serif; }
  /* Les temoins sont poses sur un blanc opaque explicite pour que leur pile de
     fonds se termine sur une valeur connue quel que soit le theme actif. */
  #controls { background-color: #ffffff; }
</style>
</head>
<body>
<div id="controls">${controls}</div>
<div id="swatches">${swatches}</div>
</body>
</html>`
}

interface IMeasure {
    key: string
    /** Le token n'est pas declare dans cette configuration. */
    absent?: string
    /** Ratio WCAG avec compositing de l'alpha (la seule valeur qui fait foi). */
    ratio?: number
    /** Ratio SANS compositing — volontairement faux, sert de temoin negatif. */
    naive?: number
    bg?: string
    fg?: string
}

/**
 * Mesure executee DANS la page : le navigateur a deja resolu `var()`, la sonde
 * n'a plus qu'a empiler les fonds et appliquer la formule.
 */
function measureInPage (): { controls: IMeasure[], swatches: IMeasure[], surface: string } {
    interface IRgba { r: number, g: number, b: number, a: number }

    const parse = (s: string): IRgba | null => {
        const n = (s.match(/[-\d.]+/g) ?? []).map(Number)
        if (n.length < 3) return null
        return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }
    }
    const over = (fg: IRgba, bg: IRgba): IRgba => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1
    })
    const lum = ({ r, g, b }: IRgba): number => {
        const c = (v: number): number => {
            const s = v / 255
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
    }
    const ratio = (x: IRgba, y: IRgba): number => {
        const a = lum(x)
        const b = lum(y)
        return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100
    }

    /**
     * Empile les fonds de l'element vers la racine jusqu'a la premiere couche
     * OPAQUE, puis compose du plus profond vers le plus superficiel. Retourne
     * `null` si aucune couche opaque n'existe : on refuse de fabriquer un blanc
     * implicite, qui est exactement l'erreur ayant produit le 3.69 de `ghost`.
     */
    const paintedBackground = (el: Element): IRgba | null => {
        const layers: IRgba[] = []
        let node: Element | null = el
        let opaque = false
        while (node) {
            const p = parse(getComputedStyle(node).backgroundColor)
            if (p && p.a > 0) {
                layers.push(p)
                if (p.a >= 1) { opaque = true; break }
            }
            node = node.parentElement
        }
        if (!opaque) return null
        let acc = layers.pop() as IRgba
        for (let i = layers.length - 1; i >= 0; i -= 1) acc = over(layers[i], acc)
        return acc
    }

    const rgb = (c: IRgba): string => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`

    const readAll = (sel: string): IMeasure[] => [...document.querySelectorAll(sel)].map((el) => {
        const key = (el as HTMLElement).dataset.key as string
        const cs = getComputedStyle(el)
        const rootCs = getComputedStyle(document.documentElement)

        // Un token NON DECLARE rend `var()` invalide : le navigateur retombe sur
        // la valeur initiale et la sonde mesurerait un couple qui n'existe pas.
        // Les proprietes personnalisees, elles, restent lisibles.
        const missing: string[] = []
        for (const attr of ['bgtoken', 'fgtoken'] as const) {
            const token = (el as HTMLElement).dataset[attr]
            if (!token) continue
            if (!cs.getPropertyValue(token).trim() && !rootCs.getPropertyValue(token).trim()) {
                missing.push(token.split('---')[1])
            }
        }
        if (missing.length) return { key, absent: missing.join(' + ') }

        const bg = paintedBackground(el)
        const fgRaw = parse(cs.color)
        if (!bg || !fgRaw) return { key, absent: 'couleur irresolue' }

        const fg = over(fgRaw, bg)
        const bgNaive = parse(cs.backgroundColor)

        return {
            key,
            ratio: ratio(fg, bg),
            naive: bgNaive ? ratio({ ...fgRaw, a: 1 }, { ...bgNaive, a: 1 }) : undefined,
            bg: rgb(bg),
            fg: rgb(fg)
        }
    })

    return {
        controls: readAll('.ctl'),
        swatches: readAll('.sw'),
        surface: getComputedStyle(document.body).backgroundColor
    }
}

/** Une page par configuration, mise en cache pour la duree du fichier. */
function pageFileFor (cfg: IProbeConfig): string {
    const file = join(OUT_DIR, `${cfg.id}.html`)
    writeFileSync(file, buildPage(cfg))
    return file
}

for (const cfg of CONFIGS) {
    test.describe(`#789 — ${cfg.id} (${cfg.label})`, () => {
        test(`la sonde est juste, puis chaque paire d'intention tient ${AA_TEXT}:1`, async ({ browser }) => {
            const ctx = await browser.newContext({ colorScheme: cfg.colorScheme })
            const page = await ctx.newPage()
            await page.goto(`file://${pageFileFor(cfg)}`)
            const res = await page.evaluate(measureInPage)
            await ctx.close()

            // ── 1. TEMOIN POSITIF ────────────────────────────────────────────
            // Aucun chiffre de token n'a d'autorite tant que ceci n'a pas passe.
            const byKey = new Map(res.controls.map(c => [c.key, c]))
            for (const [key, expected] of Object.entries(CONTROLS)) {
                const got = byKey.get(key)
                expect(got, `temoin ${key} manquant`).toBeTruthy()
                expect(
                    got!.ratio,
                    `temoin ${key} : la sonde rend ${got!.ratio} au lieu de ${expected.composited} — elle est disqualifiee`
                ).toBeCloseTo(expected.composited, 1)
            }

            // ── 2. TEMOIN NEGATIF : la sonde compose bien l'alpha ────────────
            // La meme mesure SANS compositing doit donner autre chose. Si les
            // deux coincident, la sonde ne compose rien et ses chiffres sur
            // `ghost` (fond `rgba(0,0,0,0)`) seraient faux de 2 points.
            for (const [key, expected] of Object.entries(CONTROLS)) {
                if (expected.naive === undefined) continue
                const got = byKey.get(key)!
                expect(
                    got.naive,
                    `temoin negatif ${key} : la mesure naive devrait valoir ${expected.naive}`
                ).toBeCloseTo(expected.naive, 1)
                expect(
                    Math.abs(got.naive! - got.ratio!),
                    `temoin negatif ${key} : naive (${got.naive}) et composee (${got.ratio}) coincident — la sonde ne compose pas l'alpha`
                ).toBeGreaterThan(0.5)
            }

            // ── 3. LES PAIRES D'INTENTION ───────────────────────────────────
            const failures: string[] = []
            for (const s of res.swatches) {
                if (s.absent) continue // token non declare dans cette configuration
                if (s.ratio! < AA_TEXT) {
                    failures.push(`${s.key} = ${s.ratio}:1 (fg ${s.fg} sur bg ${s.bg})`)
                }
            }

            expect(
                failures,
                `${cfg.id} — surface de page ${res.surface} — paires sous ${AA_TEXT}:1 :\n  ${failures.join('\n  ')}`
            ).toEqual([])
        })
    })
}

/**
 * Verdict archive sur `ghost`, la contradiction qui a coute trois campagnes de
 * mesure : le 3.69 du titre de #789 est reproductible, mais c'est la mesure
 * NAIVE. La valeur composee — la seule juste — est 5.70, conforme AA.
 */
test('#789 — `ghost` en clair : 5.70 compose, 3.69 sans compositing (l\'artefact)', async ({ browser }) => {
    const cfg = CONFIGS.find(c => c.id === 'T-light') as IProbeConfig
    const ctx = await browser.newContext({ colorScheme: cfg.colorScheme })
    const page = await ctx.newPage()
    await page.goto(`file://${pageFileFor(cfg)}`)
    const res = await page.evaluate(measureInPage)
    await ctx.close()

    const ghost = res.swatches.find(s => s.key === 'ghost|bg') as IMeasure
    expect(ghost.bg, 'le fond de `ghost` doit se composer sur la surface de page').toBe('rgb(255, 255, 255)')
    expect(ghost.ratio, '`ghost` compose est conforme AA').toBeCloseTo(5.70, 1)
    expect(ghost.naive, 'le 3.69 de #789 est la mesure naive, reproductible').toBeCloseTo(3.69, 1)
})
