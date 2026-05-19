import { NextRequest, NextResponse } from "next/server"

import { getPublicBaseUrl } from "../_lib/env"
import { acceptHydraLogin } from "../_lib/hydra"
import { getKratosSessionOrNull } from "../_lib/kratos"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const loginChallenge = url.searchParams.get("login_challenge")
    if (!loginChallenge) {
        return new NextResponse("Missing login_challenge", { status: 400 })
    }

    const session = await getKratosSessionOrNull(request.headers.get("cookie"))
    if (!session?.identity?.id) {
        const returnTo = `${getPublicBaseUrl()}/hydra/login?login_challenge=${encodeURIComponent(loginChallenge)}`
        return NextResponse.redirect(
            `${getPublicBaseUrl()}/auth/login?return_to=${encodeURIComponent(returnTo)}`,
            302,
        )
    }

    const accepted = await acceptHydraLogin(loginChallenge, session.identity.id)
    return NextResponse.redirect(accepted.redirect_to, 302)
}

