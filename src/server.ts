import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchJisho } from './modules/jisho.js';
import { fetchKanjiByJlpt, getKanjiInfo } from './modules/kanjiapi.js';
import { addCard } from './modules/anki.js';

const text = (text: string) => ({ content: [{ type: "text" as const, text }] });

export function buildServer() {
    const server = new McpServer({
        name: "nhgo",
        version: "1.0.0"
    });

    server.registerTool(
        'lookup',
        {
            title: 'Lookup word on Jisho',
            description: 'Lookup a japanese word on the online dictionary Jisho',
            inputSchema: {
                word: z.string().min(1).max(10)
                    .describe('Japanese word to look up, written in kanji, hiragana or katakana')
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async ({ word }) => text(JSON.stringify(await fetchJisho(word)))
    );

    server.registerTool(
        'kanji_by_jlpt',
        {
            title: 'List kanji by JLPT level',
            description: 'List all kanji for a JLPT level (N5 to N1) using kanjiapi.dev',
            inputSchema: {
                level: z.number().int().min(1).max(5)
                    .describe('JLPT level as an integer from 1 (N1, hardest) to 5 (N5, easiest)')
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async ({ level }) => text((await fetchKanjiByJlpt(level)).join(''))
    );

    server.registerTool(
        'kanji_info',
        {
            title: 'Get kanji info',
            description: 'Get readings, JLPT level, grade and meanings for every kanji in a text using kanjiapi.dev',
            inputSchema: {
                text: z.string().min(1).max(50)
                    .describe('Japanese text; info is returned for each distinct kanji it contains')
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async ({ text: input }) => text((await getKanjiInfo(input)).join('\n'))
    );

    server.registerTool(
        'add_to_anki',
        {
            title: 'Add card to anki',
            description: 'Add a flash card with a japanese phrase or word to the specified anki deck',
            inputSchema: {
                deck: z.string().min(1).max(20)
                    .describe('Title of the deck the card will be added to'),
                japanese: z.string().min(1).max(20)
                    .describe('Japanese word or phrase that will be studied - in kanji, hiragana or katakana'),
                emoji: z.string().min(1).max(5)
                    .describe('(Combination of) emoji(s) representing the Japanese word'),
                reading: z.string().min(1).max(20).describe(
                    'Reading of the word or phrase in hiragana. ' +
                    'Alternatively this can contain the kanji writing of a word ' +
                    'that is usually written in hiragana'
                ),
                translation: z.string().min(1).max(120).describe(
                    'English translation of the word or phrase. ' +
                    'Limit to the most straight forward translation(s) ' +
                    'to ensure simplicity while studying the word'
                )
            }
        },
        async (card) => text(`Added card (note id ${await addCard(card)})`)
    );

    return server;
}
