import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const directory = process.env.BLAST_DATA_DIR || path.resolve(__dirname, '../../data');
mkdirSync(directory, { recursive: true });
export const db = new DatabaseSync(path.join(directory, 'blast.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE,name TEXT NOT NULL,password TEXT,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,pages TEXT NOT NULL,original BLOB,mime TEXT,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS document_images(document TEXT NOT NULL REFERENCES documents(id),page INTEGER NOT NULL,format TEXT NOT NULL,bytes BLOB NOT NULL,PRIMARY KEY(document,page));
CREATE TABLE IF NOT EXISTS notebooks(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES users(id),payload TEXT NOT NULL,updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES users(id),status TEXT NOT NULL,phase TEXT NOT NULL,result TEXT,error TEXT,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT,owner TEXT NOT NULL,notebook TEXT NOT NULL,role TEXT NOT NULL,payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reviews(owner TEXT NOT NULL,notebook TEXT NOT NULL,card TEXT NOT NULL,interval_days INTEGER NOT NULL,due TEXT NOT NULL,rating TEXT NOT NULL,PRIMARY KEY(owner,notebook,card));
CREATE TABLE IF NOT EXISTS attempts(owner TEXT NOT NULL,notebook TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(owner,notebook));
`);
db.prepare("UPDATE jobs SET status='failed', phase='Interrupted', error='The server restarted. Please try again.' WHERE status IN ('queued','running')").run();
db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
export function saveNotebook(owner: string, pack: any) { db.prepare('INSERT INTO notebooks(id,owner,payload,updated) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated=excluded.updated WHERE owner=excluded.owner').run(pack.id, owner, JSON.stringify(pack), new Date().toISOString()); }
export function notebook(owner: string, id: string): any | undefined { const row = db.prepare('SELECT payload FROM notebooks WHERE owner=? AND id=?').get(owner, id) as { payload: string } | undefined; return row ? JSON.parse(row.payload) : undefined; }
export function listNotebooks(owner: string) { return (db.prepare('SELECT payload FROM notebooks WHERE owner=? ORDER BY updated DESC').all(owner) as { payload: string }[]).map(row => JSON.parse(row.payload)); }
export function addDocument(owner: string, title: string, pages: { page: number; text: string }[], original: Buffer | null = null, mime = 'text/plain') { const id = randomUUID(); db.prepare('INSERT INTO documents VALUES(?,?,?,?,?,?,?)').run(id, owner, title, JSON.stringify(pages), original, mime, new Date().toISOString()); return { id, title, pageCount: pages.length, characters: pages.reduce((n, p) => n + p.text.length, 0) }; }
export function getDocuments(owner: string, ids: string[]) { return ids.map(id => { const row = db.prepare('SELECT id,title,pages FROM documents WHERE owner=? AND id=?').get(owner, id) as { id: string; title: string; pages: string } | undefined; if (!row) throw Object.assign(new Error('Source document not found.'), { status: 404 }); return { ...row, pages: JSON.parse(row.pages) as { page: number; text: string }[] }; }); }
export function getDocumentImages(owner:string,ids:string[]){
  getDocuments(owner,ids);
  return ids.flatMap(id=>(db.prepare('SELECT page,format,bytes FROM document_images JOIN documents ON documents.id=document_images.document WHERE documents.id=? AND owner=? ORDER BY page').all(id,owner) as {page:number;format:'png'|'jpeg';bytes:Uint8Array}[]).map(row=>({format:row.format,bytes:row.bytes,sourceId:`${id}:p${row.page}:c0`})));
}
