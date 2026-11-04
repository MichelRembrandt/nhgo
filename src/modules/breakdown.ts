import { lookupRadicals } from './radical.js';

const READING_INSTRUCTION =
    'When referencing kanji in your breakdown, always include the relevant reading in hiragana. ' +
    'Take the following as input and use your own knowledge for explaining the semantic and sound origin of the parts of the kanji.';

const RADICALS_FALLBACK = 'No radical data found. Rely on your own knowledge.';

export async function getRadicals(kanji: string): Promise<string> {
    try {
        const lines = await lookupRadicals(kanji);
        return lines
            ? 'Radical decomposition:\n' + lines
            : RADICALS_FALLBACK;
    } catch {
        return RADICALS_FALLBACK;
    }
}

export async function getBreakdownPrompt(kanji: string): Promise<string> {
    const task = kanji.length === 1
        ? `Break down the meanings of the parts that make up the kanji ${kanji}`
        : `Break down the meaning of the kanji that make up ${kanji} and the parts that make up those kanji.`;

    return `${task}\n\n${READING_INSTRUCTION}\n\n${await getRadicals(kanji)}`;
}
