import type { NextConfig } from "next";

/**
 * NOTE: the Content-Security-Policy header is deliberately *not* set here — it
 * is built per request in `proxy.ts` so every page load carries a fresh nonce.
 * A static policy here would override it and re-open the inline-script hole.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  // Nothing reads this header; it only advertises the framework. Removing it
  // is free and removes one cheap fingerprint for automated scanners, though
  // it is hygiene rather than protection — `/_next/` asset paths, the `Vary`
  // header and the `__next_f` payload scripts still give the stack away.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // The old "manage code + password" page is gone; its link is replaced by
      // the account area. Point stragglers and old bookmarks at the new flow
      // instead of 404-ing them.
      {
        source: "/:lang(ar|en)/manage",
        destination: "/:lang/login",
      },
      {
        source: "/:path*",
        destination: "https://iskantr.com/:path*",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
