const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PRIVATE_KEY: process.env.SUPABASE_PRIVATE_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.quicq.io",
        port: "",
      },
    ],
  },
});
