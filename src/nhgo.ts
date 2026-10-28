

export function getBreakdownPrompt(kanji: string): string {

    if (kanji.length === 1) {
        return "Break down the meanings of the parts that make up the kanji " + kanji;        
    }

    return "Break down the meaning of the kanji that make up " + kanji + " and the parts that make up those kanji.";
}
