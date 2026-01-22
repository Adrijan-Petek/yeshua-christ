import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";

export type AdminUser = {
  _id: ObjectId;
  emailLower: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminSession = {
  tokenHash: string;
  adminUserId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAdminCookieName(): string {
  return "yc_admin_session";
}

export function getSessionDays(): number {
  const raw = process.env.ADMIN_SESSION_DAYS;
  const days = raw ? Number(raw) : 14;
  if (!Number.isFinite(days) || days <= 0) return 14;
  return Math.min(days, 90);
}

export function sha256Hex(input: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto") as typeof import("crypto");
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto") as typeof import("crypto");
  return crypto.randomBytes(32).toString("base64url");
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out[k] = rest.join("=") || "";
  }
  return out;
}

export async function ensureBootstrapAdminUser(): Promise<void> {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!bootstrapEmail || !bootstrapPassword) return;

  const db = await getMongoDb();
  const users = db.collection<AdminUser>("admin_users");
  const count = await users.estimatedDocumentCount();
  if (count > 0) return;

  const emailLower = normalizeEmail(bootstrapEmail);
  const passwordHash = await bcrypt.hash(bootstrapPassword, 12);
  const now = new Date();
  await users.insertOne({
    _id: new ObjectId(),
    emailLower,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = await getMongoDb();
  const users = db.collection<AdminUser>("admin_users");
  const emailLower = normalizeEmail(email);
  return await users.findOne({ emailLower });
}

export async function verifyAdminPassword(user: AdminUser, password: string): Promise<boolean> {
  return await bcrypt.compare(password, user.passwordHash);
}

export async function createAdminSession(adminUserId: ObjectId): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken();
  const tokenHash = sha256Hex(token);
  const db = await getMongoDb();
  const sessions = db.collection<AdminSession>("admin_sessions");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + getSessionDays() * 24 * 60 * 60 * 1000);
  await sessions.insertOne({ tokenHash, adminUserId, createdAt: now, expiresAt });
  return { token, expiresAt };
}

export async function getAdminFromSessionToken(token: string): Promise<AdminUser | null> {
  const tokenHash = sha256Hex(token);
  const db = await getMongoDb();
  const sessions = db.collection<AdminSession>("admin_sessions");
  const session = await sessions.findOne({ tokenHash });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await sessions.deleteOne({ tokenHash });
    return null;
  }

  const users = db.collection<AdminUser>("admin_users");
  return await users.findOne({ _id: session.adminUserId });
}

export async function deleteSessionToken(token: string): Promise<void> {
  const tokenHash = sha256Hex(token);
  const db = await getMongoDb();
  await db.collection<AdminSession>("admin_sessions").deleteOne({ tokenHash });
}

export async function deleteAllSessionsForUser(adminUserId: ObjectId): Promise<void> {
  const db = await getMongoDb();
  await db.collection<AdminSession>("admin_sessions").deleteMany({ adminUserId });
}

export async function updateAdminPassword(adminUserId: ObjectId, newPassword: string): Promise<void> {
  const db = await getMongoDb();
  const users = db.collection<AdminUser>("admin_users");
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await users.updateOne({ _id: adminUserId }, { $set: { passwordHash, updatedAt: new Date() } });
}

