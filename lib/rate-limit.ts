/**
 * Minimal in-memory rate limiter for login attempts.
 *
 * Good enough for a single Node/VPS process. Behind multiple instances
 * (serverless / horizontal scaling) each instance keeps its own counters, so
 * combine it with an edge WAF or a shared store if you run more than one.
 */
interface Bucket {
  count: number
  first: number
  blockedUntil: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 15 * 60 * 1000 // counting window
const MAX_ATTEMPTS = 8 // failures allowed within the window
const BLOCK_MS = 15 * 60 * 1000 // how long to block once exceeded

function sweep(now: number): void {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.blockedUntil < now && now - bucket.first > WINDOW_MS) {
      buckets.delete(key)
    }
  }
}

export function checkRateLimit(key: string): {
  allowed: boolean
  retryAfterSeconds: number
} {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket) return { allowed: true, retryAfterSeconds: 0 }
  if (bucket.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    }
  }
  if (now - bucket.first > WINDOW_MS) {
    buckets.delete(key)
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

export function recordFailure(key: string): void {
  const now = Date.now()
  sweep(now)
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.first > WINDOW_MS) {
    buckets.set(key, { count: 1, first: now, blockedUntil: 0 })
    return
  }
  bucket.count += 1
  if (bucket.count >= MAX_ATTEMPTS) {
    bucket.blockedUntil = now + BLOCK_MS
  }
}

export function resetRateLimit(key: string): void {
  buckets.delete(key)
}
