// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"

import { getKratosBrowserUrl } from "@/app/hydra/_lib/env"
import { getLoginFlowInternal } from "@/app/hydra/_lib/flows"
import LoginClient from "./login-client"

function getFirstQueryParam(
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

export default async function LoginPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = getFirstQueryParam(searchParams, "flow")
    const returnTo = getFirstQueryParam(searchParams, "return_to")

    if (!flowId) {
        const browserFlowUrl = new URL(
            "self-service/login/browser",
            getKratosBrowserUrl(),
        )
        if (returnTo) {
            browserFlowUrl.searchParams.set("return_to", returnTo)
        }
        redirect(browserFlowUrl.toString())
    }

    let flow
    try {
        flow = await getLoginFlowInternal(
            searchParams,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/login] getLoginFlowInternal threw:", error)
        const message =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unknown error"
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-medium">Login flow could not be loaded.</div>
                <div className="mt-2 break-words text-xs text-red-800">
                    {message}
                </div>
            </div>
        )
    }

    if (!flow) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                Login flow is missing or expired.
            </div>
        )
    }

    return <LoginClient flow={flow} />
}
