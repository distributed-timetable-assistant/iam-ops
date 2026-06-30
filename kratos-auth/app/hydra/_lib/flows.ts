import { getKratosPublicUrl } from "./env"

type OrySearchParams = Record<string, string | string[] | undefined> | undefined

function extractParam(sp: OrySearchParams, key: string): string | undefined {
    if (!sp) return undefined
    const val = sp[key]
    if (Array.isArray(val)) return val[0]
    return typeof val === "string" ? val : undefined
}

async function fetchKratosFlow<T>(
    path: string,
    id?: string,
    cookieHeader?: string,
): Promise<T | null> {
    const base = getKratosPublicUrl()
    const url = new URL(path, base)
    if (id) url.searchParams.set("id", id)

    const headers: Record<string, string> = {
        accept: "application/json",
    }

    if (cookieHeader) {
        headers.cookie = cookieHeader
    }

    const res = await fetch(url.toString(), {
        headers,
        cache: "no-store",
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Kratos ${path} failed: ${res.status} ${text}`)
    }

    return (await res.json()) as T
}

export async function getLoginFlowInternal(
    sp: OrySearchParams,
    cookieHeader?: string,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/login/flows", flowId, cookieHeader)
}

export async function getRegistrationFlowInternal(
    sp: OrySearchParams,
    cookieHeader?: string,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow(
        "/self-service/registration/flows",
        flowId,
        cookieHeader,
    )
}

export async function getRecoveryFlowInternal(
    sp: OrySearchParams,
    cookieHeader?: string,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/recovery/flows", flowId, cookieHeader)
}

export async function getVerificationFlowInternal(
    sp: OrySearchParams,
    cookieHeader?: string,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow(
        "/self-service/verification/flows",
        flowId,
        cookieHeader,
    )
}

export async function getSettingsFlowInternal(
    sp: OrySearchParams,
    cookieHeader?: string,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/settings/flows", flowId, cookieHeader)
}
