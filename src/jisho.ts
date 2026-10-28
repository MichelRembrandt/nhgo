interface JishoJapanese {
    word?: string;
    reading?: string;
}

interface JishoSense {
    english_definitions: string[];
    parts_of_speech: string[];
}

interface JishoEntry {
    slug: string;
    is_common?: boolean;
    jlpt: string[];
    japanese: JishoJapanese[];
    senses: JishoSense[];
}

export interface JishoResponse {
    meta: { status: number };
    data: JishoEntry[];
}

export async function fetchJisho(word: string): Promise<JishoResponse> {
    const url = 'https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(word);
    const res = await fetch(url, {
        headers: { 'User-Agent': 'jishomcp/1.0 (personal MCP server)' }
    });

    if (!res.ok) {
        throw new Error(`Jisho request failed: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<JishoResponse>;
}
