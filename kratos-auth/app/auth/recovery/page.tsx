// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { Recovery } from "@ory/elements-react/theme"
import { type RecoveryFlow } from "@ory/client-fetch"
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

async function fetchRecoveryFlow(
    flowId: string,
    cookieHeader?: string,
): Promise<RecoveryFlow | null> {
    const url = new URL("/self-service/recovery/flows", getKratosPublicUrl())
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
        throw new Error(`Kratos recovery flow fetch failed: ${res.status} ${text}`)
    }

    return res.json() as Promise<RecoveryFlow>
}

export default async function RecoveryPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = extractParam(searchParams, "flow")

    if (!flowId) {
        return null
    }

    let flow
    try {
        flow = await fetchRecoveryFlow(
            flowId,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/recovery] fetchRecoveryFlow failed:", error)
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-medium">Recovery flow could not be loaded.</div>
                <div className="mt-2 break-words text-xs text-red-800">
                    {error instanceof Error ? error.message : "Unknown error"}
                </div>
            </div>
        )
    }

    if (!flow) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                Recovery flow is missing or expired.
            </div>
        )
    }

    return (
        <Recovery
            flow={flow}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
