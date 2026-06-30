// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Registration } from "@ory/elements-react/theme"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getKratosBrowserUrl } from "@/app/hydra/_lib/env"
import { getRegistrationFlowInternal } from "@/app/hydra/_lib/flows"

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

export default async function RegistrationPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = getFirstQueryParam(searchParams, "flow")
    const returnTo = getFirstQueryParam(searchParams, "return_to")

    if (!flowId) {
        const browserFlowUrl = new URL(
            "self-service/registration/browser",
            getKratosBrowserUrl(),
        )
        if (returnTo) {
            browserFlowUrl.searchParams.set("return_to", returnTo)
        }
        redirect(browserFlowUrl.toString())
    }

    let flow
    try {
        flow = await getRegistrationFlowInternal(
            searchParams,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/registration] getRegistrationFlowInternal threw:", error)
        const message =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unknown error"
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-medium">
                    Registration flow could not be loaded.
                </div>
                <div className="mt-2 break-words text-xs text-red-800">
                    {message}
                </div>
            </div>
        )
    }

    if (!flow) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                Registration flow is missing or expired.
            </div>
        )
    }

    return (
        <Registration
            flow={flow as any}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
