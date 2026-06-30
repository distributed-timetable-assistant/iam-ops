// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { Login } from "@ory/elements-react/theme"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getLoginFlowInternal } from "@/app/hydra/_lib/flows"

export default async function LoginPage(props: OryPageParams) {
    let flow
    try {
        flow = await getLoginFlowInternal(await props.searchParams)
    } catch (err) {
        console.error("[auth/login] getLoginFlowInternal threw:", err)
        redirect("/auth/error?error=login_flow_fetch_failed")
    }

    if (!flow) {
        redirect("/auth/error?error=login_flow_not_found")
    }

    return (
        <Login
            flow={flow as any}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}

