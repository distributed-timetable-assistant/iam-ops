// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { Error as ErrorComponent, type OryError } from "@ory/elements-react/theme"
import { getServerSession, OryPageParams } from "@ory/nextjs/app"
import { headers } from "next/headers"

import config from "@/ory.config"

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

async function getRequestOrigin(): Promise<string> {
    const h = await headers()
    const proto = h.get("x-forwarded-proto") ?? "http"
    const host = h.get("x-forwarded-host") ?? h.get("host")
    return host ? `${proto}://${host}` : "http://localhost:3000"
}

async function getSelfServiceError(
    searchParams: OryPageParams["searchParams"],
): Promise<OryError> {
    const resolvedSearchParams = await searchParams
    const id = getFirstQueryParam(resolvedSearchParams, "id")

    if (!id) {
        return {
            error: {
                code: 400,
                status: "Bad Request",
                message: "Missing error id.",
            },
        } as OryError
    }

    const origin = await getRequestOrigin()
    const url = new URL("/self-service/errors", origin)
    url.searchParams.set("id", id)

    const res = await fetch(url, {
        cache: "no-store",
        headers: {
            accept: "application/json",
        },
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        return {
            error: {
                code: res.status,
                status: res.statusText || "Error",
                id,
                message: text || `Failed to load error (HTTP ${res.status})`,
            },
        } as OryError
    }

    const data = await res.json().catch(() => null)
    return coerceOryDates(data) as OryError
}

function coerceOryDates<T>(value: T): T {
    if (!value) return value

    if (Array.isArray(value)) {
        return value.map(coerceOryDates) as unknown as T
    }

    if (typeof value !== "object") return value

    const input = value as unknown as Record<string, unknown>
    const output: Record<string, unknown> = {}

    for (const [key, raw] of Object.entries(input)) {
        if (typeof raw === "string" && key.endsWith("_at")) {
            const date = new Date(raw)
            output[key] = Number.isNaN(date.getTime()) ? raw : date
            continue
        }

        output[key] = coerceOryDates(raw)
    }

    return output as unknown as T
}

export default async function ErrorPage(props: OryPageParams) {
    const error = await getSelfServiceError(props.searchParams)
    const session = await getServerSession().catch(() => null)

    return (
        <ErrorComponent
            error={error}
            config={config}
            components={{ Card: {} }}
            session={session ?? undefined}
        />
    )
}
