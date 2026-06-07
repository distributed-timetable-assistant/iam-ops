export function getRequiredEnv(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`)
    }
    return value
}

export function getPublicBaseUrl(): string {
    return getRequiredEnv("PUBLIC_BASE_URL", "http://localhost:3000")
}

export function getKratosPublicUrl(): string {
    return getRequiredEnv("KRATOS_PUBLIC_URL", "http://127.0.0.1:4433")
}

export function getHydraAdminUrl(): string {
    return getRequiredEnv("HYDRA_ADMIN_URL", "http://127.0.0.1:4445")
}

