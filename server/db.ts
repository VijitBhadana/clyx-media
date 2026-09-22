import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, SiteContent, SiteMedia, siteContent, siteMedia, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }

export async function listSiteContent(): Promise<SiteContent[]> { const db = await getDb(); if (!db) return []; return db.select().from(siteContent).orderBy(asc(siteContent.page), asc(siteContent.sortOrder), asc(siteContent.section)); }
export async function listPageContent(page: string): Promise<SiteContent[]> { const db = await getDb(); if (!db) return []; return db.select().from(siteContent).where(eq(siteContent.page, page)).orderBy(asc(siteContent.sortOrder), asc(siteContent.section)); }
export async function upsertSiteContent(input: { id?: number; page: string; section: string; content: string; sortOrder?: number; updatedBy?: number }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  if (input.id) { await db.update(siteContent).set({ page: input.page, section: input.section, content: input.content, sortOrder: input.sortOrder ?? 0, updatedBy: input.updatedBy }).where(eq(siteContent.id, input.id)); return input.id; }
  const result = await db.insert(siteContent).values({ page: input.page, section: input.section, content: input.content, sortOrder: input.sortOrder ?? 0, updatedBy: input.updatedBy }); return Number(result[0].insertId);
}
export async function deleteSiteContent(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(siteContent).where(eq(siteContent.id, id)); }
export async function listSiteMedia(): Promise<SiteMedia[]> { const db = await getDb(); if (!db) return []; return db.select().from(siteMedia).orderBy(asc(siteMedia.createdAt)); }
export async function insertSiteMedia(input: { name: string; url: string; fileKey: string; mimeType: string; updatedBy?: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(siteMedia).values(input); return Number(result[0].insertId); }
export async function deleteSiteMedia(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(siteMedia).where(eq(siteMedia.id, id)); }
