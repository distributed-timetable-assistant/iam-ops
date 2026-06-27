import { getHydraAdminUrl } from "./env"

type HydraAcceptLoginResponse = { redirect_to: string }
type HydraAcceptConsentResponse = { redirect_to: string }
type HydraAcceptLogoutResponse = { redirect_to: string }

export type HydraConsentRequest = {
    requested_scope?: string[]
    requested_access_token_audience?: string[]
}

async function hydraAdminFetch(path: string, init?: RequestInit) {
    const url = `${getHydraAdminUrl()}${path}`
    const response = await fetch(url, {
        ...init,
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            ...(init?.headers ?? {}),
        },
        cache: "no-store",
    })

    if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(`Hydra admin call failed: ${response.status} ${text}`)
    }
    return response
}

export async function getHydraConsentRequest(consentChallenge: string) {
    const response = await hydraAdminFetch(
        `/oauth2/auth/requests/consent?consent_challenge=${encodeURIComponent(consentChallenge)}`,
        { method: "GET" },
    )
    return (await response.json()) as HydraConsentRequest
}

export async function acceptHydraLogin(loginChallenge: string, subject: string) {
    const response = await hydraAdminFetch(
        `/oauth2/auth/requests/login/accept?login_challenge=${encodeURIComponent(loginChallenge)}`,
        {
            method: "PUT",
            body: JSON.stringify({
                subject,
                remember: true,
                remember_for: 60 * 60,
            }),
        },
    )
    return (await response.json()) as HydraAcceptLoginResponse
}

export async function acceptHydraConsent(
    consentChallenge: string,
    scopes: string[],
    claims: Record<string, unknown>,
    audiences?: string[],
) {
    const response = await hydraAdminFetch(
        `/oauth2/auth/requests/consent/accept?consent_challenge=${encodeURIComponent(consentChallenge)}`,
        {
            method: "PUT",
            body: JSON.stringify({
                grant_scope: scopes,
                grant_access_token_audience: audiences,
                remember: true,
                remember_for: 60 * 60,
                session: {
                    access_token: claims,
                    id_token: claims,
                },
            }),
        },
    )
    return (await response.json()) as HydraAcceptConsentResponse
}

export async function acceptHydraLogout(logoutChallenge: string) {
    const response = await hydraAdminFetch(
        `/oauth2/auth/requests/logout/accept?logout_challenge=${encodeURIComponent(logoutChallenge)}`,
        {
            method: "PUT",
            body: JSON.stringify({}),
        },
    )
    return (await response.json()) as HydraAcceptLogoutResponse
}
