export interface JishoResponse {
    meta: { status: number };
    data: unknown[];
}

export async function fetchJisho(word: string): Promise<JishoResponse> {
    const res = await fetch(
        'https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(word),
        { headers: { 'User-Agent': 'nhgo/1.0 (personal MCP server)' } }
    );
    if (!res.ok) throw new Error(`Jisho request failed: ${res.status} ${res.statusText}`);
    return res.json() as Promise<JishoResponse>;
}
