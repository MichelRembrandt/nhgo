async function get<T>(path: string): Promise<T> {
    const res = await fetch(
        `https://kanjiapi.dev/v1/${path}`,
        { headers: { 'User-Agent': 'nhgo/1.0 (personal MCP server)' } }
    );
    if (!res.ok) {
        throw new Error(`kanjiapi request failed: ${res.status} ${res.statusText}`);
    }
    const body = new TextDecoder('utf-8').decode(await res.arrayBuffer());
    return JSON.parse(body) as T;
}

export function fetchKanjiByJlpt(level: number): Promise<string[]> {
    return get(`kanji/jlpt-${level}`);
}

export async function getKanjiInfo(text: string): Promise<string[]> {
    const chars = [...new Set(text.match(/\p{Script=Han}/gu) ?? [])];
    const results = await Promise.allSettled(
        chars.map(async c => JSON.stringify(await get(`kanji/${encodeURIComponent(c)}`)))
    );
    return results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []);
}
