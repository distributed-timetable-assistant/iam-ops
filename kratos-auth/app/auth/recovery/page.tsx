// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getRecoveryFlowInternal } from "@/app/hydra/_lib/flows"
import RecoveryClient from "./recovery-client"

export default async function RecoveryPage(props: OryPageParams) {
    let flow
    try {
        flow = await getRecoveryFlowInternal(await props.searchParams)
    } catch (err) {
        console.error("[auth/recovery] getRecoveryFlowInternal threw:", err)
        redirect("/auth/error?error=recovery_flow_fetch_failed")
    }

    if (!flow) {
        redirect("/auth/error?error=recovery_flow_not_found")
    }

    return <RecoveryClient flow={flow as any} />
}

