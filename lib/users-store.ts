import { promises as fs } from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { getSupabase, hasSupabase } from "./supabase"

export type Role = "admin" | "editor" | "viewer"

export const roles: Role[] = ["admin", "editor", "viewer"]

export interface User {
  id: string
  username: string
  name: string
  role: Role
  passwordHash: string
  createdAt: string
}

export type PublicUser = Omit<User, "passwordHash">

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "users.json")

let chain: Promise<unknown> = Promise.resolve()
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export function hashPassword(
  password: string,
  salt = crypto.randomBytes(16).toString("hex"),
): string {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const computed = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, "hex")
  if (computed.length !== expected.length) return false
  return crypto.timingSafeEqual(computed, expected)
}

function seedCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  }
}

function seedUser(): User {
  const { username, password } = seedCredentials()
  return {
    id: crypto.randomUUID(),
    username,
    name: username,
    role: "admin",
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// File storage (fallback)
// ---------------------------------------------------------------------------

async function readAll(): Promise<User[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as User[]
    return []
  } catch {
    const seeded = [seedUser()]
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(seeded, null, 2), "utf8")
    return seeded
  }
}

async function writeAll(list: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8")
}

// ---------------------------------------------------------------------------
// Supabase storage
// ---------------------------------------------------------------------------

interface UserRow {
  id: string
  username: string
  name: string
  role: Role
  password_hash: string
  created_at: string
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

let seeded = false
async function ensureSeeded(): Promise<void> {
  if (seeded) return
  seeded = true
  const supabase = getSupabase()
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
  if (error || (count ?? 0) > 0) return
  const { username, password } = seedCredentials()
  await supabase.from("users").insert({
    username,
    name: username,
    role: "admin",
    password_hash: hashPassword(password),
  })
}

async function supabaseUsers(): Promise<User[]> {
  await ensureSeeded()
  const { data, error } = await getSupabase()
    .from("users")
    .select("id,username,name,role,password_hash,created_at")
    .order("created_at", { ascending: true })
  if (error) {
    console.error("[users] supabase select failed:", error.message)
    return []
  }
  return (data as UserRow[]).map(rowToUser)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  username: user.username,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
})

export async function getUsers(): Promise<User[]> {
  if (hasSupabase()) return supabaseUsers()
  return readAll()
}

export async function getPublicUsers(): Promise<PublicUser[]> {
  return (await getUsers()).map(toPublicUser)
}

export async function getUser(id: string): Promise<User | undefined> {
  if (hasSupabase()) {
    await ensureSeeded()
    const { data, error } = await getSupabase()
      .from("users")
      .select("id,username,name,role,password_hash,created_at")
      .eq("id", id)
      .maybeSingle()
    if (error || !data) return undefined
    return rowToUser(data as UserRow)
  }
  return (await readAll()).find((user) => user.id === id)
}

export async function getUserByUsername(
  username: string,
): Promise<User | undefined> {
  const normalized = username.trim().toLowerCase()
  if (hasSupabase()) {
    await ensureSeeded()
    const { data, error } = await getSupabase()
      .from("users")
      .select("id,username,name,role,password_hash,created_at")
      .ilike("username", normalized)
      .maybeSingle()
    if (error || !data) return undefined
    return rowToUser(data as UserRow)
  }
  return (await readAll()).find(
    (user) => user.username.toLowerCase() === normalized,
  )
}

export interface UserInput {
  id?: string
  username: string
  name: string
  role: Role
  password?: string
}

export function saveUser(input: UserInput): Promise<User> {
  if (hasSupabase()) {
    return (async () => {
      const supabase = getSupabase()
      const username = input.username.trim()
      const name = input.name.trim() || username

      if (input.id) {
        const patch: Record<string, unknown> = {
          username,
          name,
          role: input.role,
        }
        if (input.password) patch.password_hash = hashPassword(input.password)
        const { data, error } = await supabase
          .from("users")
          .update(patch)
          .eq("id", input.id)
          .select("id,username,name,role,password_hash,created_at")
          .maybeSingle()
        if (error) throw new Error(error.message)
        if (!data) throw new Error("NOT_FOUND")
        return rowToUser(data as UserRow)
      }

      const { data, error } = await supabase
        .from("users")
        .insert({
          username,
          name,
          role: input.role,
          password_hash: hashPassword(input.password || "changeme123"),
        })
        .select("id,username,name,role,password_hash,created_at")
        .single()
      if (error) throw new Error(error.message)
      return rowToUser(data as UserRow)
    })()
  }

  return serialize(async () => {
    const list = await readAll()
    const username = input.username.trim()
    const name = input.name.trim() || username

    if (input.id) {
      const index = list.findIndex((user) => user.id === input.id)
      if (index < 0) throw new Error("NOT_FOUND")
      const current = list[index]
      const updated: User = {
        ...current,
        username,
        name,
        role: input.role,
        passwordHash: input.password
          ? hashPassword(input.password)
          : current.passwordHash,
      }
      list[index] = updated
      await writeAll(list)
      return updated
    }

    const created: User = {
      id: crypto.randomUUID(),
      username,
      name,
      role: input.role,
      passwordHash: hashPassword(input.password || "changeme123"),
      createdAt: new Date().toISOString(),
    }
    list.push(created)
    await writeAll(list)
    return created
  })
}

export function removeUser(id: string): Promise<boolean> {
  if (hasSupabase()) {
    return (async () => {
      const supabase = getSupabase()
      const user = await getUser(id)
      if (!user) return false
      if (user.role === "admin") {
        const admins = (await getUsers()).filter((item) => item.role === "admin")
        if (admins.length <= 1) throw new Error("LAST_ADMIN")
      }
      const { error } = await supabase.from("users").delete().eq("id", id)
      if (error) throw new Error(error.message)
      return true
    })()
  }

  return serialize(async () => {
    const list = await readAll()
    const user = list.find((item) => item.id === id)
    if (!user) return false
    const admins = list.filter((item) => item.role === "admin")
    if (user.role === "admin" && admins.length <= 1) {
      throw new Error("LAST_ADMIN")
    }
    await writeAll(list.filter((item) => item.id !== id))
    return true
  })
}
