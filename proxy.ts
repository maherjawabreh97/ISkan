import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { defaultLocale, locales } from "./lib/i18n"

/**
 * Paths that only exist on other stacks (WordPress, phpMyAdmin, exposed VCS
 * metadata, ...). Bots and vulnerability scanners hammer these constantly.
 * We answer with a flat 404 so the site never looks like a juicy target.
 */
const BLOCKED_PATHS: RegExp[] = [
  /^\/wp-(?:login|admin|content|includes|json|config|comments|cron)/i,
  /^\/xmlrpc\.php$/i,
  /^\/phpmyadmin/i,
  /^\/pma\//i,
  /^\/admin\.php$/i,
  /^\/cgi-bin\//i,
  /^\/(?:\.env|\.git|\.svn|\.hg|\.aws|\.ssh|\.htaccess|\.htpasswd|\.DS_Store)/i,
  /^\/(?:vendor|actuator|solr|druid|jenkins|zabbix|grafana|console|manager)\b/i,
  /^\/(?:config|backup|dump|db|database)\.(?:php|json|ya?ml|sql|zip|gz|env|bak)/i,
  /^\/\.well-known\/(?!acme-challenge|security\.txt|change-password|apple-app-site-association|assetlinks)/i,
]

/**
 * User agents that are never a real browser. They are only rejected on the
 * admin area so that search-engine crawlers keep working on the public site.
 */
const BOT_USER_AGENT =
  /(?:curl|wget|python-requests|python-urllib|httpx|aiohttp|go-http-client|java\/|okhttp|libwww|scrapy|zgrab|masscan|nmap|nikto|sqlmap|nuclei|dirbuster|gobuster|wpscan|semrush|ahrefs|mj12bot|dotbot|bytespider|petalbot|node-fetch|axios|postman|insomnia|httpclient)/i

function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATHS.some((pattern) => pattern.test(pathname))
}

function isAdminPath(pathname: string): boolean {
  return /(?:^|\/)admin(?:\/|$)/.test(pathname)
}

function plain(status: number, body: string) {
  return new NextResponse(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
    },
  })
}

function getLocale(request: NextRequest): string {
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? ""
  if (accept.includes("ar")) return "ar"
  if (accept.includes("en")) return "en"
  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1) Scanners / known attack paths.
  if (isBlockedPath(pathname)) {
    return plain(404, "Not found")
  }

  // 2) No real browser visits the dashboard — reject empty or bot user agents
  //    before they can even reach the login form.
  if (isAdminPath(pathname)) {
    const userAgent = request.headers.get("user-agent") ?? ""
    if (!userAgent || BOT_USER_AGENT.test(userAgent)) {
      return plain(403, "Forbidden")
    }
  }

  // API routes and uploaded media are not localized.
  if (pathname.startsWith("/api/")) return

  const pathnameHasLocale = (locales as readonly string[]).some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )
  if (pathnameHasLocale) return

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
}
