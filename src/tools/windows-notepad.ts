import path from 'node:path';
import { open, readdir, lstat, realpath } from 'node:fs/promises';

const TAB_FILE = /^([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})(?:\.[01])?\.bin$/i;
const MAX_FILES = 512;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_TOTAL_BYTES = 16 * 1024 * 1024;
type AuthorizePath = (candidate: string) => Promise<string>;
type Match = { tab_id: string; file: string; modified_at: string; count: number };

export function notepadContextEnabled(platform = process.platform, env = process.env): boolean {
    return platform === 'win32' && env.CENTRALDARK_NOTEPAD_CONTEXT_LOCAL === '1' && env.DC_REMOTE_DEVICE !== 'true';
}

export function parseNotepadContextInput(raw: unknown): {query: string; limit: number} {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('INVALID_INPUT');
    const value = raw as Record<string, unknown>;
    if (Object.keys(value).some(k => k !== 'query' && k !== 'limit')) throw new Error('INVALID_INPUT');
    if (typeof value.query !== 'string') throw new Error('INVALID_QUERY');
    const query = value.query.trim().toLowerCase();
    if (query.length < 3 || query.length > 120 || /[\u0000-\u001f\u007f]/.test(query)) throw new Error('INVALID_QUERY');
    const limit = value.limit === undefined ? 10 : value.limit;
    if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('INVALID_LIMIT');
    return {query, limit};
}

function samePath(a: string, b: string): boolean {
    return process.platform === 'win32' ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);
}

function countMatches(buffer: Buffer, term: string): number {
    // Text-match heuristic only; never reconstruct the binary format or expose its bytes.
    const candidates = [buffer.toString('utf8'), buffer.toString('utf16le'), buffer.toString('utf16le', 1)];
    let max = 0;
    for (const candidate of candidates) {
        const text = candidate.toLowerCase();
        let count = 0, cursor = 0;
        for (;;) {
            const index = text.indexOf(term, cursor);
            if (index < 0) break;
            count++;
            cursor = index + term.length;
        }
        max = Math.max(max, count);
    }
    return max;
}

export async function searchNotepadTabState(root: string, raw: unknown, authorizePath: AuthorizePath) {
    const {query, limit} = parseNotepadContextInput(raw);
    const absolute = path.resolve(root);
    const authorized = await authorizePath(absolute);
    if (!samePath(absolute, authorized) || !samePath(absolute, await realpath(absolute))) throw new Error('LOCALSTATE_PATH_NOT_ALLOWED');
    const entries = (await readdir(absolute, {withFileTypes: true})).filter(entry => TAB_FILE.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name));
    const matches = new Map<string, Match>();
    let stable = 0, changed = 0, skipped = 0, examinedBytes = 0, matchingFiles = 0;
    for (const entry of entries.slice(0, MAX_FILES)) {
        const file = path.join(absolute, entry.name);
        if (!entry.isFile()) { skipped++; continue; }
        try {
            const allowed = await authorizePath(file);
            if (!samePath(file, allowed) || !samePath(file, await realpath(file))) { skipped++; continue; }
            const initial = await lstat(file);
            if (!initial.isFile() || initial.size > MAX_FILE_BYTES || examinedBytes + initial.size > MAX_TOTAL_BYTES) { skipped++; continue; }
            const handle = await open(file, 'r');
            try {
                const before = await handle.stat();
                if (!before.isFile() || before.size !== initial.size || before.mtimeMs !== initial.mtimeMs || before.ino !== initial.ino || before.dev !== initial.dev) { changed++; continue; }
                const buffer = Buffer.alloc(before.size);
                let bytesRead = 0;
                examinedBytes += buffer.length;
                while (bytesRead < buffer.length) {
                    const read = await handle.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead);
                    if (read.bytesRead === 0) break;
                    bytesRead += read.bytesRead;
                }
                const after = await handle.stat();
                const current = await lstat(file);
                if (bytesRead !== buffer.length || after.size !== before.size || after.mtimeMs !== before.mtimeMs || current.ino !== before.ino || current.dev !== before.dev || current.size !== before.size || current.mtimeMs !== before.mtimeMs || !samePath(file, await realpath(file))) { changed++; continue; }
                stable++;
                const count = countMatches(buffer, query);
                if (!count) continue;
                matchingFiles++;
                const id = TAB_FILE.exec(entry.name)![1].toLowerCase();
                const candidate = {tab_id: id, file: entry.name, modified_at: new Date(after.mtimeMs).toISOString(), count};
                const previous = matches.get(id);
                if (!previous || candidate.modified_at > previous.modified_at) matches.set(id, candidate);
            } finally { await handle.close(); }
        } catch { skipped++; }
    }
    const results = [...matches.values()].sort((a,b) => b.modified_at.localeCompare(a.modified_at) || a.tab_id.localeCompare(b.tab_id));
    return {
        source: 'WindowsNotepad/LocalState/TabState',
        status: changed || skipped || entries.length > MAX_FILES ? 'PARTIAL' : 'COMPLETE_SCAN',
        format: 'HEURISTIC_TEXT_MATCH_ONLY',
        total_candidates: entries.length,
        stable_files: stable,
        changed_files: changed,
        skipped_files: skipped + Math.max(0, entries.length - MAX_FILES),
        matching_files: matchingFiles,
        matching_tab_ids: results.length,
        returned: Math.min(limit, results.length),
        matches: results.slice(0, limit),
        raw_text_returned: false,
        active_or_unsaved_status: 'UNKNOWN',
    };
}

export async function findWindowsNotepadContext(raw: unknown, authorizePath: AuthorizePath) {
    if (!notepadContextEnabled()) throw new Error('NOTEPAD_CONTEXT_LOCAL_OPT_IN_REQUIRED');
    const base = process.env.LOCALAPPDATA;
    if (!base || !path.isAbsolute(base)) throw new Error('LOCALAPPDATA_UNAVAILABLE');
    return searchNotepadTabState(path.join(base, 'Packages', 'Microsoft.WindowsNotepad_8wekyb3d8bbwe', 'LocalState', 'TabState'), raw, authorizePath);
}
