import { NextRequest, NextResponse } from "next/server"

import { getPublicBaseUrl } from "../_lib/env"
import { acceptHydraConsent, getHydraConsentRequest } from "../_lib/hydra"
import { getKratosSessionOrNull } from "../_lib/kratos"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const consentChallenge = url.searchParams.get("consent_challenge")
    if (!consentChallenge) {
        return new NextResponse("Missing consent_challenge", { status: 400 })
    }

    const session = await getKratosSessionOrNull(request.headers.get("cookie"))
    if (!session?.identity?.id) {
        const returnTo = `${getPublicBaseUrl()}/hydra/consent?consent_challenge=${encodeURIComponent(consentChallenge)}`
        return NextResponse.redirect(
            `${getPublicBaseUrl()}/auth/login?return_to=${encodeURIComponent(returnTo)}`,
            302,
        )
    }

    const traits = (session.identity.traits ?? {}) as Record<string, unknown>
    const email = typeof traits.email === "string" ? traits.email : undefined
    const name = typeof traits.name === "object" && traits.name ? traits.name : undefined

    const consentRequest = await getHydraConsentRequest(consentChallenge)
    const requestedScopes = consentRequest.requested_scope ?? []

    const accepted = await acceptHydraConsent(
        consentChallenge,
        requestedScopes,
        {
            sub: session.identity.id,
            email,
            name,
        },
        consentRequest.requested_access_token_audience,
    )
    return NextResponse.redirect(accepted.redirect_to, 302)
}
