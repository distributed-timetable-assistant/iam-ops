// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { NextResponse, type NextRequest } from "next/server"
import { createOryMiddleware } from "@ory/nextjs/middleware"
import oryConfig from "@/ory.config"

const oryProxy = createOryMiddleware(oryConfig)

const AUTH_BROWSER_PATHS: Record<string, string> = {
    "/auth/login": "self-service/login/browser",
    "/auth/registration": "self-service/registration/browser",
    "/auth/recovery": "self-service/recovery/browser",
    "/auth/verification": "self-service/verification/browser",
    "/auth/settings": "self-service/settings/browser",
}

function getPublicBaseUrl(): string {
    return (
        process.env.PUBLIC_BASE_URL ??
        process.env.NEXT_PUBLIC_ORY_SDK_URL ??
        "https://web.login.outi.ir"
    )
}

function isBrowserDocumentRequest(request: NextRequest): boolean {
    if (request.headers.get("RSC") === "1") {
        return false
    }
    if (request.headers.get("Next-Router-Prefetch") === "1") {
        return false
    }

    const accept = request.headers.get("accept") ?? ""
    if (accept.includes("text/x-component")) {
        return false
    }

    const fetchDest = request.headers.get("sec-fetch-dest")
    if (fetchDest && fetchDest !== "document" && fetchDest !== "iframe") {
        return false
    }

    return accept.includes("text/html") || accept === "*/*" || accept === ""
}

function redirectToBrowserFlow(
    request: NextRequest,
    browserPath: string,
): NextResponse {
    const url = new URL(browserPath, getPublicBaseUrl())
    const returnTo = request.nextUrl.searchParams.get("return_to")
    if (returnTo) {
        url.searchParams.set("return_to", returnTo)
    }
    return NextResponse.redirect(url)
}

function maybeRedirectToBrowserFlow(request: NextRequest): NextResponse | null {
    if (!isBrowserDocumentRequest(request)) {
        return null
    }

    const browserPath = AUTH_BROWSER_PATHS[request.nextUrl.pathname]
    if (!browserPath) {
        return null
    }

    if (!request.nextUrl.searchParams.has("flow")) {
        return redirectToBrowserFlow(request, browserPath)
    }

    return null
}

function isPublicAuthRoute(pathname: string): boolean {
    return (
        pathname === "/" ||
        pathname.startsWith("/auth/") ||
        pathname.startsWith("/hydra/") ||
        pathname.startsWith("/self-service/") ||
        pathname.startsWith("/sessions/") ||
        pathname.startsWith("/kratos/")
    )
}

export function proxy(request: NextRequest) {
    const browserFlowRedirect = maybeRedirectToBrowserFlow(request)
    if (browserFlowRedirect) {
        return browserFlowRedirect
    }

    if (isPublicAuthRoute(request.nextUrl.pathname)) {
        return NextResponse.next()
    }

    return oryProxy(request)
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico).*)"],
}
