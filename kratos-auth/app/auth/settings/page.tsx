// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { Settings } from "@ory/elements-react/theme"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getSettingsFlowInternal } from "@/app/hydra/_lib/flows"

export default async function SettingsPage(props: OryPageParams) {
    let flow
    try {
        flow = await getSettingsFlowInternal(await props.searchParams)
    } catch (err) {
        console.error("[auth/settings] getSettingsFlowInternal threw:", err)
        redirect("/auth/error?error=settings_flow_fetch_failed")
    }

    if (!flow) {
        redirect("/auth/error?error=settings_flow_not_found")
    }

    return (
        <Settings
            flow={flow as any}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}

