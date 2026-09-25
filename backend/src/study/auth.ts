import { Request, Response, NextFunction } from 'express';
import { randomBytes, randomUUID, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './store';
const scrypt = promisify(scryptCallback);
const production = process.env.NODE_ENV === 'production';
const cookieName = production ? '__Host-blast_session' : 'blast_session';
export type User = { id: string; email: string | null; name: string };
declare global { namespace Express { interface Request { user: User } } }
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export async function passwordHash(password: string) { const salt = randomBytes(16).toString('hex'); return `${salt}:${(await scrypt(password, salt, 64) as Buffer).toString('hex')}`; }
export async function verifyPassword(password: string, stored: string) { const [salt, key] = stored.split(':'); const derived = await scrypt(password, salt, 64) as Buffer; const expected = Buffer.from(key, 'hex'); return derived.length === expected.length && timingSafeEqual(derived, expected); }
export function issueSession(res: Response, id: string) { const token = randomBytes(32).toString('hex'); const age = 7 * 86400; db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token), id, Date.now() + age * 1000); res.cookie(cookieName, token, { httpOnly: true, secure: production, sameSite: 'strict', path: '/', maxAge: age * 1000 }); }
export function readUser(req: Request) { const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1); if (!token || !/^[a-f0-9]{64}$/.test(token)) return undefined; return db.prepare('SELECT users.id,email,name FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.hash=? AND sessions.expires>?').get(hash(token), Date.now()) as User | undefined; }
export function session(req: Request, res: Response) { const user = readUser(req); if (user) { res.json({ user, guest: !user.email }); return; } if (production) { res.status(401).json({ message: 'Sign in to open your workspace.' }); return; } const id = randomUUID(); db.prepare('INSERT INTO users VALUES(?,NULL,?,NULL,?)').run(id, 'Student', new Date().toISOString()); issueSession(res, id); res.json({ user: { id, name: 'Student', email: null }, guest: true }); }
export function requireUser(req: Request, res: Response, next: NextFunction) { const user = readUser(req); if (!user || (production && !user.email)) { res.status(401).json({ message: 'Please sign in again.' }); return; } req.user = user; next(); }
export function logout(req: Request, res: Response) { const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1); if (token) db.prepare('DELETE FROM sessions WHERE hash=?').run(hash(token)); res.clearCookie(cookieName, { path: '/', httpOnly: true, secure: production, sameSite: 'strict' }); res.json({ success: true }); }
