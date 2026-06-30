// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { NextResponse, type NextRequest } from "next/server"
import { createOryMiddleware } from "@ory/nextjs/middleware"
import oryConfig from "@/ory.config"

const oryProxy = createOryMiddleware(oryConfig)

function isPublicAuthRoute(pathname: string): boolean {
    return (
        pathname === "/" ||
        pathname.startsWith("/auth/") ||
        pathname.startsWith("/hydra/")
    )
}

export function proxy(request: NextRequest) {
    if (isPublicAuthRoute(request.nextUrl.pathname)) {
        return NextResponse.next()
    }

    return oryProxy(request)
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico).*)"],
}
