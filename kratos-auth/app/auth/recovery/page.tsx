// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { getRecoveryFlow, OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import RecoveryClient from "./recovery-client"

export default async function RecoveryPage(props: OryPageParams) {
    const flow = await getRecoveryFlow(config, props.searchParams)

    if (!flow) {
        return null
    }

    return <RecoveryClient flow={flow} />
}

