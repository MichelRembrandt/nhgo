import { lookupKanjiLines } from './kanjiapi.js';

const READING_INSTRUCTION =
    'When referencing kanji in your breakdown, always include the relevant reading in hiragana. ' +
    'Rely on your own knowledge for breaking down the kanji into parts and explaining the semantic and sound origin.';

const KANJI_FALLBACK = 'No kanji data found. Rely on your own knowledge.';

export async function getKanjiInfo(text: string): Promise<string> {
    const lines = await lookupKanjiLines(text);
    return lines.length
        ? 'Start your breakdown with the following basic Kanji info:\n' + lines.join('\n')
        : KANJI_FALLBACK;
}

export async function getBreakdownPrompt(kanji: string): Promise<string> {
    const task = kanji.length === 1
        ? `Break down the meanings of the parts that make up the kanji ${kanji}`
        : `Break down the meaning of the kanji that make up ${kanji} and the parts that make up those kanji.`;

    return `${task}\n\n${READING_INSTRUCTION}\n\n${await getKanjiInfo(kanji)}`;
}
