// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"
import { type SettingsFlow } from "@ory/client-fetch"
import "@ory/elements-react/theme/styles.css"

import OrySettingsFlow from "@/components/ory-settings-flow"
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

async function fetchFlow(
    flowId: string,
    cookieHeader?: string,
): Promise<SettingsFlow | null> {
    const url = new URL("/self-service/settings/flows", getKratosPublicUrl())
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
        throw new Error(`Kratos settings flow fetch failed: ${res.status} ${text}`)
    }

    return res.json() as Promise<SettingsFlow>
}

export default async function SettingsPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = extractParam(searchParams, "flow")

    if (!flowId) {
        return null
    }

    let flow: SettingsFlow | null = null
    try {
        flow = await fetchFlow(
            flowId,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/settings] fetchFlow failed:", error)
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-medium">Settings flow could not be loaded.</div>
                <div className="mt-2 break-words text-xs text-red-800">
                    {error instanceof Error ? error.message : "Unknown error"}
                </div>
            </div>
        )
    }

    if (!flow) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                Settings flow is missing or expired.
            </div>
        )
    }

    return <OrySettingsFlow flow={flow} />
}
