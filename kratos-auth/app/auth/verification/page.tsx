// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { redirect } from "next/navigation"
import { OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import { getVerificationFlowInternal } from "@/app/hydra/_lib/flows"
import VerificationClient from "./verification-client"

export default async function VerificationPage(props: OryPageParams) {
    let flow
    try {
        flow = await getVerificationFlowInternal(await props.searchParams)
    } catch (err) {
        console.error("[auth/verification] getVerificationFlowInternal threw:", err)
        redirect("/auth/error?error=verification_flow_fetch_failed")
    }

    if (!flow) {
        redirect("/auth/error?error=verification_flow_not_found")
    }

    return <VerificationClient flow={flow as any} />
}

