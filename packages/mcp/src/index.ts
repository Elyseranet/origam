import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerApiTools } from './services/api-tools.service.ts'
import { registerPlaygroundTools } from './services/playground-tools.service.ts'
import { PlaygroundBrowser } from './services/playground.service.ts'
import { OrigamApiClient } from './utils/http-client.util.ts'
import { readAdminPassword } from './utils/password.util.ts'

/*********************************************************
 * Serveur MCP origam (stdio). Aucun log sur stdout (reserve au protocole).
 ********************************************************/

const server = new McpServer({ name: 'origam', version: '0.1.0' })
const playground = new PlaygroundBrowser()

registerApiTools(server, new OrigamApiClient({ getPassword: readAdminPassword }))
registerPlaygroundTools(server, playground)

let closing = false
async function shutdown (): Promise<void> {
    if (closing) return
    closing = true
    await playground.close()
    process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.stdin.on('close', shutdown)

await server.connect(new StdioServerTransport())
