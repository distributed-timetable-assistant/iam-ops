// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { Settings } from "@ory/elements-react/theme"
import { getSettingsFlow, OryPageParams } from "@ory/nextjs/app"

import config from "@/ory.config"

export default async function SettingsPage(props: OryPageParams) {
    const flow = await getSettingsFlow(config, props.searchParams)

    if (!flow) {
        return null
    }

    return (
        <Settings
            flow={flow}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}

