import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getBreakdownPrompt } from './nhgo.js';
import { fetchJisho } from './jisho.js';
import { addCard } from './anki.js';

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

    server.registerTool(
        'lookup',
        {
            title: 'Lookup word on Jisho',
            description: 'Lookup a japanese word on the online dictionary Jisho',
            inputSchema: {
                word: z.string().min(1).max(10).describe('Japanese word to look up, written in kanji, hiragana or katakana')
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async ({ word }) => text(JSON.stringify(await fetchJisho(word)))
    );

    server.registerTool(
        'add_to_anki',
        {
            title: 'Add card to anki',
            description: 'Add a flash card with a japanese phrase or word to the specified anki deck',
            inputSchema: {
                deck: z.string().min(1).max(20).describe('Title of the deck the card will be added to'),
                japanese: z.string().min(1).max(20).describe('Japanese word or phrase that will be studied - in kanji, hiragana or katakana'),
                emoji: z.string().min(1).max(5).describe('(Combination of) emoji(s) representing the Japanese word'),
                reading: z.string().min(1).max(20).describe('Reading of the word or phrase in hiragana. Alternatively this can contain the kanji writing of a word that is usually written in hiragana'),
                translation: z.string().min(1).max(120).describe('English translation of the word or phrase. Limit to the most straight forward translation(s) to ensure simplicity while studying the word')
            }
        },
        async (card) => text(`Added card (note id ${await addCard(card)})`)
    );

    return server;
}
