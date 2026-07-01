// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"

import OrySettingsFlow from "@/components/ory-settings-flow"
import {
    getFirstQueryParam,
    isCsrfError,
    redirectToBrowserFlow,
} from "@/app/hydra/_lib/browser-flow"
import { getSettingsFlowInternal } from "@/app/hydra/_lib/flows"

export default async function SettingsPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = getFirstQueryParam(searchParams, "flow")
    const returnTo = getFirstQueryParam(searchParams, "return_to")

    if (!flowId) {
        redirectToBrowserFlow("self-service/settings/browser", returnTo)
    }

    let flow
    try {
        flow = await getSettingsFlowInternal(
            searchParams,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/settings] getSettingsFlowInternal threw:", error)
        const message =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unknown error"

        if (isCsrfError(message)) {
            redirectToBrowserFlow("self-service/settings/browser", returnTo)
        }

        redirect("/auth/error?error=settings_flow_fetch_failed")
    }

    if (!flow) {
        redirect("/auth/error?error=settings_flow_not_found")
    }

    return <OrySettingsFlow flow={flow} />
}
