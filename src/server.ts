import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getBreakdownPrompt } from './modules/breakdown.js';
import { fetchJisho } from './modules/jisho.js';
import { fetchKanjiByJlpt } from './modules/kanjiapi.js';
import { addCard } from './modules/anki.js';
import { lookupKanjiByRadicals, lookupRadicals } from './modules/radical.js';

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
                kanji: z.string().min(1).max(5)
                    .describe("One or multiple kanji as input for the breakdown.")
            },
            annotations: {
                readOnlyHint: true
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
        'radicals',
        {
            title: 'Lookup kanji radicals',
            description: 'Look up the radical (component) decomposition of one or more kanji using KRADFILE',
            inputSchema: {
                kanji: z.string().min(1).max(10)
                    .describe('One or multiple kanji to look up the radicals of')
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async ({ kanji }) => text(
            await lookupRadicals(kanji) || 'No radical data found for the given kanji.'
        )
    );

    server.registerTool(
        'kanji_by_radical',
        {
            title: 'Lookup kanji by radical',
            description:
                'List the kanji that contain a given radical (component) using RADKFILE. ' +
                'Multiple radicals give one list per radical.',
            inputSchema: {
                radical: z.string().min(1).max(5).describe(
                    'One or multiple radicals, e.g. 氵 or 木. ' +
                    '阝 returns both of its forms; to get only one, ' +
                    'pass 阡 for the left form (hill, as in 阪) ' +
                    'or 邦 for the right form (village, as in 都)'
                )
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async ({ radical }) => text(
            await lookupKanjiByRadicals(radical) || 'No kanji found for the given radical.'
        )
    );

    server.registerTool(
        'jlpt',
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
