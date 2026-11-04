export async function fetchKanjiByJlpt(level: number): Promise<string[]> {
    const res = await fetch(
        `https://kanjiapi.dev/v1/kanji/jlpt-${level}`,
        { headers: { 'User-Agent': 'nhgo/1.0 (personal MCP server)' } }
    );
    if (!res.ok) {
        throw new Error(`kanjiapi request failed: ${res.status} ${res.statusText}`);
    }
    const body = new TextDecoder('utf-8').decode(await res.arrayBuffer());
    return JSON.parse(body) as string[];
}
