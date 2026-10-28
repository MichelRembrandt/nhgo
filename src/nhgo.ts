import { fetchJisho } from './jisho.js';

const READING_INSTRUCTION =
    'When referencing kanji in your breakdown, always include the relevant reading in hiragana. ' +
    'Take the following as input and use your own knowledge for explaining the semantic and sound origin of the parts of the kanji.';

const JISHO_FALLBACK = 'Failed to load Jisho data. Rely on your own knowledge.';

async function getJishoContext(kanji: string): Promise<string> {
    try {
        const { data } = await fetchJisho(kanji);
        return data.length > 0
            ? 'Jisho dictionary data:\n' + JSON.stringify(data)
            : JISHO_FALLBACK;
    } catch {
        return JISHO_FALLBACK;
    }
}

export async function getBreakdownPrompt(kanji: string): Promise<string> {
    const task = kanji.length === 1
        ? `Break down the meanings of the parts that make up the kanji ${kanji}`
        : `Break down the meaning of the kanji that make up ${kanji} and the parts that make up those kanji.`;

    return `${task}\n\n${READING_INSTRUCTION}\n\n${await getJishoContext(kanji)}`;
}
