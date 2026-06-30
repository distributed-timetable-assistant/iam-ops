import { getKratosPublicUrl } from "./env"

type OrySearchParams = Record<string, string | string[] | undefined> | undefined

function extractParam(sp: OrySearchParams, key: string): string | undefined {
    if (!sp) return undefined
    const val = sp[key]
    if (Array.isArray(val)) return val[0]
    return typeof val === "string" ? val : undefined
}

async function fetchKratosFlow<T>(path: string, id?: string): Promise<T | null> {
    const base = getKratosPublicUrl()
    const url = new URL(path, base)
    if (id) url.searchParams.set("id", id)

    const res = await fetch(url.toString(), {
        headers: { accept: "application/json" },
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
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/login/flows", flowId)
}

export async function getRegistrationFlowInternal(
    sp: OrySearchParams,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/registration/flows", flowId)
}

export async function getRecoveryFlowInternal(
    sp: OrySearchParams,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/recovery/flows", flowId)
}

export async function getVerificationFlowInternal(
    sp: OrySearchParams,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/verification/flows", flowId)
}

export async function getSettingsFlowInternal(
    sp: OrySearchParams,
): Promise<unknown | null> {
    const flowId = extractParam(sp, "flow")
    if (!flowId) return null
    return fetchKratosFlow("/self-service/settings/flows", flowId)
}
