import { readFile } from 'node:fs/promises';

let kradMap: Map<string, string[]> | undefined;

async function loadKrad(): Promise<Map<string, string[]>> {
    if (kradMap) return kradMap;
    const text = await readFile(new URL('./kradfile.txt', import.meta.url), 'utf8');
    const map = new Map<string, string[]>();
    for (const line of text.split('\n')) {
        if (!line || line.startsWith('#')) continue;
        const [kanji, parts] = line.split(' : ');
        if (kanji && parts) map.set(kanji.trim(), parts.trim().split(/\s+/));
    }
    return (kradMap = map);
}

export async function lookupRadicals(kanji: string): Promise<string> {
    const krad = await loadKrad();
    return [...kanji]
        .filter((ch) => krad.has(ch))
        .map((ch) => `${ch}: ${krad.get(ch)!.join(' ')}`)
        .join('\n');
}

let radkMap: Map<string, string[]> | undefined;

async function loadRadk(): Promise<Map<string, string[]>> {
    if (radkMap) return radkMap;
    const text = await readFile(new URL('./radkfile.txt', import.meta.url), 'utf8');
    const map = new Map<string, string[]>();
    let current: string[] | undefined;
    for (const line of text.split('\n')) {
        if (!line || line.startsWith('#')) continue;
        if (line.startsWith('$')) {
            const radical = line.split(/\s+/)[1];
            current = [];
            if (radical) map.set(radical, current);
        } else if (current) {
            current.push(...line.trim());
        }
    }
    return (radkMap = map);
}

const RADICAL_ALIASES: Record<string, string[]> = {
    '氵': ['汁'],
    '扌': ['扎'],
    '忄': ['忙'],
    '亻': ['化'],
    '艹': ['艾'],
    '辶': ['込'],
    '礻': ['礼'],
    'ネ': ['初'],
    '犭': ['犯'],
    '刂': ['刈'],
    '灬': ['杰'],
    '阝': ['阡', '邦']
};

export async function lookupKanjiByRadicals(radicals: string): Promise<string> {
    const radk = await loadRadk();
    return [...new Set(radicals)]
        .flatMap((r) => {
            const targets = RADICAL_ALIASES[r] ?? [r];
            return targets.map((t) => ({
                label: targets.length > 1 ? `${r} (${t})` : r,
                kanji: radk.get(t) ?? [],
            }));
        })
        .filter(({ kanji }) => kanji.length > 0)
        .map(({ label, kanji }) => `${label}: ${kanji.join('')}`)
        .join('\n');
}
