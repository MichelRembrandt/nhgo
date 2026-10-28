import { fetchJisho } from "./jisho.js";


export async function getBreakdownPrompt(kanji: string): Promise<string> {

    let context = "\n\nWhen referencing kanji in your breakdown, always include the relevant reading in hiragana. Take the following as input and use your own knowledge for explaining the semantic and sound origin of the parts of the kanji.";
    try {
        const jisho = await fetchJisho(kanji);
        if (jisho.data.length > 0) {
            context += "\n\nJisho dictionary data:\n" + JSON.stringify(jisho.data);
        }
        else {
            context += "\n\nFailed to load Jisho data. Rely on your own knowledge.";
        }
    } catch {
        context += "\n\nFailed to load Jisho data. Rely on your own knowledge.";
    }
    
    if (kanji.length === 1) {
        return "Break down the meanings of the parts that make up the kanji " + kanji + context;
    }

    return "Break down the meaning of the kanji that make up " + kanji + " and the parts that make up those kanji." + context;
}
