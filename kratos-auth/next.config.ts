/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    allowedDevOrigins: ["127.0.0.1", "localhost"],
    env: {
        NEXT_PUBLIC_ORY_SDK_URL:
            process.env.NEXT_PUBLIC_ORY_SDK_URL || "https://web.login.outi.ir",
    },
    turbopack: {
        root: __dirname,
    },
}

export default nextConfig
