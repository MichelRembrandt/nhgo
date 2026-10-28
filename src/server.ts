import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getBreakdownPrompt } from './nhgo.js';

const text = (text: string) => ({ content: [{ type: "text" as const, text }] });

export function buildServer() {
    const server = new McpServer({
        name: "nhgo",
        version: "1.0.0"
    });

    server.registerTool(
        "breakdown",
        { 
            title: "Provides the prompt to initiate the breakdown the meaning and origin of kanji",
            inputSchema: {
                kanji: z.string().min(1).max(5).describe("One or multiple kanji as input for the breakdown.")
            }
        },
        async ({ kanji }) => text(await getBreakdownPrompt(kanji))
    );

    return server;
}
