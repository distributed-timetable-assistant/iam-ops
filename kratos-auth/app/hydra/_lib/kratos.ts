import { getKratosPublicUrl } from "./env"

export type KratosWhoamiIdentity = {
    id: string
    traits?: Record<string, unknown>
}

export type KratosWhoamiResponse = {
    active: boolean
    identity: KratosWhoamiIdentity
}

export async function getKratosSessionOrNull(cookieHeader: string | null) {
    if (!cookieHeader) return null

    const response = await fetch(`${getKratosPublicUrl()}/sessions/whoami`, {
        headers: {
            cookie: cookieHeader,
            accept: "application/json",
        },
        cache: "no-store",
    })

    if (response.status === 401 || response.status === 403) {
        return null
    }
    if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(`Kratos whoami failed: ${response.status} ${text}`)
    }

    return (await response.json()) as KratosWhoamiResponse
}

