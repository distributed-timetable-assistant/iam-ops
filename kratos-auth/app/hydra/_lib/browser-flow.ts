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
