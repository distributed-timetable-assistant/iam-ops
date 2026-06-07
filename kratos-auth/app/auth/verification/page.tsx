// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { getVerificationFlow, OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"
import VerificationClient from "./verification-client"

export default async function VerificationPage(props: OryPageParams) {
    const flow = await getVerificationFlow(config, props.searchParams)

    if (!flow) {
        return null
    }

    return <VerificationClient flow={flow} />
}

