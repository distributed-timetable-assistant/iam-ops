// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { Registration } from "@ory/elements-react/theme"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getRegistrationFlowInternal } from "@/app/hydra/_lib/flows"

export default async function RegistrationPage(props: OryPageParams) {
    let flow
    try {
        flow = await getRegistrationFlowInternal(props.searchParams)
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

