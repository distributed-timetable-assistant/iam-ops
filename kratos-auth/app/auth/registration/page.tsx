// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
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
        flow = await getRegistrationFlowInternal(searchParams)
    } catch (err) {
        console.error("[auth/registration] getRegistrationFlowInternal threw:", err)
        redirect("/auth/error?error=registration_flow_fetch_failed")
    }

    if (!flow) {
        redirect("/auth/error?error=registration_flow_not_found")
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
