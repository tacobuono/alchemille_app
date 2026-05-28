/** @type {import('next').NextConfig} */

// Derive Supabase Storage hostname from env so next/image can serve
// avatars served from the project's CDN. Falls back to no remote pattern
// in case the URL isn't set at build time (CI without env, etc.).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = (() => {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
})();

const remotePatterns = [
  ...(supabaseHostname
    ? [
        {
          protocol: "https",
          hostname: supabaseHostname,
          pathname: "/storage/v1/object/public/**",
        },
      ]
    : []),
  // Clerk avatar fallbacks (used until a user uploads their own)
  { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
  { protocol: "https", hostname: "images.clerk.dev", pathname: "/**" },
];

const nextConfig = {
  images: { remotePatterns },
  // Keep the app responsive on slower devices.
  experimental: { optimizePackageImports: ["lucide-react", "date-fns"] },
};

export default nextConfig;
