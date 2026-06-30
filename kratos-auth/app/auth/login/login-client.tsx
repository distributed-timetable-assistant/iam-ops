// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

"use client"

import { Login } from "@ory/elements-react/theme"

import CustomCardHeader from "@/components/custom-card-header"
import config from "@/ory.config"

export default function LoginClient({ flow }: { flow: unknown }) {
    return (
        <Login
            flow={flow as never}
            config={config}
            components={{
                Card: {
                    Header: CustomCardHeader,
                },
            }}
        />
    )
}
