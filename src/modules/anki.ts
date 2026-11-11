const ANKI_CONNECT_URL = "http://127.0.0.1:8765";
const ANKI_CONNECT_VERSION = 6;

export interface CardInput {
    deck: string;
    japanese: string;
    emoji: string;
    reading: string;
    translation: string;
    sentence?: string;
    sentenceTranslation?: string;
}

async function invoke<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(ANKI_CONNECT_URL, {
        method: "POST",
        body: JSON.stringify({ action, version: ANKI_CONNECT_VERSION, params }),
    }).catch((err: Error) => {
        throw new Error(`Could not reach AnkiConnect at ${ANKI_CONNECT_URL}. Is Anki running? (${err.message})`);
    });

    const { result, error } = (await res.json()) as { result: T; error: string | null };
    if (error) throw new Error(`AnkiConnect error on "${action}": ${error}`);
    return result;
}

export async function addCard(
    { deck, japanese, emoji, reading, translation, sentence, sentenceTranslation }: CardInput
): Promise<number> {
    await invoke("createDeck", { deck });
    const front = sentence ? `${japanese}<br><br>${sentence}` : japanese;
    const back = [emoji, reading, translation, sentenceTranslation && `<br>${sentenceTranslation}`]
        .filter(Boolean)
        .join("<br>");
    return invoke<number>("addNote", {
        note: {
            deckName: deck,
            modelName: "Basic",
            fields: {
                Front: front,
                Back: back,
            },
            tags: ["ankimcp"],
            options: { allowDuplicate: true, duplicateScope: "deck" },
        },
    });
}
