// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

"use client"

import dynamic from "next/dynamic"
import { type LoginFlow } from "@ory/client-fetch"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

const Login = dynamic(() => import("@/components/ory-login"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="login" />,
})

export default function OryLoginFlow({ flow }: { flow: LoginFlow }) {
    return (
        <Login
            flow={flow}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
