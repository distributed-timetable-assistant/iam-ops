import { redirect } from "next/navigation"

import { getKratosBrowserUrl } from "./env"

export function getFirstQueryParam(
    searchParams: unknown,
    key: string,
): string | undefined {
    if (!searchParams) return undefined

    if (searchParams instanceof URLSearchParams) {
        return searchParams.get(key) ?? undefined
    }

    if (typeof searchParams !== "object") return undefined

    const value = (searchParams as Record<string, unknown>)[key]
    if (Array.isArray(value)) {
        const first = value[0]
        return typeof first === "string" ? first : undefined
    }

    return typeof value === "string" ? value : undefined
}

export function redirectToBrowserFlow(
    browserPath: string,
    returnTo?: string,
): never {
    const url = new URL(browserPath, getKratosBrowserUrl())
    if (returnTo) {
        url.searchParams.set("return_to", returnTo)
    }
    redirect(url.toString())
}

export function isCsrfError(message: string): boolean {
    return (
        message.includes("security_csrf_violation") ||
        message.includes("Cookie Header is empty")
    )
}

export function coerceOryDates<T>(value: T): T {
    if (!value) return value

    if (Array.isArray(value)) {
        return value.map(coerceOryDates) as unknown as T
    }

    if (typeof value !== "object") return value

    const input = value as unknown as Record<string, unknown>
    const output: Record<string, unknown> = {}

    for (const [key, raw] of Object.entries(input)) {
        if (typeof raw === "string" && key.endsWith("_at")) {
            const date = new Date(raw)
            output[key] = Number.isNaN(date.getTime()) ? raw : date
            continue
        }

        output[key] = coerceOryDates(raw)
    }

    return output as unknown as T
}
