import { createHash } from 'node:crypto'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { IPlaygroundRenderInput, IPlaygroundSnapshot } from '../interfaces/mcp.interface.ts'
import type { PlaygroundBrowser } from './playground.service.ts'
import { toError } from './api-tools.service.ts'

/*********************************************************
 * Outils MCP playground : render / diff / sweep.
 ********************************************************/

const common = {
    viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
    theme: z.string().optional().describe('Valeur posee sur <html data-theme>.'),
    mode: z.enum(['light', 'dark']).optional().describe('Valeur posee sur <html data-mode>.'),
    styleProps: z.array(z.string()).optional().describe('Longhands CSS a relever (defaut : couleurs, fond, bordure, rayon, ombre, dimensions, padding).')
}
const component = z.string().describe('Nom du composant, ex. origam-btn.')
const props = z.record(z.string(), z.unknown())

const image = (png: Buffer) => ({ type: 'image' as const, data: png.toString('base64'), mimeType: 'image/png' })
const summary = (s: IPlaygroundSnapshot) => ({ error: s.error, classes: s.classes, styles: s.styles, console: s.console })
const json = (v: unknown) => ({ type: 'text' as const, text: JSON.stringify(v, null, 2) })
const signature = (s: IPlaygroundSnapshot) => createHash('sha1').update(s.png).update(JSON.stringify([s.styles, s.classes, s.error])).digest('hex')

export function registerPlaygroundTools (server: McpServer, pg: PlaygroundBrowser): void {
    server.registerTool(
        'playground_render',
        {
            description: 'Rend un composant dans le playground (Chromium headless) : capture PNG, styles calcules, classes, erreurs console, ou l\'erreur data-playground-error.',
            inputSchema: { component, props: props.optional(), slot: z.string().optional().describe('Texte du slot par defaut.'), ...common }
        },
        async (a: IPlaygroundRenderInput) => {
            try {
                const snap = await pg.render(a)
                return { isError: snap.error !== null, content: [json(summary(snap)), image(snap.png)] }
            } catch (err) {
                return toError(err)
            }
        }
    )

    server.registerTool(
        'playground_diff',
        {
            description: 'Rend un composant avec deux jeux de props et renvoie les differences (styles, classes, DOM, % de pixels). identical:true = la prop est probablement morte.',
            inputSchema: { component, propsA: props.optional(), propsB: props.optional(), slot: z.string().optional(), ...common }
        },
        async (a: { propsA?: Record<string, unknown>, propsB?: Record<string, unknown> } & Omit<IPlaygroundRenderInput, 'props'>) => {
            try {
                const { propsA, propsB, ...rest } = a
                const r = await pg.diff({ ...rest, props: propsA }, { ...rest, props: propsB })
                return {
                    isError: !!(r.a.error || r.b.error),
                    content: [json({ ...r.diff, errorA: r.a.error, errorB: r.b.error, consoleA: r.a.console, consoleB: r.b.console }), image(r.a.png), image(r.b.png)]
                }
            } catch (err) {
                return toError(err)
            }
        }
    )

    server.registerTool(
        'playground_sweep',
        {
            description: 'Balaye une prop sur une liste de valeurs : une ligne par valeur, signale celles qui ne changent rien (identiques a la valeur precedente / au rendu sans la prop).',
            inputSchema: { component, prop: z.string(), values: z.array(z.unknown()).min(1), baseProps: props.optional(), slot: z.string().optional(), ...common }
        },
        async (a: { prop: string, values: unknown[], baseProps?: Record<string, unknown> } & Omit<IPlaygroundRenderInput, 'props'>) => {
            try {
                const { prop, values, baseProps = {}, ...rest } = a
                const defaults = await pg.render({ ...rest, props: baseProps })
                const defaultSig = signature(defaults)
                const rows: Array<Record<string, unknown>> = []
                let prev = defaultSig
                for (const value of values) {
                    const snap = await pg.render({ ...rest, props: { ...baseProps, [prop]: value } })
                    const sig = signature(snap)
                    rows.push({
                        value,
                        error: snap.error,
                        sameAsPrevious: sig === prev,
                        sameAsWithoutProp: sig === defaultSig,
                        classes: snap.classes,
                        styles: snap.styles
                    })
                    prev = sig
                }
                const noEffect = rows.filter(r => r.sameAsWithoutProp && !r.error).map(r => r.value)
                return { content: [json({ prop, valuesWithoutVisibleEffect: noEffect, rows })] }
            } catch (err) {
                return toError(err)
            }
        }
    )
}
