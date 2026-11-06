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

export async function lookupKanjiLines(text: string): Promise<string[]> {
    const chars = [...new Set(text.match(/\p{Script=Han}/gu) ?? [])];
    const results = await Promise.allSettled(
        chars.map(async c => formatKanji(await get<KanjiInfo>(`kanji/${encodeURIComponent(c)}`)))
    );
    return results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []);
}

function formatKanji(info: KanjiInfo): string {
    const readings = [...info.on_readings, ...info.kun_readings].join('、') || '-';
    return `${info.kanji}: readings: ${readings}; ` +
        `JLPT: ${info.jlpt ? 'N' + info.jlpt : '-'}; ` +
        `grade: ${info.grade ?? '-'}; ` +
        `meaning: ${info.meanings.join(', ') || '-'}`;
}

interface KanjiInfo {
    kanji: string;
    grade: number | null;
    jlpt: number | null;
    meanings: string[];
    on_readings: string[];
    kun_readings: string[];
}
