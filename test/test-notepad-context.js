import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, symlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { notepadContextEnabled, parseNotepadContextInput, searchNotepadTabState } from '../dist/tools/windows-notepad.js';
const a = '11111111-1111-1111-1111-111111111111';
const b = '22222222-2222-2222-2222-222222222222';
const c = '33333333-3333-3333-3333-333333333333';
async function fixture(fn) {
    const root = await mkdtemp(path.join(os.tmpdir(), 'notepad-fixture-'));
    try { await fn(root); } finally { await rm(root, {recursive:true, force:true}); }
}
const authorize = async p => p;
test('local Windows opt-in cannot enable the remote device child', () => {
    assert.equal(notepadContextEnabled('win32', {}), false);
    assert.equal(notepadContextEnabled('linux', {CENTRALDARK_NOTEPAD_CONTEXT_LOCAL:'1'}), false);
    assert.equal(notepadContextEnabled('win32', {CENTRALDARK_NOTEPAD_CONTEXT_LOCAL:'1', DC_REMOTE_DEVICE:'true'}), false);
    assert.equal(notepadContextEnabled('win32', {CENTRALDARK_NOTEPAD_CONTEXT_LOCAL:'1'}), true);
});
test('rejects extra parameters, short or control queries, excessive limits', () => {
    for (const input of [{query:'ab'},{query:'abc\nxyz'},{query:'abc',limit:11},{query:'abc',path:'x'},{query:'abc',limit:1.5}]) assert.throws(() => parseNotepadContextInput(input));
});
test('matches UTF8 and odd UTF16LE, deduplicates revisions, no raw notes', async () => fixture(async root => {
    await writeFile(path.join(root,a+'.bin'),'KV Cache; private fixture text');
    await writeFile(path.join(root,a+'.0.bin'),'kv cache');
    await writeFile(path.join(root,b+'.bin'),Buffer.concat([Buffer.from([1]),Buffer.from('KV Cache KV Cache','utf16le')]));
    await writeFile(path.join(root,c+'.bin'),'unrelated');
    await writeFile(path.join(root,'not-an-id.bin'),'KV Cache');
    const result = await searchNotepadTabState(root,{query:'KV Cache',limit:10},authorize);
    assert.equal(result.total_candidates,4);
    assert.equal(result.stable_files,4);
    assert.equal(result.matching_files,3);
    assert.equal(result.matching_tab_ids,2);
    assert.equal(result.matches.find(x=>x.tab_id===b).count,2);
    assert.equal(result.raw_text_returned,false);
    assert.equal(result.active_or_unsaved_status,'UNKNOWN');
    assert(!JSON.stringify(result).includes('private fixture text'));
}));
test('limit and literal matching', async () => fixture(async root => {
    for (const id of [a,b]) await writeFile(path.join(root,id+'.bin'),'a.b literal');
    const result=await searchNotepadTabState(root,{query:'a.b',limit:1},authorize);
    assert.equal(result.matching_tab_ids,2); assert.equal(result.returned,1);
    assert.equal((await searchNotepadTabState(root,{query:'a*b'},authorize)).matching_tab_ids,0);
}));
test('honors root and per-file authorization, size bounds', async () => fixture(async root => {
    await assert.rejects(searchNotepadTabState(root,{query:'cache'},async()=>{throw Error('denied')}));
    await writeFile(path.join(root,a+'.bin'),'cache');
    await writeFile(path.join(root,b+'.bin'),Buffer.alloc(1024*1024+1));
    const result=await searchNotepadTabState(root,{query:'cache'},async p=>{if(p.endsWith(a+'.bin'))throw Error('denied');return p});
    assert.equal(result.matching_tab_ids,0);assert.equal(result.skipped_files,2);assert.equal(result.status,'PARTIAL');
}));
test('does not follow symlinks', {skip:process.platform==='win32'}, async () => fixture(async root => {
    await writeFile(path.join(root,'outside.txt'),'cache');
    await symlink(path.join(root,'outside.txt'),path.join(root,a+'.bin'));
    const result=await searchNotepadTabState(root,{query:'cache'},authorize);
    assert.equal(result.matching_tab_ids,0);assert.equal(result.skipped_files,1);
}));
