import { NextRequest, NextResponse } from "next/server"

import { acceptHydraLogout } from "../_lib/hydra"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const logoutChallenge = url.searchParams.get("logout_challenge")
    if (!logoutChallenge) {
        return new NextResponse("Missing logout_challenge", { status: 400 })
    }

    const accepted = await acceptHydraLogout(logoutChallenge)
    return NextResponse.redirect(accepted.redirect_to, 302)
}

