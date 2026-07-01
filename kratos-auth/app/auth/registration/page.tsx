// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"

import {
    getFirstQueryParam,
    isCsrfError,
    redirectToBrowserFlow,
} from "@/app/hydra/_lib/browser-flow"
import { getRegistrationFlowInternal } from "@/app/hydra/_lib/flows"
import RegistrationClient from "./registration-client"

export default async function RegistrationPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = getFirstQueryParam(searchParams, "flow")
    const returnTo = getFirstQueryParam(searchParams, "return_to")

    if (!flowId) {
        redirectToBrowserFlow("self-service/registration/browser", returnTo)
    }

    let flow
    try {
        flow = await getRegistrationFlowInternal(
            searchParams,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error(
            "[auth/registration] getRegistrationFlowInternal threw:",
            error,
        )
        const message =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unknown error"

        if (isCsrfError(message)) {
            redirectToBrowserFlow("self-service/registration/browser", returnTo)
        }

        redirect(`/auth/error?error=registration_flow_fetch_failed`)
    }

    if (!flow) {
        redirect("/auth/error?error=registration_flow_not_found")
    }

    return <RegistrationClient flow={flow} />
}
