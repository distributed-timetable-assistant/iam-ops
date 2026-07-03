// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { headers } from "next/headers"
import { OryPageParams } from "@ory/nextjs/app"

import OryLoginFlow from "@/components/ory-login-flow"
import { getKratosPublicUrl } from "@/app/hydra/_lib/env"
import { type LoginFlow } from "@ory/client-fetch"

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
): Promise<LoginFlow | null> {
    const url = new URL("/self-service/login/flows", getKratosPublicUrl())
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
        throw new Error(`Kratos login flow fetch failed: ${res.status} ${text}`)
    }

    return res.json() as Promise<LoginFlow>
}

export default async function LoginPage(props: OryPageParams) {
    const searchParams = await props.searchParams
    const requestHeaders = await headers()
    const flowId = extractParam(searchParams, "flow")

    if (!flowId) {
        return null
    }

    let flow: LoginFlow | null = null
    try {
        flow = await fetchFlow(
            flowId,
            requestHeaders.get("cookie") ?? undefined,
        )
    } catch (error) {
        console.error("[auth/login] fetchFlow failed:", error)
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-medium">Login flow could not be loaded.</div>
                <div className="mt-2 break-words text-xs text-red-800">
                    {error instanceof Error ? error.message : "Unknown error"}
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
