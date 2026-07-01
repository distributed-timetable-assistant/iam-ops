// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { Registration } from "@ory/elements-react/theme"
import { type RegistrationFlow } from "@ory/client-fetch"
import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getKratosPublicUrl } from "@/app/hydra/_lib/env"

function extractParam(
    sp: Record<string, string | string[] | undefined> | undefined,
    key: string,
): string | undefined {
    if (!sp) return undefined
    const val = sp[key]
    if (Array.isArray(val)) return val[0]
    return typeof val === "string" ? val : undefined
}

async function fetchRegistrationFlow(
    flowId: string,
    cookieHeader?: string,
): Promise<RegistrationFlow | null> {
    const url = new URL("/self-service/registration/flows", getKratosPublicUrl())
    url.searchParams.set("id", flowId)

    const res = await fetch(url.toString(), {
        headers: {
            accept: "application/json",
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        cache: "no-store",
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Kratos registration flow fetch failed: ${res.status} ${text}`)
    }

    return res.json() as Promise<RegistrationFlow>
}

export default async function RegistrationPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = extractParam(searchParams, "flow")

    if (!flowId) {
        return null
    }

    let flow
    try {
        flow = await fetchRegistrationFlow(
            flowId,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/registration] fetchRegistrationFlow failed:", error)
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-medium">Registration flow could not be loaded.</div>
                <div className="mt-2 break-words text-xs text-red-800">
                    {error instanceof Error ? error.message : "Unknown error"}
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
            flow={flow}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
