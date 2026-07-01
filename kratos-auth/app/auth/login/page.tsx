// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"

import OryLoginFlow from "@/components/ory-login-flow"
import {
    getFirstQueryParam,
    isCsrfError,
    redirectToBrowserFlow,
} from "@/app/hydra/_lib/browser-flow"
import { getLoginFlowInternal } from "@/app/hydra/_lib/flows"

export default async function LoginPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = getFirstQueryParam(searchParams, "flow")
    const returnTo = getFirstQueryParam(searchParams, "return_to")

    if (!flowId) {
        redirectToBrowserFlow("self-service/login/browser", returnTo)
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

        if (isCsrfError(message)) {
            redirectToBrowserFlow("self-service/login/browser", returnTo)
        }

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

    return <OryLoginFlow flow={flow} />
}
