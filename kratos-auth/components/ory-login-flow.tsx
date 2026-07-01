"use client"

import dynamic from "next/dynamic"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"
import { coerceOryDates } from "@/app/hydra/_lib/browser-flow"

const Login = dynamic(() => import("@/components/ory-login"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="login" />,
})

export default function OryLoginFlow({ flow }: { flow: unknown }) {
    return (
        <Login
            flow={coerceOryDates(flow) as never}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
